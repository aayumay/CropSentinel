# CropSentinel — Testing Guide

**Version:** v1.1.0-final | **Branch:** `main` | **Build Date:** 2026-06-14

---

## 1. Installation

### Option A — Expo Go (Recommended for testers)
1. Install **Expo Go** from the Play Store or App Store.
2. Navigate to the mobile folder and scan the QR code (`cd mobile && npx expo start`).
3. The app bundles and launches on your device.

### Option B — Preview APK (Android only)
1. Download the APK from the link provided in the release.
2. On your Android device: **Settings → Security → Install unknown apps → Allow**.
3. Open the downloaded APK file and tap **Install**.
4. Launch **CropSentinel** from your home screen.

---

## 2. Login Instructions

CropSentinel uses **passwordless authentication** — no password required.

### Valid Input Formats
| Format | Example |
|:---|:---|
| Indian mobile number | `9876543210` (10 digits, starts with 6–9) |
| Email address | `user@example.com` |

### Steps
1. Open the app → **Login** screen appears automatically.
2. Enter your phone number or email in the input field.
   - A ✓ green border confirms valid format.
   - A ✗ red border with helper text confirms invalid format.
3. The **Login** button only activates when input is valid.
4. Tap **Login** — the app authenticates with the backend and navigates to the Home screen.

> **Note:** The backend is hosted on a free server tier. The **first login after a period of inactivity may take 30–50 seconds** while the server wakes up. Subsequent requests are fast.

---

## 3. Test Scenarios

### 3.1 Authentication
| Scenario | Steps | Expected |
|:---|:---|:---|
| Valid phone login | Enter `9876543210`, tap Login | Home screen loads |
| Valid email login | Enter `user@example.com`, tap Login | Home screen loads |
| Invalid phone (short) | Enter `12345` | Red border + helper text; button disabled |
| Invalid phone (wrong prefix) | Enter `1234567890` | Red border + helper text |
| Invalid email | Enter `test@gmail` | Red border + helper text |
| Empty input + Login press | Tap Login with empty field | Alert dialog shown |

### 3.2 Farm Management
| Scenario | Steps | Expected |
|:---|:---|:---|
| View farm list | Tap **Farms** tab | All created farms listed |
| Add a farm | Tap **+** → Fill name, lat/lon → Save | Farm appears in list; Farm Detail opens |
| Open farm details | Tap any farm card | Detail screen with NDVI, Moisture, Weather Risk, Market Risk, Satellite Analysis |
| Search farms | Use search bar in Farms screen | List filters in real-time |
| Delete a farm | Long-press or swipe a farm → Delete | Farm removed from list |

### 3.3 Backend Integration
| Endpoint | Trigger | Expected |
|:---|:---|:---|
| `POST /auth/login` | Login screen | JWT token returned, navigates home |
| `GET /farm/list` | Farms screen load | Real farms list populated |
| `POST /farm/create` | Add Field → Save | `farm_id` returned, navigation uses that ID |
| `POST /analyze` | Open any farm detail | Satellite Analysis Summary card populated |
| `GET /history/{farm_id}` | Open any farm detail | NDVI trend chart populated |

### 3.4 Home Dashboard
| Scenario | Expected |
|:---|:---|
| Home screen load | Weather row visible; Highest-Risk Farm card shows; AI Recommendation card shows |
| Pull-to-refresh | Data reloads from backend |

### 3.5 Alerts
| Scenario | Expected |
|:---|:---|
| Open Alerts tab | Alert cards load with severity colours (red/yellow) |
| Pull-to-refresh | Alerts reload |
| Tap an alert | Navigates to Intervention Detail |

### 3.6 Interventions
| Scenario | Expected |
|:---|:---|
| Open Insights tab | Recommendation card with cost, risk, confidence |
| Tap **Apply Recommendation** | Success dialog appears |
| Tap **Share** | Native share sheet opens |

### 3.7 Settings
| Scenario | Expected |
|:---|:---|
| Language → Hindi | All labels switch to Hindi |
| Language → English | Labels switch back |
| Demo Mode ON | Demo banner visible; drought toggle appears on Farm Detail |
| Demo Mode OFF | Real backend mode; no demo banner |
| Notifications toggle | Toggle state persists |

### 3.8 Demo Mode Scenarios
| Scenario | Expected |
|:---|:---|
| Demo ON, open Sugarcane Farm | Health 78, NDVI 0.65, LOW risk |
| Demo ON, simulate drought | Health 41, NDVI 0.22, HIGH risk; Satellite Summary shows STRESSED |
| Demo ON, view Intervention | Action updates to "Increase irrigation within 48 hours" |

---

## 4. Bug Reporting Template

```
**Bug Title:** [Short description]

**App Version:** v1.0.0
**Device:** [e.g. Samsung Galaxy S21, Android 13]
**Mode:** [Demo / Real]

**Steps to Reproduce:**
1.
2.
3.

**Expected Behaviour:**
[What should happen]

**Actual Behaviour:**
[What actually happened]

**Screenshot / Screen Recording:**
[Attach if available]

**Console Output (if available):**
[Paste any error messages]
```

---

## 5. Known Limitations

- **Backend cold-start:** First login after inactivity = 30–50 s wait. This is a free-tier Render limitation.
- **Edit/Delete farm:** Local state update only; backend PUT/DELETE endpoints are not implemented server-side.
- **Social login (Google/Apple):** Shows informational alert only — not implemented.
- **GPS picker:** Coordinates are entered manually.
