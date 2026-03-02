from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.services.supabase_client import get_supabase_client

router = APIRouter()
security = HTTPBearer()


class UserProfile(BaseModel):
    """User profile model."""
    name: Optional[str] = None
    goal: Optional[str] = None
    target_date: Optional[str] = None
    daily_available_time: Optional[int] = None  # in minutes
    skill_level: Optional[str] = None  # beginner, intermediate, advanced
    strengths: Optional[list[str]] = None
    weaknesses: Optional[list[str]] = None


class UserUpdate(BaseModel):
    """User update request model."""
    name: Optional[str] = None
    goal: Optional[str] = None
    target_date: Optional[str] = None
    daily_available_time: Optional[int] = None
    skill_level: Optional[str] = None
    strengths: Optional[list[str]] = None
    weaknesses: Optional[list[str]] = None


async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Extract user ID from JWT token."""
    try:
        supabase = get_supabase_client()
        user = supabase.auth.get_user(credentials.credentials)
        if user.user is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.get("/profile")
async def get_profile(user_id: str = Depends(get_current_user_id)):
    """Get user profile."""
    try:
        supabase = get_supabase_client()
        response = supabase.table("profiles").select("*").eq("id", user_id).execute()
        
        if not response.data:
            # Create profile if doesn't exist
            profile_data = {"id": user_id}
            supabase.table("profiles").insert(profile_data).execute()
            return profile_data
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/profile")
async def update_profile(
    profile_data: UserUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update user profile."""
    try:
        supabase = get_supabase_client()
        
        # Filter out None values
        update_data = {k: v for k, v in profile_data.model_dump().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        response = supabase.table("profiles").update(update_data).eq("id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/stats")
async def get_user_stats(user_id: str = Depends(get_current_user_id)):
    """Get user statistics."""
    try:
        supabase = get_supabase_client()
        
        # Get task completion stats
        tasks_response = supabase.table("tasks").select("status").eq("user_id", user_id).execute()
        tasks = tasks_response.data
        
        total_tasks = len(tasks)
        completed_tasks = sum(1 for t in tasks if t["status"] == "completed")
        pending_tasks = sum(1 for t in tasks if t["status"] == "pending")
        missed_tasks = sum(1 for t in tasks if t["status"] == "missed")
        
        # Get study plans count
        plans_response = supabase.table("study_plans").select("id").eq("user_id", user_id).execute()
        total_plans = len(plans_response.data)
        
        completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        return {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "pending_tasks": pending_tasks,
            "missed_tasks": missed_tasks,
            "completion_rate": round(completion_rate, 2),
            "total_study_plans": total_plans
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))