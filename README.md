# FocusFlow

تطبيق إدارة الوقت والتركيز - مؤقت بومودورو، مهام، عادات

## Building as Desktop App

### Prerequisites

1. Install Rust: https://rustup.rs/
2. Install Node.js 22+: https://nodejs.org/
3. Install system dependencies:
   - **Windows**: Microsoft Visual Studio C++ Build Tools
   - **Linux**: `sudo apt install libwebkit2gtk-4.0-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev`
   - **macOS**: Xcode Command Line Tools

### Setup

```bash
# Install dependencies
npm install

# Generate icons (requires sharp)
npm install sharp
node src-tauri/icons/generate-icons.js

# Development
npm run dev

# Build
npm run build
```

### GitHub Actions

The workflow file `.github/workflows/build-tauri.yml` uses Node.js 22 to avoid the deprecation warning.

## Features

- Pomodoro timer with customizable durations
- Task management with priorities
- Habit tracking with streaks
- Reward system with levels and achievements
- Custom notification sounds
- Weekly habit rewards
- Offline support (PWA)
- Desktop app via Tauri

## License

MIT
