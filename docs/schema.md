# Schema

This document tracks the PostgreSQL schema direction for `bond_grid`.

## Reference

See [PostgreSQL Database Reference](./POSTGRES-DB.md) for setup notes.

## Conventions

- Use `uuid` primary keys for public records.
- Use `timestamptz` for timestamps.
- Use `created_at` and `updated_at` on mutable tables.
- Prefer explicit foreign keys.
- Name tables with lowercase plural nouns.

## Initial Tables

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text NOT NULL UNIQUE,
  name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

## Future Tables

- `sessions`
- `roles`
- `bond_records`
- `grid_snapshots`
- `audit_events`

