"""
Service layer for fetching and processing weather forecast data from Open-Meteo.
"""
import requests

def get_weather(latitude: float, longitude: float) -> dict:
    """
    Fetches current & 7-day forecast agricultural weather data directly by coordinates
    and reverse geocodes the coordinate to get a display location name.
    """
    # 1. Reverse geocode coordinates to display location name via BigDataCloud client API
    try:
        reverse_geocode_url = f"https://api.bigdatacloud.net/data/reverse-geocode-client?latitude={latitude}&longitude={longitude}&localityLanguage=en"
        geo_response = requests.get(reverse_geocode_url, timeout=10)
        geo_response.raise_for_status()
        geo_data = geo_response.json()
        resolved_location_name = geo_data.get("city") or geo_data.get("locality") or geo_data.get("principalSubdivision") or "Unknown Location"
    except Exception as e:
        print(f"[Warning] Reverse geocoding failed (Error: {str(e)}). Using fallback location name.")
        resolved_location_name = "Unknown Location"

    # 2. Query the weather forecast API for agricultural metrics directly using coordinates
    try:
        forecast_url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={latitude}&longitude={longitude}"
            f"&current=temperature_2m,relative_humidity_2m,wind_speed_10m"
            f"&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max"
            f"&timezone=auto"
        )
        weather_response = requests.get(forecast_url, timeout=10)
        weather_response.raise_for_status()
        weather_data = weather_response.json()
    except Exception as e:
        forecast_url = locals().get("forecast_url", "N/A")
        print(f"[Warning] Open-Meteo Forecast API failed (URL: {forecast_url}, Error: {str(e)}). Returning fallback weather metrics.")
        from datetime import datetime, timedelta
        fallback_forecast = []
        today = datetime.utcnow()
        for i in range(7):
            day_date = (today + timedelta(days=i)).strftime("%Y-%m-%d")
            fallback_forecast.append({
                "date": day_date,
                "temp_max": 38,
                "temp_min": 29,
                "rainfall_mm": 0.0,
                "rain_probability": 15
            })
        return {
            "location": resolved_location_name,
            "latitude": latitude,
            "longitude": longitude,
            "current": {
                "temperature": 34,
                "humidity": 55,
                "wind_speed": 10
            },
            "forecast": fallback_forecast,
            "is_fallback": True
        }
    
    # 3. Simplify and map to CropSentinel standard format
    current_data = weather_data.get("current", {})
    daily_data = weather_data.get("daily", {})
    
    forecast_items = []
    times = daily_data.get("time", [])
    temp_maxs = daily_data.get("temperature_2m_max", [])
    temp_mins = daily_data.get("temperature_2m_min", [])
    precipitation_sums = daily_data.get("precipitation_sum", [])
    precipitation_probs = daily_data.get("precipitation_probability_max", [])
    
    for i in range(len(times)):
        t_max = temp_maxs[i] if i < len(temp_maxs) else None
        t_min = temp_mins[i] if i < len(temp_mins) else None
        rain = precipitation_sums[i] if i < len(precipitation_sums) else 0.0
        prob = precipitation_probs[i] if i < len(precipitation_probs) else 0
        
        forecast_items.append({
            "date": times[i],
            "temp_max": int(round(t_max)) if t_max is not None else None,
            "temp_min": int(round(t_min)) if t_min is not None else None,
            "rainfall_mm": float(rain) if rain is not None else 0.0,
            "rain_probability": int(prob) if prob is not None else 0
        })
        
    return {
        "location": resolved_location_name,
        "latitude": latitude,
        "longitude": longitude,
        "current": {
            "temperature": int(round(current_data.get("temperature_2m"))) if current_data.get("temperature_2m") is not None else None,
            "humidity": int(round(current_data.get("relative_humidity_2m"))) if current_data.get("relative_humidity_2m") is not None else None,
            "wind_speed": int(round(current_data.get("wind_speed_10m"))) if current_data.get("wind_speed_10m") is not None else None
        },
        "forecast": forecast_items,
        "is_fallback": False
    }
