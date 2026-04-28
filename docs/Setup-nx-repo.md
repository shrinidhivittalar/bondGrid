# Setup Nx Repo

This is the short setup guide for the `bond_grid` workspace.

## Install

```bash
npm install
```

## Show Projects

```bash
npx nx show projects
```

Expected projects:

```text
@bond_grid/api
web
```

## Run Locally

Use two terminals:

```bash
npm run api:serve
```

```bash
npm run web:serve
```

## Build

```bash
npm run api:build
npm run web:build
```

## Lint

```bash
npm run lint
```

## Structure

See [Project Structure](./PROJECT-STRUCTURE.md).

