# SMS Forwarder

An Android app that forwards incoming SMS messages matching configurable rules to a Telegram chat.

## Architecture

Clean Architecture with 4 layers:

- **`src/domain/`** — Pure TypeScript entities and interfaces (zero external imports)
- **`src/application/usecases/`** — Business logic with constructor injection
- **`src/infrastructure/`** — Concrete implementations (AsyncStorage, Telegram HTTP client, DI container)
- **`src/presentation/`** — React Native screens and navigation

## Features

- **Filter Rules**: Create text or regex rules matched against the SMS sender or body
- **Telegram Forwarding**: Matched messages are forwarded to a Telegram bot/chat
- **Activity Monitor**: View recent SMS processing logs with status (forwarded / filtered / error)
- **Settings**: Configure Telegram bot token and chat ID; send a test message to verify

## Telegram Bot Setup

1. Open Telegram and message @BotFather
2. Send `/newbot` and follow instructions to get your **bot token** (e.g. `123456:ABC-DEF...`)
3. Add the bot to the target chat/group, then find the **Chat ID**:
   - For personal chat: message the bot and visit `https://api.telegram.org/bot<TOKEN>/getUpdates`
   - For a group: add the bot, send a message, and check `getUpdates` for the negative chat ID
4. Open the app -> **Settings** tab -> enter the bot token and chat ID -> **Save Settings**
5. Tap **Send Test Message** to confirm the connection works

## Running the App

```bash
npm install --legacy-peer-deps
npx expo start          # start Metro bundler
npx expo run:android    # build and run on Android device/emulator
```

## Running Tests

```bash
npm test                    # run all tests once
npm run test:coverage       # run with coverage report
npx jest --coverage         # equivalent, verbose output
```

## Test Coverage

Tests cover all four use cases in `src/application/usecases/`:

| Use Case | Tests |
|---|---|
| `ManageRulesUseCase` | create, list, update, toggle, delete, error cases |
| `ProcessSmsUseCase` | text/regex matching, filtered, error states, sender field |
| `ManageSettingsUseCase` | save/load, token encoding, test message, error propagation |
| `GetSmsLogsUseCase` | default limit, custom limit, empty, delegation |

## Android Permissions

Declared in `app.json`:
- `RECEIVE_SMS` — listen for incoming messages
- `READ_SMS` — read message content
- `FOREGROUND_SERVICE` — keep the forwarding service alive
- `POST_NOTIFICATIONS` — notify the user of forwarding activity
