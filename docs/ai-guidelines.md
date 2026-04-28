# AI Development Guidelines - BondGrid

This document is the working standard for AI assistants contributing to the
BondGrid Graph System. All development work must support the PRD goal: a
graph-based community relationship platform where people are nodes and
relationships are typed connections.

## Core Principles

### 1. Product-First Graph Model

- Treat `Person` as the primary node entity.
- Treat `Relationship` as the primary edge entity.
- Relationship types must come from predefined backend-managed data.
- Do not hardcode relationship type lists in UI components.
- Every graph feature must preserve data accuracy, duplicate prevention, and
  relationship consistency.

### 2. Dynamic Content and Configuration

- User-facing labels, helper text, validation messages, empty states, page
  titles, and relationship type names should be fetched from the API or passed
  as props.
- Avoid hardcoded user-facing strings in reusable components.
- Technical constants are allowed only when they are developer-only and not part
  of the visible product language.
- Screens should accept copy and option sets from parent components or API data.

Example:

```tsx
function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}
```

### 3. UI Components - shadcn/ui First

- Use shadcn/ui-style primitives from `apps/web/src/components/ui`.
- Do not build custom UI primitives when an existing shadcn/ui equivalent fits.
- Custom components should compose primitives around BondGrid business behavior,
  such as search-before-create, graph panels, merge review, and relationship
  editors.
- Keep UI primitive styling centralized and reusable.

### 4. Responsive Graph and Data Entry UX

- Every page must work on mobile, tablet, desktop, and large screens.
- Use a mobile-first layout with Tailwind responsive classes.
- Touch targets must be at least 44x44 pixels on mobile.
- Graph controls must remain usable on small screens.
- Detail panels should collapse, slide, or stack on narrow viewports.
- Data entry forms must support progressive entry: collect minimal required
  details first, then allow optional profile completion later.

### 5. Color and Styling Tokens

- Use semantic Tailwind and design-system tokens only.
- Do not use hardcoded hex, RGB, HSL, or one-off color values in components.
- Prefer tokens such as `text-foreground`, `text-muted-foreground`,
  `text-primary`, `text-destructive`, `bg-background`, `bg-card`,
  `border-border`, `border-destructive`, `ring-ring`, and `ring-primary`.
- Graph node and edge styling should map relationship states to documented
  semantic tokens, not arbitrary colors.

### 6. Search-Before-Create Is Mandatory

- Person creation must always begin with a duplicate search.
- The UI must warn users before creating a likely duplicate.
- Search should prioritize name and phone number matching.
- Phone number must be unique when present.
- Incomplete profiles are allowed, but duplicate checks still apply.

### 7. Relationship Validation

- No self-relationships.
- No duplicate relationships between the same pair of people.
- Use predefined relationship types only.
- Auto-create reverse relationships when the product rule requires it.
- Enforce one father and one mother where applicable.
- Prevent obvious logical conflicts, such as a person becoming their own
  ancestor or child of their own child.
- Relationship corrections, reversals, and deletes must preserve auditability
  where practical.

### 8. Merge Duplicate Profiles

- Merge flows must preserve all relationships from both profiles.
- Conflicting profile fields must be shown to an admin for resolution.
- Merge operations should be reversible where practical.
- Never silently discard relationship edges or profile details.

### 9. Authentication and Authorization

- Implement role-based access control for:
  - `Admin`: full access, duplicate merge, relationship correction, user and
    system management.
  - `Volunteer`: create and edit permitted records, subject to validation.
  - `Viewer`: read-only graph and profile exploration.
- Protected routes must validate role and permissions on the server.
- Client-side checks are only UX helpers; API authorization is mandatory.

## Technical Standards

### File Structure

- Next.js App Router pages: `apps/web/src/app`
- Feature components: `apps/web/src/components`
- UI primitives: `apps/web/src/components/ui`
- Shared utilities: `apps/web/src/lib`
- API functions: `apps/web/src/lib/api`
- Express API entry: `apps/api/src/main.ts`
- API routes: `apps/api/src/routes`
- Controllers: `apps/api/src/controllers`
- Services: `apps/api/src/services`
- Database and config: `apps/api/src/config`

### Component Architecture

- Use TypeScript with strict mode.
- Define clear prop interfaces.
- Do not use `any`.
- Separate UI composition from business rules.
- Use Server Components where possible.
- Use Client Components only for interactivity such as graph navigation, forms,
  dialogs, and search interactions.

### API Integration

- Centralize frontend API calls under `apps/web/src/lib/api`.
- Handle loading, empty, validation, and error states for every async flow.
- Keep API response types explicit.
- Server-side validation must mirror important UI validation.
- Do not trust client-submitted relationship direction, role, or identity data.

### Database Standards

- PostgreSQL is the target database.
- Use UUID primary keys for public records.
- Use foreign keys for relationships.
- Store relationship types in database-managed tables.
- Add migrations before production data is introduced.
- Keep `.env.example` files in sync with required environment variables.

### Graph UI Standards

- Use React Flow for graph visualization unless a future architecture decision
  replaces it.
- Support zoom, pan, node selection, and lazy expansion.
- Limit visible nodes for performance.
- Render profile details in a side panel or responsive detail area.
- Avoid loading the full community graph at once.

## Review Checklist

Before submitting any code, verify:

- [ ] Person creation follows search-before-create.
- [ ] Relationship rules are validated in UI and API.
- [ ] No user-facing relationship types or copy are hardcoded in reusable UI.
- [ ] shadcn/ui-style primitives are used for UI controls.
- [ ] Layout works on mobile, tablet, desktop, and large screens.
- [ ] Only design-system color tokens are used.
- [ ] Forms show clear validation feedback.
- [ ] Role checks are enforced by the API.
- [ ] TypeScript strict mode passes with no `any`.
- [ ] Build and lint commands pass.

## Verification Commands

Run from the repo root:

```bash
npm run api:build
npm run web:build
npm run lint
```

---

Last Updated: April 28, 2026
