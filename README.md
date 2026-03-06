# Courtly

Courtly is a tennis court booking system with a Python backend and a React frontend.

The backend uses `FastAPI`, `SQLAlchemy`, `SQLite`, and `Alembic`. SQLite is the primary data store, and an append-only JSON event log is kept for audit and future rebuild/recovery workflows.

For the architecture and domain design, see `ARCHITECTURE.md`.

## Current Status

The repository already includes:

- a FastAPI app with `GET /health`
- a React app in `web/` created with Vite
- SQLAlchemy models for the initial booking schema
- Alembic setup with an initial migration
- Docker Compose with `nginx` as a single public entry point on port `80`

## Tech Stack

- Backend: `FastAPI`, `SQLAlchemy`, `Alembic`, `SQLite`
- Frontend: `React`, `Vite`
- Dev tooling: `docker compose`

## Project Structure

```text
.
├── alembic/
│   ├── env.py
│   └── versions/
├── app/
│   ├── api/
│   │   └── routes.py
│   ├── infrastructure/
│   │   ├── event_store.py
│   │   ├── models.py
│   │   ├── repository.py
│   │   └── sqlite.py
│   └── main.py
├── db/
│   └── events.jsonl
├── nginx/
│   └── default.conf
├── web/
│   ├── src/
│   └── package.json
├── .env
├── alembic.ini
├── docker-compose.yaml
├── README.md
├── ARCHITECTURE.md
└── requirements.txt
```

## Environment Variables

Courtly reads configuration from `.env`.

Example:

```env
DATABASE_URL=sqlite:///db/app.sqlite3
EVENT_LOG_PATH=db/events.jsonl
```

Notes:

- `DATABASE_URL` points to the main SQLite database.
- `EVENT_LOG_PATH` points to the append-only event log file.

## Local Development

### Backend

Create and activate a virtual environment if needed:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Run migrations:

```bash
alembic upgrade head
```

Start the API:

```bash
python -m app.main
```

The backend will be available at:

- `http://localhost:5000/health`

You can also run it with Uvicorn directly:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

### Frontend

Install dependencies:

```bash
cd web
npm install
```

Run the Vite dev server:

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

The frontend will be available at:

- `http://localhost:5173`

## Docker Compose

Run the full app stack:

```bash
docker compose up
```

Public entry point:

- App: `http://localhost`
- Health endpoint: `http://localhost/health`

The compose setup currently:

- runs `nginx` on port `80`
- proxies `/` to the React frontend
- proxies `/health` to the FastAPI backend
- keeps backend and frontend on internal Docker network ports only
- mounts the repository into the backend and frontend containers
- runs `alembic upgrade head` before starting the backend
- runs Vite in dev mode for the frontend

## Database and Migrations

Courtly uses:

- `SQLite` as the primary operational database
- `Alembic` for schema migrations
- `db/events.jsonl` as an append-only audit log

### Initial migration flow

Generate a new migration after changing models:

```bash
alembic revision --autogenerate -m "describe change"
```

Apply migrations:

```bash
alembic upgrade head
```

If you need to recreate the local database from scratch, delete the SQLite file and run:

```bash
alembic upgrade head
```

## Database Schema Overview

The initial schema contains five tables:

### `users`

- `id`
- `first_name`
- `last_name`
- `email`
- `role`
- `created_at`
- `is_active`

### `courts`

- `id`
- `name`
- `surface_type`
- `city`
- `district`
- `address`
- `created_at`
- `is_active`

### `court_hours`

- `id`
- `court_id`
- `weekday`
- `start_time`
- `end_time`
- `is_active`

### `bookings`

- `id`
- `court_id`
- `user_id`
- `start_time`
- `end_time`
- `slot_count`
- `status`
- `created_at`
- `cancelled_at`

### `booking_slots`

- `id`
- `booking_id`
- `court_id`
- `slot_start`
- `created_at`

Why `booking_slots` exists:

- the booking calendar is split into 30-minute slots
- each booking must reserve at least 2 slots
- conflicts are prevented with a unique slot-per-court rule

## API

Current endpoint:

- `GET /health` -> returns `{"status": "ok"}`

When using Docker Compose, this endpoint is available through `nginx` at:

- `http://localhost/health`

As the project grows, API routes should continue to live in `app/api/routes.py` or in dedicated router modules under `app/api/`.

## How To Write Code In This Project

Keep the codebase layered and predictable.

### General rules

- Keep API handlers thin.
- Put persistence logic in repositories, not in routes.
- Keep business rules out of SQLAlchemy models and route handlers.
- Use Alembic migrations for schema changes instead of `create_all()` as the main mechanism.
- Treat `events.jsonl` as append-only.

### Backend rules

- `app/api/`: HTTP concerns only
- `app/infrastructure/sqlite.py`: engine, session, and DB configuration
- `app/infrastructure/models.py`: SQLAlchemy models only
- `app/infrastructure/repository.py`: database access and queries
- future `application/` layer: orchestration and use cases
- future `domain/` layer: business rules and aggregates

### Frontend rules

- Keep UI code in `web/src/`
- Put API calls behind small helper functions instead of scattering `fetch()` everywhere
- Prefer simple components first, then extract shared UI when repetition appears

### When adding a feature

Typical backend sequence:

1. Update or add domain/application logic.
2. Update repository methods.
3. Update models if persistence changes.
4. Generate and review an Alembic migration.
5. Add or update API routes.
6. Update frontend integration if needed.

## Event Log

The event log is stored at `db/events.jsonl`.

It is intended for:

- audit trail
- debugging
- future rebuild/recovery flows

Event log entries should be append-only and should not be edited in place.

## Naming

The application name is `courtly`.

Use that name consistently in:

- API/app titles
- docs
- future Dockerfiles and service metadata

## Reverse Proxy

The repository includes `nginx/default.conf`.

Its current job is intentionally simple:

- expose the app on `80`
- send `/` traffic to the frontend service
- send `/health` traffic to the backend service

This keeps Docker usage simple because the browser only needs one URL:

- `http://localhost`
