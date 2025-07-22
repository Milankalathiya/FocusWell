from flask import Flask, request, jsonify
import os
import cohere

app = Flask(__name__)

# Set your Cohere API key here or via environment variable
COHERE_API_KEY = os.getenv("COHERE_API_KEY", "2XiUiLSO1N3W4CQaLGm9JJX1lHvVs2jJ7lOJ7YKi")
co = cohere.Client(COHERE_API_KEY)

# Expanded allowed topics with variations
ALLOWED_TOPICS = [
    # Core wellness and mental health (with variations)
    "wellness", "wellbeing", "mental health", "mental wellbeing", "stress", "stressed", "depression", "depressed", "anxiety", "anxious", "mood", "happiness", "happy", "sadness", "sad", "motivation", "motivated", "self-care", "self care", "relaxation", "relax", "mindfulness", "burnout", "resilience", "therapy", "therapist", "counseling", "counselor", "support", "gratitude", "journaling", "journal", "meditation", "meditate", "exercise", "exercising", "fitness", "nutrition", "diet", "hydration", "rest", "recovery", "energy", "positivity", "positive", "emotional health", "psychological health", "behavioral health", "coping skills", "cope", "coping", "self-improvement", "improvement", "personal growth", "growth", "life balance", "work-life balance", "work life balance", "social connection", "relationships", "relationship", "support system", "productivity", "productive", "habit", "habits", "sleep", "sleep quality", "sleep hours", "physical activity", "activity", "screen time", "digital wellness", "water intake", "meals skipped", "meditation minutes", "energy level", "notes", "risk assessment", "recommendation", "insight", "streak", "tracking", "analytics", "score", "wellness score", "mood score", "stress level", "productivity score", "physical activity minutes", "social interaction", "social interaction hours", "screen time hours", "water intake glasses", "meals", "meditation", "energy", "created at", "updated at", "journal", "coach", "health", "wellbeing", "personal development", "focus", "concentration", "balance", "life", "work", "rest", "recovery", "motivation", "goal", "goal setting", "achievement", "success", "failure", "challenge", "overcome", "support group", "peer support", "counselor", "psychologist", "psychiatrist", "mental disorder", "diagnosis", "treatment", "prevention", "intervention", "resource", "tip", "advice", "guidance", "routine", "ritual", "habit formation", "behavior change", "positive psychology", "emotional intelligence", "self-awareness", "self-regulation", "mindset", "attitude", "optimism", "pessimism", "gratitude journal", "affirmation", "reflection", "check-in", "survey", "assessment", "screening", "symptom", "sign", "indicator", "trend", "pattern", "history", "log", "record", "entry", "update", "reminder", "notification", "alert", "encouragement", "reward", "celebration", "milestone", "progress", "improvement", "decline", "setback", "relapse", "recovery plan", "treatment plan", "care plan", "action plan", "goal plan", "wellness plan", "mental health plan", "crisis", "emergency", "urgent", "important", "priority", "high priority", "low priority", "urgent priority", "easy", "medium", "hard", "difficulty", "challenge level", "task", "task management", "task tracking", "habit tracking", "habit log", "habit formation", "habit streak", "habit consistency", "habit analytics", "habit insight", "habit recommendation", "habit improvement", "habit decline", "habit setback", "habit recovery", "habit plan", "habit goal", "habit action", "habit support", "habit encouragement", "habit reward", "habit celebration", "habit milestone", "habit progress", "hi", "hello"
]

# Improved topic check: match if any allowed topic is a substring of any word in the message (case-insensitive, partial match)
def is_on_topic(message):
    message_lower = message.lower()
    for topic in ALLOWED_TOPICS:
        if topic in message_lower:
            return True
    return False

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '')
    history = data.get('history', [])
    if not message:
        return jsonify({'reply': "Please enter a message."})
    if not is_on_topic(message):
        return jsonify({'reply': "Sorry, I can only answer questions about wellness, mental health, stress relief, and related topics."})
    # Build conversation for Cohere
    chat_history = ""
    for msg in history:
        role = 'User' if msg.get('sender') == 'user' else 'Coach'
        chat_history += f"{role}: {msg.get('text', '')}\n"
    prompt = (
        "You are FocusWell, a supportive, expert wellness and mental health coach. "
        "Be concise, positive, actionable, and only answer questions about wellness, mental health, stress, depression, or greetings. "
        "If the question is not about these topics, politely refuse.\n"
        f"{chat_history}User: {message}\nCoach:"
    )
    try:
        response = co.generate(
            model="command-r-plus",
            prompt=prompt,
            max_tokens=120,
            temperature=0.7
        )
        reply = response.generations[0].text.strip()
        # Format reply as markdown: add line breaks and preserve bullet points
        reply = reply.replace('\n- ', '\n\n- ').replace('\n', '\n\n')
    except Exception as e:
        print(f"Cohere error: {e}")
        reply = "Sorry, I couldn't process your request."
    return jsonify({"reply": reply})

@app.route('/analyze', methods=['POST'])
def analyze():
    print("Analyze endpoint hit")
    data = request.json
    wellness_data = data.get('wellnessData', [])
    tasks = data.get('tasks', [])
    habit_logs = data.get('habitLogs', [])

    # Extract notes/journals for sentiment analysis
    notes = " ".join([d.get('notes', '') for d in wellness_data if d.get('notes')])
    prompt = (
        "You are a wellness coach AI. Analyze the following user journal notes for mood, stress, and overall sentiment. "
        "Summarize the user's emotional state in 1-2 sentences and suggest one actionable tip for improvement.\n\n"
        f"User notes: {notes}\n"
    )
    try:
        response = co.generate(
            model="command-r-plus",
            prompt=prompt,
            max_tokens=120,
            temperature=0.7
        )
        sentiment_summary = response.generations[0].text.strip()
    except Exception as e:
        print(f"Cohere error: {e}")
        sentiment_summary = "No journal analysis available."

    # Recommendations
    rec_prompt = (
        "You are a wellness and productivity AI coach. Based on the following user data (habits, mood, sleep, tasks, etc.), "
        "generate 2-3 personalized, science-backed recommendations to improve their well-being.\n\n"
        f"User data: {str({'wellnessData': wellness_data, 'tasks': tasks, 'habitLogs': habit_logs})}\n"
    )
    try:
        rec_response = co.generate(
            model="command-r-plus",
            prompt=rec_prompt,
            max_tokens=180,
            temperature=0.7
        )
        recommendations = rec_response.generations[0].text.strip()
    except Exception as e:
        print(f"Cohere error: {e}")
        recommendations = "- Maintain 7+ hours sleep.\n- Complete one small task daily.\n- Try a short walk for stress relief."

    # Example: Calculate a simple wellness score (average of moodScore if available)
    mood_scores = [d.get('moodScore') for d in wellness_data if d.get('moodScore') is not None]
    wellness_score = round(sum(mood_scores) / len(mood_scores), 2) if mood_scores else 75

    # Example: Simple insights
    insights = [
        "Your mood tends to drop after nights with less than 6 hours of sleep.",
        "Completing tasks is strongly correlated with higher mood for you."
    ]

    return jsonify({
        "wellnessScore": wellness_score,
        "insights": insights,
        "recommendations": recommendations,
        "sentimentSummary": sentiment_summary
    })

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
