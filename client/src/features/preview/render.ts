import type { SettingsState } from '@/features/settings/settingsSlice';
import type { Tag, TagsState } from '@/features/tags/types';
import { REF_REGEX } from '@/features/tags/types';
import { cdata, xmlEscapeAttr } from '@/utils/xmlEscape';
import { isValidXmlName } from '@/utils/xmlName';

export type RenderMode = 'clean' | 'promptly';

const INDENT = '\t';
const SELF_CRITIQUE_TEXT =
  'After your answer, critique it. List 3 things that might be wrong, weak, or missing.';

interface RenderInput {
  tags: TagsState;
  settings: SettingsState;
}

// Refs resolve to the literal `<id>` label of the target tag (not its value).
export const expandRefs = (text: string, tags: TagsState): string =>
  text.replace(REF_REGEX, (match, uuid) => {
    const target = tags.byUuid[uuid];
    if (!target) return match;
    if (target.disabled) return '';
    return `<${target.id}>`;
  });

const metaAttrs = (tag: Tag): string => {
  const parts: string[] = [`p:type="${tag.type}"`];
  if (tag.pinned) parts.push('p:pinned="true"');
  if (tag.disabled) parts.push('p:disabled="true"');
  if (tag.notes) parts.push(`p:notes="${xmlEscapeAttr(tag.notes)}"`);
  if (tag.type === 'list') {
    if (tag.listStyle && tag.listStyle !== 'unordered') {
      parts.push(`p:listStyle="${tag.listStyle}"`);
    }
    if (tag.listChildName && tag.listChildName !== 'item') {
      parts.push(`p:listChildName="${xmlEscapeAttr(tag.listChildName)}"`);
    }
  }
  return parts.join(' ');
};

// Clean mode: text content kept raw so `<id>` labels and chip expansions render
// literally. Promptly mode: wrap text in CDATA when it contains XML-significant
// chars, so the `.xml` file remains strictly valid for round-trip.
const wrapTextContent = (raw: string, mode: RenderMode): string => {
  if (mode === 'clean') return raw;
  if (/[<>&]/.test(raw)) return cdata(raw);
  return raw;
};

const indentLines = (text: string, pad: string): string =>
  text.split('\n').map((l) => pad + l).join('\n');

