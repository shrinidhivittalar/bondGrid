# App Flow

This document describes the expected user and system flow for `bond_grid`.

## Runtime Flow

```text
User
  -> Next.js web app
  -> API client
  -> Express API
  -> Neo4j graph database
  -> API response
  -> UI state update
```

## Web Flow

1. User opens the web app at `http://localhost:3000`.
2. Next.js renders the current page from `apps/web/src/app`.
3. UI components call service functions from `apps/web/src/services`.
4. `apiClient` sends requests to the backend API.
5. The page updates after the API response is received.

## API Flow

1. Express starts from `apps/api/src/main.ts`.
2. Middleware handles CORS and JSON parsing.
3. Route modules under `apps/api/src/routes` receive requests.
4. Controllers and services handle business logic.
5. Database access goes through the Neo4j integration layer.

## Health Check

```text
GET http://localhost:3333/api/health
```

