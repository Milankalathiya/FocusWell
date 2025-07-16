from flask import Flask, request, jsonify
import os
import openai

app = Flask(__name__)

# Set your OpenAI API key here or via environment variable
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY

def analyze_journals_with_openai(notes):
    if not notes or not OPENAI_API_KEY:
        return None
    prompt = (
        "You are a wellness coach AI. Analyze the following user journal notes for mood, stress, and overall sentiment. "
        "Summarize the user's emotional state in 1-2 sentences and suggest one actionable tip for improvement.\n\n"
        f"User notes: {notes}\n"
    )
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "system", "content": "You are a helpful wellness assistant."},
                      {"role": "user", "content": prompt}],
            max_tokens=120,
            temperature=0.7
        )
        return response.choices[0].message['content'].strip()
    except Exception as e:
        print(f"OpenAI error: {e}")
        return None

def generate_recommendations_with_openai(user_data):
    if not OPENAI_API_KEY:
        return None
    prompt = (
        "You are a wellness and productivity AI coach. Based on the following user data (habits, mood, sleep, tasks, etc.), "
        "generate 2-3 personalized, science-backed recommendations to improve their well-being.\n\n"
        f"User data: {user_data}\n"
    )
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "system", "content": "You are a helpful wellness assistant."},
                      {"role": "user", "content": prompt}],
            max_tokens=180,
            temperature=0.7
        )
        return response.choices[0].message['content'].strip()
    except Exception as e:
        print(f"OpenAI error: {e}")
        return None

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '')
    history = data.get('history', [])
    if not message:
        return jsonify({'reply': "Please enter a message."})
    # Build conversation for OpenAI
    messages = []
    for msg in history:
        role = 'user' if msg.get('sender') == 'user' else 'assistant'
        messages.append({"role": role, "content": msg.get('text', '')})
    messages.append({"role": "user", "content": message})
    reply = ""
    if OPENAI_API_KEY:
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "system", "content": "You are a supportive, expert wellness and productivity coach. Be concise, positive, and actionable."}] + messages,
                max_tokens=120,
                temperature=0.7
            )
            reply = response.choices[0].message['content'].strip()
        except Exception as e:
            print(f"OpenAI error: {e}")
            reply = "Sorry, I couldn't process your request."
    else:
        reply = "AI chat is not available. Please set up your OpenAI API key."
    return jsonify({"reply": reply})

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    wellness_data = data.get('wellnessData', [])
    tasks = data.get('tasks', [])
    habit_logs = data.get('habitLogs', [])

    # Extract notes/journals for sentiment analysis
    notes = " ".join([d.get('notes', '') for d in wellness_data if d.get('notes')])

    # Use OpenAI for sentiment analysis and recommendations if possible
    sentiment_summary = analyze_journals_with_openai(notes)
    recommendations = generate_recommendations_with_openai({
        'wellnessData': wellness_data,
        'tasks': tasks,
        'habitLogs': habit_logs
    })

    # Simple fallback logic if OpenAI is not configured
    if not sentiment_summary:
        sentiment_summary = "No journal analysis available."
    if not recommendations:
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
    app.run(port=5001)
