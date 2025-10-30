# 🌿 MindTrack – Wellness & Habit Tracker

**MindTrack** is an AI-powered wellness web app built using **[Lovable.ai](https://lovable.ai/)**.  
It helps users **build healthy habits, track emotions, set goals, and stay mindful every day** — all through a clean, AI-driven interface.  

This project integrates both **Frontend** and **Backend** using Lovable’s no-code AI platform — making **mental wellness simple, smart, and personalized.**

---

## 💖 Built with Lovable.ai

**Lovable.ai** is an AI-powered app builder that automatically generates frontend, backend, and database logic through natural language prompts.  
MindTrack was developed using prompt-based design, refined with **“Edit with AI”** and **“Preview”** features.

> 💡 *“Track your habits. Nurture your mind. Grow every day with MindTrack.”*

---

## 🧠 Key Features

✅ **AI-Powered Habit Suggestions** – Personalized wellness ideas based on user data.  
✅ **Daily Mood Tracker** – Log emotions and visualize your mental trends.  
✅ **Timer & Calendar View** – Stay consistent using focus timers and track habits date-wise.  
✅ **Goal Setting & Tracking** – Define, edit, and monitor your personal wellness targets.  
✅ **Progress Dashboard** – Interactive charts showing habit streaks and achievements.  
✅ **Google Sheets Integration** – Sync data automatically for backup & analytics.  
✅ **Responsive Design** – Works perfectly on desktop, tablet, and mobile.  
✅ **Secure Authentication** – Manage user sessions safely through Supabase.  

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | Lovable.ai (AI-generated UI), TypeScript, Tailwind CSS |
| **Backend** | Lovable.ai (AI logic & API generation) |
| **Database** | Supabase |
| **Deployment** | Lovable Cloud |
| **Version Control** | GitHub |

---

## 📂 Project Structure

```
MindTrack-Wellness-Habit-Tracker/
├── public/                        # Static assets (icons, images, manifest files)
│   ├── favicon.ico
│   ├── logo.png
│   └── manifest.json
│
├── src/                           # Main source code folder
│   ├── components/                # Reusable UI components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── HabitCard.tsx
│   │   ├── MoodTracker.tsx
│   │   ├── Timer.tsx
│   │   └── CalendarView.tsx
│   │
│   ├── pages/                     # Page-level React components
│   │   ├── Home.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   └── Signup.tsx
│   │
│   ├── hooks/                     # Custom React hooks
│   │   └── useHabits.ts
│   │
│   ├── utils/                     # Helper functions and constants
│   │   ├── dateUtils.ts
│   │   └── storageHelper.ts
│   │
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # App entry point
│   └── index.css                  # Global styles
│
├── supabase/                      # Backend configuration (Lovable auto-generated)
│   ├── client.ts
│   ├── schema.sql
│   └── functions/
│       └── handleUserData.ts
│
├── .env                           # Environment variables (API keys, Supabase config)
├── .gitignore                     # Files ignored in version control
├── README.md                      # Project documentation
├── bun.lockb                      # Lock file for Bun package manager
├── components.json                 # Lovable component configuration
├── eslint.config.js               # ESLint configuration for code linting
├── index.html                     # Base HTML file for Vite
├── package.json                   # Project dependencies and scripts
├── package-lock.json              # Dependency lock file
├── postcss.config.js              # PostCSS configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── tsconfig.app.json              # TypeScript configuration for app
├── tsconfig.json                  # Root TypeScript configuration
├── tsconfig.node.json             # Node environment config
└── vite.config.ts                 # Vite build configuration
```
## 💡 Explanation of Key Folders
| Folder/File          | Description                                                                           |
| -------------------- | ------------------------------------------------------------------------------------- |
| `public/`            | Contains static assets that don’t need processing (icons, logos, etc).                |
| `src/`               | All core logic and UI code lives here — main app logic, components, hooks, utilities. |
| `components/`        | Modular reusable UI parts like cards, timers, calendars, etc.                         |
| `pages/`             | Page-level views connected to routes (Home, Dashboard, Login).                        |
| `supabase/`          | Database, authentication, and backend logic (Lovable auto-generated).                 |
| `.env`               | Stores API keys or private URLs securely (not pushed to GitHub).                      |
| `tailwind.config.ts` | Custom Tailwind CSS styling setup.                                                    |
| `vite.config.ts`     | Vite setup for faster development build.                                              |

---
## ⚙️ Tech Stack Used
| Category            | Technology                               |
| ------------------- | ---------------------------------------- |
| **Frontend**        | React + TypeScript + Tailwind CSS        |
| **Backend**         | Supabase (integrated through Lovable.ai) |
| **Build Tool**      | Vite                                     |
| **Package Manager** | Bun                                      |
| **AI Builder**      | Lovable.ai                               |
| **Version Control** | Git + GitHub                             |
---
## 🚀 How to Run Locally

```bash
# Clone this repository
git clone https://github.com/Shivshanker869/mindtrack-personalwellness.git

# Open in Lovable.ai
1️⃣ Visit https://lovable.ai  
2️⃣ Log in → Click “My Projects”  
3️⃣ Choose **Import Project** → Upload your exported project files or link your GitHub repository
```
---
## 🌐 Live Demo

🟢 Try the live app here:
👉 mindtrack-personalwellness.lovable.app

This deployed version connects real-time with the backend and database, allowing users to experience full functionality — from adding habits to tracking emotional progress.
---
## 🧩 Future Enhancements

✨ AI Wellness Assistant – Smart chat suggestions for daily motivation.
🔔 Reminder Notifications – Timely alerts for habits and focus sessions.
📊 Export Progress Reports – Download wellness data in Excel or PDF format.
💬 Community Space – Share achievements and inspire others.
📱 Mobile PWA Version – For seamless usage on smartphones.
---
## 🏁 Deployment Guide

To publish using Lovable:

Open the project in Lovable.ai

Click on Share → Publish

Get your live link instantly
---
## 🌐 Custom Domain Setup

You can connect a personal domain:

Go to Project → Settings → Domains

Click Connect Domain

Add your DNS record as guided by Lovable

📖 Official Guide: Setting up a custom domain
---
## 🧠 Created & Presented By

👨‍💻 Team Name: TestRide Team

🧑‍🏫 Submitted To: Ma’am Ritu Bahaguna
---
| Team Member               | Role                       |
| ------------------------- | -------------------------- |
| **Shiv Shanker Gupta**    | Developer & AI Integration |
| **Diptanu Podder**        | UI/UX & Design             |
| **A. Mahesh Reddy Avula** | Testing & Documentation    |

---
## ⭐ Project Motto

“MindTrack isn’t just an app — it’s your digital companion for mindfulness and growth.” 🌱

---

### ✅ Highlights of This Version:
- Perfect markdown formatting for GitHub (headings, icons, tables).  
- Professional tone and layout suitable for hackathon or portfolio.  
- Includes all your requested features (Timer, Calendar, AI, etc).  
- Easy to read and attractive for judges, recruiters, or reviewers.

---


