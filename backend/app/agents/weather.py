"""
Weather Intelligence Agent.
Responsible for forecast analysis, geocoding, and retrieving weather metrics.
"""
from app.services.weather_service import get_weather

class WeatherAgent:
    """
    Weather intelligence agent responsible for geocoding and forecast retrieval.
    Can be run as a standalone execution or as a LangGraph node.
    """
    
    def execute(self, latitude: float, longitude: float) -> dict:
        """
        Executes weather forecast retrieval and returns normalized agent state.
        """
        try:
            weather_data = get_weather(latitude, longitude)
            return {
                "agent": "weather",
                "status": "completed",
                "data": weather_data
            }
        except Exception as e:
            return {
                "agent": "weather",
                "status": "failed",
                "error": str(e)
            }

    def run(self, state: dict) -> dict:
        """
        LangGraph node execution. Reads coordinates from state, performs weather retrieval,
        appends results to state, and returns updated state.
        """
        latitude = state.get("latitude")
        longitude = state.get("longitude")
        if not latitude or not longitude:
            raise ValueError("State must contain 'latitude' and 'longitude'.")
            
        result = self.execute(latitude, longitude)
        
        if result["status"] == "completed":
            state["weather"] = result["data"]
        else:
            state["weather"] = {
                "error": result.get("error", "Unknown weather agent error")
            }
            
        return state
