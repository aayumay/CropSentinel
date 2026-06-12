# CropSentinel

AI-powered crop monitoring and farm intelligence platform designed to help farmers make proactive decisions using weather insights, satellite analysis, and intelligent recommendations.

---

## Features

### Mobile Application

* **Farm Management**: Easy addition, modification, and deletion of fields.
* **Real Backend Integration**: Fully integrated API endpoints for live dynamic data.
* **Authentication Flow**: Validated authentication using phone numbers or email.
* **Dynamic Farm Analysis**: Localized satellite indicators and NDVI metrics.
* **Weather Insights**: Real-time forecasts fetched directly from Open-Meteo API.
* **Alerts Feed**: Actionable and categorized risk notifications.
* **Recommendations Engine**: Intelligent suggestions for active agricultural interventions.
* **Bilingual Support**: Full translation support for English and Hindi.
* **Native Haptics**: Clear physical feedback for all interactions.
* **Demo Mode Support**: Tonal switch to load offline simulations for judges.

### Backend

* FastAPI services
* JWT authentication
* Farm CRUD APIs
* Analysis APIs
* Historical data endpoints

### Dashboard

* Web dashboard implementation

---

## Tech Stack

### Mobile

* React Native
* Expo SDK 56
* React Navigation
* Expo Location
* React Native Paper

### Backend

* FastAPI
* Render deployment

### External Services

* Open-Meteo API

---

## Repository Structure

* `main`: Contains the stable, fully merged codebase of the mobile application and integrated API contracts.
* `yesh/mobile`: Standalone backup and staging branch representing the mobile code used to build the submission APK.
* `frontend`: Untouched remote branch containing the frontend web dashboard.
* `backend`: Untouched remote branch containing the production backend server code.
* `d6-backend`: Historical branch documenting the backend services, schemas, and endpoint design constraints.

---

## APK Installation

The final submission build can be installed on physical Android devices:
1. **Download the APK**: [CropSentinel v1.0.0 APK](https://expo.dev/artifacts/eas/m-eaFP90nXZwAhc8rAxyae07wG41wD-8do9bvlaaUxE.apk)
2. **Scan/Install via Expo**: Visit the [Expo Build Details Page](https://expo.dev/accounts/yeshbind/projects/faraway/builds/89f6abd0-7eec-44ba-9745-e5d64a1a112f) and scan the QR code with your device camera to trigger the direct install.
3. **Run Setup**: Allow "Installation from Unknown Sources" if prompted by Android security services during APK installation.

---

## Backend Documentation

The live backend interactive API Swagger docs can be accessed at:
[Swagger UI Documentation](https://cropsentinel-on03.onrender.com/docs)

---

## Team

* **Param** — Backend + AI Agents
* **Aayush** — Web Dashboard
* **Yesh** — Mobile Application

---

## Future Enhancements

* **Farm Boundary Drawing**: Interactive polygon boundary mapping.
* **Offline Synchronization**: Core database storage for editing/adding farms without active internet.
* **Push Notifications**: Remote cloud alert broadcasts.
* **Advanced Satellite Visualizations**: Interactive indices overlays.
