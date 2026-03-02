# 📱 AI-SmartLearn (Mobile App)

### 🚀 AI-Powered Personalized Learning & Smart Reminder System

**AI-SmartLearn** is an intelligent mobile learning assistant designed to help you achieve your goals efficiently. It generates **tailored study plans**, adapts to your performance, and sends **smart reminders** directly to your device.

Built for **Android** (via Capacitor) and powered by **Supabase** and **AI**, it delivers a seamless, personalized learning experience on the go.

---

## 🚀 Key Features

### 🎯 Personalized Study Plans

- Generates custom study plans based on:
  - User schedule
  - Subject / Skill
  - Daily available time
  - Target exam date
  - Skill level
  - Strengths & weaknesses

### 🧠 AI-Powered Task Breakdown

- Converts large goals into micro-tasks
- Allocates optimal time blocks
- Adds revision cycles automatically
- Adjusts plan dynamically based on progress

### 🔔 Smart Reminder System

- **Push Notifications** for daily tasks
- Adaptive rescheduling for missed tasks
- Deadline-based urgency escalation
- Cross-platform alerts (Telegram / Email)

### 📊 Progress Analytics

- Completion rate tracking
- Weekly performance summaries
- Streak tracking
- Weak area detection

---

# 🏗️ Tech Stack

## 📱 Mobile (Android)

- **React.js** (UI Framework)
- **Capacitor** (Native Runtime)
- **Ionic Framework** (Mobile Components - Optional)
- **Tailwind CSS** (Styling)

## 🔙 Backend

- **FastAPI** (Python)
- **APScheduler / Celery** (Background jobs)

## 🗄️ Database

- **Supabase**
  - PostgreSQL (Primary Database)
  - Supabase Auth (Authentication)
  - Supabase Realtime (Live updates)

## 🧠 AI Integration

- OpenAI API / Gemini API

## 🔔 Notifications

- **Firebase Cloud Messaging (FCM)** (Push Notifications)
- Telegram Bot API
- Email (SMTP / SendGrid)

---

# 🧠 System Architecture (Mobile)

```
                        ┌─────────────────────────┐
                        │      User (Mobile)      │
                        │    (Android / iOS)      │
                        └─────────────┬───────────┘
                                      │
                                      ▼
                        ┌─────────────────────────┐
                        │   React Mobile App      │
                        │      (Capacitor)        │
                        └─────────────┬───────────┘
                                      │ HTTPS / REST
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
 │ - Users         │        └─────────────────┘       │ - FCM (Push)     │
 │ - Study Plans   │                                  │ - Telegram       │
 │ - Tasks         │                                  │ - Email          │
 └─────────────────┘                                  └──────────────────┘
```

---

# 🔄 Workflow Diagram

```
User Input (Mobile)
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
Schedule Reminders (Push/Telegram)
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

- id (UUID)
- name
- email
- goal
- target_date
- daily_available_time
- created_at

## 📘 StudyPlans

- id (UUID)
- user_id (Foreign Key)
- generated_plan (JSON)
- created_at

## 📝 Tasks

- id (UUID)
- user_id (Foreign Key)
- title
- description
- scheduled_time
- status (Pending / Completed / Missed)
- priority
- created_at

---

# 🛠️ Setup Instructions

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/AI-SmartLearn.git
cd AI-SmartLearn
```

## 2️⃣ Supabase Setup

1.  Create project at [https://supabase.com](https://supabase.com)
2.  Create required tables
3.  Enable Supabase Auth
4.  Copy Project URL & Anon Public Key to `.env`

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

## 4️⃣ Mobile App Setup

### Prerequisites

- Node.js & npm
- Android Studio (for Android build)
- Java/JDK 17+

### Install Dependencies

```bash
cd frontend
npm install
```

### Run on Web (Browser)

```bash
npm start
```

### Run on Android Emulator/Device

First, sync the web build with the native project:

```bash
npm run build
npx cap sync
```

Open in Android Studio:

```bash
npx cap open android
```

From Android Studio, click the **Run** (Play) button to launch the app on an emulator or connected device.

---

# 📲 Publishing to Play Store

## 1️⃣ Prepare Release Build

1.  **Generate Signed Bundle/APK**:
    - Open project in Android Studio (`npx cap open android`).
    - Go to **Build** > **Generate Signed Bundle / APK**.
    - Select **Android App Bundle** (AAB) for Play Store.
    - Create a new **Key store path** (keep this file safe!).
    - Fill in key details (Alias, Password).
    - Select **Release** build variant.
    - Click **Finish**.

2.  **Locate the File**:
    - The `.aab` file will be generated in `android/app/release/`.

## 2️⃣ Upload to Google Play Console

1.  Go to [Google Play Console](https://play.google.com/console).
2.  **Create App**: Enter app name, language, and select "App" type.
3.  **Set up App**: Complete the Dashboard tasks (Privacy Policy, App Access, Content Ratings, Target Audience, etc.).
4.  **Create Release**:
    - Go to **Production** > **Create new release**.
    - Upload the **Signed AAB** file you generated.
    - Add release notes.
    - **Review and rollout** to production!

---

# 🔮 Future Enhancements

- AI-based burnout prediction
- ML performance modeling
- Gamification (XP, badges)
- WhatsApp integration
- AI conversational mentor mode

---

# 🎯 Use Cases

- GATE / UPSC / JEE preparation
- Coding interviews
- Skill learning (Web Dev, AI, ML)
- Habit building
- Productivity improvement

---

# 🌟 Vision

AI-SmartLearn aims to become a fully adaptive AI learning companion that:

- Understands user behavior
- Predicts weak areas
- Adjusts plans dynamically
- Ensures goal achievement through intelligent reminders

