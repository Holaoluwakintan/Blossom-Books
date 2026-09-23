# Blossom Stories Mobile

Expo SDK 54 / React Native client for Blossom Stories.

## Run locally

From this directory:

```bash
pnpm install
cp .env.example .env
pnpm start
```

Set `EXPO_PUBLIC_API_URL` to the URL of the Blossom Express server. Android emulators usually reach a host machine through `http://10.0.2.2:3000`; a physical device needs a reachable LAN or HTTPS URL.

## Current scope

The first mobile milestone includes Expo Router navigation, a Home feed backed by `stories.list`, server-side discovery search, story detail/chapter preview, and honest library/profile states.

Authentication is intentionally the next milestone. The mobile client must use an OAuth browser callback and secure token storage before authenticated library, reading progress, writer, notification, and account-deletion features are enabled.

## Release prerequisites

Before creating a production Android App Bundle, add an EAS configuration, production API URL, Android signing credentials, a privacy-policy URL, reviewer access instructions, and a verified Android API 36 build configuration. Do not ship the current placeholder profile/auth state as a production release.
