"""
Intervention Planning Agent.
Responsible for converting risk analysis into actionable farm recommendations with estimated impact, cost, and urgency.
"""

class InterventionAgent:
    """
    Intervention planning agent responsible for decision-to-action mapping.
    Can be run as a standalone execution or as a LangGraph node.
    """

    def execute(self, state_data: dict) -> dict:
        """
        Processes upstream agent state data to generate intervention plans.
        """
        try:
            satellite = state_data.get("satellite", {})
            weather = state_data.get("weather", {})
            risk = state_data.get("risk", {})

            ndvi = satellite.get("ndvi", 0.0)
            risk_score = risk.get("risk_score", 0)
            risk_level = risk.get("risk_level", "LOW")

            # Calculate average rain probability for the next 3 forecast days from forecast weather
            forecast = weather.get("forecast", [])
            forecast_3_days = forecast[:3]
            if forecast_3_days:
                rain_probs = [day.get("rain_probability", 0) for day in forecast_3_days]
                rain_probability = int(round(sum(rain_probs) / len(rain_probs)))
            else:
                rain_probability = 0

            # Rule-based decision-to-action logic
            if risk_score >= 60:
                priority = "HIGH"
                action = "Irrigate"
                time_window = "48 hours"
                estimated_cost = 350
                estimated_yield_loss = 18000
                expected_benefit = 6000
            elif risk_score >= 30:
                priority = "MEDIUM"
                action = "Monitor and Prepare Irrigation"
                time_window = "3-5 days"
                estimated_cost = 200
                estimated_yield_loss = 10000
                expected_benefit = 3000
            else:
                priority = "LOW"
                action = "Continue Monitoring"
                time_window = "7 days"
                estimated_cost = 0
                estimated_yield_loss = 0
                expected_benefit = 0

            # Dynamic reasoning generator
            ndvi_status = "critically low" if ndvi < 0.30 else "moderate" if ndvi < 0.45 else "healthy"
            rain_status = "remains below 20%" if rain_probability < 20 else "remains below 40%" if rain_probability < 40 else "is favorable"
            reasoning = (
                f"NDVI is {ndvi_status} ({ndvi:.3f}) and rainfall probability {rain_status} ({rain_probability}%), "
                f"indicating a {risk_level.lower()} crop risk situation. Immediate action '{action}' is planned."
            )

            intervention_data = {
                "priority": priority,
                "action": action,
                "time_window": time_window,
                "estimated_cost": estimated_cost,
                "estimated_yield_loss": estimated_yield_loss,
                "expected_benefit": expected_benefit,
                "reasoning": reasoning
            }

            # Import and generate LLM plan
            from app.services.intervention_llm_service import generate_intervention_plan
            plan = generate_intervention_plan(intervention_data)
            intervention_data["plan"] = plan

            return {
                "agent": "intervention",
                "status": "completed",
                "data": intervention_data
            }
        except Exception as e:
            return {
                "agent": "intervention",
                "status": "failed",
                "error": str(e)
            }

    def run(self, state: dict) -> dict:
        """
        LangGraph node execution. Reads upstream states, runs execution,
        appends results to state["intervention"], and returns updated state.
        """
        result = self.execute(state)
        
        if result["status"] == "completed":
            state["intervention"] = result["data"]
        else:
            state["intervention"] = {
                "error": result.get("error", "Unknown intervention agent error")
            }
            
        return state