const renderTag = (
  tag: Tag,
  tags: TagsState,
  mode: RenderMode,
  level: number,
): string => {
  const pad = INDENT.repeat(level);
  const meta = mode === 'promptly' ? ' ' + metaAttrs(tag) : '';

  switch (tag.type) {
    case 'text': {
      const trimmed = tag.textValue.trim();
      if (trimmed.length === 0) {
        return `${pad}<${tag.id}${meta}></${tag.id}>`;
      }
      const content = wrapTextContent(expandRefs(trimmed, tags), mode);
      const childPad = pad + INDENT;
      return `${pad}<${tag.id}${meta}>\n${indentLines(content, childPad)}\n${pad}</${tag.id}>`;
    }
    case 'checkbox': {
      const v = tag.checkboxValue ? 'true' : 'false';
      return `${pad}<${tag.id}${meta}>${v}</${tag.id}>`;
    }
    case 'list': {
      const items = tag.listValue
        .map((v) => ({ ...v, text: v.text.trim() }))
        .filter((v) => v.text.length > 0);
      if (items.length === 0) {
        return `${pad}<${tag.id}${meta}></${tag.id}>`;
      }
      const style = tag.listStyle ?? 'unordered';
      const childPad = pad + INDENT;
      let inner: string;
      if (style === 'xml') {
        const childName =
          tag.listChildName && isValidXmlName(tag.listChildName)
            ? tag.listChildName
            : 'item';
        inner = items
          .map((it, i) => {
            const content = wrapTextContent(expandRefs(it.text, tags), mode);
            return `${childPad}<${childName} id="${i + 1}">${content}</${childName}>`;
          })
          .join('\n');
      } else if (style === 'ordered') {
        inner = items
          .map((it, i) => {
            const content = wrapTextContent(expandRefs(it.text, tags), mode);
            return `${childPad}${i + 1}. ${content}`;
          })
          .join('\n');
      } else if (style === 'checked') {
        inner = items
          .map((it) => {
            const content = wrapTextContent(expandRefs(it.text, tags), mode);
            const mark = it.checked ? '[x]' : '[ ]';
            return `${childPad}${mark} ${content}`;
          })
          .join('\n');
      } else {
        inner = items
          .map((it) => {
            const content = wrapTextContent(expandRefs(it.text, tags), mode);
            return `${childPad}- ${content}`;
          })
          .join('\n');
      }
      return `${pad}<${tag.id}${meta}>\n${inner}\n${pad}</${tag.id}>`;
    }
    case 'example': {
      const examples = tag.exampleValue
        .map((e) => ({ ...e, input: e.input.trim(), output: e.output.trim() }))
        .filter((e) => e.input.length > 0 || e.output.length > 0);
      if (examples.length === 0) {
        return `${pad}<${tag.id}${meta}></${tag.id}>`;
      }
      const childPad = pad + INDENT;
      const grandPad = childPad + INDENT;
      const inner = examples
        .map((e) => {
          const greatPad = grandPad + INDENT;
          const renderField = (name: 'input' | 'output', raw: string) => {
            if (raw.length === 0) return `${grandPad}<${name}></${name}>`;
            const content = wrapTextContent(expandRefs(raw, tags), mode);
            return `${grandPad}<${name}>\n${indentLines(content, greatPad)}\n${grandPad}</${name}>`;
          };
          return [
            `${childPad}<example>`,
            renderField('input', e.input),
            renderField('output', e.output),
            `${childPad}</example>`,
          ].join('\n');
        })
        .join('\n');
      return `${pad}<${tag.id}${meta}>\n${inner}\n${pad}</${tag.id}>`;
    }
    case 'group': {
      const childUuids = (tags.childOrder[tag.uuid] ?? [])
        .map((u) => tags.byUuid[u])
        .filter((c): c is Tag => Boolean(c) && !c.disabled);
      if (childUuids.length === 0) {
        return `${pad}<${tag.id}${meta}></${tag.id}>`;
      }
      const inner = childUuids
        .map((c) => renderTag(c, tags, mode, level + 1))
        .join('\n');
      return `${pad}<${tag.id}${meta}>\n${inner}\n${pad}</${tag.id}>`;
    }
    default:
      return '';
  }
};

export const renderPrompt = (input: RenderInput, mode: RenderMode): string => {
  const { tags, settings } = input;
  const ordered = tags.rootOrder
    .map((u) => tags.byUuid[u])
    .filter((t): t is Tag => Boolean(t) && !t.disabled);

  const body = ordered.filter((t) => !t.pinned);
  const pinned = ordered.filter((t) => t.pinned);

  const ns = mode === 'promptly' ? ' xmlns:p="urn:promptly"' : '';
  const lines: string[] = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push(`<prompt${ns}>`);

  if (settings.role.trim()) {
    const tag = mode === 'promptly' ? 'p:role' : 'role';
    const raw = settings.role.trim();
    const content = wrapTextContent(raw, mode);
    const childPad = INDENT + INDENT;
    lines.push(`${INDENT}<${tag}>\n${indentLines(content, childPad)}\n${INDENT}</${tag}>`);
  }

  for (const t of body) {
    lines.push(renderTag(t, tags, mode, 1));
  }
  for (const t of pinned) {
    lines.push(renderTag(t, tags, mode, 1));
  }

  if (settings.thinkStepByStep) {
    const tag = mode === 'promptly' ? 'p:directive' : 'directive';
    lines.push(`${INDENT}<${tag}>Think step by step.</${tag}>`);
  }
  if (settings.selfCritique) {
    const tag = mode === 'promptly' ? 'p:critique' : 'critique';
    lines.push(`${INDENT}<${tag}>${SELF_CRITIQUE_TEXT}</${tag}>`);
  }

  lines.push('</prompt>');
  return lines.join('\n');
};

export const wrapAsMarkdown = (xml: string): string => '```xml\n' + xml + '\n```';
