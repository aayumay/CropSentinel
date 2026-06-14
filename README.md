# CropSentinel Monorepo

AI-powered crop monitoring and farm intelligence platform designed to help farmers make proactive decisions using weather insights, satellite analysis, and intelligent recommendations.

This repository is organized as a clean, professional monorepo containing the mobile application, backend API services, and the web frontend dashboard.

---

## 📁 Monorepo Structure

```text
CropSentinel/
│
├── mobile/                 # React Native / Expo Mobile Application
│   ├── App.js
│   ├── app.json
│   ├── eas.json
│   ├── babel.config.js
│   ├── package.json
│   ├── src/                # Mobile components, screens, services
│   └── assets/             # Mobile static assets
│
├── backend/                # FastAPI Application & AI Agents
│   ├── app/                # Main application package (routers, services, db)
│   ├── tests/              # Test suite
│   ├── pyproject.toml      # Dependency specification (PEP 508 / uv)
│   └── uv.lock             # uv lockfile
│
├── frontend/               # React / Vite Web Dashboard
│   ├── src/                # Dashboard screens and visual elements
│   ├── index.html
│   ├── package.json        # Frontend dependency list
│   └── vite.config.js      # Vite configuration
│
├── docs/                   # Consolidated Documentation & Guides
│   ├── API_CONTRACT.md     # API contract schemas & specifications
│   ├── PROJECT_SUMMARY.md  # Architectural summaries
│   ├── QUICKSTART.md       # Mobile quick start guide
│   ├── RELEASE_NOTES.md    # Version release details
│   ├── TESTING_GUIDE.md    # Detailed test guides & checklists
│   └── BUG_REPORT_TEMPLATE.md
│
├── README.md               # Main monorepo entry point
├── .gitignore              # Unified ignore specifications
└── LICENSE                 # MIT License file
```

---

## 🌿 Branch Structure

To maintain a clean repository history, the codebase utilizes the following branch layout:
* **`main`**: The primary, production-ready branch containing the restructured mobile application, backend API, and web frontend dashboard.
* **`d7.1-stabilization`**: Legacy branch representing the D7 stabilization history pass (flat mobile app structure).
* **`yesh/mobile`**: Historical branch representing the initial mobile application development.
* **`backend`**: Standalone backend API services development branch.
* **`frontend`**: Standalone web dashboard frontend development branch.
* **`repo-restructure`**: Restructuring history branch used during the monorepo migration pass.

---

## 🚀 Getting Started

### 📱 Mobile Application

The mobile app is built using React Native and Expo SDK 56.

1. **Navigate & Install Dependencies**:
   ```bash
   cd mobile
   npm install
   ```
2. **Start Metro Bundler**:
   ```bash
   npx expo start
   ```
3. **Run on Simulators or Physical Devices**:
   - Press `a` for Android Emulator.
   - Press `i` for iOS Simulator.
   - Scan the terminal QR code with the Expo Go app on a physical device.

---

### ⚙️ Backend Services

The backend is built with FastAPI, using Uvicorn as the ASGI web server, and integrates with PostgreSQL and the Groq/LangGraph AI engine.

1. **Navigate & Create Virtual Environment**:
   ```bash
   cd backend
   python -m venv .venv
   # Activate on Windows:
   .venv\Scripts\activate
   # Activate on macOS/Linux:
   source .venv/bin/activate
   ```
2. **Install Dependencies**:
   Using uv (recommended):
   ```bash
   uv sync
   ```
   Or using standard pip:
   ```bash
   pip install -e .
   ```
3. **Configure Environment Variables**:
   Create a `.env` file from the template:
   ```bash
   cp .env.example .env
   # Add your COPERNICUS_CLIENT_ID, COPERNICUS_CLIENT_SECRET, and GROQ_API_KEY
   ```
4. **Run Server**:
   ```bash
   python -m uvicorn app.main:app --reload
   ```

Interactive API documentation:
* **Local**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **Production**: [https://cropsentinel-on03.onrender.com/docs](https://cropsentinel-on03.onrender.com/docs)

---

### 💻 Frontend Dashboard

The web dashboard is built using React 19, Tailwind CSS, and Vite.

1. **Navigate & Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```
2. **Start Development Server**:
   ```bash
   npm run dev
   ```
3. **Build Production Bundle**:
   ```bash
   npm run build
   ```

---

## 🎯 Releases

### Original Hackathon Submission
- Git Tag: `v1.0.0-submission`
- Purpose: Exact codebase submitted during the hackathon.

Checkout:
```bash
git checkout v1.0.0-submission
```

### Latest Stabilized Release
* Git Tag: `v1.1.0-final`
* Branch: `main`
* Purpose: Post-hackathon stabilization release including D7 fixes and production hardening.

Checkout:
```bash
git checkout v1.1.0-final
```

### APK Installation
The final D7 stabilization-pass preview build can be installed directly on physical Android devices:
* **Version**: v1.1.0-final
* **Build ID**: `8605741e-f7ae-474b-b283-986de68da9ca`
* **Commit**: `fd8999b5f2e5df3e8cf2ee513b61d8fb1401442f`

**Download**:
[Download CropSentinel v1.1.0 APK](https://expo.dev/artifacts/eas/ywJTmxSh1znB5n5_I7mTi_kBYr_pORfuE1oOFkYcakc.apk)

**Build Details**:
[Expo Build Details Page](https://expo.dev/accounts/yeshbind/projects/faraway/builds/8605741e-f7ae-474b-b283-986de68da9ca)

---

## ✨ Features

### Mobile Application
- **Farm Management**: Field creation and management workflows with graceful handling of backend limitations.
- **Real Backend Integration**: Fully integrated API endpoints for live dynamic data.
- **Authentication Flow**: Validated authentication using phone numbers or email.
- **Dynamic Farm Analysis**: Localized satellite indicators and NDVI metrics.
- **Weather Insights**: Real-time forecasts fetched directly from Open-Meteo API.
- **Alerts Feed**: Actionable and categorized risk notifications.
- **Recommendations Engine**: Scenario-specific recommendations and drought simulation in Demo Mode, with a production empty-state fallback when mock capabilities are disabled.
- **Bilingual Support**: Full translation support for English and Hindi.
- **Native Haptics**: Clear physical feedback for all interactions.
- **Demo Mode Support**: Switch to load offline simulations for judging presentation.

### Backend
- FastAPI services.
- JWT authentication.
- Farm CRUD APIs.
- Analysis APIs.
- Historical data endpoints.
- AI Recommendations & Copernicus satellite mock integration.

### Web Dashboard
- React/Vite dashboard prototype showcasing analytics and field visualization workflows.
- Field view visualization, notifications feed, and analytics charts.

---

## 👥 Team Members

* **Param** — Backend + AI Agents
* **Aayush** — Web Dashboard
* **Yesh** — Mobile Application

---

## 📝 Known Limitations

* **Location Input**: Interactive map coordinate selection was replaced with current location GPS queries and manual coordinate entry to prioritize client-side submission stability.
* **Weather Dependency**: External weather metrics depend entirely on Open-Meteo service availability and cached lookups.
* **Boundary Visuals**: Farm polygon boundary drawing is planned for future releases (currently displays visual placeholders).
