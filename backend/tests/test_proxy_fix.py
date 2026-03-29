import sys
import os
import unittest
from unittest.mock import patch

# Mock the settings before importing dependencies to avoid env var errors
os.environ["SUPABASE_URL"] = "https://example.supabase.co"
os.environ["SUPABASE_KEY"] = "mock-key"
os.environ["GROQ_API_KEY"] = "mock-key"

# Add parent directory to sys.path for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import httpx
from app.dependencies import get_supabase_anon

class TestProxyFix(unittest.TestCase):
    def test_httpx_monkeypatch_ignores_proxy(self):
        """Verify that httpx.Client ignores proxy argument after monkeypatch."""
        try:
            # This would NORMALLY crash if the monkeypatch fails and 
            # the environment doesn't support the proxy argument
            client = httpx.Client(proxy="http://localhost:8080")
            self.assertIsInstance(client, httpx.Client)
            print("✅ httpx.Client ignored 'proxy' argument successfully.")
        except TypeError as e:
            self.fail(f"❌ httpx.Client still crashes with proxy argument: {e}")

    def test_httpx_async_monkeypatch_ignores_proxy(self):
        """Verify that httpx.AsyncClient ignores proxy argument after monkeypatch."""
        try:
            client = httpx.AsyncClient(proxy="http://localhost:8080")
            self.assertIsInstance(client, httpx.AsyncClient)
            print("✅ httpx.AsyncClient ignored 'proxy' argument successfully.")
        except TypeError as e:
            self.fail(f"❌ httpx.AsyncClient still crashes with proxy argument: {e}")

    def test_environ_pop(self):
        """Verify that get_supabase_anon pops proxy env vars."""
        os.environ["HTTP_PROXY"] = "http://bad-proxy"
        
        # Calling this should trigger the pop logic
        get_supabase_anon()
        
        self.assertNotIn("HTTP_PROXY", os.environ)
        print("✅ Environment proxy variables stripped successfully.")

if __name__ == "__main__":
    unittest.main()
