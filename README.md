# SMS Forwarder

An Android app that forwards incoming SMS messages matching configurable rules to a Telegram chat.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Telegram Bot Setup](#telegram-bot-setup)
- [Running the App](#running-the-app)
  - [On a Physical Android Device](#on-a-physical-android-device)
  - [On an Android Emulator](#on-an-android-emulator)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [Project Structure](#project-structure)
- [Android Permissions](#android-permissions)
- [Troubleshooting](#troubleshooting)

## Features

- **Filter Rules**: Create text or regex rules matched against the SMS sender or body
- **Telegram Forwarding**: Matched messages are forwarded to a Telegram bot/chat
- **Activity Monitor**: View recent SMS processing logs with status (forwarded / filtered / error)
- **Settings**: Configure Telegram bot token and chat ID; send a test message to verify

## Architecture

Clean Architecture with 4 layers:

- **`src/domain/`** — Pure TypeScript entities and interfaces (zero external imports)
- **`src/application/usecases/`** — Business logic with constructor injection
- **`src/infrastructure/`** — Concrete implementations (AsyncStorage, Telegram HTTP client, DI container)
- **`src/presentation/`** — React Native screens and navigation

## Prerequisites

Ensure the following tools are installed before you begin:

| Tool | Version | Notes |
|------|---------|-------|
| [Node.js](https://nodejs.org/) | 18 LTS or newer | Check with `node -v` |
| [npm](https://www.npmjs.com/) | 9 or newer (bundled with Node) | Check with `npm -v` |
| [Android Studio](https://developer.android.com/studio) | Latest stable | Required for the Android SDK and emulator |
| [Java Development Kit (JDK)](https://adoptium.net/) | 17 | Required by the Android build tools |

After installing Android Studio, open **SDK Manager** (from the toolbar or *More Actions → SDK Manager*) and ensure the following are installed under the **SDK Tools** tab:
- Android SDK Build-Tools
- Android Emulator
- Android SDK Platform-Tools

Add the SDK tools to your `PATH` by adding these lines to `~/.bashrc`, `~/.zshrc`, or the equivalent for your shell:

```bash
export ANDROID_HOME=$HOME/Android/Sdk          # macOS: $HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Reload your shell (`source ~/.bashrc`) and verify with `adb --version`.

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/fernandovaldivieso/messages-app.git
   cd messages-app
   ```

2. **Install dependencies**

   ```bash
   npm install --legacy-peer-deps
   ```

   > The `--legacy-peer-deps` flag is required because some transitive packages have peer-dependency declarations that are incompatible with newer npm peer-resolution logic. This flag is safe to use for this project.

3. **Verify the installation**

   ```bash
   npm test
   ```

   All 26 unit tests should pass without any additional setup.

## Telegram Bot Setup

The app needs a Telegram bot token and a chat ID to forward messages.

1. Open Telegram and message **@BotFather**
2. Send `/newbot` and follow the prompts to receive your **bot token** (looks like `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)
3. Find your **chat ID**:
   - **Personal chat**: Send any message to your new bot, then open `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` in a browser. The `"id"` field inside `"chat"` is your chat ID.
   - **Group chat**: Add the bot to the group, send a message, then open the same `getUpdates` URL. The group's chat ID is a negative number (e.g., `-1001234567890`).
4. Open the app → **Settings** tab → enter the bot token and chat ID → tap **Save Settings**
5. Tap **Send Test Message** to confirm the bot can send messages to the chat

## Running the App

### On a Physical Android Device

1. Enable **Developer Options** on your device:
   - Go to *Settings → About Phone* and tap **Build Number** seven times
   - Go back to *Settings → Developer Options* and enable **USB Debugging**

2. Connect the device to your computer with a USB cable. Accept the *"Allow USB Debugging"* prompt on the device.

3. Verify the device is detected:

   ```bash
   adb devices
   ```

   You should see your device listed with the status `device`.

4. Start the Metro bundler and build the app:

   ```bash
   npm install --legacy-peer-deps   # if not done yet
   npm run android
   ```

   The first build takes several minutes as Gradle downloads dependencies. Subsequent builds are much faster.

5. The app will launch automatically on your device.

### On an Android Emulator

1. Open **Android Studio** → **More Actions** → **Virtual Device Manager**
2. Click **Create Device**, choose a phone (e.g., *Pixel 6*), then select a system image (e.g., *API 34, Android 14*)
3. Click **Finish**, then click the **▶ Play** button to launch the emulator
4. Once the emulator is fully booted, run:

   ```bash
   npm run android
   ```

   > **Note**: SMS forwarding requires a real device to receive actual SMS messages. The emulator can be used to explore the UI and test Telegram settings, but it cannot receive SMS from real phone numbers.

## Running Tests

The test suite runs entirely in Node.js — no device or emulator is needed.

```bash
# Run all tests once and exit
npm test

# Run all tests and watch for file changes (re-runs on save)
npx jest --watchAll

# Run a single test file
npx jest ManageRulesUseCase

# Run tests matching a specific name
npx jest -t "matches text rule"
```

Expected output when all tests pass:

```
Test Suites: 4 passed, 4 total
Tests:       26 passed, 26 total
```

## Test Coverage

Generate a coverage report with:

```bash
npm run test:coverage
```

This produces:
- A summary table in the terminal
- A detailed HTML report at `coverage/lcov-report/index.html` (open in a browser)

Tests cover all four use cases in `src/application/usecases/`:

| Use Case | What is tested |
|---|---|
| `ManageRulesUseCase` | create, list, update, toggle, delete, error cases |
| `ProcessSmsUseCase` | text/regex matching, filtered, error states, sender field, invalid regex |
| `ManageSettingsUseCase` | save/load, token encoding, test message, error propagation |
| `GetSmsLogsUseCase` | default limit, custom limit, empty log, repository delegation |

Coverage collection is scoped to `src/application/usecases/**/*.ts` (the business-logic layer).

## Project Structure

```
messages-app/
├── src/
│   ├── domain/                  # Entities and repository interfaces (no dependencies)
│   │   ├── entities/
│   │   │   ├── Rule.ts          # Filter rule definition
│   │   │   ├── Settings.ts      # Bot token and chat ID
│   │   │   └── SmsLog.ts        # Processing log entry
│   │   └── repositories/        # Abstract interfaces
│   ├── application/
│   │   └── usecases/            # Business logic (depends only on domain)
│   │       ├── ManageRulesUseCase.ts
│   │       ├── ProcessSmsUseCase.ts
│   │       ├── ManageSettingsUseCase.ts
│   │       ├── GetSmsLogsUseCase.ts
│   │       └── __tests__/       # Unit tests for each use case
│   ├── infrastructure/          # Concrete implementations
│   │   ├── storage/             # AsyncStorage-backed repositories
│   │   ├── telegram/            # Telegram Bot API HTTP client
│   │   └── di/                  # Dependency injection container
│   └── presentation/            # React Native UI
│       ├── navigation/          # Bottom-tab navigator
│       └── screens/             # HomeScreen, RulesScreen, SettingsScreen
├── App.tsx                      # Root component
├── app.json                     # Expo / Android manifest config
├── babel.config.js              # Path alias configuration
├── package.json
└── tsconfig.json
```

## Android Permissions

Declared in `app.json` under `android.permissions`:

| Permission | Purpose |
|---|---|
| `RECEIVE_SMS` | Listen for incoming SMS messages |
| `READ_SMS` | Read the content of received messages |
| `FOREGROUND_SERVICE` | Keep the forwarding service running in the background |
| `POST_NOTIFICATIONS` | Display a notification when a message is forwarded |
| `DETECT_SCREEN_CAPTURE` | Required by Expo's `NativeUnimoduleProxy` on Android 14+ to register the screen-capture observer during module initialization |

## Troubleshooting

**`npm install` fails with peer dependency errors**

Always use the `--legacy-peer-deps` flag:

```bash
npm install --legacy-peer-deps
```

---

**`adb devices` shows no devices or "unauthorized"**

- Make sure USB Debugging is enabled on the device.
- Revoke and re-grant USB debugging authorization: *Developer Options → Revoke USB debugging authorizations*, then reconnect.

---

**Build fails with "SDK location not found"**

Create a `local.properties` file in the `android/` directory with your SDK path:

```
sdk.dir=/home/<your-username>/Android/Sdk
```

On macOS the path is typically `/Users/<your-username>/Library/Android/sdk`.

---

**Metro bundler shows "Unable to resolve module"**

Clear Metro and Gradle caches:

```bash
npx expo start --clear
```

---

**Tests fail with "Cannot find module '@domain/...'"**

The path aliases (`@domain`, `@application`, etc.) are configured in `babel.config.js` and `tsconfig.json`. Run tests through the npm script to pick up the Babel configuration:

```bash
npm test        # correct — uses jest-expo preset with Babel
npx ts-node … # incorrect for tests — does not apply Babel transforms
```
