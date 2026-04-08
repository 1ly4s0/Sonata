# Sonata - Reproductor de Música Local

**Reproductor de música offline para Android: hermoso, rápido y completo.**

> 🌐 **Idiomas:** [English](README.md) · [Français](README.fr.md) · [Português](README.pt.md)

---

## Características

- 🎵 **Todos los formatos de audio** — MP3, FLAC, AAC, M4A, OGG, OPUS, WAV, WMA y más
- ▶️ **Reproducción en segundo plano** — La música sigue sonando con la pantalla apagada o al cambiar de app
- 🔔 **Pantalla de bloqueo y notificaciones** — Controles completos de sesión multimedia en la barra de notificaciones y la pantalla de bloqueo
- 📂 **"Abrir con"** — Abre archivos de audio directamente desde cualquier explorador de archivos
- 🔀 **Shuffle y repetición** — Aleatorio global, repetir una o repetir todo
- ❤️ **Favoritos** — Marca tus canciones favoritas
- 📋 **Listas de reproducción** — Crea y gestiona listas de reproducción
- 🔍 **Búsqueda** — Encuentra canciones por título, artista o álbum
- 🕓 **Reproducción reciente** — Acceso rápido a lo que escuchaste recientemente
- 🎨 **Interfaz cuidada** — Tema rojo, portadas de álbum y vista de biblioteca limpia

---

## Stack tecnológico

| Capa           | Tecnología                      |
| -------------- | ------------------------------- |
| Framework      | React Native 0.73.6             |
| Audio          | react-native-track-player 4.1.1 |
| Estado         | Redux Toolkit                   |
| Navegación     | React Navigation 6              |
| Escáner nativo | Módulo Kotlin MediaStore propio |
| Persistencia   | AsyncStorage                    |
| Animaciones    | Reanimated 3 + Gesture Handler  |

---

## Estructura del proyecto

```
MusicApp/
├── android/           ← Proyecto nativo Android
│   └── app/
│       └── src/main/java/com/sonata/musicplayer/
│           ├── MainActivity.kt
│           ├── MainApplication.kt
│           ├── MediaScannerModule.kt   ← Escáner nativo MediaStore
│           └── OpenFileModule.kt       ← Manejador "Abrir con"
├── src/
│   ├── screens/       ← Home, NowPlaying, Search, Playlists, ...
│   ├── components/    ← MiniPlayer, SongItem, SongOptionsModal
│   ├── navigation/    ← Stack + Bottom Tab navigators
│   ├── store/         ← Slices Redux (player, library, playlist)
│   ├── services/      ← Configuración TrackPlayer, MediaScanner JS
│   ├── utils/         ← Formateadores, helpers AsyncStorage
│   ├── types/         ← Interfaces TypeScript
│   └── theme/         ← Colores, fuentes, espaciado
├── index.js
└── App.tsx
```

---

## Primeros pasos

### Requisitos previos

- Node.js 18+
- Java 17+ (JDK)
- Android SDK (API 34)
- Android Studio (para emulador/dispositivo)

### Instalar dependencias

```bash
npm install
```

### Ejecutar en dispositivo/emulador

```bash
npm run android
```

### Compilar APK de producción

```bash
npm run build:android
# Salida: android/app/build/outputs/apk/release/app-release.apk
```

### Compilar AAB para Google Play

```bash
npm run build:android:aab
# Salida: android/app/build/outputs/bundle/release/app-release.aab
```

---

## Firma para producción

Para builds de producción:

1. Genera un keystore (si no tienes uno):
   ```bash
   keytool -genkeypair -v -keystore android/app/release.keystore -alias sonata-release-key -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Copia el archivo de credenciales de ejemplo:
   ```bash
   cp android/keystore.properties.example android/keystore.properties
   ```
3. Rellena tus valores en `android/keystore.properties` (este archivo está en .gitignore).

## Firebase Analytics

1. Crea un proyecto Firebase en [console.firebase.google.com](https://console.firebase.google.com)
2. Añade una app Android con el nombre de paquete `com.tecnobros.sonata`
3. Descarga `google-services.json` y colócalo en `android/app/google-services.json` (este archivo está en .gitignore)
4. Hay una plantilla de ejemplo en `android/app/google-services.json.example`

---

## Permisos

| Permiso                             | Android API | Propósito                                      |
| ----------------------------------- | ----------- | ---------------------------------------------- |
| `READ_MEDIA_AUDIO`                  | 33+         | Leer archivos de audio                         |
| `READ_EXTERNAL_STORAGE`             | ≤32         | Leer archivos de audio (Android antiguo)       |
| `FOREGROUND_SERVICE`                | Todos       | Servicio de reproducción en segundo plano      |
| `FOREGROUND_SERVICE_MEDIA_PLAYBACK` | 34+         | Tipo de servicio en primer plano               |
| `WAKE_LOCK`                         | Todos       | Mantener la CPU activa durante la reproducción |

---

## Licencia

MIT — ver [LICENSE](LICENSE)
