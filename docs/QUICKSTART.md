# Quick Start Guide - CropSentinel Mobile App

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+) and npm installed
- iOS simulator or Android emulator OR a physical device with the Expo Go app installed

### Installation Steps

1. **Navigate to the Mobile Directory**
   ```bash
   cd mobile
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Development Server**
   ```bash
   npx expo start
   ```

4. **Run the App**
   - **Android Emulator**: Press `a`
   - **iOS Simulator**: Press `i`
   - **Physical Device**: Scan the QR code displayed in the terminal using your device camera or the Expo Go app.

---

## 📁 Project Structure Overview

All mobile application files are located in the [mobile/](file:///c:/Users/Yesh%20bind/OneDrive/Desktop/Faraway/mobile/) subfolder:
- **`mobile/App.js`** - Navigation container and error boundary setup
- **`mobile/src/theme.js`** - App theme color and layout specifications
- **`mobile/src/screens/`** - All React Native screen components
- **`mobile/src/components/`** - Reusable visual elements (banners, dialogs, error boundaries)
- **`mobile/src/services/`** - API client layer (real FastAPI queries & mock fallbacks)
- **`mobile/app.json`** - Expo project configuration
- **`mobile/package.json`** - App dependencies and npm scripts

---

## 🎨 Color Theme

All colors are defined inside `mobile/src/theme.js` using a custom Material Design 3 theme:
- Primary Green: `#1B5E20`
- Dark Background: `#121212`
- Surface: `#1E1E1E`

---

## 📱 Screen Navigation Flow

```text
Onboarding
    ↓
Login (with JWT auth)
    ↓
MyFarms (Hub / Dashboard)
    ├→ FarmDetail (with health metric rings, weather info)
    ├→ AlertsFeed (push alert notification feed)
    │   └→ InterventionDetail (AI agent recommendations)
    └→ Settings (English/Hindi translations & Demo Mode toggle)
```

---

## 🔧 Development Tips

1. **Hot Reloading**: The app automatically reloads when you save code changes.
2. **Developer Menu**: Shake your physical device or press `Ctrl+M` (Android) / `Cmd+D` (iOS) in the emulator to open the Expo dev menu.
3. **Reset Cache**: If you run into Metro bundler caching issues, start using:
   ```bash
   npx expo start -c
   ```

---

## 📦 Key Dependencies

- `react-native`: Cross-platform mobile development library
- `expo`: Managed app framework layer
- `@react-navigation/native`: Stack navigation container
- `expo-haptics`: Physical micro-feedback actions
- `react-native-paper`: Material UI components

---

## 🐛 Troubleshooting

**Metro Bundler Issues**
```bash
npx expo start -c
```

**Module Not Found**
```bash
npm install
```

**Port 8081 Already in Use**
```bash
npx expo start --port 8082
```

---

## 💡 Common Tasks

### Adding a New Screen
1. Create a file under `mobile/src/screens/NewScreen.js`.
2. Import the new screen in `mobile/App.js`.
3. Add a `<Stack.Screen>` element inside the navigator in `mobile/App.js`.

### Changing Theme Colors
Modify `mobile/src/theme.js` and all screens will automatically adjust to the new color constants.

---

Happy coding! 🌱
