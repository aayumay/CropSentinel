"""
Service layer for generating structured agricultural intervention plans using Groq + Llama.
"""
import os
import json
import re
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def generate_intervention_plan(intervention_data: dict) -> dict:
    """
    Upgrades intervention recommendations into a structured execution plan
    using Groq's llama-3.1-8b-instant. Wraps operations in robust fallback blocks.
    """
    priority = intervention_data.get("priority", "LOW")
    action = intervention_data.get("action", "Continue Monitoring")
    time_window = intervention_data.get("time_window", "7 days")
    estimated_cost = intervention_data.get("estimated_cost", 0)
    estimated_yield_loss = intervention_data.get("estimated_yield_loss", 0)
    expected_benefit = intervention_data.get("expected_benefit", 0)
    reasoning = intervention_data.get("reasoning", "")

    # Fallback plan preparation
    action_lower = str(action).lower()
    if "irrigate" in action_lower:
        fallback = {
            "summary": "Immediate irrigation is recommended.",
            "execution_steps": [
                "Begin irrigation within 48 hours",
                "Monitor field moisture levels",
                "Review crop condition after irrigation"
            ],
            "expected_outcome": "Reduced crop stress."
        }
    elif "prepare" in action_lower or "monitor" in action_lower:
        fallback = {
            "summary": "Preparation for irrigation and close monitoring are recommended.",
            "execution_steps": [
                "Prepare irrigation equipment and resources",
                "Monitor field moisture levels closely over the next few days",
                "Review crop condition and prepare to irrigate if stress increases"
            ],
            "expected_outcome": "Preparedness for timely water application."
        }
    else:
        fallback = {
            "summary": "Continued routine monitoring is recommended.",
            "execution_steps": [
                "Observe crop condition daily for any signs of stress",
                "Monitor weather forecasts and soil moisture levels",
                "Review risk assessment in 7 days or if conditions change"
            ],
            "expected_outcome": "Maintained crop health and early stress detection."
        }

    try:
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            print("[Warning] GROQ_API_KEY environment variable is missing. Returning fallback plan.")
            return fallback

        client = Groq(api_key=groq_api_key)

        system_prompt = (
            "You are an expert agricultural advisor. Based on the provided farm intervention metrics, "
            "you must generate a human-friendly execution plan.\n"
            "You MUST return your response as a valid, parses-clean JSON object with EXACTLY the following structure:\n"
            "{\n"
            "  \"summary\": \"A brief summary of the execution plan.\",\n"
            "  \"execution_steps\": [\n"
            "    \"Step 1 description\",\n"
            "    \"Step 2 description\",\n"
            "    \"Step 3 description\"\n"
            "  ],\n"
            "  \"expected_outcome\": \"Description of the expected outcome.\"\n"
            "}\n\n"
            "Rules:\n"
            "1. Do not use any markdown styling (no asterisks, no double asterisks, no headers, no backticks).\n"
            "2. The 'execution_steps' list must contain between 3 and 5 short, clear, actionable steps.\n"
            "3. Inside the 'execution_steps' strings, do NOT include any bullet symbols, numbers, dashes or asterisks (e.g. write 'Initiate water flow' instead of '1. Initiate water flow' or '- Initiate water flow').\n"
            "4. Limit the entire response content (summary, steps, outcome) to a maximum of 120 words.\n"
            "5. Return only raw valid JSON. Do not write any conversational preamble or wrap the JSON in markdown code blocks."
        )

        user_prompt = (
            f"Intervention Data:\n"
            f"- Priority: {priority}\n"
            f"- Action: {action}\n"
            f"- Time Window: {time_window}\n"
            f"- Estimated Cost: ${estimated_cost}\n"
            f"- Estimated Yield Loss: ${estimated_yield_loss}\n"
            f"- Expected Benefit: ${expected_benefit}\n"
            f"- Reasoning: {reasoning}"
        )

        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
            max_tokens=300
        )

        response_content = completion.choices[0].message.content.strip()
        parsed_plan = json.loads(response_content)

        # Validate that the parsed JSON has the required structure
        if "summary" in parsed_plan and "execution_steps" in parsed_plan and "expected_outcome" in parsed_plan:
            # Clean up execution steps from bullet characters just in case the LLM did not follow instructions fully
            cleaned_steps = []
            for step in parsed_plan["execution_steps"]:
                s = str(step).strip()
                s = re.sub(r'^[\s\-\*\•\u2022]+', '', s)  # strip symbols
                s = re.sub(r'^\d+[\.\)\:\-]\s*', '', s)  # strip "1.", "1)", "1-", etc.
                if s:
                    cleaned_steps.append(s)
            parsed_plan["execution_steps"] = cleaned_steps
            return parsed_plan
        else:
            print("[Warning] Parsed LLM response did not contain required keys. Returning fallback plan.")
            return fallback

    except Exception as e:
        print(f"[Warning] Failed to generate LLM intervention plan: {e}. Returning fallback plan.")
        return fallback
