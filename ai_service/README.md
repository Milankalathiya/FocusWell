# AI Service

This microservice powers AI-driven insights and recommendations for the LifeDash/WellnessGuardian project.

## Features

- Receives user data (wellness, tasks, habits) from the Java backend
- Runs AI/ML/NLP analysis (correlation, sentiment, recommendations)
- Returns actionable insights and suggestions

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the service:
   ```bash
   python app.py
   ```

## API

- **POST /analyze**
  - Request: JSON with user data
  - Response: JSON with wellness score, insights, recommendations, sentiment summary

## Next Steps

- Integrate real AI/ML/NLP logic (OpenAI, HuggingFace, etc.)
- Connect to Java backend for live data
