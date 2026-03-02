from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "AI-SmartLearn API is running"}


@router.get("/ping")
async def ping():
    """Simple ping endpoint."""
    return {"pong": True}