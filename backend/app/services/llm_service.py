"""
Service layer for generating agricultural advice using Llama models via Groq.
"""
import os
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def generate_advice(
    risk_score: int,
    risk_level: str,
    recommendation: str,
    ndvi: float,
    temperature: int,
    humidity: int,
    rain_probability: int
) -> str:
    """
    Generates natural-language agricultural advice based on rule-based risk factors using a Llama model on Groq.
    """
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY environment variable is missing.")

    client = Groq(api_key=groq_api_key)

    system_prompt = (
        "You are an agricultural assistant. Explain the farm risk assessment results in simple, farmer-friendly language. "
        "Strictly adhere to the following rules:\n"
        "1. Explain results in simple, clear language.\n"
        "2. Mention the crop stress level.\n"
        "3. Mention weather conditions (temperature, humidity).\n"
        "4. Mention the rainfall outlook.\n"
        "5. Mention why the recommendation was generated.\n"
        "6. Keep responses under 120 words.\n"
        "7. Do not invent any data or use any assumptions outside the provided inputs.\n"
        "8. Do not change or modify the recommendation."
    )

    user_prompt = (
        f"Risk Score: {risk_score}\n"
        f"Risk Level: {risk_level}\n"
        f"Recommendation: {recommendation}\n"
        f"NDVI: {ndvi}\n"
        f"Temperature: {temperature}\n"
        f"Humidity: {humidity}\n"
        f"Rain Probability: {rain_probability}"
    )

    # Use a fast, lightweight, and reliable Llama model on Groq
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.2,
        max_tokens=250
    )

    advice = completion.choices[0].message.content
    return advice.strip()
