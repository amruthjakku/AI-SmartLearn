from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.services.supabase_client import get_supabase_client, get_supabase_admin_client
from app.services.ai_service import AIService
from app.dependencies import get_current_user_id

router = APIRouter()

class ChatMessageRequest(BaseModel):
    message: str

@router.get("/history")
async def get_chat_history(user_id: str = Depends(get_current_user_id)):
    try:
        supabase = get_supabase_admin_client()
        response = supabase.table("chat_messages").select("*").eq("user_id", user_id).order("created_at", desc=False).execute()
        return {"history": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/message")
async def send_message(
    request: ChatMessageRequest,
    user_id: str = Depends(get_current_user_id)
):
    try:
        supabase = get_supabase_admin_client()
        ai_service = AIService()
        
        # 1. Get user profile
        profile_res = supabase.table("profiles").select("*").eq("id", user_id).execute()
        profile = profile_res.data[0] if profile_res.data else {}
        
        # 2. Get recent history
        history_res = supabase.table("chat_messages").select("role", "content").eq("user_id", user_id).order("created_at", desc=False).limit(10).execute()
        history = history_res.data
        
        # 3. Get AI response
        ai_response = await ai_service.chat(request.message, history, profile)
        
        # 4. Store user message
        user_msg = {
            "user_id": user_id,
            "role": "user",
            "content": request.message
        }
        supabase.table("chat_messages").insert(user_msg).execute()
        
        # 5. Store AI message
        assistant_msg = {
            "user_id": user_id,
            "role": "assistant",
            "content": ai_response["reply"],
            "metadata": ai_response.get("meta")
        }
        supabase.table("chat_messages").insert(assistant_msg).execute()
        
        # 6. Handle Execution Actions
        if ai_response.get("action") == "execute_plan":
            plan_params = ai_response.get("meta", {}).get("plan_params")
            if plan_params:
                # Generate and save plan (Reusing logic from plans router)
                generated_plan = await ai_service.generate_study_plan(
                    goal=plan_params.get("goal"),
                    target_date=plan_params.get("target_date"),
                    daily_available_time=plan_params.get("daily_available_time", 60),
                    skill_level=plan_params.get("skill_level", "beginner")
                )
                
                plan_data = {
                    "user_id": user_id,
                    "title": f"Study Plan: {plan_params.get('goal')}",
                    "description": f"Created via SmartBud chat on {datetime.now().strftime('%Y-%m-%d')}",
                    "generated_plan": generated_plan,
                    "status": "active"
                }
                
                plan_res = supabase.table("study_plans").insert(plan_data).execute()
                if plan_res.data:
                    plan_id = plan_res.data[0]["id"]
                    # Create tasks
                    if "tasks" in generated_plan:
                        tasks_to_create = []
                        for task in generated_plan["tasks"]:
                            tasks_to_create.append({
                                "user_id": user_id,
                                "study_plan_id": plan_id,
                                "title": task.get("title", "Untitled Task"),
                                "description": task.get("description", ""),
                                "scheduled_time": task.get("scheduled_time"),
                                "duration_minutes": task.get("duration_minutes", 30),
                                "priority": task.get("priority", "medium"),
                                "status": "pending"
                            })
                        if tasks_to_create:
                            supabase.table("tasks").insert(tasks_to_create).execute()
        
        elif ai_response.get("action") == "task_update":
            update_data = ai_response.get("meta", {}).get("task_update")
            if update_data and update_data.get("id"):
                supabase.table("tasks").update({"status": update_data["status"]}).eq("id", update_data["id"]).eq("user_id", user_id).execute()

        return ai_response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/history")
async def clear_history(user_id: str = Depends(get_current_user_id)):
    try:
        supabase = get_supabase_admin_client()
        supabase.table("chat_messages").delete().eq("user_id", user_id).execute()
        return {"message": "Chat history cleared"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
