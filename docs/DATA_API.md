# Data API

This document tracks API routes and data contracts.

## Base URLs

```text
Local API: http://localhost:3333
Local Web: http://localhost:3000
```

## Environment

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bond_grid
```

## Current Routes

### Health

```http
GET /api/health
```

Response:

```json
{
  "ok": true,
  "service": "bond_grid-api"
}
```

## Planned Data Areas

- Users and authentication
- Bonds or grid records
- Admin configuration
- Audit and activity records

