"""
Shared authentication dependency for all routers.
Centralizes token verification so any fix here applies everywhere.
"""
import os
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()


def get_supabase_anon():
    """
    Returns a fresh Supabase client with proxy env vars stripped.
    This avoids the `httpx.Client(proxy=...)` crash on Vercel/Python 3.12+.
    """
    # Remove proxy vars that httpx picks up automatically and
    # that older Supabase SDK versions forward as a `proxy=` kwarg
    # (invalid in httpx >= 0.24).
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

        # supabase-py ≥ 2.x wraps in res.user; older wraps in res.data.user
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
