# promptly cookbook

Worked examples showing how Builder state turns into the prompt you copy.

All snippets below are shown in **clean** render mode — what the **Copy** button puts on your clipboard. The same prompt exported via **Export XML** wraps every element with a `urn:promptly` namespace and `p:*` attributes (`p:type`, `p:pinned`, `p:listStyle`, …) so it round-trips losslessly through **Import XML**. See the [Output](../README.md#output) and [XML import / export](../README.md#xml-import--export) sections of the README for the metadata format.

### Rules these examples follow

Every example honours the validation rules from the [README](../README.md#validation-rules):

- All tag IDs are **globally unique** — no two tags share an ID, including across group boundaries.
- IDs match `^[A-Za-z_][A-Za-z0-9._-]*$` and don't start with `xml`.
- IDs `role`, `directive`, and `critique` are reserved for Settings and never used as tag IDs (the cookbook uses `persona` or similar where a "system role" tag is needed).
- For `list` tags with `listStyle: xml`, `listChildName` is itself a valid XML name.
- **Every element name in the rendered output is unique.** This is what makes references unambiguous — see [Element-name uniqueness](../README.md#element-name-uniqueness-in-the-rendered-output). The cookbook avoids the `example` input type for this reason; few-shot blocks use a single `list` tag instead.

## Table of contents

1. [Minimal coding prompt](#1-minimal-coding-prompt)
2. [Few-shot examples as an ordered list](#2-few-shot-examples-as-an-ordered-list)
3. [Structured output schema with `xml`-style lists](#3-structured-output-schema-with-xml-style-lists)
4. [References to keep prompts DRY](#4-references-to-keep-prompts-dry)
5. [Checkboxes for feature flags](#5-checkboxes-for-feature-flags)
6. [Groups for nested structure](#6-groups-for-nested-structure)
7. [Pinned closing instruction + directives](#7-pinned-closing-instruction--directives)
8. [Templates and static fields](#8-templates-and-static-fields)
9. [Round-trip via XML](#9-round-trip-via-xml)
10. [A/B testing with disabled tags](#10-ab-testing-with-disabled-tags)

---

## 1. Minimal coding prompt

The bread-and-butter case: a role, some context, a task. All `text` tags.

**Builder:**

| Tag | Type | Value |
| --- | ---- | ----- |
| Settings → role | — | `You are a senior Go engineer.` |
| `context` | text | `The repo uses Go 1.22 and a custom error wrapper in pkg/errs.` |
| `task` | text | `Refactor the order service to use errs.Wrap consistently.` |

**Rendered:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<prompt>
	<role>
		You are a senior Go engineer.
	</role>
	<context>
		The repo uses Go 1.22 and a custom error wrapper in pkg/errs.
	</context>
	<task>
		Refactor the order service to use errs.Wrap consistently.
	</task>
</prompt>
```

## 2. Few-shot examples as an ordered list

> **Why not the `example` input type?** That type renders one `<example>` block per pair, each with its own `<input>` and `<output>` — so three pairs produce three `<example>`, three `<input>`, and three `<output>` sibling elements. promptly's reference system expands every reference to a literal `<element-name>` token, so duplicated names are ambiguous and the `example` type is **not safe whenever the prompt also uses references**. See [Element-name uniqueness](../README.md#element-name-uniqueness-in-the-rendered-output) for the rule. The pattern below — a single `examples` tag with an ordered list — keeps every element name unique.

**Builder:**

- `task` (text) — `Classify each sentence as positive, neutral, or negative.`
- `examples` (list, style `ordered`) — three items:
  - `"I love this." → positive`
  - `"It is fine." → neutral`
  - `"This is the worst." → negative`

**Rendered:**

```xml
<prompt>
	<task>
		Classify each sentence as positive, neutral, or negative.
	</task>
	<examples>
		1. "I love this." → positive
		2. "It is fine." → neutral
		3. "This is the worst." → negative
	</examples>
</prompt>
```

If you need each example as its own structured block (e.g. with separate `<input>` / `<output>` you can reference), give every block its own unique IDs, for example:

```xml
	<example_1>
		<input_1>I love this.</input_1>
		<output_1>positive</output_1>
	</example_1>
	<example_2>
		<input_2>It is fine.</input_2>
		<output_2>neutral</output_2>
	</example_2>
```

Awkward but unambiguous. In practice the ordered-list form above is what most prompts want.

## 3. Structured output schema with `xml`-style lists

When the model needs to know exact field names, set the list style to `xml`. Each item becomes a named child element with an auto-generated `id` index.

**Builder:** `schema` (list) — set `listStyle: xml`, `listChildName: field`. Items:

- `name: string — full legal name`
- `age: number — in years`
- `email: string — optional`

**Rendered:**

```xml
	<schema>
		<field id="1">name: string — full legal name</field>
		<field id="2">age: number — in years</field>
		<field id="3">email: string — optional</field>
	</schema>
```

The `id="N"` lets the model (and you) refer to items by index. The other list styles render the same items as `- name…` (`unordered`), `1. name…` (`ordered`), or `[ ] name…` / `[x] name…` (`checked`).

## 4. References to keep prompts DRY

Type `<` in any text/list/example field to open the reference picker. The reference renders as the **literal `<id>` of the target tag**, not its value — so you can name another section inline and the model sees a tag pointer.

**Builder:**

- `schema` (list, xml style, child `field`) — three fields, as in example 3.
- `task` (text) — typed as:

  > `Output a JSON object matching <` … pick `schema` from the popper … `>. Do not include extra fields.`

**Rendered:**

```xml
	<schema>
		<field id="1">name: string</field>
		<field id="2">age: number</field>
		<field id="3">email: string</field>
	</schema>
	<task>
		Output a JSON object matching <schema>. Do not include extra fields.
	</task>
```

Edge cases:

- **Delete `schema`** → `<task>` keeps a raw `{{ref:uuid}}` placeholder and gets a `Reference points to a missing tag.` warning until you remove the broken ref or recreate the target.
- **Disable `schema`** → the reference renders as an empty string, so the surrounding sentence collapses naturally. Useful for A/B-ing whether a section helps.

## 5. Checkboxes for feature flags

A `checkbox` tag renders as `<id>true</id>` or `<id>false</id>`. Pair with text tags that explain what each flag means.

**Builder:**

- `verbose` (checkbox) — true
- `cite-sources` (checkbox) — false

**Rendered:**

```xml
	<verbose>true</verbose>
	<cite-sources>false</cite-sources>
```

## 6. Groups for nested structure

Drop one tag onto another in the Builder to wrap them in a `group`. Groups have no value of their own — they nest other tags. Nesting depth is unlimited, and cycles are prevented (a tag cannot be moved into its own descendant).

**Builder:** `style-guide` (group) containing:

- `tone` (text) — `Direct, lowercase, no exclamation marks.`
- `length` (text) — `Under 200 words.`

**Rendered:**

```xml
	<style-guide>
		<tone>
			Direct, lowercase, no exclamation marks.
		</tone>
		<length>
			Under 200 words.
		</length>
	</style-guide>
```

## 7. Pinned closing instruction + directives

`pinned` tags render at the **end** of the prompt body, after non-pinned ones. Combine with **Settings → think step by step** (appends `<directive>`) and **self-critique** (appends `<critique>`) for a clean closing block.

**Builder:**

- `context` (text) — the brief
- `task` (text) — the ask
- `format` (text, **pinned**) — `Respond in markdown with a TL;DR header.`
- Settings → think step by step ✓, self-critique ✓

**Rendered:**

```xml
<prompt>
	<context>
		…
	</context>
	<task>
		…
	</task>
	<format>
		Respond in markdown with a TL;DR header.
	</format>
	<directive>Think step by step.</directive>
	<critique>After your answer, critique it. List 3 things that might be wrong, weak, or missing.</critique>
</prompt>
```

Body order: non-pinned tags (Builder order) → pinned tags → directive → critique.

## 8. Templates and static fields

Scenario: you've built a polished prompt for "summarise a meeting transcript." The persona, schema, and tone rarely change; the transcript changes every time. Make the boilerplate disappear from the Builder so only the variable parts are visible.

> Note: the **Settings → role** field is not a tag and cannot be marked static (it has its own input above the tag list). For static persona / system instructions, create a regular `text` tag with a non-reserved id like `persona` or `assistant_role`. See [Reserved IDs](../README.md#reserved-ids-collide-with-settings) for why `role`, `directive`, and `critique` should not be used as tag ids.

1. On `persona`, `schema`, `tone`, click the lock icon to mark them **static**. They drop out of the Builder list.
2. Open the **Library**, click **Save as template**.
3. Next session: open the template. Static fields are preserved with their text, so you only fill in `transcript`.
4. Need to edit the boilerplate? Settings → toggle **Show static in builder** to bring them back.

Saved items (both prompts and templates) are `PromptlyFile` objects (`{ version: 1, tags, settings }`) under `localStorage["promptly:library"]`. The only thing distinguishing a template from a regular saved prompt is its `kind` field — both store the full state, including field values.

## 9. Round-trip via XML

**Export XML** writes the current state to a file with the `urn:promptly` namespace and `p:*` metadata:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<prompt xmlns:p="urn:promptly">
	<p:role>
		You are a senior Go engineer.
	</p:role>
	<context p:type="text">
		<![CDATA[Use <errs.Wrap> for all error returns.]]>
	</context>
	<schema p:type="list" p:listStyle="xml" p:listChildName="field">
		<field id="1">name: string</field>
	</schema>
</prompt>
```

A few things to notice:

- `<role>` becomes `<p:role>` so it doesn't collide with a tag a user happens to name `role`.
- `context` carries `p:type="text"` so the importer doesn't have to guess.
- The text content includes `<errs.Wrap>` (a literal angle bracket), so promptly mode wraps it in `<![CDATA[...]]>` to keep the file valid XML. Clean mode keeps it raw — that's what you want for the LLM.

**Import XML** also accepts files without any `p:*` metadata. Type inference falls back to:

| What the element looks like | Inferred type |
| --------------------------- | ------------- |
| No children, body is `true` or `false` | `checkbox` |
| No children otherwise | `text` |
| All children are `<example>` | `example` |
| Any other children | `group` |

Lists fall back to sniffing the body: `1. ` → ordered, `[ ] ` / `[x] ` → checked, `- ` / `* ` → unordered. Named child elements → `xml` style.

This means you can paste an LLM prompt you wrote by hand into a file, hit **Import XML**, and start editing it in the Builder.

## 10. A/B testing with disabled tags

To compare a prompt with and without a few-shot block, toggle the **disabled** flag on the `examples` tag instead of deleting it. Disabled tags are excluded from the rendered output, and any `<examples>` reference elsewhere renders empty — but the data stays in the Builder so you can flip it back.

```
examples.disabled = false  →  <examples>1. … 2. … 3. …</examples>  in output
examples.disabled = true   →  tag and any references to it both disappear
```

Combine with the Library: save two snapshots, one with the block enabled and one disabled, and reload them side-by-side in two browser tabs to compare model outputs.
