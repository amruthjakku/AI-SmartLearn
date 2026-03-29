import json
from typing import List, Dict, Any
from datetime import datetime, timedelta
from openai import AsyncOpenAI
from app.config import get_settings

settings = get_settings()


class AIService:
    """Service for AI-powered study plan generation using Groq."""
    
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.groq_api_key,
            base_url="https://api.groq.com/openai/v1"
        )
        self.model_large = "llama-3.3-70b-versatile"
        self.model_fast = "llama-3.1-8b-instant"
    
    async def generate_study_plan(
        self,
        goal: str,
        target_date: str,
        daily_available_time: int,
        skill_level: str = "beginner",
        strengths: List[str] = None,
        weaknesses: List[str] = None,
        additional_notes: str = None
    ) -> Dict[str, Any]:
        """Generate a personalized study plan using Groq AI."""
        
        prompt = self._build_plan_generation_prompt(
            goal, target_date, daily_available_time, skill_level,
            strengths or [], weaknesses or [], additional_notes
        )
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model_large,
                messages=[
                    {"role": "system", "content": "You are an expert study planner and educational consultant. Generate detailed, actionable study plans in JSON format."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.7
            )
            
            plan = json.loads(response.choices[0].message.content)
            return plan
            
        except Exception as e:
            print(f"Error generating AI plan: {e}")
            return self._generate_basic_plan(goal, target_date, daily_available_time)
    
    def _build_plan_generation_prompt(
        self,
        goal: str,
        target_date: str,
        daily_available_time: int,
        skill_level: str,
        strengths: List[str],
        weaknesses: List[str],
        additional_notes: str
    ) -> str:
        """Build the prompt for plan generation."""
        
        prompt = f"""
Generate a personalized study plan with the following requirements:

**Goal**: {goal}
**Target Date**: {target_date}
**Daily Available Time**: {daily_available_time} minutes
**Current Skill Level**: {skill_level}
**Strengths**: {', '.join(strengths) if strengths else 'None specified'}
**Weaknesses**: {', '.join(weaknesses) if weaknesses else 'None specified'}
**Additional Notes**: {additional_notes or 'None'}

Generate a comprehensive study plan in JSON format with the following structure:
{{
    "title": "Plan title",
    "description": "Brief description of the plan",
    "total_weeks": number,
    "daily_schedule": {{
        "recommended_time_slots": ["time slots for study"]
    }},
    "weekly_breakdown": [
        {{
            "week": 1,
            "focus_area": "Main topic for this week",
            "objectives": ["list of objectives"],
            "tasks": [
                {{
                    "day": "Monday",
                    "title": "Task title",
                    "description": "Task description",
                    "duration_minutes": 30,
                    "priority": "high/medium/low"
                }}
            ]
        }}
    ],
    "tasks": [
        {{
            "title": "Task title",
            "description": "Task description",
            "scheduled_time": "ISO datetime string",
            "duration_minutes": 30,
            "priority": "high/medium/low",
            "type": "study/practice/review/quiz"
        }}
    ],
    "revision_schedule": {{
        "description": "Revision strategy",
        "intervals": ["spaced repetition intervals"]
    }},
    "milestones": [
        {{
            "week": 1,
            "milestone": "Milestone description",
            "criteria": "How to measure completion"
        }}
    ],
    "tips": ["Helpful study tips for this goal"]
}}

Make sure tasks are spread across available time slots and include regular revision sessions.
Consider the user's skill level and focus more time on weak areas.
"""
        return prompt
    
    def _generate_basic_plan(
        self,
        goal: str,
        target_date: str,
        daily_available_time: int
    ) -> Dict[str, Any]:
        """Generate a basic plan structure when AI fails."""
        
        # Calculate days until target
        try:
            target = datetime.strptime(target_date, "%Y-%m-%d")
            today = datetime.utcnow()
            days_remaining = (target - today).days
        except:
            days_remaining = 30
        
        tasks = []
        current_date = datetime.utcnow()
        
        for i in range(min(days_remaining, 30)):  # Generate tasks for next 30 days max
            task_date = current_date + timedelta(days=i)
            tasks.append({
                "title": f"Study Session: {goal}",
                "description": f"Dedicate {daily_available_time} minutes to learning",
                "scheduled_time": task_date.strftime("%Y-%m-%dT09:00:00"),
                "duration_minutes": daily_available_time,
                "priority": "medium",
                "type": "study"
            })
        
        return {
            "title": f"Study Plan: {goal}",
            "description": f"A {days_remaining}-day study plan to achieve your goal",
            "total_weeks": days_remaining // 7,
            "tasks": tasks,
            "milestones": [
                {"week": 1, "milestone": "Complete foundational concepts"},
                {"week": 2, "milestone": "Practice and apply knowledge"},
                {"week": 4, "milestone": "Review and refine skills"}
            ],
            "tips": [
                "Study consistently at the same time each day",
                "Take short breaks every 25-30 minutes",
                "Review previous material regularly"
            ]
        }
    
    async def adjust_study_plan(
        self,
        current_plan: Dict[str, Any],
        progress_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Adjust study plan based on user progress using Groq AI."""
        
        prompt = f"""
Given the current study plan and user progress, suggest adjustments to optimize learning.

**Current Plan**: {json.dumps(current_plan, indent=2)}

**Progress Data**: {json.dumps(progress_data, indent=2)}

Analyze the progress and adjust the plan accordingly. Consider:
1. Tasks that were missed or delayed
2. Areas where the user is struggling
3. Areas where the user is excelling
4. Time management patterns

Return the adjusted plan in the same JSON format as the original plan.
Only include tasks that haven't been completed yet and adjust their scheduling.
Add new tasks if necessary to fill gaps.
"""
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model_large,
                messages=[
                    {"role": "system", "content": "You are an expert study planner. Adjust plans based on user progress."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.7
            )
            
            adjusted_plan = json.loads(response.choices[0].message.content)
            return adjusted_plan
            
        except Exception as e:
            print(f"Error adjusting AI plan: {e}")
            return current_plan
    
    async def generate_daily_summary(
        self,
        tasks_completed: List[Dict[str, Any]],
        tasks_pending: List[Dict[str, Any]]
    ) -> str:
        """Generate a motivational summary of daily progress using Groq AI."""
        
        prompt = f"""
Generate a brief, motivational summary for the user's daily progress.

**Completed Tasks**: {json.dumps(tasks_completed, indent=2)}
**Pending Tasks**: {json.dumps(tasks_pending, indent=2)}

Keep it concise (2-3 sentences), encouraging, and suggest what to focus on next.
"""
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model_fast,
                messages=[
                    {"role": "system", "content": "You are a supportive study coach."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"Error generating summary: {e}")
            return f"Today you completed {len(tasks_completed)} task(s). Keep up the great work!"
    
    async def suggest_study_time(
        self,
        user_patterns: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Suggest optimal study times based on user patterns using Groq AI."""
        
        prompt = f"""
Based on the user's study patterns, suggest optimal study times.

**User Patterns**: {json.dumps(user_patterns, indent=2)}

Return a JSON object with suggested time slots for morning, afternoon, and evening sessions.
Include a brief explanation for each suggestion.
"""
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model_fast,
                messages=[
                    {"role": "system", "content": "You are a productivity expert."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.7
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            print(f"Error suggesting study times: {e}")
            return {
                "morning": "9:00 AM - 11:00 AM",
                "afternoon": "2:00 PM - 4:00 PM",
                "evening": "7:00 PM - 9:00 PM"
            }