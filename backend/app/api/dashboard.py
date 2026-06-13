"""
API endpoints for the CropSentinel farm dashboard.
"""
from fastapi import APIRouter

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard():
    """
    Get current summary information for the farm dashboard.
    """
    return {
        "farm": {
            "id": 1,
            "name": "Vidarbha Cotton Farm",
            "crop_type": "cotton"
        },
        "farm_health_score": 72,
        "ndvi": 0.21,
        "weather_risk": 0.65,
        "soil_moisture": 18,
        "market_risk": 0.40,
        "last_updated": "2026-06-08T12:00:00Z",
        "recommendation": {
            "action": "Irrigate within 48 hours",
            "estimated_cost": 340,
            "yield_loss_risk": 18000
        }
    }

@router.get("/ndvi-history")
async def get_ndvi_history():
    """
    Get historical NDVI records for trend visualization.
    """
    return [
        {
            "date": "2026-06-01",
            "value": 0.42
        },
        {
            "date": "2026-06-02",
            "value": 0.39
        },
        {
            "date": "2026-06-03",
            "value": 0.35
        }
    ]

@router.get("/market-history")
async def get_market_history():
    """
    Get historical mandi prices for market price trends.
    """
    return [
        {
            "date": "2026-06-01",
            "price": 6500
        },
        {
            "date": "2026-06-02",
            "price": 6700
        },
        {
            "date": "2026-06-03",
            "price": 6900
        }
    ]

@router.get("/stress-map")
async def get_stress_map():
    """
    Get NDVI stress map visual link.
    """
    return {
        "image_url": "/static/maps/stress_map.png"
    }

@router.get("/alerts")
async def get_alerts():
    """
    Get historical alerts.
    """
    return [
        {
            "id": 1,
            "message": "Irrigate within 48 hours",
            "timestamp": "2026-06-08T12:00:00Z",
            "status": "sent"
        }
    ]
