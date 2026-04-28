# Architecture

`bond_grid` is an Nx monorepo with a Next.js frontend and an Express API.

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
- Database target: PostgreSQL

## Database

PostgreSQL is the target relational database. See
[PostgreSQL Database Reference](./POSTGRES-DB.md).

