<<<<<<< HEAD

# Frontend Branch - Track It

This branch contains the frontend work for the project, including:

- User registration
- User login
- Dashboard navigation with browser history handling to prevent back navigation after login/register

## Features

- Registration and login forms with validation
- After successful login/register, users are redirected to the dashboard
- Users cannot go back to the login or register pages using the browser back button once authenticated
- Clean navigation flow mimicking a real-world application behavior

## How to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   =======
   ```

# LifeDash

> > > > > > > 010a5b0f9d21b0ac653258c98f2b1af854896ef5

# Python AI Microservice

A new folder `ai_service/` will be created at the project root. This microservice will:

- Receive user data from the Java backend (wellness, tasks, habits, etc.)
- Run AI/ML/NLP analysis (correlation, sentiment, recommendations)
- Return actionable insights and suggestions to the backend

## How to Run

1. Navigate to the `ai_service/` directory:
   ```bash
   cd ai_service
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the service:
   ```bash
   python app.py
   ```

The service will run on `http://localhost:5001/analyze` by default.
