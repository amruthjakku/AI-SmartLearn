# 📚 AI-SmartLearn

### Personalized AI-Powered Learning & Smart Reminder System

AI-SmartLearn is an intelligent learning assistant that generates **personalized study plans**, adapts to user progress, and sends **smart reminders** to ensure timely task completion.

The system uses AI APIs to tailor learning schedules based on user goals, availability, strengths, weaknesses, and deadlines.

---

## 🚀 Features

### 🎯 Personalized Study Planning

* Custom study plans based on:

  * User schedule
  * Subject / Skill
  * Daily available time
  * Target exam or goal date
  * Skill level (Beginner / Intermediate / Advanced)

### 🧠 AI-Powered Task Generation

* Breaks large goals into micro-tasks
* Allocates realistic time blocks
* Suggests revision schedules
* Adjusts difficulty dynamically

### 🔔 Smart Reminder System

* Automated notifications
* Adaptive rescheduling for missed tasks
* Urgency escalation near deadlines
* Daily task summaries

### 📊 Progress Tracking

* Completion analytics
* Weekly performance reports
* Streak tracking
* Weak area identification

### 💬 Optional Integrations

* Email reminders
* Telegram Bot notifications
* Web push notifications

---

## 🏗️ Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Recharts (for analytics)

### Backend

* FastAPI
* PostgreSQL
* Redis (for scheduling & background jobs)

### AI Integration

* OpenAI / Gemini API
* Prompt-engineered personalization engine

### Notifications

* APScheduler / Celery
* Email (SMTP / SendGrid)
* Telegram Bot API

---

## 🧠 How It Works

1. User signs up.
2. User provides:

   * Study goal (e.g., GATE 2026, DSA Mastery, React Development)
   * Time available per day
   * Weak & strong subjects
   * Target date
3. AI generates a personalized weekly plan.
4. System schedules tasks and reminders.
5. User marks tasks as complete.
6. AI adjusts future plans based on performance.

---

## 📂 Project Structure (Planned)

```
AI-SmartLearn/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── README.md
└── .env
```

---

## 📊 Database Design (Initial)

### Users

* id
* name
* email
* goal
* target_date
* daily_available_time

### StudyPlans

* id
* user_id
* generated_plan (JSON)
* created_at

### Tasks

* id
* user_id
* title
* description
* scheduled_time
* status
* priority

---

## 🛠️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/AI-SmartLearn.git
cd AI-SmartLearn
```

---

### 2️⃣ Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` file:

```
OPENAI_API_KEY=your_api_key
DATABASE_URL=your_database_url
REDIS_URL=your_redis_url
```

Run backend:

```bash
uvicorn app.main:app --reload
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

## 🔮 Future Enhancements

* AI-based burnout prediction
* Gamification (XP, Levels, Badges)
* WhatsApp integration
* Voice-based interaction
* ML-based performance prediction
* Community leaderboard

---

## 🎯 Use Cases

* Competitive exam preparation (GATE, UPSC, JEE, etc.)
* Coding interview preparation
* Skill learning (Web Dev, AI, ML, etc.)
* Time management improvement
* Personal productivity enhancement

---

## 💡 Vision

AI-SmartLearn aims to become an adaptive AI learning companion that understands user behavior, predicts performance gaps, and ensures goal achievement through intelligent scheduling and reminders.

---

## 🤝 Contributing

Contributions are welcome!
Feel free to fork the repository and submit pull requests.

---

## 📜 License

This project is licensed under the MIT License.
