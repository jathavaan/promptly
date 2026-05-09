<div align="center">

# promptly

**Build structured LLM prompts wrapped in HTML tags — fast.**

Define tags with typed inputs, cross-reference them with autocomplete, and copy a clean rendered prompt in one click.

[![Try it now](https://img.shields.io/badge/try%20it%20now-promptly-6E56CF?style=for-the-badge&logo=githubpages&logoColor=white)](https://jathavaan.github.io/promptly/)
[![Deploy](https://img.shields.io/github/actions/workflow/status/jathavaan/promptly/deploy.yml?branch=main&style=for-the-badge&label=deploy)](https://github.com/jathavaan/promptly/actions/workflows/deploy.yml)
[![License: GPL v3](https://img.shields.io/badge/license-GPL%20v3-blue?style=for-the-badge)](./LICENSE)

</div>

---

## Why

Hand-writing `<role>...</role>` and `<context>...</context>` blocks for Claude or ChatGPT prompts gets repetitive. **promptly** turns prompt scaffolding into a typed, reusable form: define tags once, fill them in, copy the result.

## Table of contents

- [Quickstart](#quickstart)
- [Cookbook (worked examples)](#cookbook-worked-examples)
- [Concepts](#concepts)
  - [Tags](#tags)
  - [Input types](#input-types)
  - [References (`<id>` autocomplete)](#references-id-autocomplete)
  - [Groups](#groups)
  - [Flags: pinned, disabled, static](#flags-pinned-disabled-static)
- [Validation rules](#validation-rules)
  - [Tag ID rules](#tag-id-rules)
  - [Errors vs warnings](#errors-vs-warnings)
  - [Reference resolution](#reference-resolution)
  - [Empty values](#empty-values)
- [Output](#output)
  - [Render modes: clean vs promptly](#render-modes-clean-vs-promptly)
  - [Settings (role, think step by step, self-critique)](#settings-role-think-step-by-step-self-critique)
- [Library: prompts and templates](#library-prompts-and-templates)
- [XML import / export](#xml-import--export)
- [Storage and privacy](#storage-and-privacy)
- [Stack](#stack)
- [Layout](#layout)
- [Run locally](#run-locally)
- [Deploy](#deploy)
- [License](#license)

## Quickstart

1. Open <https://jathavaan.github.io/promptly/>.
2. Click **+ Tag** in the Builder. Pick an input type, give it an ID (e.g. `context`).
3. In any text field, type `<` to open the autocomplete and reference another tag's ID — the rendered prompt expands `<other-tag>` literally where you typed it.
4. Open the **Preview** panel to see the rendered XML; click **Copy** to put it on the clipboard.
5. Open the **Library** to save the current prompt or save it as a template (preserves field text for reuse).

## Cookbook (worked examples)

For end-to-end examples that map Builder state to rendered output — few-shot prompts, structured-output schemas, references, templates, XML round-trip, A/B testing — see **[docs/EXAMPLES.md](./docs/EXAMPLES.md)**.

## Concepts

### Tags

A **tag** is one named field that becomes one XML element in the output. Each tag has:

- A unique **id** (the XML element name, e.g. `context`).
- A **type** (`text`, `checkbox`, `list`, `example`, or `group`).
- A **value** matching the type.
- Optional **flags**: `pinned`, `disabled`, `static`, plus free-form `notes`.

### Input types

| Type | Editor | Renders as |
| ---- | ------ | ---------- |
| `text` | Multiline text area with `<` autocomplete for references | `<id>...text...</id>` |
| `checkbox` | Toggle switch | `<id>true</id>` or `<id>false</id>` |
| `list` | Repeatable rows; pick a list style (see below) | `<id>` containing items in the chosen style |
| `example` | Repeatable `{ input, output }` pairs | `<id><example><input>…</input><output>…</output></example>…</id>` |
| `group` | Container; drag other tags inside | `<id>` containing nested tag elements |

**List styles** (`listStyle`):

| Style | Item rendered as |
| ----- | ---------------- |
| `unordered` (default) | `- item` |
| `ordered` | `1. item` |
| `checked` | `[x] item` or `[ ] item` |
| `xml` | `<childName id="N">item</childName>` — `childName` (default `item`) must be a valid XML name |

### References (`<id>` autocomplete)

Inside any `text`, `list` item, or `example` field, type `<` to open the reference popper and pick another tag. Internally the reference is stored as `{{ref:<uuid>}}`; on render it expands to the **literal `<id>` of the target tag** (not its value). This lets you write prose that names another tag inline:

> "Use the format described in `<schema>` and the examples in `<few-shot>`."

If the referenced tag is **disabled**, the reference renders as empty. If it's **deleted**, the raw `{{ref:uuid}}` is left in place and the tag is flagged with a warning.

### Groups

A `group` tag has no value of its own — it just nests other tags. Groups can nest arbitrarily deep. Drag-reordering inside the Builder lets you create a group by dropping one tag onto another. Cycles are prevented (you can't drop a tag into its own descendant).

### Flags: pinned, disabled, static

- **pinned** — tag renders at the **end** of the prompt body, after non-pinned tags. Useful for closing instructions like a "respond in JSON" block.
- **disabled** — tag is excluded from the rendered prompt entirely. References to a disabled tag render empty.
- **static** — tag is hidden from the Builder list by default (toggle visibility with the lock icon in the Tags panel header, or in Settings → "Show static in builder"). Static tags still render normally and are preserved by templates. Use for boilerplate you rarely edit.

## Validation rules

Validation runs continuously over Builder state and surfaces issues per tag (icons on the tag card with tooltips). Issues are split into **errors** and **warnings**.

### Tag ID rules

Tag IDs must be valid XML element names (a safe ASCII subset):

```
^[A-Za-z_][A-Za-z0-9._-]*$
```

- Must start with a letter or underscore.
- May contain letters, digits, `.`, `-`, `_`.
- May **not** start with `xml` (case-insensitive — reserved by the XML spec).
- Must be unique across all tags in the prompt.

| Condition | Message |
| --------- | ------- |
| Empty | `ID is required.` |
| Starts with digit / symbol | `ID must start with a letter or underscore.` |
| Starts with `xml` / `XML` / `Xml` … | `ID cannot start with "xml" (reserved).` |
| Contains other characters | `ID may only contain letters, digits, ".", "-", "_".` |
| Two tags share the same valid ID | `Duplicate ID "{id}".` |

For `list` tags with `listStyle: xml`, the **child element name** (`listChildName`) must satisfy the same rule, otherwise: `List child element name is not a valid XML name.`

### Errors vs warnings

| Level | Examples | Effect |
| ----- | -------- | ------ |
| **Error** (red) | Invalid ID, duplicate ID, invalid list child name | Surfaced on the tag card; you can still copy/export, but the output may be malformed XML |
| **Warning** (amber) | Reference to a missing tag, empty value | Informational only; doesn't block anything |

### Reference resolution

| Target state | Rendered as |
| ------------ | ----------- |
| Exists, enabled | Literal `<target-id>` (the tag name, **not** its value) |
| Exists, disabled | Empty string |
| Deleted | Raw `{{ref:uuid}}` left in text + warning on the tag |
| Self-reference | Allowed and ignored (no warning, no expansion loop) |

References only appear in the autocomplete for tags whose IDs are currently valid.

### Empty values

A tag is flagged with `Empty value.` when:

- `text` — `textValue` is whitespace only.
- `list` — every item's text is whitespace only.
- `example` — every pair has both `input` and `output` whitespace only.
- `group` — has no children.

Empty tags still render (as a self-closing-style `<id></id>`) so you can keep placeholders.

## Output

### Render modes: clean vs promptly

Both modes render the same XML structure; they differ in metadata:

- **clean** — the prompt body only. Used for the Preview pane and the **Copy** button. No promptly-specific attributes, no namespace.
- **promptly** — adds `xmlns:p="urn:promptly"` and `p:*` attributes (`p:type`, `p:pinned`, `p:disabled`, `p:static`, `p:notes`, `p:listStyle`, `p:listChildName`). Used by **Export XML** so the file round-trips losslessly through **Import XML**.

Text content containing `<`, `>`, or `&` is wrapped in `<![CDATA[...]]>` in promptly mode (so the file remains valid XML); clean mode keeps it raw so `<id>` references render literally for the target LLM.

### Settings (role, think step by step, self-critique)

Settings live alongside tags and render at fixed positions:

- **role** (string) — emitted at the **top** of `<prompt>` as `<role>...</role>` (or `<p:role>` in promptly mode). Empty role is omitted.
- **think step by step** (bool) — appends `<directive>Think step by step.</directive>` at the end.
- **self-critique** (bool) — appends `<critique>After your answer, critique it. List 3 things that might be wrong, weak, or missing.</critique>`.
- **copy mode** — `raw` (XML only) or `markdown` (XML wrapped in a fenced ` ```xml ` block).

Body order: non-pinned tags in Builder order → pinned tags → directive → critique.

## Library: prompts and templates

The Library tab saves the current `{ tags, settings }` state as a `PromptlyFile` (`version: 1`) under the `promptly:library` localStorage key. Two kinds:

- **prompt** — a full snapshot, including all field values. Reload to resume editing.
- **template** — same shape, but intended for reuse: load it as a starting point and fill in the blanks. Static tags preserve their text across template loads.

Items can be renamed, duplicated, or removed. There is no cloud sync.

## XML import / export

**Export** (`Export XML` button) produces a `<prompt xmlns:p="urn:promptly">` document with all `p:*` metadata, suitable for round-trip.

**Import** (`Import XML` button) accepts any XML whose root element is `<prompt>`. It tolerates files without promptly metadata:

- Tag IDs come from each element's `localName`.
- Tag type comes from `p:type` if present; otherwise inferred:
  - No children + body is `true`/`false` → `checkbox`.
  - No children → `text`.
  - All children are `<example>` → `example`.
  - Any other children → `group`.
- For `list`, the style is read from `p:listStyle` if present, otherwise sniffed from text content (`1. ` → ordered, `[x] ` / `[ ] ` → checked, `- ` / `* ` → unordered) or, if the element has named child elements, treated as `xml` style.
- References saved as `{{ref:<id>}}` are remapped to fresh `{{ref:<uuid>}}` so internal links survive the import.

Failures throw `ImportError` with a short message: `Could not parse file as XML.` or `Root element must be <prompt>.`

## Storage and privacy

Everything lives in `localStorage` under the `promptly:` prefix (`promptly:tags`, `promptly:settings`, `promptly:library`, `promptly:tutorial`). No backend, no telemetry, no network calls beyond loading the static site itself.

Clearing site data wipes all prompts and library entries — export anything you want to keep first.

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
│   └── src/
│       ├── app/                  # store, persistence, root layout
│       ├── components/           # shared dumb UI (Button, …)
│       ├── features/
│       │   ├── tags/             # tag model, slice, Builder UI, validation
│       │   ├── settings/         # role + directive toggles
│       │   ├── preview/          # render.ts (clean / promptly modes)
│       │   ├── io/               # importXml / exportXml
│       │   ├── library/          # saved prompts & templates
│       │   └── tutorial/         # first-visit walkthrough
│       ├── hooks/                # shared use*.ts
│       ├── theme/                # MUI theme (light only)
│       └── utils/                # xmlName, xmlEscape, clipboard, …
└── server/    # placeholder for future .NET backend (out of scope)
```

The client is feature-based: `src/features/<feature>/` owns its slice, components, and hooks. See [`client/CLAUDE.md`](./client/CLAUDE.md) for code conventions.

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
