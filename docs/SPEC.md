# Specification

This document captures implementation-level expectations for `bond_grid`.

## Frontend

- Use Next.js App Router.
- Keep pages under `apps/web/src/app`.
- Keep API helpers under `apps/web/src/services`.
- Use Tailwind and shadcn/ui-style primitives for UI.

## Backend

- Use Express route modules.
- Keep route registration in `apps/api/src/main.ts`.
- Move reusable logic into services as features grow.
- Keep database setup in `apps/api/src/config`.

## API Contract

- Routes should live under `/api`.
- Responses should be JSON.
- Errors should use consistent status codes and response shapes.

## Database

- PostgreSQL is the target database.
- Schema changes should be represented by migrations once a migration tool is
  selected.

