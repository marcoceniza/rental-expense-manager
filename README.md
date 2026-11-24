# Rental Expense Manager

Rental Expense Manager is a monorepo containing a Laravel web application and an Expo mobile application. The web app provides the backend and web interface; the mobile app gives users a native interface for tracking rental expenses and communicates with the backend API.

## Technology Stack

- **Web (`web/`):** PHP `^8.3`, Laravel `^13.17`, Inertia.js `^3.0`, Vue `^3.5`, TypeScript `^5.2`, Vite (`vite-plus` `0.3.0`), Wayfinder, Sanctum and dompdf. The web UI is Vue, not React.
- **Mobile (`mobile/`):** Expo `~58.0`, React Native `0.88`, React `19.3`, TypeScript `~6.0.3`, and NativeWind `^4.1.23`.
- **Web database default:** SQLite, as specified by `web/.env.example`. Docker overrides this with MySQL on the shared `database` network (`rental` database, `rental_app` user).

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
└── web/                     # Laravel backend and web interface
    ├── app/                 # Laravel application code
    ├── database/
    ├── docker/              # wait-for-db.sh
    ├── resources/           # Inertia/Vue UI and styles
    ├── routes/
    ├── tests/
    ├── .env.example
    ├── Dockerfile
    ├── docker-compose.yml
    ├── composer.json
    └── package.json
```

The root Git repository tracks both application directories directly; neither app is a submodule. Each application has its own dependency manifest, lockfile and application-specific configuration.

## Prerequisites

- **Web:** PHP 8.3 or later, Composer, Node.js and npm, and PHP's PDO SQLite support when using the example SQLite database configuration. Docker is optional but recommended.
- **Mobile:** Node.js and npm. Use an iOS simulator, Android emulator, or compatible device to run the native app.

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

The example environment selects SQLite for non-Docker development. For Docker, set `DB_DATABASE`, `DB_USERNAME` and `DB_PASSWORD` in `web/.env` instead — see below.

### Mobile

```sh
cd mobile
npm ci
```

There is no mobile `.env.example` in the repository. Set `EXPO_PUBLIC_API_BASE_URL` in a local `mobile/.env` to a reachable API base for your backend and device environment; the code falls back to `http://localhost:8000` when it is unset.

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

#### Docker

The web app can run in Docker against the shared MySQL container:

```sh
cd web
docker compose up -d --build
docker compose exec app php artisan migrate --force
```

The app is available at `http://localhost:8000`. It joins the external `database` network from `C:/Users/marco/docker/database/compose.yml`; the database container publishes no host port. The health endpoint is `/health`. Stop it with `docker compose down`.

### Mobile

```sh
cd mobile
npm run start
```

The package also defines `npm run android` and `npm run ios` for the other targets.

## Environment Configuration

The web app's `web/.env.example` is the template for its local `web/.env`. It includes SQLite development defaults; Docker requires the `DB_*` variables to be set. Keep `.env` files and credentials private — the root ignore rules exclude them while allowing `.env.example` files to be committed.

The mobile app reads `EXPO_PUBLIC_API_BASE_URL` from `mobile/.env`. Do not put credentials in the source.

## Testing and Build Commands

### Web

From `web/`:

- `composer run test` runs Pint, PHPStan and the Laravel test suite.
- `composer run ci:check` runs the frontend checks and type check, then the Composer test script.
- `npm run check` runs the configured Vite Plus checks.
- `npm run types:check` runs `vue-tsc --noEmit`.
- `npm run build` creates the frontend production build.

### Mobile

From `mobile/`:

- `npm run lint` runs Expo ESLint.
- `npm run typecheck` runs `tsc --noEmit`.
- `npm run test:ci` runs the Jest suite once.
- `npx expo export --platform android` verifies an Android bundle.

## Git Workflow

The repository root contains both applications as regular tracked directories. Make changes to either `web/` or `mobile/` and review them together. Each application retains its own dependencies, lockfile, scripts and application-specific configuration; install and run those dependencies from that application's directory.
