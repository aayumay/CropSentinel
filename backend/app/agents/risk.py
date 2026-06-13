"""
Risk Assessment Decision Agent.
Responsible for orchestrating downstream decision-making using metrics provided by satellite and weather agents.
"""
from app.services.risk_service import calculate_risk

class RiskAgent:
    """
    Risk assessment agent responsible for generating consolidated farm risk assessments.
    Can be run as a standalone execution or as a LangGraph node.
    """
    
    def execute(self, latitude: float, longitude: float) -> dict:
        """
        Executes risk assessment and returns normalized agent state.
        """
        try:
            risk_data = calculate_risk(latitude, longitude)
            return {
                "agent": "risk",
                "status": "completed",
                "data": {
                    "risk_score": risk_data["risk_score"],
                    "risk_level": risk_data["risk_level"],
                    "recommendation": risk_data["recommendation"],
                    "llm_explanation": risk_data["llm_explanation"]
                }
            }
        except Exception as e:
            return {
                "agent": "risk",
                "status": "failed",
                "error": str(e)
            }

    def run(self, state: dict) -> dict:
        """
        LangGraph node execution. Reads satellite and weather outcomes from the shared state
        to avoid redundant service API requests, appends results under state["risk"], and returns updated state.
        """
        latitude = state.get("latitude")
        longitude = state.get("longitude")
        
        if not latitude or not longitude:
            raise ValueError("State must contain 'latitude' and 'longitude'.")
            
        satellite_data = state.get("satellite")
        weather_data = state.get("weather")
        
        try:
            # Call risk service injecting pre-calculated data if available in the common state
            risk_data = calculate_risk(
                latitude=latitude,
                longitude=longitude,
                ndvi_data=satellite_data,
                weather_data=weather_data
            )
            state["risk"] = {
                "risk_score": risk_data["risk_score"],
                "risk_level": risk_data["risk_level"],
                "recommendation": risk_data["recommendation"],
                "llm_explanation": risk_data["llm_explanation"]
            }
        except Exception as e:
            state["risk"] = {
                "error": str(e)
            }
            
        return state
