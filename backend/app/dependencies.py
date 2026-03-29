"""
Shared authentication dependency for all routers.
Centralizes token verification so any fix here applies everywhere.
"""
import os
import functools
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

# --- NUCLEAR PROXY FIX ---
# Some versions of Supabase/GoTrue/Postgrest pass a `proxy` argument to httpx
# which is invalid in newer versions of httpx used on Vercel. 
# We monkeypatch the underlying Client to ignore this argument.
try:
    import gotrue
    if hasattr(gotrue, "SyncClient"):
        _orig_init = gotrue.SyncClient.__init__
        @functools.wraps(_orig_init)
        def _patched_init(self, *args, **kwargs):
            kwargs.pop("proxy", None)
            return _orig_init(self, *args, **kwargs)
        gotrue.SyncClient.__init__ = _patched_init
    
    # Also patch the async client just in case
    if hasattr(gotrue, "AsyncClient"):
        _orig_init_async = gotrue.AsyncClient.__init__
        @functools.wraps(_orig_init_async)
        def _patched_init_async(self, *args, **kwargs):
            kwargs.pop("proxy", None)
            return _orig_init_async(self, *args, **kwargs)
        gotrue.AsyncClient.__init__ = _patched_init_async
except (ImportError, AttributeError):
    pass
# -------------------------

def get_supabase_anon():
    """
    Returns a fresh Supabase client with proxy env vars stripped.
    This avoids the `httpx.Client(proxy=...)` crash on Vercel.
    """
    # Remove proxy vars that httpx picks up automatically
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

        # Handle different response shapes across SDK versions
        user = getattr(res, "user", None) or (
            getattr(getattr(res, "data", None), "user", None)
        )
        if user is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user.id
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Auth error: {exc}") from exc
