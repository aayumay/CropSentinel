"""
CropSentinel FastAPI Application Entrypoint
"""
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.health import router as health_router
from app.api.dashboard import router as dashboard_router
from app.api.analysis import router as analysis_router
from app.api.weather import router as weather_router
from app.api.risk import router as risk_router
from app.api.analyze import router as analyze_router
from app.api.auth import router as auth_router
from app.api.farm import router as farm_router
from app.api.history import router as history_router

load_dotenv()

DEFAULT_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]


def _cors_origins() -> list[str]:
    origins = list(DEFAULT_CORS_ORIGINS)
    extra = os.getenv("CORS_ORIGINS", "").strip()
    if extra:
        for origin in extra.split(","):
            origin = origin.strip()
            if origin and origin not in origins:
                origins.append(origin)
    return origins


app = FastAPI(
    title="CropSentinel API",
    description="Autonomous farm crisis response system API layer",
    version="0.1"
)

# CORS for Vercel (prod) and Vite dev server (localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """
    Validates environment configurations and initializes database tables on application launch.
    """
    
    # 1. Environment Variable Validation
    required_vars = ["COPERNICUS_CLIENT_ID", "COPERNICUS_CLIENT_SECRET", "GROQ_API_KEY"]
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        error_message = (
            f"\n======================================================================\n"
            f"CRITICAL STARTUP ERROR: Missing required environment variables:\n"
            f"  {', '.join(missing_vars)}\n"
            f"Please configure them in your environment or .env file before starting.\n"
            f"======================================================================\n"
        )
        print(error_message, flush=True)
        raise RuntimeError(error_message)
        
    # 2. Database Schema Table Creation
    from app.db.database import engine, Base, migrate_farm_columns
    import app.db.models  # Required to register model metadata
    
    if engine is not None:
        try:
            Base.metadata.create_all(bind=engine)
            migrate_farm_columns()
            from app.db.database import SessionLocal
            from app.services.farm_backfill import backfill_farm_metadata
            db = SessionLocal()
            try:
                filled = backfill_farm_metadata(db)
                if filled:
                    print(f"Backfilled metadata on {filled} existing farm(s).", flush=True)
            finally:
                db.close()
            print("Database tables initialized successfully.", flush=True)
        except Exception as e:
            print(f"Error creating database tables: {e}", flush=True)
    else:
        print("Database engine is unconfigured. Table creation skipped.", flush=True)

# Register routers
app.include_router(health_router)
app.include_router(dashboard_router)
app.include_router(analysis_router)
app.include_router(weather_router)
app.include_router(risk_router)
app.include_router(analyze_router)
app.include_router(auth_router)
app.include_router(farm_router)
app.include_router(history_router)
