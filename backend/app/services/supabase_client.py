import os
from supabase import create_client, Client
from app.config import get_settings

_settings = get_settings()

# Strip proxy env variables that cause `Client.__init__() got an unexpected
# keyword argument 'proxy'` in newer httpx versions on Vercel/serverless.
for _var in ("HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY",
             "http_proxy", "https_proxy", "all_proxy"):
    os.environ.pop(_var, None)


def get_supabase_client() -> Client:
    """Get Supabase client instance."""
    return create_client(
        _settings.supabase_url,
        _settings.supabase_key
    )


def get_supabase_admin_client() -> Client:
    """Get Supabase admin client with service role key."""
    if not _settings.supabase_service_key:
        raise ValueError("Supabase service key not configured")
    return create_client(
        _settings.supabase_url,
        _settings.supabase_service_key
    )