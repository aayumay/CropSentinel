# CropSentinel — Release Notes

## Version: v1.1.0-final

| Field | Value |
|:---|:---|
| **Version** | v1.1.0-final |
| **Branch** | `main` |
| **Latest Commit** | `fd8999b` |
| **Build Date** | 2026-06-14 |
| **Platform** | Android (Expo Go / EAS Preview APK) |
| **Backend** | `https://cropsentinel-on03.onrender.com` |
| **EAS Build ID** | `8605741e-f7ae-474b-b283-986de68da9ca` |
| **APK / Install URL** | https://expo.dev/accounts/yeshbind/projects/faraway/builds/8605741e-f7ae-474b-b283-986de68da9ca |

---

## Key Features Delivered (D1 – D6)

### D1 — Project Foundation
- Expo React Native scaffolding with Material Design 3 token system
- Navigation stack with bottom tabs: Home, Farms, Insights, Alerts, Settings
- Theme system (`materialTheme`) with dark-friendly surface colors
- Haptic feedback integration via `expo-haptics`

### D2 — Core Screens & Demo Mode
- `MyFarmsScreen` (Home Dashboard) with weather overview, highest-risk farm highlight
- `FarmsScreen` (farms list with health score cards)
- `AddFieldScreen` (create / edit field form with location picker)
- Demo mode toggle exposing 3 curated farm profiles (Punjab Wheat, Kaveri Rice, Marathwada Sugarcane)
- Drought simulation mode with updated health/NDVI/risk values

### D3 — Farm Detail & Alerts
- `FarmDetailScreen` with dynamic health score ring, NDVI / Moisture / Weather Risk / Market Risk metric cards
- NDVI trend sparkline chart (SVG, no native dependency)
- Market price trend sparkline chart
- `AlertsFeedScreen` with severity-coded alert cards and pull-to-refresh
- Local push notification scheduling via `expo-notifications`

### D4 — Interventions & Analytics
- `InterventionDetailScreen` with AI recommendation card, cost/risk/confidence metrics
- Apply Intervention flow with M3-styled success dialog
- Share functionality using `Share` API

### D5 — Polish & Internationalisation
- Full English / Hindi translation system (12 screens, 120+ keys)
- Real-time language switch in Settings without restart
- M3 dialogs, haptic micro-interactions on all interactive elements
- Demo banner overlay with drought toggle
- `NotificationSettingsScreen`, `HelpSupportScreen`, `AccountSettingsScreen`

### D6 — Backend Integration & Final Cleanup
- Full JWT authentication via `POST /auth/login` (phone number or email)
- Real-time login input validation (Indian mobile regex + email regex)
- Farm persistence via `POST /farm/create` → real backend IDs returned and propagated
- Farm list loaded from `GET /farm/list`
- Per-farm satellite analysis via `POST /analyze` (multi-agent: satellite + weather + risk)
- Per-farm history via `GET /history/{farm_id}`
- Dynamic **Satellite Analysis Summary** card (NDVI score, Vegetation Status, Risk Level, Recommendation)
- Home dashboard derived from `fetchFarms` + `getFarmHistory` — no mock `/dashboard` endpoint
- Removed all debug `console.log` instrumentation

---

## Known Limitations

| Item | Detail |
|:---|:---|
| Backend cold-start | Hosted on free Render tier — first request after inactivity takes 30–50 s. API timeout set to 50 s. |
| No offline cache | Real mode requires internet. Switching to Demo Mode provides offline functionality. |
| Farm coordinates | Currently entered manually as numeric lat/lon. Live GPS picker is a future enhancement. |
| Social login | Google / Apple buttons show an informational alert (not implemented). |
| Edit / Delete farm | Backend `PUT /farm/:id` and `DELETE /farm/:id` endpoints are stubbed; falls back to local mock state. |
