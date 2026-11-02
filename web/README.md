# Web (Laravel)

The web application for the Rental Expense Manager. It is a Laravel application built on the
Inertia.js Vue starter kit: a server-rendered Laravel backend that serves a single-page Vue
frontend, with TypeScript, Vite (Vite Plus), and Wayfinder for typed route/action helpers.

## Requirements

- PHP `^8.3` with the extensions Laravel requires (notably PDO)
- Composer
- Node.js and npm
- SQLite (the default example database) — PHP's PDO SQLite support

## Setup

```sh
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
composer run setup
```

## Running

Development (Laravel dev server + Vite):

```sh
composer run dev
```

Or run each process separately:

```sh
php artisan serve
npm run dev
```

Production build:

```sh
npm run build
```

## Quality checks

- `composer run lint` — format code with Laravel Pint
- `composer run test` — clear config, Pint check, PHPStan, and the test suite
- `npm run check` — Vite Plus checks
- `npm run types:check` — `vue-tsc --noEmit`

## Notes

- The example `.env` uses SQLite; `.env` is gitignored while `.env.example` is committed.
- Build artifacts (`public/build`, `dist/`) are gitignored.
- The API backend lives in this same application under `routes/api.php`.
