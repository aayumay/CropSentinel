# CropSentinel Mobile — Pre-D6 Testing Guide

This guide is designed to help remote team members (Param, Aayush, and Mobile QA) install, validate, and test the CropSentinel Mobile app independently before the backend services are integrated in D6.

---

## SECTION 1 — INSTALLATION

There are two ways to run and test this preview release:

### Option A: Install the Preview APK (Recommended for Android Devs)
1. Download the generated APK from the download link provided in the QA package: [Download Preview APK](https://expo.dev/artifacts/eas/crop-sentinel-preview.apk) (or run the build manually if needed, see below).
2. Open your device settings and allow installations from **Unknown Sources**.
3. Install the downloaded `CropSentinel-preview.apk` file on your device.
4. Open the application.

* **Expected Result**: The CropSentinel custom Agritech splash screen appears, followed by the Onboarding/Welcome experience.

### Option B: Run via Expo Go (Immediate Validation on iOS & Android)
If you don't have the APK installed, you can test it directly on any physical device via Expo Go:
1. Install **Expo Go** from the Google Play Store or Apple App Store.
2. In the project root workspace, run:
   ```bash
   npx expo start
   ```
3. Scan the generated QR code using your phone camera (iOS) or the Expo Go app (Android).

---

## SECTION 2 — DEMO MODE TEST

1. Complete the onboarding screen and tap **Get Started**.
2. Log in (tap the Login button on the Auth screen).
3. Navigate to **Profile Settings** (tap the Settings gear icon in the header).
4. Locate the **Demo Mode** section and toggle the switch to **ON**.
5. Navigate back to the Home/Dashboard screen.

* **Expected Result**: A green "DEMO MODE ACTIVE" simulation banner is displayed at the top of the screen.
* **Pass Criteria**: The switch toggles smoothly and no screen crashes or freezes occur.

---

## SECTION 3 — FARM DETAIL TEST

1. From the My Farms list dashboard, select **Marathwada Sugarcane Farm**.
2. Review the overall health score displayed inside the animated circle metric.
3. Scroll down to the satellite card overlay displaying the green crop boundary polygon.

* **Expected Result**: All metrics (NDVI, Soil Moisture, Weather Risk, Mandi Market Risk) and the satellite placeholder preview card render properly.
* **Pass Criteria**: Layout renders clean visual card spacing with no overlapping text.

---

## SECTION 4 — SIMULATE DROUGHT TEST

1. With **Demo Mode** enabled, open the **Marathwada Sugarcane Farm** details screen.
2. Locate the yellow **Simulate Drought** action button.
3. Tap **Simulate Drought**.

* **Expected Result**: The health score smoothly animated-counts down to `41`, and the satellite preview card highlights the drought risk boundary.
* **Pass Criteria**: All states transition seamlessly without crashes or freezing.

---

## SECTION 5 — ALERTS TEST

1. Navigate to the **Alerts** feed screen (tap the Bell icon on the bottom navigation bar).
2. Review the generated lists of active alerts.

* **Expected Result**: Dynamic warnings like "Critical Moisture Drop" or "NDVI Alert" are listed with priority chips.
* **Pass Criteria**: The list loads successfully without showing an empty page.

---

## SECTION 6 — INTERVENTION TEST

1. Tap on any alert in the alerts feed to view its **Intervention Detail** screen.
2. Review the recommended actions, cost estimates, and risk charts.
3. Tap the **Apply Recommendation** (or **Take Action**) button.

* **Expected Result**: An animated success dialog appears confirming the action, and a local notification is successfully pushed to the device status tray.
* **Pass Criteria**: The modal completes the action successfully and notification is received.

---

## SECTION 7 — ADD FARM TEST

1. Tap the floating **Add Farm** button (`+` icon) on the My Farms dashboard screen.
2. Enter a **Farm Name** (e.g., "South Field").
3. Select **Crop Type** from the dropdown menu (e.g., "Wheat").
4. Select **Soil Type** from the dropdown menu (e.g., "Sandy").
5. Tap **Choose Farm Location** to open the coordinates picker screen.
6. Enter manual coordinates:
   - **Latitude**: e.g., `22.5937` (Must be between -90 and 90)
   - **Longitude**: e.g., `78.9629` (Must be between -180 and 180)
7. Tap **Use Coordinates**.
8. Tap **Save Field**.

* **Expected Result**: An animated confirmation dialog appears showing the prepared JSON payload ready for D6 backend integration.
* **Pass Criteria**: Coordinates return successfully to the Add Farm fields, form validation accepts the values, and the save flow succeeds.

---

## SECTION 8 — LANGUAGE TEST

1. Go to **Settings** (gear icon in header).
2. Tap the language selector toggle or profile language settings.
3. Select **Hindi** or another alternate option.
4. Navigate back to the Home screen.

* **Expected Result**: Text labels switch languages appropriately.
* **Pass Criteria**: Transitions run without crashes.

---

## SECTION 9 — GENERAL UX FEEDBACK

Please report back to the engineering team on the following items:
* **Ease of navigation**: Did you find it easy to navigate between screens?
* **Visual appeal**: How does the visual theme, spacing, and transition styling feel?
* **Confusing interactions**: Were there any buttons or behaviors that felt unintuitive?
* **Bugs encountered**: List any unexpected errors or warnings.
* **Suggestions**: Any improvement suggestions before we freeze the release for D6.

---

### Manual EAS Build Generation Instructions
If you need to generate a new APK build yourself using your Expo Account:
1. Authenticate with your credentials:
   ```bash
   npx eas-cli login
   ```
2. Build the Android preview:
   ```bash
   npx eas-cli build --platform android --profile preview
   ```
