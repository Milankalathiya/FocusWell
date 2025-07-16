# 🚀 FocusWell

**Focus Well** is a modern productivity and wellness platform that helps users manage tasks, habits, and wellness — powered by an **AI Wellness Coach**.

It features a robust **Java Spring Boot** backend, a **React + TypeScript** frontend, and a **Python microservice** for AI chat and insights.

---

## 📑 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Setup & Installation](#setup--installation)
  - [Backend (Spring Boot)](#1-backend-java-spring-boot)
  - [Frontend (React + TypeScript)](#2-frontend-react--typescript)
  - [AI Microservice (Python)](#3-ai-microservice-python)
- [AI Chatbot](#ai-chatbot)
- [Development Notes](#development-notes)
- [License](#license)

---

## ✨ Features

- ✅ User Registration & Login (JWT-secured authentication)
- ✅ Dashboard: Overview of tasks, habits, and wellness logs
- ✅ Task & Habit Tracker: Daily goal management
- ✅ Wellness Tracking: Log mood, sleep, and activity data
- ✅ **AI Wellness Coach**:
  - Chatbot focused on mental health, productivity & self-improvement
  - Markdown-formatted responses with friendly tone
  - Modern overlay UI with typing indicator
  - **Strict topic filtering** (no off-topic replies)
- ✅ Analytics: Visual insights & progress tracking
- ✅ Responsive Design: Works on both desktop & mobile

---

## 🧱 Architecture

```bash
trackit/
├── src/       # Java Spring Boot REST API
├── trackit-frontend/      # React + TypeScript
└── ai_service/            # Python Flask AI Microservice
```

⚙️ Setup & Installation
1. Backend (Java Spring Boot)
```bash
cd trackit-backend/
./mvnw spring-boot:run
Runs on: http://localhost:8080
```

3. Frontend (React + TypeScript)
```bash
cd trackit-frontend/
npm install
npm run dev
Runs on: http://localhost:5173
```

4. AI Microservice (Python Flask)
```bash
cd ai_service/
pip install -r requirements.txt
python app.py
Runs on: http://localhost:5001
```

📌 Environment Variables:
Create a .env file inside ai_service/:

COHERE_API_KEY=your_key_here

🤖 AI Chatbot:
The AI Wellness Coach:

Answers ONLY on:

Mental health

Productivity

Self-improvement

Wellness

❌ Ignores off-topic questions (via semantic filtering)

🧠 Uses Cohere API + sentence-transformers

📝 Supports markdown-formatted answers (lists, bold text, etc.)

💬 Friendly first-time greeting

💻 Renders in a wide chat UI with typing indicator

🛠️ Development Notes


Frontend:
Built with React + TypeScript

Uses react-markdown to render AI responses

Responsive overlay chat with Tailwind styling

Backend:
Java Spring Boot + Spring Security

REST APIs with JPA & MySQL/PostgreSQL

AI Microservice:
Python Flask

Cohere LLM API + sentence-transformers

Libraries: transformers, torch, numpy

📜 License
This project is licensed under the MIT License.

🤝 Contributions
Contributions, suggestions, and issues are welcome!
Feel free to open a PR or issue to improve the platform. 🙌


