# Rental Expense Manager

Expo and React Native app for tracking rental income, expenses, liabilities, recurring transactions, categories, charity-related transactions, users, and activity logs.

## Run the app

Install dependencies and start Expo:

```sh
npm install
npm start
```

Use the Expo CLI prompts to open the app on an Android emulator or iOS simulator, or scan the QR code with Expo Go.

## API connection

The mobile app defaults to the currently configured Cloudflare Tunnel. Set `EXPO_PUBLIC_API_BASE_URL` to the Laravel server's origin (without `/api/v1`) if the tunnel changes or when using a local server. For example, use `http://10.0.2.2:8000` for the standard Android emulator, your development machine's LAN address for a physical device, or your active tunnel URL. Restart Expo after changing the value.

After sign-in, transactions, categories, recurring items, reports, and charity/other summaries are loaded from the Laravel API. User management and activity logs are available to admins through the protected `/api/v1/users` and `/api/v1/logs` endpoints. Business data is no longer seeded or cached on the device; AsyncStorage is used only for the Sanctum access token.

Android uses a resize layout when the software keyboard opens so forms remain scrollable above it. Changes to this native setting require a new development or production build; reloading the JavaScript bundle is not enough.

## Stack

- Expo Router with native React Native components
- NativeWind for utility-class styling
- AsyncStorage for the saved authentication token
- Lucide React Native icons

The app's routes are under `src/app`, and feature screens, data, and shared components are under `src`.
