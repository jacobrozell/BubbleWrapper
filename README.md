# Pop & Breathe

Expo / React Native app (see `package.json` for scripts).

## Development

- `npm install`
- `npm start` — Metro; press `a` / `i` for Android or iOS
- `npm run web` — **dev-only** browser preview (not a shipped target); see `docs/cross-platform.md`
- `npm test` — Jest

For a native **development build** (e.g. after native dependency or `app.json` changes), use `npx expo run:android` or `npx expo run:ios`. Generated `android/` and `ios/` folders are gitignored.

## Cursor MCP (optional)

This repo ignores **`.cursor/mcp.json`** so each machine can define its own MCP servers without committing local paths or tooling.

If you use Cursor and want the **Android MCP** helper (e.g. `adb`-backed tools for the agent), create `.cursor/mcp.json` at the repo root. Example shape (adjust Python / SDK paths as needed on your machine):

```json
{
  "mcpServers": {
    "android-mcp": {
      "command": "python",
      "args": [
        "-m",
        "uv",
        "tool",
        "run",
        "--python",
        "3.13",
        "android-mcp"
      ],
      "env": {
        "PATH": "${env:PATH};${env:LOCALAPPDATA}\\Android\\Sdk\\platform-tools"
      }
    }
  }
}
```

On Windows, the repo’s **`.vscode/settings.json`** sets `ANDROID_HOME` and related `PATH` entries for the integrated terminal so `adb` and the emulator are easier to find.
