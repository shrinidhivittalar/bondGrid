# System Design

## Overview

`bond_grid` is split into a browser client, an API server, and a PostgreSQL
database.

```text
Browser
  -> Next.js app
  -> Express API
  -> PostgreSQL
```

## Components

### Browser Client

Renders the user interface and calls the backend through `apiClient`.

### API Server

Owns request validation, business logic, authentication, and database access.

### Database

Stores application state in PostgreSQL.

## Deployment Shape

The web and API apps can be deployed independently while sharing the same repo.
Environment variables should be configured per deployment target.

## Operational Notes

- Keep `/api/health` available for uptime checks.
- Add structured logging before production deployment.
- Add migrations before storing production data.

