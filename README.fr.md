# Sonata - Lecteur de Musique Local

**Lecteur de musique hors ligne pour Android : beau, rapide et complet.**

> 🌐 **Traductions :** [English](README.md) · [Español](README.es.md) · [Português](README.pt.md)

---

## Fonctionnalités

- 🎵 **Tous les formats audio** — MP3, FLAC, AAC, M4A, OGG, OPUS, WAV, WMA et plus
- ▶️ **Lecture en arrière-plan** — La musique continue à jouer avec l'écran éteint ou lors du changement d'application
- 🔔 **Écran de verrouillage & notifications** — Contrôles multimédias complets dans le volet de notifications et l'écran de verrouillage
- 📂 **"Ouvrir avec"** — Ouvre les fichiers audio directement depuis tout gestionnaire de fichiers
- 🔀 **Aléatoire & répétition** — Tout en aléatoire, répéter un morceau ou répéter tout
- ❤️ **Favoris** — Marque tes morceaux préférés
- 📋 **Listes de lecture** — Crée et gère des playlists
- 🔍 **Recherche** — Trouve des morceaux par titre, artiste ou album
- 🕓 **Récemment écouté** — Accès rapide à tes écoutes récentes
- 🎨 **Interface soignée** — Thème rouge, pochettes d'album et vue bibliothèque épurée

---

## Stack technique

| Couche        | Technologie                     |
| ------------- | ------------------------------- |
| Framework     | React Native 0.73.6             |
| Audio         | react-native-track-player 4.1.1 |
| État          | Redux Toolkit                   |
| Navigation    | React Navigation 6              |
| Scanner natif | Module Kotlin MediaStore custom |
| Persistance   | AsyncStorage                    |
| Animations    | Reanimated 3 + Gesture Handler  |

---

## Structure du projet

```
MusicApp/
├── android/           ← Projet Android natif
│   └── app/
│       └── src/main/java/com/sonata/musicplayer/
│           ├── MainActivity.kt
│           ├── MainApplication.kt
│           ├── MediaScannerModule.kt   ← Scanner natif MediaStore
│           └── OpenFileModule.kt       ← Gestionnaire "Ouvrir avec"
├── src/
│   ├── screens/       ← Home, NowPlaying, Search, Playlists, ...
│   ├── components/    ← MiniPlayer, SongItem, SongOptionsModal
│   ├── navigation/    ← Stack + Bottom Tab navigators
│   ├── store/         ← Slices Redux (player, library, playlist)
│   ├── services/      ← Configuration TrackPlayer, MediaScanner JS
│   ├── utils/         ← Formateurs, helpers AsyncStorage
│   ├── types/         ← Interfaces TypeScript
│   └── theme/         ← Couleurs, polices, espacements
├── index.js
└── App.tsx
```

---

## Démarrage

### Prérequis

- Node.js 18+
- Java 17+ (JDK)
- Android SDK (API 34)
- Android Studio (pour émulateur/appareil)

### Installer les dépendances

```bash
npm install
```

### Lancer sur appareil/émulateur

```bash
npm run android
```

### Compiler l'APK de production

```bash
npm run build:android
# Sortie : android/app/build/outputs/apk/release/app-release.apk
```

### Compiler l'AAB pour Google Play

```bash
npm run build:android:aab
# Sortie : android/app/build/outputs/bundle/release/app-release.aab
```

---

## Signature pour la production

Pour les builds de production :

1. Génère un keystore (si tu n'en as pas) :
   ```bash
   keytool -genkeypair -v -keystore android/app/release.keystore -alias sonata-release-key -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Copie le fichier d'exemple de credentials :
   ```bash
   cp android/keystore.properties.example android/keystore.properties
   ```
3. Remplis tes valeurs dans `android/keystore.properties` (ce fichier est dans le .gitignore).

## Firebase Analytics

1. Crée un projet Firebase sur [console.firebase.google.com](https://console.firebase.google.com)
2. Ajoute une application Android avec le nom de package `com.tecnobros.sonata`
3. Télécharge `google-services.json` et place-le dans `android/app/google-services.json` (ce fichier est dans le .gitignore)
4. Un modèle d'exemple se trouve dans `android/app/google-services.json.example`

---

## Permissions

| Permission                          | Android API | Utilité                                   |
| ----------------------------------- | ----------- | ----------------------------------------- |
| `READ_MEDIA_AUDIO`                  | 33+         | Lire les fichiers audio                   |
| `READ_EXTERNAL_STORAGE`             | ≤32         | Lire les fichiers audio (Android ancien)  |
| `FOREGROUND_SERVICE`                | Tous        | Service de lecture en arrière-plan        |
| `FOREGROUND_SERVICE_MEDIA_PLAYBACK` | 34+         | Type de service de premier plan           |
| `WAKE_LOCK`                         | Tous        | Maintenir le CPU actif pendant la lecture |

---

## Licence

MIT — voir [LICENSE](LICENSE)
