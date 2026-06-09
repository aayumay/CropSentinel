"""
API endpoints for triggering and checking autonomous crop/farm analysis runs.
"""
from fastapi import APIRouter

router = APIRouter()

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
