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

The mobile app defaults to `http://localhost:8000`. Set `EXPO_PUBLIC_API_BASE_URL` to a URL reachable from the device when using an Android emulator or physical device (for example, `http://10.0.2.2:8000` for the standard Android emulator, or your development machine's LAN address for a physical device).

Android uses a resize layout when the software keyboard opens so forms remain scrollable above it. Changes to this native setting require a new development or production build; reloading the JavaScript bundle is not enough.

## Stack

- Expo Router with native React Native components
- NativeWind for utility-class styling
- AsyncStorage for on-device persistence
- Lucide React Native icons

The app's routes are under `src/app`, and feature screens, data, and shared components are under `src`.
