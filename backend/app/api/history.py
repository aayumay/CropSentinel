"""
API router for retrieving historical farm analysis records.
"""
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Farm, AnalysisHistory, User
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/history", tags=["Analysis History"])

class HistoryItem(BaseModel):
    created_at: datetime
    ndvi: float
    risk_score: int
    risk_level: str
    recommendation: str

    class Config:
        from_attributes = True

class FarmHistoryResponse(BaseModel):
    farm_id: int
    history: List[HistoryItem]

@router.get("/{farm_id}", response_model=FarmHistoryResponse)
async def get_farm_history(
    farm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves the historical crop analysis records for the specified farm.
    Verifies that the farm belongs to the authenticated user.
    """
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found."
        )
    
    if farm.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You do not own this farm."
        )
        
    records = db.query(AnalysisHistory).filter(AnalysisHistory.farm_id == farm_id).order_by(AnalysisHistory.created_at.desc()).all()
    
    return {
        "farm_id": farm_id,
        "history": records
    }
