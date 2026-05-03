# System Design

## Overview

`bond_grid` is split into a browser client, an API server, and a Neo4j graph
database.

```text
Browser
  -> Next.js app
  -> Express API
  -> Neo4j
```

## Components

### Browser Client

Renders the user interface and calls the backend through `apiClient`.

### API Server

Owns request validation, business logic, authentication, and database access.

### Database

Stores people as nodes and relationships as typed graph edges in Neo4j.

## Deployment Shape

The web and API apps can be deployed independently while sharing the same repo.
Environment variables should be configured per deployment target.

## Operational Notes

- Keep `/api/health` available for uptime checks.
- Add structured logging before production deployment.
- Add migrations before storing production data.

