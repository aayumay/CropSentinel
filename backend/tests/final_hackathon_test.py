"""
Final Hackathon Master Integration Test for CropSentinel.
Verifies all 16 pipeline requirements across 13 distinct categories end-to-end.
"""
import sys
import os
import jwt
import asyncio
from dotenv import load_dotenv

# Ensure dotenv is loaded
load_dotenv()

# Ensure project root is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.db.database import get_db, verify_connection, Base, engine
from app.db.models import User, Farm, AnalysisHistory
from app.services.auth_service import SECRET_KEY, ALGORITHM
from app.services.copernicus_service import get_copernicus_token, get_ndvi
from app.services.weather_service import get_weather
from app.services.risk_service import calculate_risk
from app.services.llm_service import generate_advice
from app.agents.satellite import SatelliteAgent
from app.agents.weather import WeatherAgent
from app.agents.risk import RiskAgent
from app.agents.intervention import InterventionAgent
from app.agents.coordinator import CoordinatorAgent
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
    phone_test = "9998887777-master"
    latitude = 20.9374
    longitude = 77.7796
    
    db = next(get_db())
    token = None
    user_id = None
    farm_id = None
    ndvi_val = None
    weather_data = None
    risk_data = None
    satellite_res = None
    advice = None
    int_res = None

    try:
        # Pre-cleanup
        existing_user = db.query(User).filter(User.phone_number == phone_test).first()
        if existing_user:
            db.delete(existing_user)
            db.commit()

        # 1. Environment Variables
        required_vars = ["COPERNICUS_CLIENT_ID", "COPERNICUS_CLIENT_SECRET", "GROQ_API_KEY", "DATABASE_URL"]
        missing = [v for v in required_vars if not os.getenv(v)]
        if missing:
            raise ValueError(f"Missing environment variables: {missing}")
        print("[PASS] Environment Variables")

        # 2. Database
        db_conn = verify_connection()
        if not db_conn:
            raise ValueError("Database connection check failed")
        # Ensure metadata bind and table verification works
        Base.metadata.create_all(bind=engine)
        print("[PASS] Database")

        # 3. Authentication
        login_res = client.post("/auth/login", json={"phone_number": phone_test})
        if login_res.status_code != 200:
            raise ValueError(f"Auth login failed: {login_res.text}")
        login_data = login_res.json()
        token = login_data["access_token"]
        user_id = login_data["user"]["id"]
        
        # Verify JWT claims
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("phone_number") != phone_test or int(payload.get("sub")) != user_id:
            raise ValueError("JWT token payloads do not match login credentials")
        print("[PASS] Authentication")

        # 4. Farm Management
        headers = {"Authorization": f"Bearer {token}"}
        farm_payload = {
            "farm_name": "Master Verification Farm",
            "latitude": latitude,
            "longitude": longitude
        }
        create_farm_res = client.post("/farm/create", json=farm_payload, headers=headers)
        if create_farm_res.status_code != 201:
            raise ValueError(f"Farm creation failed: {create_farm_res.text}")
        farm_id = create_farm_res.json()["farm_id"]
        
        # Farm List Retrieval
        list_farm_res = client.get("/farm/list", headers=headers)
        if list_farm_res.status_code != 200 or not any(f["id"] == farm_id for f in list_farm_res.json()):
            raise ValueError("Failed to retrieve created farm in user list")
        print("[PASS] Farm Management")

        # 5. Satellite Service
        cop_token = get_copernicus_token()
        if not cop_token:
            raise ValueError("Copernicus token generation returned empty payload")
        satellite_res = get_ndvi(latitude, longitude)
        ndvi_val = satellite_res["ndvi"]
        if ndvi_val is None:
            raise ValueError("Copernicus NDVI extraction returned null")
        print("[PASS] Satellite Service")

        # 6. Weather Service
        weather_data = get_weather(latitude, longitude)
        if "current" not in weather_data or "forecast" not in weather_data:
            raise ValueError("Weather forecast payload is malformed")
        print("[PASS] Weather Service")

        # 7. Risk Engine
        risk_data = calculate_risk(latitude, longitude, ndvi_data=satellite_res, weather_data=weather_data)
        if "risk_score" not in risk_data or "risk_level" not in risk_data:
            raise ValueError("Risk calculation output is missing fields")
        print("[PASS] Risk Engine")

        # 8. LLM Layer
        advice = generate_advice(
            risk_score=risk_data["risk_score"],
            risk_level=risk_data["risk_level"],
            recommendation=risk_data["recommendation"],
            ndvi=ndvi_val,
            temperature=weather_data["current"]["temperature"],
            humidity=weather_data["current"]["humidity"],
            rain_probability=30
        )
        if not advice or len(advice.strip()) == 0:
            raise ValueError("LLM advice response is empty")
        print("[PASS] LLM Layer")

        # 9. Intervention Planner
        int_agent = InterventionAgent()
        state_data = {
            "satellite": satellite_res,
            "weather": weather_data,
            "risk": risk_data
        }
        int_res = int_agent.execute(state_data)
        if int_res["status"] != "completed" or "plan" not in int_res["data"]:
            raise ValueError("Intervention plan generation failed")
        print("[PASS] Intervention Planner")

        # 10. LangGraph Workflow
        # Verify individual agent node instantiations and executions
        # A. SatelliteAgent
        sat_agent = SatelliteAgent()
        sat_exec = sat_agent.execute(latitude, longitude)
        if sat_exec["status"] != "completed":
            raise ValueError("SatelliteAgent standalone execute failed")
        
        # B. WeatherAgent
        wea_agent = WeatherAgent()
        wea_exec = wea_agent.execute(latitude, longitude)
        if wea_exec["status"] != "completed":
            raise ValueError("WeatherAgent standalone execute failed")
            
        # C. RiskAgent
        r_agent = RiskAgent()
        r_exec = r_agent.execute(latitude, longitude)
        if r_exec["status"] != "completed":
            raise ValueError("RiskAgent standalone execute failed")
            
        # D. InterventionAgent (already checked above in step 9)
        # E. CoordinatorAgent End-to-End Orchestrator
        coord = CoordinatorAgent()
        graph_state = coord.execute(latitude, longitude)
        for key in ["satellite", "weather", "risk", "intervention"]:
            if key not in graph_state:
                raise ValueError(f"LangGraph state missing '{key}' payload")
        print("[PASS] LangGraph Workflow")

        # 11. Analyze Endpoint
        req = AnalyzeRequest(latitude=latitude, longitude=longitude, farm_id=farm_id)
        endpoint_res = run_sync(post_analyze(req, db=db))
        if not all(k in endpoint_res for k in ["satellite", "weather", "risk", "intervention"]):
            raise ValueError("FASTAPI POST /analyze endpoint response malformed")
        print("[PASS] Analyze Endpoint")

        # 12. Analysis Persistence
        persisted = db.query(AnalysisHistory).filter(AnalysisHistory.farm_id == farm_id).first()
        if not persisted:
            raise ValueError("Analysis result was not saved to database")
        print("[PASS] Analysis Persistence")

        # 13. History Endpoint
        hist_res = client.get(f"/history/{farm_id}", headers=headers)
        if hist_res.status_code != 200 or len(hist_res.json()["history"]) == 0:
            raise ValueError("Could not fetch persisted analysis history from endpoint")
        
        # Check unauthorized access prevention (User B attempting to view User A's history)
        phone_unauth = "9998887777-unauth"
        unauth_login = client.post("/auth/login", json={"phone_number": phone_unauth}).json()
        unauth_token = unauth_login["access_token"]
        unauth_headers = {"Authorization": f"Bearer {unauth_token}"}
        
        unauth_res = client.get(f"/history/{farm_id}", headers=unauth_headers)
        if unauth_res.status_code != 403:
            raise ValueError(f"Expected 403 Forbidden for unauthorized user, got {unauth_res.status_code}")
            
        # Cleanup User B
        unauth_user_id = unauth_login["user"]["id"]
        unauth_user = db.query(User).filter(User.id == unauth_user_id).first()
        if unauth_user:
            db.delete(unauth_user)
            db.commit()
            
        print("[PASS] History Endpoint")

        # Master Success Status Output
        print("\n=================================")
        print("FINAL STATUS: HACKATHON READY")
        print("=================================")

    except Exception as e:
        print(f"\n[FAIL] Master Integration Test failed: {e}")
        sys.exit(1)
    finally:
        # Final Cleanup of User A (cascades deletion of Farms and History)
        user = db.query(User).filter(User.id == user_id).first() if user_id else None
        if user:
            db.delete(user)
            db.commit()
        db.close()

if __name__ == "__main__":
    main()
