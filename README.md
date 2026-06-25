# MiniFitLog

[繁體中文](README_CN.md)

A self-hosted web app for tracking training, meals, BMR, and calorie deficits. It replaces spreadsheet-based records with a Docker-deployable Fastify + SQLite application.

Each user signs up with an email and password. Training, food, BMR, and settings data are isolated per user.

## Table of Contents

- [Security](#security)
- [Background](#background)
- [Features](#features)
- [Design Palette](#design-palette)
- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Contributing](#contributing)
- [License](#license)

## Security

Passwords are hashed with salted `crypto.scrypt` hashes. Browser cookies store random session tokens, not user passwords.

User data is scoped by `user_id` in SQLite tables. Existing legacy data without a user owner is assigned to the first registered user.

Do not commit real credentials, database dumps, private keys, tokens, or `.env` files.

## Background

MiniFitLog is a small personal tracking app built for self-hosting. The backend is a TypeScript Fastify server, the database is SQLite through `better-sqlite3`, and the frontend is static HTML/CSS/JavaScript served by the same server.

The Docker setup persists application data in the `training-data` volume.

## Features

- Email and password registration/login.
- Per-user data isolation.
- Monthly calendar view for training records.
- Daily cardio, workout, heart rate, and notes tracking.
- Weekly body fat, weight, and waist metrics.
- Food item library with source, calories, protein, and notes.
- Breakfast, lunch, and dinner meal tracking.
- Weekly BMR tracking and forward BMR cascade.
- Calorie intake and deficit summaries.
- SQLite migrations run automatically at server startup.
- Docker Compose deployment.

## Design Palette

MiniFitLog uses a light fitness dashboard palette. Use these tokens for future UI work:

| Token | Color | Usage |
| --- | --- | --- |
| Primary Green | `#22C55E` | Primary actions, success states, active navigation. |
| Secondary Blue | `#0EA5E9` | Secondary actions, focus states, workout accents. |
| Background | `#F8FAFC` | App background. |
| Card White | `#FFFFFF` | Cards, panels, dialogs, form surfaces. |
| Main Text | `#0F172A` | Headings and primary text. |
| Muted Text | `#64748B` | Labels, secondary text, metadata. |
| Border | `#E2E8F0` | Dividers, form borders, card borders. |
| Warning Orange | `#F97316` | Calorie warnings and caution states. |
| Danger Red | `#EF4444` | Delete actions and errors. |

## Install

Install dependencies:

```bash
pnpm install
```

Run database migrations:

```bash
pnpm db:migrate
```

Build the TypeScript server:

```bash
pnpm build
```

## Usage

Start the development server:

```bash
pnpm dev
```

Start the compiled server:

```bash
pnpm start
```

Run tests:

```bash
pnpm test
```

Deploy with Docker Compose:

```bash
docker compose up -d
```

Open the app at:

```text
http://localhost:3000
```

On first use, open `/login` and register with an email and password. After registration, use the same email and password to log in.

### Environment Variables

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` | HTTP port. |
| `HOST` | `0.0.0.0` | HTTP host. |
| `DB_PATH` | `data/training.db` | SQLite database path. |

### Commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Run the development server with `tsx watch`. |
| `pnpm build` | Compile TypeScript to `dist/`. |
| `pnpm start` | Start the compiled server. |
| `pnpm test` | Run Vitest tests. |
| `pnpm db:migrate` | Run SQLite migrations. |
| `pnpm lint` | Run ESLint if it is installed in the project. |

## API

All application APIs require an authenticated session except the auth endpoints.

### Auth

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/auth/status` | Return registration and session status. |
| `POST` | `/api/auth/register` | Register with email and password. |
| `POST` | `/api/auth/login` | Log in with email and password. |
| `POST` | `/api/auth/logout` | Log out and clear the session cookie. |

### Training

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/months/:year/:month` | Get monthly training data and stats. |
| `PUT` | `/api/daily/:date` | Save a daily training record. |
| `PUT` | `/api/weekly/:date` | Save weekly body metrics. |
| `POST` | `/api/import` | Import weekly metrics and daily records. |

### Food and Settings

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/foods` | List the current user's food items. |
| `GET` | `/api/foods/sources` | List food sources. |
| `GET` | `/api/foods/search` | Search food items. |
| `POST` | `/api/foods` | Create a food item. |
| `PUT` | `/api/foods/:id` | Update a food item. |
| `DELETE` | `/api/foods/:id` | Delete a food item. |
| `GET` | `/api/food/months/:year/:month` | Get monthly meal and BMR data. |
| `PUT` | `/api/food/daily/:date/:meal` | Save meal records for breakfast, lunch, or dinner. |
| `PUT` | `/api/food/bmr/:date` | Save a BMR record. |
| `PUT` | `/api/food/bmr-cascade/:date` | Apply a BMR value forward. |
| `GET` | `/api/settings` | List current user settings. |
| `GET` | `/api/settings/:key` | Read one setting. |
| `PUT` | `/api/settings` | Save one setting. |

## Contributing

Keep changes focused and follow the existing route -> service -> repository structure.

- Use Zod schemas for request validation.
- Keep database access inside `src/repositories/`.
- Do not modify existing migration files; add a new migration instead.
- Add or update tests when changing behavior.
- Run `pnpm test` and `pnpm build` before shipping changes.

## License

ISC
