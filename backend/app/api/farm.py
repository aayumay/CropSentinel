"""
API router for managing farm entities belonging to authenticated users.
"""
from typing import List, Optional
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
    crop_type: Optional[str] = Field(None, description="Crop grown on the farm")
    sowing_date: Optional[str] = Field(None, description="Sowing date (ISO format YYYY-MM-DD)")
    area: Optional[float] = Field(None, ge=0, description="Farm area in acres")
    soil_type: Optional[str] = Field(None, description="Soil type classification")

class FarmResponse(BaseModel):
    id: int
    farm_name: str
    latitude: float
    longitude: float
    crop_type: Optional[str] = None
    sowing_date: Optional[str] = None
    area: Optional[float] = None
    soil_type: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class FarmCreateResponse(FarmResponse):
    farm_id: int

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
        longitude=request.longitude,
        crop_type=request.crop_type,
        sowing_date=request.sowing_date,
        area=request.area,
        soil_type=request.soil_type,
    )
    db.add(farm)
    db.commit()
    db.refresh(farm)

    return FarmCreateResponse(
        id=farm.id,
        farm_id=farm.id,
        farm_name=farm.farm_name,
        latitude=farm.latitude,
        longitude=farm.longitude,
        crop_type=farm.crop_type,
        sowing_date=farm.sowing_date,
        area=farm.area,
        soil_type=farm.soil_type,
        created_at=farm.created_at,
    )

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
