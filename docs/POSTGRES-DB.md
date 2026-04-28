# PostgreSQL Database Reference

This document captures the PostgreSQL database setup and the reference image for
the `bond_grid` backend.

## Reference Image

Place the database reference image at:

```text
docs/images/postgres-db-reference.png
```

Markdown preview:

![PostgreSQL database reference](./images/postgres-db-reference.png)

## Local Database

Recommended local defaults:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bond_grid
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=bond_grid
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

Keep real credentials in `apps/api/.env`. Only example values should be
committed.

## Connection Flow

```text
Next.js app
  -> API client
  -> Express routes
  -> PostgreSQL connection pool / ORM
  -> bond_grid database
```

## Suggested Database Layout

Use one application database named `bond_grid`. Keep tables grouped by feature
area and use UUID primary keys for records that are exposed outside the backend.

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

## API Environment

When the API is switched from MongoDB to PostgreSQL, add `DATABASE_URL` to
`apps/api/.env.example` and read it from the API configuration layer.

Example:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bond_grid
```

## Notes

- Current API code still uses MongoDB through `mongoose`.
- PostgreSQL integration should replace the MongoDB connection in
  `apps/api/src/main.ts` or move database bootstrapping into `apps/api/src/config`.
- Keep migrations in a dedicated folder once an ORM or migration tool is chosen.
