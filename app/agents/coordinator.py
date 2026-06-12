"""
Multi-Agent Coordinator.
Orchestrates independent agents (Satellite, Weather, Risk) inside a LangGraph StateGraph workflow.
"""
from typing import TypedDict
from langgraph.graph import StateGraph, START, END

from app.agents.satellite import SatelliteAgent
from app.agents.weather import WeatherAgent
from app.agents.risk import RiskAgent
from app.agents.intervention import InterventionAgent

class AgentState(TypedDict):
    """
    Common state shared across all agents in the LangGraph workflow.
    """
    latitude: float
    longitude: float
    satellite: dict
    weather: dict
    risk: dict
    intervention: dict

def build_workflow():
    """
    Constructs and compiles the sequential multi-agent LangGraph workflow:
    START -> satellite_agent -> weather_agent -> risk_agent -> intervention_agent -> END
    """
    workflow = StateGraph(AgentState)
    
    # Instantiate agents
    satellite_agent = SatelliteAgent()
    weather_agent = WeatherAgent()
    risk_agent = RiskAgent()
    intervention_agent = InterventionAgent()
    
    # Register nodes using their LangGraph-compliant run methods
    workflow.add_node("satellite_agent", satellite_agent.run)
    workflow.add_node("weather_agent", weather_agent.run)
    workflow.add_node("risk_agent", risk_agent.run)
    workflow.add_node("intervention_agent", intervention_agent.run)
    
    # Establish graph topology
    workflow.add_edge(START, "satellite_agent")
    workflow.add_edge("satellite_agent", "weather_agent")
    workflow.add_edge("weather_agent", "risk_agent")
    workflow.add_edge("risk_agent", "intervention_agent")
    workflow.add_edge("intervention_agent", END)
    
    return workflow.compile()

class CoordinatorAgent:
    """
    Top-level coordinator agent that compiles and runs the multi-agent graph.
    """
    
    def execute(self, latitude: float, longitude: float) -> dict:
        """
        Creates the initial state, invokes the compiled LangGraph workflow,
        and returns the final orchestrated state dictionary.
        """
        graph = build_workflow()
        
        initial_state = {
            "latitude": latitude,
            "longitude": longitude,
            "satellite": {},
            "weather": {},
            "risk": {},
            "intervention": {}
        }
        
        final_state = graph.invoke(initial_state)
        return final_state
