# promptly

Web app for building Claude / ChatGPT prompts wrapped in HTML tags. Users define tags with an ID + input type (text / checkbox / list), reference tags from other fields via autocomplete, and copy the generated prompt with one click.

## Layout

- `client/` — React + Vite app. **All active work happens here.** See @client/CLAUDE.md.
- `server/` — empty placeholder. **.NET backend is planned but out of scope for now.** Do not scaffold, install, or wire backend calls until explicitly requested.

## Deploy target

GitHub Pages, auto-deployed via GitHub Actions on push to `main`. Repo + app name is `promptly`, so `client/vite.config.ts` must set `base: '/promptly/'`.

<!-- maintainer: @jathavaan; review when backend work begins -->
