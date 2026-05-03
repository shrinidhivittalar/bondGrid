# Architecture

`bond_grid` is an Nx monorepo with a Next.js frontend, an Express API, and a Neo4j graph backend.

## Applications

```text
apps/web  -> Next.js App Router frontend
apps/api  -> Express backend API
docs      -> product and engineering documentation
```

## Web

- Framework: Next.js
- UI: React, Tailwind, shadcn/ui-style components
- Routing: App Router under `apps/web/src/app`
- API access: `apps/web/src/services/apiClient.ts`

## API

- Framework: Express
- Entry point: `apps/api/src/main.ts`
- Routes: `apps/api/src/routes`
- Controllers: `apps/api/src/controllers`
- Services: `apps/api/src/services`
- Database target: Neo4j

## Database

Neo4j is the graph database of record. See
[Neo4j Database Reference](./NEO4J-DB.md).

