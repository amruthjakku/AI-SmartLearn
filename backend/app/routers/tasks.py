from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.services.supabase_client import get_supabase_client
from app.dependencies import get_current_user_id

router = APIRouter()


class TaskCreate(BaseModel):
    """Task creation request."""
    title: str
    description: Optional[str] = None
    scheduled_time: Optional[str] = None
    duration_minutes: int = 30
    priority: str = "medium"  # low, medium, high
    study_plan_id: Optional[str] = None


class TaskUpdate(BaseModel):
    """Task update request."""
    title: Optional[str] = None
    description: Optional[str] = None
    scheduled_time: Optional[str] = None
    duration_minutes: Optional[int] = None
    priority: Optional[str] = None
    status: Optional[str] = None


@router.post("/")
async def create_task(
    task_data: TaskCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new task."""
    try:
        supabase = get_supabase_client()
        task_entry = {
            "user_id": user_id,
            "title": task_data.title,
            "description": task_data.description,
            "scheduled_time": task_data.scheduled_time,
            "duration_minutes": task_data.duration_minutes,
            "priority": task_data.priority,
            "status": "pending",
            "study_plan_id": task_data.study_plan_id
        }
        
        response = supabase.table("tasks").insert(task_entry).execute()
        
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create task")
        
        return {"message": "Task created successfully", "task": response.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/")
async def get_tasks(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    date: Optional[str] = Query(None),
    user_id: str = Depends(get_current_user_id)
):
    """Get all tasks for the current user with optional filters."""
    try:
        supabase = get_supabase_client()
        query = supabase.table("tasks").select("*").eq("user_id", user_id)
        
        if status:
            query = query.eq("status", status)
        if priority:
            query = query.eq("priority", priority)
        if date:
            query = query.gte("scheduled_time", f"{date}T00:00:00").lte("scheduled_time", f"{date}T23:59:59")
        
        response = query.order("scheduled_time", desc=False).execute()
        return {"tasks": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/today")
async def get_today_tasks(user_id: str = Depends(get_current_user_id)):
    """Get all tasks scheduled for today."""
    try:
        supabase = get_supabase_client()
        today = datetime.utcnow().strftime("%Y-%m-%d")
        
        response = supabase.table("tasks").select("*").eq("user_id", user_id).gte("scheduled_time", f"{today}T00:00:00").lte("scheduled_time", f"{today}T23:59:59").order("scheduled_time", desc=False).execute()
        
        return {"tasks": response.data, "date": today}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/upcoming")
async def get_upcoming_tasks(
    days: int = Query(7, ge=1, le=30),
    user_id: str = Depends(get_current_user_id)
):
    """Get upcoming tasks for the next N days."""
    try:
        supabase = get_supabase_client()
        today = datetime.utcnow()
        end_date = today.replace(day=today.day + days)
        
        response = supabase.table("tasks").select("*").eq("user_id", user_id).eq("status", "pending").gte("scheduled_time", today.isoformat()).lte("scheduled_time", end_date.isoformat()).order("scheduled_time", desc=False).execute()
        
        return {"tasks": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{task_id}")
async def get_task(
    task_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get a specific task."""
    try:
        supabase = get_supabase_client()
        response = supabase.table("tasks").select("*").eq("id", task_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{task_id}")
async def update_task(
    task_id: str,
    task_data: TaskUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update a task."""
    try:
        supabase = get_supabase_client()
        
        # Filter out None values
        update_data = {k: v for k, v in task_data.model_dump().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        response = supabase.table("tasks").update(update_data).eq("id", task_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return {"message": "Task updated successfully", "task": response.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{task_id}/complete")
async def complete_task(
    task_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Mark a task as completed."""
    try:
        supabase = get_supabase_client()
        
        response = supabase.table("tasks").update({
            "status": "completed",
            "completed_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", task_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return {"message": "Task marked as completed", "task": response.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{task_id}/miss")
async def miss_task(
    task_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Mark a task as missed."""
    try:
        supabase = get_supabase_client()
        
        response = supabase.table("tasks").update({
            "status": "missed",
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", task_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return {"message": "Task marked as missed", "task": response.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{task_id}/reschedule")
async def reschedule_task(
    task_id: str,
    new_time: str,
    user_id: str = Depends(get_current_user_id)
):
    """Reschedule a task to a new time."""
    try:
        supabase = get_supabase_client()
        
        response = supabase.table("tasks").update({
            "scheduled_time": new_time,
            "status": "pending",
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", task_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return {"message": "Task rescheduled successfully", "task": response.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a task."""
    try:
        supabase = get_supabase_client()
        
        response = supabase.table("tasks").delete().eq("id", task_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return {"message": "Task deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))