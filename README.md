<div align="center">

# promptly

**Build structured LLM prompts wrapped in HTML tags — fast.**

Define tags with typed inputs, cross-reference them with autocomplete, and copy a clean rendered prompt in one click.

[![Live Demo](https://img.shields.io/badge/demo-promptly-6E56CF?style=for-the-badge&logo=githubpages&logoColor=white)](https://jathavaan.github.io/promptly/)
[![Deploy](https://img.shields.io/github/actions/workflow/status/jathavaan/promptly/deploy.yml?branch=main&style=for-the-badge&label=deploy)](https://github.com/jathavaan/promptly/actions/workflows/deploy.yml)
[![License: GPL v3](https://img.shields.io/badge/license-GPL%20v3-blue?style=for-the-badge)](./LICENSE)

</div>

---

## Why

Hand-writing `<role>...</role>` and `<context>...</context>` blocks for Claude or ChatGPT prompts gets repetitive. **promptly** turns prompt scaffolding into a typed, reusable form: define tags once, fill them in, copy the result.

## Features

- **Typed tag inputs** — text, checkbox, or list per tag.
- **Tag references** — autocomplete `@tag-id` from any field; references render inline.
- **Drag-to-create groups** — visually group related tags.
- **Live preview** — rendered prompt with tab indentation and per-line wrap.
- **Library** — save and reload prompts and templates locally.
- **XML import / export** — round-trip your prompts as XML.
- **One-click copy** — final prompt to clipboard.
- **Local-first** — `localStorage` only, no backend, no telemetry.

## Stack

| Layer    | Tech                                                    |
| -------- | ------------------------------------------------------- |
| UI       | React 19 · TypeScript 6 · Vite 8                        |
| Styling  | MUI 9 (`@mui/material` + `styled`) · Emotion           |
| State    | Redux Toolkit · `localStorage` (`promptly:` prefix)     |
| Tooling  | ESLint flat config · Prettier · npm                     |
| Deploy   | GitHub Actions → GitHub Pages                           |

## Layout

```
promptly/
├── client/    # React + Vite app — all active work lives here
└── server/    # placeholder for future .NET backend (out of scope)
```

The client is feature-based: `src/features/<feature>/` owns its slice, components, and hooks. See [`client/CLAUDE.md`](./client/CLAUDE.md) for conventions.

## Run locally

```bash
git clone https://github.com/jathavaan/promptly.git
cd promptly/client
npm ci
npm run dev
```

| Command           | What it does                       |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Vite dev server                    |
| `npm run build`   | `tsc -b && vite build`             |
| `npm run lint`    | ESLint over the workspace          |
| `npm run format`  | Prettier write                     |
| `npm run preview` | Preview the production build       |

## Deploy

Push to `main` triggers [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml), which builds `client/` and publishes `client/dist` to GitHub Pages. `vite.config.ts` sets `base: '/promptly/'` so assets resolve under the repo path.

Live at **<https://jathavaan.github.io/promptly/>**.

## License

[GNU GPL v3](./LICENSE) © [Jathavaan Shankar](https://github.com/jathavaan)
