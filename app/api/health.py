"""
API endpoints for system health and verification.
"""
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def get_health():
    """
    Check the health of the API server.
    """
    return {"status": "healthy"}
