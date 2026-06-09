"""
CropSentinel FastAPI Application Entrypoint
"""
from fastapi import FastAPI
from app.api.health import router as health_router
from app.api.dashboard import router as dashboard_router
from app.api.analysis import router as analysis_router

app = FastAPI(
    title="CropSentinel API",
    description="Autonomous farm crisis response system API layer",
    version="0.1"
)

# Register routers
app.include_router(health_router)
app.include_router(dashboard_router)
app.include_router(analysis_router)
