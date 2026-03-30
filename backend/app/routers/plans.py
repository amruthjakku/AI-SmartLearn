from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime
from app.services.supabase_client import get_supabase_client, get_supabase_admin_client
from app.services.ai_service import AIService
from app.dependencies import get_current_user_id

router = APIRouter()


class PlanGenerateRequest(BaseModel):
    """Study plan generation request."""
    goal: str
    target_date: str
    daily_available_time: int  # in minutes
    skill_level: str = "beginner"
    strengths: Optional[List[str]] = []
    weaknesses: Optional[List[str]] = []
    additional_notes: Optional[str] = None


class StudyPlan(BaseModel):
    """Study plan model."""
    id: Optional[str] = None
    user_id: str
    title: str
    description: Optional[str] = None
    generated_plan: dict
    status: str = "active"
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


@router.post("/generate")
async def generate_plan(
    request: PlanGenerateRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Generate a new AI-powered study plan."""
    try:
        ai_service = AIService()
        
        # Generate plan using AI
        generated_plan = await ai_service.generate_study_plan(
            goal=request.goal,
            target_date=request.target_date,
            daily_available_time=request.daily_available_time,
            skill_level=request.skill_level,
            strengths=request.strengths,
            weaknesses=request.weaknesses,
            additional_notes=request.additional_notes
        )
        
        # Save plan to database
        supabase = get_supabase_admin_client()
        plan_data = {
            "user_id": user_id,
            "title": f"Study Plan: {request.goal}",
            "description": f"Target: {request.target_date}",
            "generated_plan": generated_plan,
            "status": "active"
        }
        
        response = supabase.table("study_plans").insert(plan_data).execute()
        
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to save study plan")
        
        saved_plan = response.data[0]
        
        # Extract tasks from plan and create individual tasks
        if "tasks" in generated_plan:
            tasks_to_create = []
            for task in generated_plan["tasks"]:
                task_entry = {
                    "user_id": user_id,
                    "study_plan_id": saved_plan["id"],
                    "title": task.get("title", "Untitled Task"),
                    "description": task.get("description", ""),
                    "scheduled_time": task.get("scheduled_time"),
                    "duration_minutes": task.get("duration_minutes", 30),
                    "priority": task.get("priority", "medium"),
                    "status": "pending"
                }
                tasks_to_create.append(task_entry)
            
            if tasks_to_create:
                supabase.table("tasks").insert(tasks_to_create).execute()
        
        return {
            "message": "Study plan generated successfully",
            "plan": saved_plan
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/")
async def get_plans(user_id: str = Depends(get_current_user_id)):
    """Get all study plans for the current user."""
    try:
        supabase = get_supabase_admin_client()
        response = supabase.table("study_plans").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return {"plans": response.data or []}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{plan_id}")
async def get_plan(
    plan_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get a specific study plan."""
    try:
        supabase = get_supabase_admin_client()
        response = supabase.table("study_plans").select("*").eq("id", plan_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Study plan not found")
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{plan_id}/status")
async def update_plan_status(
    plan_id: str,
    status: str,
    user_id: str = Depends(get_current_user_id)
):
    """Update study plan status (active, paused, completed)."""
    try:
        supabase = get_supabase_admin_client()
        response = supabase.table("study_plans").update({
            "status": status,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", plan_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Study plan not found")
        
        return {"message": f"Plan status updated to {status}", "plan": response.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{plan_id}")
async def delete_plan(
    plan_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a study plan and its associated tasks."""
    try:
        supabase = get_supabase_admin_client()
        
        # Delete associated tasks first
        supabase.table("tasks").delete().eq("study_plan_id", plan_id).execute()
        
        # Delete the plan
        response = supabase.table("study_plans").delete().eq("id", plan_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Study plan not found")
        
        return {"message": "Study plan deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{plan_id}/adjust")
async def adjust_plan(
    plan_id: str,
    progress_data: dict,
    user_id: str = Depends(get_current_user_id)
):
    """Adjust study plan based on progress using AI."""
    try:
        supabase = get_supabase_admin_client()
        
        # Get current plan
        plan_response = supabase.table("study_plans").select("*").eq("id", plan_id).eq("user_id", user_id).execute()
        if not plan_response.data:
            raise HTTPException(status_code=404, detail="Study plan not found")
        
        current_plan = plan_response.data[0]
        
        # Adjust plan using AI
        ai_service = AIService()
        adjusted_plan = await ai_service.adjust_study_plan(
            current_plan=current_plan["generated_plan"],
            progress_data=progress_data
        )
        
        # Update plan in database
        update_response = supabase.table("study_plans").update({
            "generated_plan": adjusted_plan,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", plan_id).execute()
        
        return {
            "message": "Study plan adjusted successfully",
            "plan": update_response.data[0]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))