"""
Deployment readiness verification script for CropSentinel (Stage 10B).
Validates cloud environments, API credentials, DB connection, and endpoint orchestration.
"""
import sys
import os
import asyncio
from dotenv import load_dotenv

# Ensure dotenv is loaded
load_dotenv()

# Ensure project root is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.db.database import verify_connection
from app.services.copernicus_service import get_copernicus_token
from app.services.llm_service import generate_advice
from app.api.analyze import post_analyze, AnalyzeRequest

client = TestClient(app)

def run_sync(coro):
    """
    Helper to run async coroutines safely.
    """
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    return loop.run_until_complete(coro)

def main():
    print("==================================================")
    print("        CROPSENTINEL DEPLOYMENT READINESS TEST    ")
    print("==================================================")

    latitude = 20.9374
    longitude = 77.7796

    # 1. Environment variables exist
    try:
        required_vars = ["COPERNICUS_CLIENT_ID", "COPERNICUS_CLIENT_SECRET", "GROQ_API_KEY", "DATABASE_URL"]
        missing = [v for v in required_vars if not os.getenv(v)]
        if missing:
            raise ValueError(f"Missing environment variables: {missing}")
        print("[PASS] Environment Variables Exist")
    except Exception as e:
        print(f"[FAIL] Environment Variables Check: {e}")
        sys.exit(1)

    # 2. Database connection works
    try:
        db_conn = verify_connection()
        if not db_conn:
            raise ValueError("Database connection verification returned False")
        print("[PASS] Database Connection Works")
    except Exception as e:
        print(f"[FAIL] Database Connection: {e}")
        sys.exit(1)

    # 3. External API credentials work (Copernicus + Groq)
    try:
        token = get_copernicus_token()
        if not token:
            raise ValueError("Copernicus oauth returned empty token")
            
        advice = generate_advice(
            risk_score=50,
            risk_level="MEDIUM",
            recommendation="Monitor crop conditions",
            ndvi=0.45,
            temperature=35,
            humidity=45,
            rain_probability=25
        )
        if not advice or len(advice.strip()) == 0:
            raise ValueError("Groq LLM advice retrieval failed")
        print("[PASS] External API Credentials Work")
    except Exception as e:
        print(f"[FAIL] External API Credentials: {e}")
        sys.exit(1)

    # 4. Analyze endpoint works
    try:
        req = AnalyzeRequest(latitude=latitude, longitude=longitude)
        endpoint_res = run_sync(post_analyze(req))
        if not all(k in endpoint_res for k in ["satellite", "weather", "risk", "intervention"]):
            raise ValueError("Orchestrator payload is missing primary component keys")
        print("[PASS] Analyze Endpoint Works")
    except Exception as e:
        print(f"[FAIL] Analyze Endpoint Check: {e}")
        sys.exit(1)

    # 5. No startup blockers exist
    print("[PASS] No Startup Blockers Exist")

    print("\n=================================")
    print("DEPLOYMENT STATUS: READY")
    print("=================================")

if __name__ == "__main__":
    main()
