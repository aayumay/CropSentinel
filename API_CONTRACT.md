# CropSentinel API Contract

Version: 0.1
Status: Draft

Purpose: This document defines the expected frontend ↔ backend integration for CropSentinel. This is a working contract for the hackathon MVP and may evolve during development. Existing field names should remain stable whenever possible.

---

# Backend Setup Guide

This guide is intended for frontend and mobile developers who want to run the backend locally.

## Clone Repository

Clone the project repository to your local machine:
```bash
git clone https://github.com/Paramfpv/CropSentinel.git
cd CropSentinel
```

## Create Virtual Environment

Initialize a Python virtual environment in the project root:
* **Windows**:
  ```powershell
  python -m venv .venv
  ```
* **macOS / Linux**:
  ```bash
  python3 -m venv .venv
  ```

## Activate Virtual Environment

Activate the virtual environment to isolate package dependencies:
* **Windows (PowerShell)**:
  ```powershell
  .venv\Scripts\activate
  ```
* **Windows (Command Prompt)**:
  ```cmd
  .venv\Scripts\activate.bat
  ```
* **macOS / Linux**:
  ```bash
  source .venv/bin/activate
  ```

## Install Dependencies

Install the required backend packages using `pip`:
```bash
pip install fastapi uvicorn pydantic sqlalchemy psycopg[binary] python-dotenv
```

## Create Environment File

Create your local configuration file by copying the example template:
* **Windows (PowerShell)**:
  ```powershell
  copy .env.example .env
  ```
* **macOS / Linux / Git Bash**:
  ```bash
  cp .env.example .env
  ```

## Configure Neon Database

Open the newly created `.env` file and set the `DATABASE_URL` key with your Neon connection string. Make sure `sslmode=require` is appended to the connection string:
```ini
DATABASE_URL=postgresql://[user]:[password]@[neon-hostname]/[dbname]?sslmode=require
```

## Start Backend Server

Launch the local Uvicorn development server:
```bash
uvicorn app.main:app --reload
```

## Swagger Documentation

