# Courtly Release Checklist

## Pre-release

- [ ] Run backend test suite (`pytest`).
- [ ] Verify superuser forced password change on first login.
- [ ] Verify JWT access/refresh rotation works.
- [ ] Validate PII fields are encrypted at rest in DB.
- [ ] Validate admin endpoints return non-PII projections only.
- [ ] Verify event log hash-chain integrity (`python replay_cli.py`).
- [ ] Verify replay endpoint (`POST /api/admin/event-log/replay`) passes on clean data.

## Functional Validation

- [ ] Guest can list and view courts.
- [ ] Authenticated user can hold, confirm, and cancel booking.
- [ ] Booking conflict protection returns `409` on overlapping slot.
- [ ] Cabinet profile update and bookings list operate normally.
- [ ] Favorites add/remove and reviews CRUD work.
- [ ] Moderator/Admin can manage courts and transfer ownership.
- [ ] Admin can manage users/roles/permissions/policies/bindings.
- [ ] Dashboard email notification dispatch endpoint works.

## Performance and Reliability

- [ ] Check P95 read/write targets in load environment.
- [ ] Validate 7-day availability query uses indexes and no full table scan.
- [ ] Confirm event log append remains atomic under concurrent writes.
- [ ] Recovery drill: rebuild state from event log in fresh DB.

## Deployment

- [ ] Apply database migrations (if introducing Alembic migrations in next iteration).
- [ ] Configure production secrets (`COURTLY_JWT_SECRET`, encryption key).
- [ ] Set backup/retention policy for SQLite and event log files.
- [ ] Smoke test frontend against deployed API base URL.

