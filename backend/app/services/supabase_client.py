from supabase import create_client, Client
from app.config import get_settings
from functools import lru_cache

_settings = get_settings()


@lru_cache()
def get_supabase_client() -> Client:
    """Get cached Supabase client instance."""
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