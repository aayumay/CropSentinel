"""
API endpoints for triggering and checking autonomous crop/farm analysis runs.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.copernicus_service import get_ndvi

router = APIRouter()

class SatelliteHealthRequest(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude of the farm location")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude of the farm location")

@router.get("/agent-status")
async def get_agent_status():
    """
    Get current processing status of all specialized agents.
    """
    return {
        "satellite": "completed",
        "weather": "completed",
        "soil": "completed",
        "market": "completed",
        "intervention": "completed",
        "alert": "completed"
    }

@router.post("/run-analysis")
async def run_analysis():
    """
    Manually trigger an analysis run cycle.
    """
    return {
        "status": "started"
    }

@router.post("/satellite-health")
async def post_satellite_health(request: SatelliteHealthRequest):
    """
    Get real Sentinel-2 satellite vegetation index (NDVI) and farm health stats for coordinate coordinates.
    """
    try:
        health_data = get_ndvi(request.latitude, request.longitude)
        return health_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Satellite analysis failed: {str(e)}")
