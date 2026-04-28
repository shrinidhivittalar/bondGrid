# UI Design System

This document defines the frontend design direction for `bond_grid`.

## Stack

- React
- Next.js
- Tailwind CSS
- shadcn/ui-style primitives

## Design Principles

- Keep operational screens clear and scannable.
- Prefer dense, organized layouts over marketing-style sections.
- Use consistent spacing, typography, and control states.
- Keep repeated UI elements componentized.

## Components

Place reusable UI primitives under:

```text
apps/web/src/components/ui
```

Place feature components under:

```text
apps/web/src/components
```

## Styling

- Use Tailwind utility classes.
- Keep cards subtle with small border radius.
- Use accessible color contrast.
- Avoid hard-coded one-off styles when a shared component fits.

