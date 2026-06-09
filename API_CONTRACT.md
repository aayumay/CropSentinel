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

# Future Endpoints

These endpoints are expected but not yet defined:

* Farm onboarding
* Farm boundary upload
* WhatsApp alert management
* Historical recommendations
* Multi-farm support

---

# Notes For Frontend Team

Frontend should assume:

* Response field names are expected to remain stable.
* Additional fields may be added later.
* Mock data can be created using the examples above.
* Charts, cards, maps, and agent-status components can be developed immediately using these response formats.
* Backend implementation may evolve, but the overall response shape should stay similar.
