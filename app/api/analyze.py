"""
API endpoints for triggering unified farm analysis orchestrating satellite, weather, and risk assessments.
"""
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.agents.coordinator import CoordinatorAgent
from app.db.database import get_db
from app.db.models import Farm, AnalysisHistory

router = APIRouter()

class AnalyzeRequest(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude of the farm location")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude of the farm location")
    farm_id: int | None = Field(None, description="Optional farm ID to link and persist analysis history")

@router.post("/analyze")
async def post_analyze(request: AnalyzeRequest, db: Session = Depends(get_db)):
    """
    Orchestrates the complete analysis pipeline using a LangGraph multi-agent workflow,
    returning satellite, weather, risk, and action-planning metrics in a single payload.
    If farm_id is provided, automatically persists the core results to the database.
    """
    # If farm_id is provided, check if it exists in the database
    if request.farm_id is not None:
        farm = db.query(Farm).filter(Farm.id == request.farm_id).first()
        if not farm:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Farm with ID {request.farm_id} not found."
            )
            
    try:
        coordinator = CoordinatorAgent()
        final_state = coordinator.execute(
            latitude=request.latitude,
            longitude=request.longitude
        )
        
        # Persist to AnalysisHistory if farm_id is linked
        if request.farm_id is not None:
            # Safely extract metrics from graph output
            ndvi = final_state.get("satellite", {}).get("ndvi", 0.0)
            risk_score = final_state.get("risk", {}).get("risk_score", 0)
            risk_level = final_state.get("risk", {}).get("risk_level", "LOW")
            recommendation = final_state.get("risk", {}).get("recommendation", "No immediate recommendation generated.")
            
            history_record = AnalysisHistory(
                farm_id=request.farm_id,
                ndvi=ndvi,
                risk_score=risk_score,
                risk_level=risk_level,
                recommendation=recommendation
            )
            db.add(history_record)
            db.commit()
            db.refresh(history_record)
            
        return final_state
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
