# promptly — client

React app for composing HTML-tag-wrapped LLM prompts. Tags have an ID + input type (text / checkbox / list); other fields can reference existing tag IDs via autocomplete; final prompt is copyable in one click.

## Stack

React 19, TypeScript 6, Vite 8, MUI (`@mui/material` + `styled`), Redux Toolkit, npm. ESLint flat config + Prettier.

## Layout — feature-based

```
src/
  app/         # store config, providers, root App.tsx
  features/<feature>/   # slice.ts + components + hooks scoped to one feature
  components/  # shared dumb UI (e.g. Button)
  hooks/       # shared use*.ts, one hook per file
  theme/       # MUI theme (light only)
  utils/
```

Slices, feature-specific components and feature-specific hooks live **inside** `features/<feature>/`. Promote to top-level only when reused across features.

## Conventions

- **Three-file rule for styled components.** `Button.tsx` (consumer), `button.style.ts` (exports `StyledButton` via MUI `styled(Button)`), `button.types.ts` (props interface). Why: keeps the consumer free of styling concerns and makes MUI prop extension explicit.
- **MUI prop extension uses aliased import:** `import type { ButtonProps as MuiButtonProps } from '@mui/material'`, then `interface ButtonProps extends MuiButtonProps`. Why: the local name `ButtonProps` is what the rest of the app imports.
- **One hook per file.** Filename matches the hook (`useTagSuggestions.ts` exports `useTagSuggestions`). No barrel files mixing multiple hooks.
- **Redux Toolkit only.** Slices via `createSlice`. No RTK Query (no backend yet). Selectors typed with `RootState`.
- **Path alias `@/` → `src/`.** Configure in both `vite.config.ts` (`resolve.alias`) and `tsconfig.app.json` (`paths`).
- **Persistence is `localStorage`** with key prefix `promptly:` (e.g. `promptly:tags`, `promptly:draft`). Why: namespaced keys avoid collisions if hosted alongside other GH Pages apps on the same origin.

## Commands

```
npm run dev       # vite dev server
npm run build     # tsc -b && vite build
npm run lint      # eslint .
npm run format    # prettier --write .
```

## Deploy

GitHub Actions workflow runs `npm ci && npm run build` on push to `main`, publishes `client/dist` to GitHub Pages. `vite.config.ts` must set `base: '/promptly/'` or assets 404.

## Out of scope — do not add

- React Router (single-page, no routing needed).
- Tests (no Vitest / RTL setup).
- Dark mode or theme toggle (light only).
- Pre-commit hooks (no husky / lint-staged).
- Any backend / API calls (.NET server is planned later — see root CLAUDE.md).

<important if="creating or modifying a styled component">
- Apply the three-file split: `Component.tsx`, `component.style.ts`, `component.types.ts`.
- `component.style.ts` exports the styled version (e.g. `StyledButton`) using MUI `styled(...)`.
- `component.types.ts` extends MUI props with the aliased-import pattern (`ButtonProps as MuiButtonProps`).
- Do not inline `sx={...}` for repeated styling — promote to the styled file.
</important>

<important if="adding state">
- Default to a Redux Toolkit slice in the feature folder. Reach for `useState` only for local, ephemeral UI state (open/closed, hover, focus).
- Anything that needs to survive a reload must be persisted to `localStorage` under the `promptly:` prefix.
</important>

<!-- maintainer: @jathavaan; revisit when backend lands or tests are added -->
