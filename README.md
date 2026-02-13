
# 📚 AI-SmartLearn

### AI-Powered Personalized Learning & Smart Reminder System

AI-SmartLearn is an intelligent learning assistant that generates **tailored study plans**, adapts to user performance, and sends **smart reminders** to help users achieve their goals efficiently.

The system uses AI APIs and **Supabase** to deliver personalized scheduling, adaptive task management, and real-time notifications.

---

## 🚀 Key Features

### 🎯 Personalized Study Plans

* Generates custom study plans based on:

  * User schedule
  * Subject / Skill
  * Daily available time
  * Target exam date
  * Skill level
  * Strengths & weaknesses

### 🧠 AI-Powered Task Breakdown

* Converts large goals into micro-tasks
* Allocates optimal time blocks
* Adds revision cycles automatically
* Adjusts plan dynamically based on progress

### 🔔 Smart Reminder System

* Automated daily reminders
* Adaptive rescheduling for missed tasks
* Deadline-based urgency escalation
* Telegram / Email / Web notifications

### 📊 Progress Analytics

* Completion rate tracking
* Weekly performance summaries
* Streak tracking
* Weak area detection

---

# 🏗️ Tech Stack

## 🖥️ Frontend

* React.js
* Tailwind CSS
* Recharts (Analytics Dashboard)

## 🔙 Backend

* FastAPI
* APScheduler / Celery (Background jobs)

## 🗄️ Database

* **Supabase**

  * PostgreSQL (Primary Database)
  * Supabase Auth (Authentication)
  * Supabase Realtime (Live updates)
  * Supabase Storage (Optional future feature)

## 🧠 AI Integration

* OpenAI API / Gemini API

## 🔔 Notifications

* Email (SMTP / SendGrid)
* Telegram Bot API
* Browser Push Notifications

---

# 🧠 System Architecture (Visual Overview)

```
                        ┌─────────────────────────┐
                        │        User (Web)       │
                        └─────────────┬───────────┘
                                      │
                                      ▼
                        ┌─────────────────────────┐
                        │       React Frontend    │
                        │  (Dashboard + Planner)  │
                        └─────────────┬───────────┘
                                      │ REST API
                                      ▼
                        ┌─────────────────────────┐
                        │      FastAPI Backend    │
                        │  - Auth Middleware      │
                        │  - AI Service Layer     │
                        │  - Task Scheduler       │
                        └─────────────┬───────────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            ▼                         ▼                         ▼
 ┌─────────────────┐        ┌─────────────────┐       ┌──────────────────┐
 │   Supabase DB   │        │     AI API      │       │ Notification     │
 │  (PostgreSQL)   │        │ (OpenAI/Gemini) │       │ Service Layer    │
 │ - Users         │        └─────────────────┘       │ - Email          │
 │ - Study Plans   │                                   │ - Telegram       │
 │ - Tasks         │                                   │ - Push Alerts    │
 └─────────────────┘                                   └──────────────────┘
                                      │
                                      ▼
                        ┌─────────────────────────┐
                        │   Reminder Scheduler    │
                        │ (APScheduler / Celery)  │
                        └─────────────────────────┘
```

---

# 🔄 Workflow Diagram

```
User Input
   │
   ▼
AI Plan Generation
   │
   ▼
Store Plan in Supabase
   │
   ▼
Break Into Tasks
   │
   ▼
Schedule Reminders
   │
   ▼
User Marks Complete
   │
   ▼
AI Adjusts Future Plan
```

---

# 🗄️ Supabase Database Schema

## 👤 Users

* id (UUID)
* name
* email
* goal
* target_date
* daily_available_time
* created_at

## 📘 StudyPlans

* id (UUID)
* user_id (Foreign Key)
* generated_plan (JSON)
* created_at

## 📝 Tasks

* id (UUID)
* user_id (Foreign Key)
* title
* description
* scheduled_time
* status (Pending / Completed / Missed)
* priority
* created_at

---

# 🛠️ Setup Instructions

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/AI-SmartLearn.git
cd AI-SmartLearn
```

---

## 2️⃣ Supabase Setup

1. Create project at [https://supabase.com](https://supabase.com)
2. Create required tables
3. Enable Supabase Auth
4. Copy:

   * Project URL
   * Anon Public Key

---

## 3️⃣ Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env`:

```
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_anon_key
OPENAI_API_KEY=your_api_key
```

Run backend:

```bash
uvicorn app.main:app --reload
```

---

## 4️⃣ Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

# 🔮 Future Enhancements

* AI-based burnout prediction
* ML performance modeling
* Gamification (XP, badges)
* WhatsApp integration
* Mobile App version
* AI conversational mentor mode

---

# 🎯 Use Cases

* GATE / UPSC / JEE preparation
* Coding interviews
* Skill learning (Web Dev, AI, ML)
* Habit building
* Productivity improvement

---

# 🌟 Vision

AI-SmartLearn aims to become a fully adaptive AI learning companion that:

* Understands user behavior
* Predicts weak areas
* Adjusts plans dynamically
* Ensures goal achievement through intelligent reminders

---

# 📜 License

MIT License
