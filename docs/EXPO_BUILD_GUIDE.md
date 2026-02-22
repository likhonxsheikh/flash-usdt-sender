# 📱 Building APKs with Expo
## Complete Guide: From Quick Testing to Production Deployment

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Testing with Expo Go](#1-quick-testing-with-expo-go)
3. [Development Builds](#2-development-builds)
4. [Local Builds](#3-local-builds)
5. [EAS Build - Cloud Builds](#4-eas-build---cloud-builds)
6. [Production Builds](#5-production-builds)
7. [Configuration Reference](#configuration-reference)

---

## Prerequisites

### Required Tools
```bash
# Node.js (LTS version recommended)
node --version  # v18.x or higher

# npm or yarn
npm --version

# Expo CLI
npm install -g expo-cli

# Android Studio (for local builds)
# Download from: https://developer.android.com/studio

# EAS CLI (for cloud builds)
npm install -g eas-cli
```

### Environment Setup
```bash
# Set JAVA_HOME (Windows)
setx JAVA_HOME "C:\Program Files\Android\Android Studio\jbr"

# Set ANDROID_HOME
setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"

# Add to PATH
setx PATH "%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools"
```

---

## 1. Quick Testing with Expo Go

### Overview
- **Use Case**: Rapid prototyping, UI testing, quick feedback
- **Speed**: ⚡ Fastest
- **Cost**: Free
- **Push Notifications**: ❌ Not Supported

### Steps

```bash
# 1. Create new Expo project
npx create-expo-app@latest MyApp
cd MyApp

# 2. Start Metro bundler
npx expo start

# 3. Scan QR code with Expo Go app
# Available on:
# - iOS App Store
# - Google Play Store

# 4. For Android emulator
npx expo start --android
```

### Pros & Cons
| Pros | Cons |
|------|------|
| Instant hot reload | Limited native features |
| No build wait | Push notifications don't work |
| Free | Requires Metro bundler |
| Easy debugging | Not for production |

---

## 2. Development Builds

### Overview
- **Use Case**: App development with full native access
- **Speed**: ⚡⚡ Fast
- **Cost**: Free (EAS) / Free (Local)
- **Push Notifications**: ✅ Supported
- **Chrome DevTools**: ✅ Supported

### Option A: EAS Development Build

```bash
# 1. Login to Expo
npx expo login

# 2. Configure project
npx expo install expo-dev-client

# 3. Create development build
eas build -p android --profile development

# 4. Install on device
# Download APK from EAS dashboard
```

### Option B: Local Development Build

```bash
# 1. Generate native Android project
npx expo prebuild --platform android

# 2. Build debug APK
cd android
./gradlew assembleDebug

# 3. APK location
# android/app/build/outputs/apk/debug/app-debug.apk
```

### Development Build Features
- Full native code support
- Custom native modules
- Push notifications
- Background tasks
- Hardware access
- Chrome DevTools debugging

---

## 3. Local Builds

### Overview
- **Use Case**: Building without cloud dependencies
- **Speed**: ⚡⚡⚡ Medium
- **Cost**: Free
- **Push Notifications**: ✅ Supported
- **JS Bundling**: Included in APK

### Steps

```bash
# Method 1: Using expo run:android (Recommended)
npx expo run:android --variant release

# Method 2: Manual build
npx expo prebuild --platform android
cd android
./gradlew assembleRelease

# Method 3: Build with bundled JS
npx expo export --platform android
# Then copy to android/assets/
```

### Local Build Commands Reference

| Command | Description |
|---------|-------------|
| `npx expo prebuild` | Generate native project |
| `npx expo run:android` | Build and run on device |
| `./gradlew assembleDebug` | Debug APK |
| `./gradlew assembleRelease` | Release APK |
| `./gradlew bundleRelease` | JS bundle only |

### Output Locations
```
android/app/build/outputs/apk/
├── debug/app-debug.apk
└── release/app-release.apk
```

---

## 4. EAS Build - Cloud Builds

### Overview
- **Use Case**: CI/CD, team collaboration, complex builds
- **Speed**: ⚡⚡⚡⚡ Slow (queue dependent)
- **Cost**: Free tier available (Android)
- **Push Notifications**: ✅ Supported

### Setup EAS

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Configure project
eas project:init
```

### Build Profiles

#### Development Profile
```json
// eas.json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

```bash
# Build development APK
eas build -p android --profile development
```

#### Preview Profile
```json
// eas.json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

```bash
# Build preview APK (shareable via QR)
eas build -p android --profile preview
```

#### Production Profile
```json
// eas.json
{
  "build": {
    "production": {
      "distribution": "store",
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

```bash
# Build production AAB (for Play Store)
eas build -p android --profile production

# Or APK
eas build -p android --profile production --output android/app/build/outputs/apk/release/
```

### EAS Build Commands

| Command | Description |
|---------|-------------|
| `eas build -p android` | Start new build |
| `eas build -p android --profile dev` | Development build |
| `eas build -p android --profile preview` | Preview build |
| `eas build -p android --profile production` | Production build |
| `eas build:list` | List all builds |
| `eas build:cancel` | Cancel running build |

---

## 5. Production Builds

### Overview
- **Use Case**: Play Store submission, production release
- **Push Notifications**: ✅ Supported
- **App Bundle**: ✅ Required for Play Store

### Generate Keystore

```bash
# Method 1: Using keytool
keytool -genkeypair -v -storetype PKCS12 -keystore my-app.keystore -alias my-app-alias -keyalg RSA -keysize 2048 -validity 10000

# Method 2: Using Expo (recommended)
npx expo fetch:android:keystore
```

### Configure EAS for Production

```json
// eas.json
{
  "build": {
    "production": {
      "distribution": "store",
      "android": {
        "buildType": "app-bundle",
        "gradleCommand": ":app:bundleRelease"
      },
      "env": {
        "APP_ENV": "production"
      }
    },
    "release": {
      "distribution": "store",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### Build Commands

```bash
# Production AAB (Play Store ready)
eas build -p android --profile production

# Production APK (direct install)
eas build -p android --profile release

# With environment variables
eas build -p android --profile production --env.API_URL=https://api.example.com
```

### Play Store Upload

```bash
# Using bundletool (convert AAB to APKS)
bundletool build-apks --bundle=/path/to/app.aab --output=/path/to/app.apks

# Upload to Play Store
# Option 1: Manual upload via Play Console
# Option 2: Use fastlane
```

---

## 6. Configuration Reference

### app.json / app.config.js

```javascript
// app.config.js
export default {
  expo: {
    name: "My App",
    slug: "my-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.example.myapp"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.example.myapp",
      versionCode: 1,
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    plugins: [
      "expo-secure-store",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff"
        }
      ]
    ],
    extra: {
      apiUrl: process.env.API_URL,
      eas: {
        projectId: "your-project-id"
      }
    }
  }
}
```

### eas.json Complete Reference

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "distribution": "store",
      "android": {
        "buildType": "app-bundle",
        "gradleCommand": ":app:bundleRelease"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./path/to/service-account-key.json",
        "track": "production"
      }
    }
  }
}
```

---

## Quick Reference: Which Build to Use?

| Use Case | Recommended | Command |
|----------|--------------|---------|
| Quick UI test | Expo Go | `npx expo start` |
| Development with native code | EAS Development | `eas build -p android --profile development` |
| Share with testers | EAS Preview | `eas build -p android --profile preview` |
| CI/CD automation | EAS Production | `eas build -p android --profile production` |
| No internet required | Local Build | `npx expo run:android` |
| Play Store submission | EAS Production (AAB) | `eas build -p android --profile production` |

---

## Troubleshooting

### Common Issues

```bash
# Metro bundler issues
npx expo start --clear

# Clear cache
npx expo start -c

# Rebuild native code
npx expo prebuild --clean

# Check Android SDK
echo $ANDROID_HOME

# List available devices
adb devices

# Install APK directly
adb install app.apk

# View APK info
aapt dump badging app.apk
```

### Error Solutions

| Error | Solution |
|-------|----------|
| `JAVA_HOME not set` | Set JAVA_HOME environment variable |
| `ANDROID_HOME not found` | Install Android SDK and set ANDROID_HOME |
| `Build failed` | Check gradle logs in `android/app/build/` |
| `Keystore not found` | Run `npx expo fetch:android:keystore` |
| `Push notifications not working` | Use development or production build, not Expo Go |

---

## Related Documentation

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Android Build Configuration](https://docs.expo.dev/build/android-builds/)
- [app.json Reference](https://docs.expo.dev/versions/latest/config/app/)

---

*Last Updated: February 2026*
