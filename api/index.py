import sys
import os

# Add backend directory to the sys.path to allow importing from the 'app' package
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app as _app

# This is required for Vercel to pick up the FastAPI app
app = _app
