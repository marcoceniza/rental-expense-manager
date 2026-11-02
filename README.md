# Rental Expense Manager

Rental Expense Manager is a monorepo containing a Laravel web application and an Expo mobile
application. The web app provides the backend and web interface; the mobile app provides a
user-facing interface for tracking rental expenses and communicates with the backend API.

## Technology Stack

- **Web (`web/`):** PHP `^8.3`, Laravel (blank Vue starter kit), Inertia.js `^3.0`, Vue `^3.5`,
  TypeScript `^5.2`, Vite (`vite-plus` `0.3.0`), and Wayfinder. The web UI is Vue, not React.
- **Mobile (`mobile/`):** Expo `~58.0`, React Native `0.88`, React `19.3`, TypeScript `~6.0.3`,
  and NativeWind `^4.1.23`.
- **Web database default:** SQLite, as specified by `web/.env.example`.

## Repository Structure

```text
.
├── .editorconfig
├── .gitignore
├── README.md
├── mobile/                  # Expo / React Native mobile application
│   ├── assets/
│   ├── src/
│   │   ├── app/             # Expo Router routes
│   │   ├── components/
│   │   ├── context/
│   │   ├── data/
│   │   ├── screens/
│   │   ├── types/
│   │   └── utils/
│   ├── app.json
│   └── package.json
├── web/
│   ├── app/                 # Laravel application code
│   ├── resources/           # Inertia/Vue UI and styles
│   ├── routes/
│   ├── tests/
│   ├── .env.example
│   ├── composer.json
│   └── package.json
```

The root Git repository tracks both application directories directly; neither app is a submodule.
Each application has its own dependency manifest, lockfile, and application-specific configuration.

## Prerequisites

- **Web:** PHP 8.3 or later, Composer, Node.js and npm, and PHP's PDO SQLite support when using
  the example SQLite database configuration.
- **Mobile:** Node.js and npm. Use an iOS simulator, Android emulator, or compatible device to run
  the native app.

## Installation and Setup

### Web

```sh
cd web
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
npm install
npm run build
```

Or run the bundled setup script:

```sh
cd web
composer run setup
```

The example environment selects SQLite, and the database directory ignores generated SQLite files.
Review `.env` and configure the database or other services if your setup differs from the example.

### Mobile

```sh
cd mobile
npm ci
```

There is no mobile `.env.example` in the repository. Set `EXPO_PUBLIC_API_URL` as needed for your
backend and device environment before using the app against a local or remote server.

## Running the Applications

Run each app from its own directory.

### Web

The Composer `dev` script starts the configured Laravel development process:

```sh
cd web
composer run dev
```

For separate processes:

```sh
cd web
php artisan serve
```

In another terminal:

```sh
cd web
npm run dev
```

### Mobile

```sh
cd mobile
npm run start
```

The package also defines `npm run android` and `npm run ios` for launching Expo on those targets.

## Testing and Build Commands

### Web

From `web/`:

- `composer run test` runs the configured PHP formatting check, PHPStan analysis, and Laravel tests.
- `composer run ci:check` runs the frontend checks and type check, then the Composer test script.
- `npm run check` runs the configured Vite Plus checks.
- `npm run types:check` runs `vue-tsc --noEmit`.
- `npm run build` creates the frontend production build.

### Mobile

From `mobile/`, `npm run lint` runs Expo ESLint and `npm run typecheck` checks TypeScript. Use
`npx expo export --platform android` to verify an Android bundle.

## Git Workflow

The repository root contains both applications as regular tracked directories. Make changes to
either `web/` or `mobile/` and review them together. Each application retains its own dependencies,
lockfile, scripts, and application-specific configuration; install and run those dependencies from
that application's directory.
