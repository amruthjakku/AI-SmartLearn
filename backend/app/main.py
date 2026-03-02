from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import auth, users, plans, tasks, health

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-Powered Personalized Learning & Smart Reminder System API",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(plans.router, prefix="/api/plans", tags=["Study Plans"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    print(f"🚀 {settings.app_name} API v{settings.app_version} started")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    print(f"👋 {settings.app_name} API shutting down")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)