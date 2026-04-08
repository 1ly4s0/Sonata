# Sonata - Leitor de Música Local

**Leitor de música offline para Android: bonito, rápido e completo.**

> 🌐 **Traduções:** [English](README.md) · [Español](README.es.md) · [Français](README.fr.md)

---

## Funcionalidades

- 🎵 **Todos os formatos de áudio** — MP3, FLAC, AAC, M4A, OGG, OPUS, WAV, WMA e mais
- ▶️ **Reprodução em segundo plano** — A música continua mesmo com o ecrã desligado ou ao mudar de app
- 🔔 **Ecrã de bloqueio & notificações** — Controlos completos de sessão de media na barra de notificações e ecrã de bloqueio
- 📂 **"Abrir com"** — Abre ficheiros de áudio diretamente de qualquer gestor de ficheiros
- 🔀 **Aleatório & repetição** — Aleatório global, repetir um ou repetir tudo
- ❤️ **Favoritos** — Marca as tuas músicas favoritas
- 📋 **Listas de reprodução** — Cria e gere playlists
- 🔍 **Pesquisa** — Procura músicas por título, artista ou álbum
- 🕓 **Reproduzido recentemente** — Acesso rápido ao que ouviste recentemente
- 🎨 **Interface cuidada** — Tema vermelho, capas de álbum e vista de biblioteca limpa

---

## Stack tecnológica

| Camada         | Tecnologia                       |
| -------------- | -------------------------------- |
| Framework      | React Native 0.73.6              |
| Áudio          | react-native-track-player 4.1.1  |
| Estado         | Redux Toolkit                    |
| Navegação      | React Navigation 6               |
| Scanner nativo | Módulo Kotlin MediaStore próprio |
| Persistência   | AsyncStorage                     |
| Animações      | Reanimated 3 + Gesture Handler   |

---

## Estrutura do projeto

```
MusicApp/
├── android/           ← Projeto Android nativo
│   └── app/
│       └── src/main/java/com/sonata/musicplayer/
│           ├── MainActivity.kt
│           ├── MainApplication.kt
│           ├── MediaScannerModule.kt   ← Scanner nativo MediaStore
│           └── OpenFileModule.kt       ← Gestor "Abrir com"
├── src/
│   ├── screens/       ← Home, NowPlaying, Search, Playlists, ...
│   ├── components/    ← MiniPlayer, SongItem, SongOptionsModal
│   ├── navigation/    ← Stack + Bottom Tab navigators
│   ├── store/         ← Slices Redux (player, library, playlist)
│   ├── services/      ← Configuração TrackPlayer, MediaScanner JS
│   ├── utils/         ← Formatadores, helpers AsyncStorage
│   ├── types/         ← Interfaces TypeScript
│   └── theme/         ← Cores, tipos, espaçamentos
├── index.js
└── App.tsx
```

---

## Primeiros passos

### Pré-requisitos

- Node.js 18+
- Java 17+ (JDK)
- Android SDK (API 34)
- Android Studio (para emulador/dispositivo)

### Instalar dependências

```bash
npm install
```

### Executar no dispositivo/emulador

```bash
npm run android
```

### Compilar APK de produção

```bash
npm run build:android
# Saída: android/app/build/outputs/apk/release/app-release.apk
```

### Compilar AAB para Google Play

```bash
npm run build:android:aab
# Saída: android/app/build/outputs/bundle/release/app-release.aab
```

---

## Assinatura para produção

Para builds de produção:

1. Gera um keystore (se não tiveres um):
   ```bash
   keytool -genkeypair -v -keystore android/app/release.keystore -alias sonata-release-key -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Copia o ficheiro de exemplo de credenciais:
   ```bash
   cp android/keystore.properties.example android/keystore.properties
   ```
3. Preenche os teus valores em `android/keystore.properties` (este ficheiro está no .gitignore).

## Firebase Analytics

1. Cria um projeto Firebase em [console.firebase.google.com](https://console.firebase.google.com)
2. Adiciona uma app Android com o nome de pacote `com.tecnobros.sonata`
3. Descarrega `google-services.json` e coloca-o em `android/app/google-services.json` (este ficheiro está no .gitignore)
4. Há um modelo de exemplo em `android/app/google-services.json.example`

---

## Permissões

| Permissão                           | Android API | Propósito                               |
| ----------------------------------- | ----------- | --------------------------------------- |
| `READ_MEDIA_AUDIO`                  | 33+         | Ler ficheiros de áudio                  |
| `READ_EXTERNAL_STORAGE`             | ≤32         | Ler ficheiros de áudio (Android antigo) |
| `FOREGROUND_SERVICE`                | Todos       | Serviço de reprodução em segundo plano  |
| `FOREGROUND_SERVICE_MEDIA_PLAYBACK` | 34+         | Tipo de serviço em primeiro plano       |
| `WAKE_LOCK`                         | Todos       | Manter CPU ativa durante a reprodução   |

---

## Licença

MIT — ver [LICENSE](LICENSE)
