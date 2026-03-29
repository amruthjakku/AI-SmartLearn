"""
Shared authentication dependency for all routers.
Centralizes token verification so any fix here applies everywhere.
"""
import os
import functools
import httpx
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

# --- THE ULTIMATE NUCLEAR PROXY FIX ---
# We monkeypatch the underlying HTTPX and GoTrue clients to 
# COMPLETELY IGNORE the 'proxy' argument. This handles all versions 
# of Supabase/GoTrue/Postgrest/HTTPX and the Vercel environment.

# 1. Patch httpx.Client
_orig_httpx_init = httpx.Client.__init__
@functools.wraps(_orig_httpx_init)
def _patched_httpx_init(self, *args, **kwargs):
    kwargs.pop("proxy", None)
    kwargs.pop("proxies", None) # Older httpx
    return _orig_httpx_init(self, *args, **kwargs)
httpx.Client.__init__ = _patched_httpx_init

# 2. Patch httpx.AsyncClient
_orig_httpx_async_init = httpx.AsyncClient.__init__
@functools.wraps(_orig_httpx_async_init)
def _patched_httpx_async_init(self, *args, **kwargs):
    kwargs.pop("proxy", None)
    kwargs.pop("proxies", None)
    return _orig_httpx_async_init(self, *args, **kwargs)
httpx.AsyncClient.__init__ = _patched_httpx_async_init

# 3. Patch gotrue.Client if it exists (for older supabase-py)
try:
    import gotrue
    client_classes = ["Client", "SyncClient", "AsyncClient"]
    for cls_name in client_classes:
        if hasattr(gotrue, cls_name):
            cls = getattr(gotrue, cls_name)
            _orig_cls_init = cls.__init__
            @functools.wraps(_orig_cls_init)
            def _patched_cls_init(self, *args, **kwargs):
                kwargs.pop("proxy", None)
                return _orig_cls_init(self, *args, **kwargs)
            cls.__init__ = _patched_cls_init
except (ImportError, AttributeError):
    pass
# -------------------------------------

def get_supabase_anon():
    """Returns a fresh Supabase client with proxy env vars stripped."""
    for var in ("HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY",
                "http_proxy", "https_proxy", "all_proxy"):
        os.environ.pop(var, None)

    from supabase import create_client
    from app.config import get_settings
    s = get_settings()
    return create_client(s.supabase_url, s.supabase_key)


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """FastAPI dependency — extracts and validates the Supabase user from JWT."""
    try:
        client = get_supabase_anon()
        res = client.auth.get_user(credentials.credentials)

        user = getattr(res, "user", None) or (
            getattr(getattr(res, "data", None), "user", None)
        )
        if user is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user.id
    except HTTPException:
        raise
    except Exception as exc:
        # Re-raising without prefix to avoid UI bracket pollution
        raise HTTPException(status_code=401, detail=str(exc)) from exc
