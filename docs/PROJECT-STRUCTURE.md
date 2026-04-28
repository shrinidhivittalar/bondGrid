# Project Structure

```text
bond_grid/
├── nx.json
├── package.json
├── tsconfig.base.json
├── eslint.config.mjs
├── .prettierrc
├── apps/
│   ├── api/
│   │   ├── .gitignore
│   │   ├── .env.example
│   │   ├── package.json
│   │   ├── tsconfig.app.json
│   │   └── src/
│   │       ├── main.ts
│   │       ├── routes/
│   │       ├── controllers/
│   │       ├── models/
│   │       ├── middleware/
│   │       ├── services/
│   │       ├── utils/
│   │       └── assets/
│   └── web/
│       ├── .gitignore
│       ├── .env.example
│       ├── project.json
│       ├── next.config.js
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       ├── public/
│       └── src/
│           ├── app/
│           ├── components/
│           │   └── ui/
│           ├── layout/
│           ├── services/
│           ├── store/
│           ├── utils/
│           └── styles/
└── docs/
    └── PROJECT-STRUCTURE.md
```

## Apps

`apps/api` contains the Express backend. Add route modules under `src/routes`,
request handlers under `src/controllers`, database models under `src/models`,
and reusable business logic under `src/services`.

`apps/web` contains the Next.js frontend. Add App Router pages under `src/app`,
feature components under `src/components`, shadcn/ui primitives under
`src/components/ui`, and API calls under `src/services`.

## Environment Files

Commit `.env.example` files and keep real `.env` or `.env.local` files local.
When a new environment variable is read in code, add it to the matching example
file.
