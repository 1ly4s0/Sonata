# Sonata - Local Music Player

**Beautiful, fast, and feature-rich offline music player for Android.**

> 🌐 **Translations:** [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md)

---

## Features

- 🎵 **All audio formats** — MP3, FLAC, AAC, M4A, OGG, OPUS, WAV, WMA and more
- ▶️ **Background playback** — Music keeps playing when the screen is off or when you switch apps
- 🔔 **Lock screen & notifications** — Full media session controls in Android notification shade and lock screen
- 📂 **"Open with"** — Open audio files directly from any file manager
- 🔀 **Shuffle & Repeat** — Shuffle all, repeat one, or repeat all
- ❤️ **Favorites** — Mark your favorite tracks
- 📋 **Playlists** — Create and manage playlists
- 🔍 **Search** — Find songs by title, artist, or album
- 🕓 **Recently Played** — Quick access to your recent listens
- 🎨 **Beautiful UI** — Orange-red gradient theme, album art, clean library view

---

## Tech Stack

| Layer          | Technology                      |
| -------------- | ------------------------------- |
| Framework      | React Native 0.73.6             |
| Audio          | react-native-track-player 4.1.1 |
| State          | Redux Toolkit                   |
| Navigation     | React Navigation 6              |
| Native Scanner | Custom Kotlin MediaStore module |
| Persistence    | AsyncStorage                    |
| Animations     | Reanimated 3 + Gesture Handler  |

---

## Project Structure

```
MusicApp/
├── android/           ← Android native project
│   └── app/
│       └── src/main/java/com/sonata/musicplayer/
│           ├── MainActivity.kt
│           ├── MainApplication.kt
│           ├── MediaScannerModule.kt   ← Native MediaStore scanner
│           └── OpenFileModule.kt       ← "Open With" handler
├── src/
│   ├── screens/       ← Home, NowPlaying, Search, Playlists, ...
│   ├── components/    ← MiniPlayer, SongItem, SongOptionsModal
│   ├── navigation/    ← Stack + Bottom Tab navigators
│   ├── store/         ← Redux slices (player, library, playlist)
│   ├── services/      ← TrackPlayer setup, MediaScanner JS
│   ├── utils/         ← Formatters, AsyncStorage helpers
│   ├── types/         ← TypeScript interfaces
│   └── theme/         ← Colors, fonts, spacing
├── index.js
└── App.tsx
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Java 17+ (JDK)
- Android SDK (API 34)
- Android Studio (for emulator/device)

### Install dependencies

```bash
npm install
```

### Run on device/emulator

```bash
npm run android
```

### Build release APK

```bash
npm run build:android
# Output: android/app/build/outputs/apk/release/app-release.apk
```

### Build release AAB (Google Play)

```bash
npm run build:android:aab
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

---

## Release Signing

A debug keystore is included at `android/app/debug.keystore` for debug builds.

For production releases:

1. Generate a keystore (if you don't have one):
   ```bash
   keytool -genkeypair -v -keystore android/app/release.keystore -alias sonata-release-key -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Copy the example credentials file:
   ```bash
   cp android/keystore.properties.example android/keystore.properties
   ```
3. Fill in your values in `android/keystore.properties` (this file is gitignored).

## Firebase Analytics

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Add an Android app with package name `com.tecnobros.sonata`
3. Download `google-services.json` and place it at `android/app/google-services.json` (this file is gitignored)
4. An example template is at `android/app/google-services.json.example`

---

## Permissions

| Permission                          | Android API | Purpose                          |
| ----------------------------------- | ----------- | -------------------------------- |
| `READ_MEDIA_AUDIO`                  | 33+         | Read audio files                 |
| `READ_EXTERNAL_STORAGE`             | ≤32         | Read audio files (older Android) |
| `FOREGROUND_SERVICE`                | All         | Background playback service      |
| `FOREGROUND_SERVICE_MEDIA_PLAYBACK` | 34+         | Foreground service type          |
| `WAKE_LOCK`                         | All         | Keep CPU awake during playback   |

---

## License

MIT — see [LICENSE](LICENSE)
