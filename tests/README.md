# CropSentinel Backend Verification Suites

This directory contains the consolidated verification suites for CropSentinel, simplifying testing overhead while maintaining complete coverage of the backend pipeline.

---

## 1. Development Verification

The development test suite is designed for verifying the complete system state locally, including all features, database tables, and API routes.

### Execution Command

```bash
uv run python tests/final_hackathon_test.py
```

### Coverage Details

This suite runs end-to-end, validating 16 distinct operational components grouped into 13 status checkpoints:
1. **Environment Variables**: Checks presence of CDSE Copernicus, Groq, and PostgreSQL connection credentials.
2. **Database**: Verifies connectivity and model schema table creations.
3. **Authentication**: Tests mobile passwordless login, automatic user creation, and JWT claims signing.
4. **Farm Management**: Validates farm creation and listing.
5. **Satellite Service**: Verifies Copernicus OAuth handshake and point-based NDVI calculation.
6. **Weather Service**: Queries coordinate forecast ranges from Open-Meteo.
7. **Risk Engine**: Asserts points-based risk scoring rules.
8. **LLM Layer**: Tests Groq Llama explanation generation.
9. **Intervention Planner**: Asserts priority metrics mapping and Llama plan formatting.
10. **LangGraph Workflow**: Verifies separate agent node triggers (`SatelliteAgent`, `WeatherAgent`, `RiskAgent`, `InterventionAgent`, and `CoordinatorAgent`).
11. **Analyze Endpoint**: Validates FastAPI request/response payloads on the `/analyze` route.
12. **Analysis Persistence**: Verifies that the endpoint automatically persists results to `AnalysisHistory`.
13. **History Endpoint**: Tests history retrievals, timestamps, and cross-user authorization security checks.

---

## 2. Deployment Verification

The deployment test suite is designed to be cloud-focused, verifying environment setup and remote service APIs before or during cloud deployment (e.g. Render, AWS).

### Execution Command

```bash
uv run python tests/deployment_readiness_test.py
```

### Coverage Details

This suite validates cloud deployment readiness by ensuring the container can start and connect to remote services:
1. **Environment Variables**: Asserts required environment variables exist in the target host space.
2. **Database Connection**: Confirms PostgreSQL database reaches a verified connection state.
3. **External API Credentials**: Validates Copernicus and Groq client oauth/connection authorization keys.
4. **Analyze Endpoint**: Verifies orchestrator pipeline operations and response payloads.
5. **Startup Blockers**: Ensures no runtime blockers exist that would prevent the application container from serving traffic.
