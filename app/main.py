from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="CropSentinel API Contract MVP", version="0.1")

# Configure CORS so the React frontend can fetch data without errors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local hackathon demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------
# Pydantic Models
# -----------------

class CoordinateRequest(BaseModel):
    latitude: float
    longitude: float

class WeatherRequest(BaseModel):
    city: str

class AnalyzeRequest(BaseModel):
    latitude: float
    longitude: float
    city: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ProfileRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    cropType: Optional[str] = None
    farmSize: Optional[str] = None

class PostRequest(BaseModel):
    content: str
    authorName: Optional[str] = "Demo Farmer"

# -----------------
# In-Memory DB
# -----------------
MOCK_PROFILE = {
    "name": "Demo Farmer",
    "email": "demo@cropsentinel.com",
    "location": "Punjab, India",
    "phone": "",
    "cropType": "",
    "farmSize": ""
}

MOCK_POSTS = []

# -----------------
# API Endpoints
# -----------------

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/api/login")
def login(req: LoginRequest):
    return {
        "token": "fake-jwt-token-123",
        "user": {"email": req.email, "id": "demo_user_1"}
    }

@app.get("/api/profile")
def get_profile():
    return MOCK_PROFILE

@app.post("/api/profile")
def update_profile(req: ProfileRequest):
    if req.name is not None: MOCK_PROFILE["name"] = req.name
    if req.email is not None: MOCK_PROFILE["email"] = req.email
    if req.phone is not None: MOCK_PROFILE["phone"] = req.phone
    if req.location is not None: MOCK_PROFILE["location"] = req.location
    if req.cropType is not None: MOCK_PROFILE["cropType"] = req.cropType
    if req.farmSize is not None: MOCK_PROFILE["farmSize"] = req.farmSize
    return MOCK_PROFILE

import time

@app.get("/api/posts")
def get_posts():
    return MOCK_POSTS

@app.post("/api/posts")
def create_post(req: PostRequest):
    new_post = {
        "id": int(time.time() * 1000),
        "author": req.authorName,
        "time": "Just now",
        "content": req.content,
        "likes": 0,
        "replies": 0
    }
    MOCK_POSTS.insert(0, new_post)
    return new_post

@app.get("/dashboard")
def dashboard():
    return None

import time

analysis_start_time = 0

@app.get("/agent-status")
def agent_status():
    global analysis_start_time
    elapsed = time.time() - analysis_start_time
    
    # Before the first run, return everything as completed so the UI looks nominal
    if analysis_start_time == 0:
        return {
            "farm_context": "completed",
            "weather_agent": "completed",
            "soil_moisture": "completed",
            "crop_growth": "completed",
            "risk_assessment": "completed",
            "recommendation": "completed",
            "notification": "completed"
        }

    return {
        "farm_context": "completed" if elapsed > 2 else "running",
        "weather_agent": "completed" if elapsed > 4 else ("running" if elapsed > 2 else "idle"),
        "soil_moisture": "completed" if elapsed > 6 else ("running" if elapsed > 4 else "idle"),
        "crop_growth": "completed" if elapsed > 8 else ("running" if elapsed > 6 else "idle"),
        "risk_assessment": "completed" if elapsed > 10 else ("running" if elapsed > 8 else "idle"),
        "recommendation": "completed" if elapsed > 12 else ("running" if elapsed > 10 else "idle"),
        "notification": "completed" if elapsed > 14 else ("running" if elapsed > 12 else "idle")
    }

@app.post("/run-analysis")
def run_analysis():
    global analysis_start_time
    analysis_start_time = time.time()
    return {"status": "started"}

@app.post("/satellite-health")
def satellite_health(req: CoordinateRequest):
    return {
        "ndvi": 0.105,
        "farm_health_score": 12,
        "status": "stressed",
        "captured_at": "2026-06-09T05:33:03.561Z"
    }

@app.post("/weather")
def weather(req: WeatherRequest):
    return {
        "city": req.city,
        "current": {
            "temperature": 34,
            "humidity": 58,
            "wind_speed": 11
        },
        "forecast": [
            {
                "date": "2026-06-10",
                "temp_max": 37,
                "temp_min": 28,
                "rainfall_mm": 0.0,
                "rain_probability": 10
            }
        ]
    }

@app.post("/risk-analysis")
def risk_analysis(req: AnalyzeRequest):
    return {
        "risk_score": 72,
        "risk_level": "HIGH",
        "recommendation": "Irrigate within 48 hours",
        "llm_explanation": "Your crop appears to be under significant stress. The vegetation index is very low, indicating weak crop health. Rainfall chances over the next few days are extremely limited, which increases the risk of moisture deficiency. Current weather conditions do not provide sufficient natural irrigation support. Based on these conditions, irrigating within the next 48 hours is recommended to reduce the chance of yield loss.",
        "factors": {
            "ndvi": 0.32,
            "temperature": 39,
            "humidity": 41,
            "rain_probability": 15
        }
    }

@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    return {
        "satellite": {
            "ndvi": 0.21,
            "farm_health_score": 32,
            "status": "stressed",
            "captured_at": "2026-06-09T05:33:03.561Z"
        },
        "weather": {
            "city": req.city,
            "current": {
                "temperature": 32,
                "humidity": 65,
                "wind_speed": 8
            },
            "forecast": [
                {
                    "date": "2026-06-10",
                    "temp_max": 39,
                    "temp_min": 30,
                    "rainfall_mm": 0.0,
                    "rain_probability": 2
                }
            ]
        },
        "risk": {
            "risk_score": 85,
            "risk_level": "HIGH",
            "recommendation": "Irrigate within 48 hours",
            "llm_explanation": "Your crop appears to be under significant stress. The vegetation index is very low, indicating weak crop health. Rainfall chances over the next few days are extremely limited, which increases the risk of moisture deficiency. Current weather conditions do not provide sufficient natural irrigation support. Based on these conditions, irrigating within the next 48 hours is recommended to reduce the chance of yield loss."
        },
        "intervention": {
            "priority": "HIGH",
            "action": "Irrigate",
            "time_window": "48 hours",
            "estimated_cost": 350,
            "estimated_yield_loss": 18000,
            "expected_benefit": 6000,
            "reasoning": "NDVI is critically low, rainfall probability remains below 20%, creating a high crop stress situation.",
            "plan": {
                "summary": "Immediate irrigation is recommended.",
                "execution_steps": [
                    "Begin irrigation within 48 hours",
                    "Monitor field moisture levels",
                    "Review crop condition after irrigation"
                ],
                "expected_outcome": "Reduced crop stress."
            }
        }
    }
