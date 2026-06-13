"""
API endpoints for retrieving real-time weather and forecast data.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.weather_service import get_weather

router = APIRouter()

class WeatherRequest(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude of the location")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude of the location")

@router.post("/weather")
async def post_weather(request: WeatherRequest):
    """
    Exposes forecast and current condition data for resolved coordinates.
    """
    try:
        weather_data = get_weather(request.latitude, request.longitude)
        return weather_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
