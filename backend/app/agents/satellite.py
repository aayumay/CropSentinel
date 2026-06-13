"""
Satellite Vision Agent.
Responsible for NDVI analysis, stress classification, and retrieving satellite data.
"""
from app.services.copernicus_service import get_ndvi

class SatelliteAgent:
    """
    Satellite vision agent responsible for NDVI and farm health retrieval.
    Can be run as a standalone execution or as a LangGraph node.
    """
    
    def execute(self, latitude: float, longitude: float) -> dict:
        """
        Executes satellite analysis and returns normalized agent state.
        """
        try:
            ndvi_data = get_ndvi(latitude, longitude)
            return {
                "agent": "satellite",
                "status": "completed",
                "data": {
                    "ndvi": ndvi_data.get("ndvi"),
                    "farm_health_score": ndvi_data.get("farm_health_score"),
                    "status": ndvi_data.get("status"),
                    "captured_at": ndvi_data.get("captured_at")
                }
            }
        except Exception as e:
            return {
                "agent": "satellite",
                "status": "failed",
                "error": str(e)
            }

    def run(self, state: dict) -> dict:
        """
        LangGraph node execution. Reads coordinates from state, performs satellite analysis,
        appends results to state, and returns updated state.
        """
        latitude = state.get("latitude")
        longitude = state.get("longitude")
        
        if latitude is None or longitude is None:
            raise ValueError("State must contain both 'latitude' and 'longitude'.")
            
        result = self.execute(latitude, longitude)
        
        if result["status"] == "completed":
            state["satellite"] = result["data"]
        else:
            state["satellite"] = {
                "error": result.get("error", "Unknown satellite agent error")
            }
            
        return state
