import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.config import get_settings
from app.routers import auth, users, plans, tasks, health, chat

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
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])

# --- Frontend Serving ---
# Serve static files from the frontend/dist directory if it exists
frontend_dist_path = os.path.abspath("../frontend/dist")

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": settings.app_name}

# Catch-all route for SPA support (React Router)
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    # Skip API routes
    if full_path.startswith("api/"):
        return {"detail": "Not Found"}
        
    if os.path.exists(os.path.join(frontend_dist_path, full_path)) and os.path.isfile(os.path.join(frontend_dist_path, full_path)):
        return FileResponse(os.path.join(frontend_dist_path, full_path))
        
    index_path = os.path.join(frontend_dist_path, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    return {"message": f"Welcome to {settings.app_name} API. Frontend not built yet."}

if os.path.exists(frontend_dist_path):
    app.mount("/", StaticFiles(directory=frontend_dist_path, html=True), name="frontend")


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    print(f"STARTUP: {settings.app_name} API v{settings.app_version} started")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    print(f"SHUTDOWN: {settings.app_name} API shutting down")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)