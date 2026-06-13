"""
Service layer for computing farm risk assessments by combining Sentinel-2 NDVI data and Weather data.
"""
from app.services.copernicus_service import get_ndvi
from app.services.weather_service import get_weather
from app.services.llm_service import generate_advice

def calculate_risk(latitude: float, longitude: float, ndvi_data: dict = None, weather_data: dict = None) -> dict:
    """
    Combines Sentinel-2 NDVI data and Weather Forecast data into a farm risk assessment.
    """
    # 1. Retrieve NDVI metrics
    if ndvi_data is None:
        ndvi_data = get_ndvi(latitude, longitude)
    ndvi = ndvi_data.get("ndvi", 0.0)

    # 2. Retrieve weather metrics
    if weather_data is None:
        weather_data = get_weather(latitude, longitude)
    current_weather = weather_data.get("current", {})
    temperature = current_weather.get("temperature")
    humidity = current_weather.get("humidity")

    # 3. Calculate average rain probability for the next 3 forecast days
    forecast = weather_data.get("forecast", [])
    forecast_3_days = forecast[:3]
    if forecast_3_days:
        rain_probs = [day.get("rain_probability", 0) for day in forecast_3_days]
        rain_probability = int(round(sum(rain_probs) / len(rain_probs)))
    else:
        rain_probability = 0

    # 4. Generate risk score (0-100) using rule-based scoring logic
    risk_score = 0

    # NDVI rules
    if ndvi < 0.30:
        risk_score += 40
    elif ndvi < 0.45:
        risk_score += 25

    # Temperature rules
    if temperature is not None:
        if temperature > 38:
            risk_score += 20
        elif temperature > 34:
            risk_score += 10

    # Rain probability rules
    if rain_probability < 20:
        risk_score += 20
    elif rain_probability < 40:
        risk_score += 10

    # Humidity rules
    if humidity is not None:
        if humidity < 35:
            risk_score += 20
        elif humidity < 50:
            risk_score += 10

    # Cap score at 100
    risk_score = min(100, risk_score)

    # 5. Determine risk level
    if risk_score <= 29:
        risk_level = "LOW"
    elif risk_score <= 59:
        risk_level = "MEDIUM"
    else:
        risk_level = "HIGH"

    # 6. Generate recommendation
    if risk_level == "HIGH":
        recommendation = "Irrigate within 48 hours"
    elif risk_level == "MEDIUM":
        recommendation = "Monitor crop conditions and irrigation needs"
    else:
        recommendation = "No immediate intervention required"

    # 7. Generate LLM natural language explanation via Groq (with static fallback)
    try:
        llm_explanation = generate_advice(
            risk_score=risk_score,
            risk_level=risk_level,
            recommendation=recommendation,
            ndvi=ndvi,
            temperature=temperature if temperature is not None else 0,
            humidity=humidity if humidity is not None else 0,
            rain_probability=rain_probability
        )
    except Exception as e:
        llm_explanation = (
            f"The crop appears to be under stress due to a low vegetation index (NDVI: {ndvi}). "
            f"Current weather conditions are {temperature}°C and {humidity}% relative humidity. "
            f"With a {rain_probability}% average probability of rain over the next 3 days, "
            f"the risk level is assessed as {risk_level}. Recommendation: {recommendation}."
        )

    # 8. Return normalized response
    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "recommendation": recommendation,
        "llm_explanation": llm_explanation,
        "factors": {
            "ndvi": ndvi,
            "temperature": temperature,
            "humidity": humidity,
            "rain_probability": rain_probability
        }
    }