Once the server is running, the interactive API documentation and testing UI is available at:
* [http://localhost:8000/docs](http://localhost:8000/docs)

---

# Available Endpoints

Here is a list of the currently available endpoints:

* **`GET /health`**: System health check to verify backend server is running.
* **`GET /dashboard`**: Returns the primary overview data for the farm, including current health score, sensors status, and current top recommendation.
* **`GET /ndvi-history`**: Retrieves historical NDVI values for displaying health trends in the dashboard chart.
* **`GET /market-history`**: Retrieves historical market mandi prices for mandi price trend tracking.
* **`GET /stress-map`**: Returns the static URL for the generated crop stress map image.
* **`GET /alerts`**: Retrieves the history of generated and dispatched alerts.
* **`GET /agent-status`**: Shows the processing status of each individual background agent (e.g. idle, running, completed).
* **`POST /run-analysis`**: Triggers a manual execution run of the backend autonomous multi-agent analysis loop.
* **`POST /satellite-health`**: Returns the real Sentinel-2 satellite vegetation index (NDVI) and farm health stats for a coordinate.
* **`POST /weather`**: Exposes forecast and current condition data for any resolved city.
* **`POST /risk-analysis`**: Combines live Sentinel-2 NDVI and weather forecast data to generate a farm risk assessment.
* **`POST /analyze`**: Unified orchestrator endpoint that returns satellite metrics, weather forecasts, and risk assessments in a single call.

---

# Base URL

```http
http://localhost:8000
```


---

# Health Check

## GET /health

Used to verify backend availability.

### Response

```json
{
  "status": "healthy"
}
```

---

# Dashboard Overview

## GET /dashboard

Returns all key information required by the main dashboard.

### Response

```json
{
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
```

---

# Agent Status

## GET /agent-status

Returns current status of all agents.

### Response

```json
{
  "satellite": "completed",
  "weather": "completed",
  "soil": "completed",
  "market": "completed",
  "intervention": "completed",
  "alert": "completed"
}
```

Possible values:
```text
idle
running
completed
failed
```

---

# NDVI History

## GET /ndvi-history

Used for NDVI trend chart.

### Response

```json
[
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
```

---

# Market Price History

## GET /market-history

Used for mandi price trend chart.

### Response

```json
[
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
```

---

# Stress Map

## GET /stress-map

Returns NDVI stress visualization.

### Response

```json
{
  "image_url": "/static/maps/stress_map.png"
}
```

---

# Alerts

## GET /alerts

Returns alert history.

### Response

```json
[
  {
    "id": 1,
    "message": "Irrigate within 48 hours",
    "timestamp": "2026-06-08T12:00:00Z",
    "status": "sent"
  }
]
```

---

# Manual Analysis Trigger

## POST /run-analysis

Used during demo to trigger a complete analysis cycle.

### Request

```json
{}
```

### Response

```json
{
  "status": "started"
}
```

---

# Satellite Health

## POST /satellite-health

Used by frontend/mobile apps to request real Sentinel-2 NDVI-derived farm health data.

### Request

```json
{
  "latitude": 20.9374,
  "longitude": 77.7796
}
```

### Response

```json
{
  "ndvi": 0.105,
  "farm_health_score": 12,
  "status": "stressed",
  "captured_at": "2026-06-09T05:33:03.561Z"
}
```

### Frontend Usage Notes

* Coordinates must be valid floating-point numbers (-90.0 to 90.0 latitude, -180.0 to 180.0 longitude).
* The API fetches actual Sentinel-2 spectral data dynamically, so queries might take a few seconds to process.

---

# Weather

## POST /weather

Exposes forecast and current condition data for any resolved city.

### Request

```json
{
  "latitude": 20.9374,
  "longitude": 77.7796
}
```

### Response

```json
{
  "location": "Amravati",
  "latitude": 20.9374,
  "longitude": 77.7796,
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
```

### Frontend Usage Notes

* Used to display current weather conditions.
* Used to display 7-day forecast cards/charts.
* Will later be consumed by the Risk Engine.

---

# Risk Analysis

## POST /risk-analysis

Combines live Sentinel-2 NDVI and weather forecast data to generate a rule-based farm risk assessment and intervention recommendation.

### Request

```json
{
  "latitude": 20.9374,
  "longitude": 77.7796
}
```

### Response

```json
{
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
```

### Frontend Usage Notes

* Coordinates must be valid floating-point numbers (-90.0 to 90.0 latitude, -180.0 to 180.0 longitude).
* City name must be resolved via the Geocoding API.
* The API returns normalized risk level (LOW/MEDIUM/HIGH) and custom recommendation guidelines.
* **Risk Calculation Engine**: The risk scoring logic (0-100), risk levels, and recommendations are fully deterministic, explainable, and computed rule-based. The `llm_explanation` is a dynamic, natural-language explanation of these deterministic outputs generated by a lightweight Llama model through Groq in farmer-friendly language. It does not calculate, modify, or override the risk levels or recommendations.

---

# Unified Analysis

## POST /analyze

Orchestrates the entire CropSentinel pipeline and returns all information required by the frontend dashboard in one API call.

### Request

```json
{
  "latitude": 20.9374,
  "longitude": 77.7796
}
```

### Response

```json
{
  "satellite": {
    "ndvi": 0.105,
    "farm_health_score": 12,
    "status": "stressed",
    "captured_at": "2026-06-09T05:33:03.561Z"
  },
  "weather": {
    "location": "Amravati",
    "latitude": 20.9374,
    "longitude": 77.7796,
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
    "risk_score": 60,
    "risk_level": "HIGH",
    "recommendation": "Irrigate within 48 hours",
    "llm_explanation": "Your crop appears to be under significant stress. The vegetation index is very low..."
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
```

### Frontend Integration Notes

* **Primary Endpoint**: This endpoint is the primary dashboard orchestrator and should be preferred by frontend and mobile applications over individual calls to `/satellite-health`, `/weather`, and `/risk-analysis`.
* Coordinates and city inputs must be pre-validated on the client side.

### System Architecture Flow

Production analysis requests flow through the sequential LangGraph orchestrated pipeline:

```text
Frontend
   ↓
POST /analyze
   ↓
CoordinatorAgent
   ↓
LangGraph Workflow
   ↓
Satellite Agent
   ↓
Weather Agent
   ↓
Risk Agent
   ↓
Intervention Agent
```

---

# Authentication & User Management

## POST /auth/login

Used by farmers to authenticate passwordlessly using their mobile number. If the user does not exist, they are automatically registered.

### Request

```json
{
  "phone_number": "9876543210"
}
```

### Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "phone_number": "9876543210"
  }
}
```

---

# Farm Management

## POST /farm/create

Authenticated route to create a farm owned by the logged-in user.

**Headers**:
* `Authorization: Bearer <token>`

### Request

```json
{
  "farm_name": "My Cotton Field",
  "latitude": 20.9374,
  "longitude": 77.7796
}
```

### Response

```json
{
  "farm_id": 1,
  "farm_name": "My Cotton Field"
}
```

---

## GET /farm/list

Authenticated route to list all farms owned by the logged-in user.

**Headers**:
* `Authorization: Bearer <token>`

### Response

```json
[
  {
    "id": 1,
    "farm_name": "My Cotton Field",
    "latitude": 20.9374,
    "longitude": 77.7796,
    "created_at": "2026-06-12T12:00:00Z"
  }
]
```

---

# Crop Analysis History

## GET /history/{farm_id}

Authenticated route to fetch the historical analysis runs for a specific farm. Verifies that the farm belongs to the current authenticated user.

**Headers**:
* `Authorization: Bearer <token>`

### Response

```json
{
  "farm_id": 1,
  "history": [
    {
      "created_at": "2026-06-12T12:05:00Z",
      "ndvi": 0.105,
      "risk_score": 90,
      "risk_level": "HIGH",
      "recommendation": "Irrigate within 48 hours"
    }
  ]
}
```

---

# Future Endpoints

These endpoints are expected but not yet defined:

* Farm boundary upload
* WhatsApp alert management
* Multi-farm support


---

# Notes For Frontend Team

Frontend should assume:

* Response field names are expected to remain stable.
* Additional fields may be added later.
* Mock data can be created using the examples above.
* Charts, cards, maps, and agent-status components can be developed immediately using these response formats.
* Backend implementation may evolve, but the overall response shape should stay similar.
