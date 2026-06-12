"""
API router for managing farm entities belonging to authenticated users.
"""
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Farm, User
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/farm", tags=["Farms"])

class FarmCreateRequest(BaseModel):
    farm_name: str = Field(..., description="Name of the farm")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude coordinate")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude coordinate")

class FarmCreateResponse(BaseModel):
    farm_id: int
    farm_name: str

class FarmResponse(BaseModel):
    id: int
    farm_name: str
    latitude: float
    longitude: float
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("/create", response_model=FarmCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_farm(
    request: FarmCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates a new farm linked to the logged-in user.
    """
    farm = Farm(
        user_id=current_user.id,
        farm_name=request.farm_name,
        latitude=request.latitude,
        longitude=request.longitude
    )
    db.add(farm)
    db.commit()
    db.refresh(farm)
    
    return {
        "farm_id": farm.id,
        "farm_name": farm.farm_name
    }

@router.get("/list", response_model=List[FarmResponse])
async def list_farms(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lists all farms owned by the currently authenticated user.
    """
    farms = db.query(Farm).filter(Farm.user_id == current_user.id).all()
    return farms
