import { nanoid } from 'nanoid';
import type {
  ExampleItem,
  InputType,
  ListItem,
  ListStyle,
  Tag,
  TagsState,
} from '@/features/tags/types';
import { REF_REGEX } from '@/features/tags/types';
import type { SettingsState, CopyMode } from '@/features/settings/settingsSlice';

const NS = 'urn:promptly';

export interface ImportResult {
  tags: TagsState;
  settings: SettingsState;
}

export class ImportError extends Error {}

const blankTag = (id: string, type: InputType, parentUuid: string | null = null): Tag => ({
  uuid: nanoid(),
  id,
  type,
  parentUuid,
  textValue: '',
  checkboxValue: false,
  listValue: [{ uuid: nanoid(), text: '', checked: false }],
  listStyle: 'unordered',
  listChildName: 'item',
  exampleValue: [{ uuid: nanoid(), input: '', output: '' }],
  pinned: false,
  disabled: false,
  notes: '',
});

const attrPromptly = (el: Element, name: string): string | null =>
  el.getAttributeNS(NS, name) ?? el.getAttribute(`p:${name}`);

const elementChildren = (el: Element): Element[] => Array.from(el.children) as Element[];

const isPromptlyEl = (el: Element, localName: string): boolean =>
  el.namespaceURI === NS && el.localName === localName;

const directTextOnly = (el: Element): string => {
  let out = '';
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.CDATA_SECTION_NODE) {
      out += node.textContent ?? '';
    }
  }
  return out;
};

const SELF_CRITIQUE_TEXT =
  'After your answer, critique it. List 3 things that might be wrong, weak, or missing.';

const SETTINGS_LOCAL = new Set(['role', 'directive', 'critique']);

const isSettingsEl = (el: Element): boolean =>
  el.namespaceURI === NS && SETTINGS_LOCAL.has(el.localName);

const inferType = (el: Element): InputType => {
  const kids = elementChildren(el);
  if (kids.length === 0) {
    const txt = directTextOnly(el).trim().toLowerCase();
    if (txt === 'true' || txt === 'false') return 'checkbox';
    return 'text';
  }
  if (kids.every((k) => k.localName === 'example')) return 'example';
  // No reliable way to tell list vs group from raw XML — default to group.
  return 'group';
};

interface ParseContext {
  byUuid: Record<string, Tag>;
  childOrder: Record<string, string[]>;
  rootOrder: string[];
}

const parseList = (el: Element, tag: Tag): void => {
  const styleAttr = attrPromptly(el, 'listStyle');
  if (
    styleAttr === 'ordered' ||
    styleAttr === 'xml' ||
    styleAttr === 'unordered' ||
    styleAttr === 'checked'
  ) {
    tag.listStyle = styleAttr as ListStyle;
  }
  const childNameAttr = attrPromptly(el, 'listChildName');
  if (childNameAttr) tag.listChildName = childNameAttr;

  const xmlChildren = elementChildren(el);
  if (xmlChildren.length > 0) {
    // XML-style list with named children.
    const childName = xmlChildren[0].localName;
    if (!childNameAttr) tag.listChildName = childName;
    if (!styleAttr) tag.listStyle = 'xml';
    tag.listValue = xmlChildren.map((c) => ({
      uuid: nanoid(),
      text: directTextOnly(c),
      checked: false,
    }));
    return;
  }

  const raw = directTextOnly(el).trim();
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const ordered: ListItem[] = [];
  const unordered: ListItem[] = [];
  const checked: ListItem[] = [];
  for (const l of lines) {
    if (/^\d+\.\s+/.test(l)) ordered.push({ uuid: nanoid(), text: l.replace(/^\d+\.\s+/, ''), checked: false });
    else if (/^\[[ xX]\]\s+/.test(l)) {
      const isChecked = /^\[[xX]\]/.test(l);
      checked.push({ uuid: nanoid(), text: l.replace(/^\[[ xX]\]\s+/, ''), checked: isChecked });
    } else if (/^[-*]\s+/.test(l)) unordered.push({ uuid: nanoid(), text: l.replace(/^[-*]\s+/, ''), checked: false });
  }
  if (checked.length > 0) {
    tag.listValue = checked;
    if (!styleAttr) tag.listStyle = 'checked';
  } else if (ordered.length > 0) {
    tag.listValue = ordered;
    if (!styleAttr) tag.listStyle = 'ordered';
  } else if (unordered.length > 0) {
    tag.listValue = unordered;
    if (!styleAttr) tag.listStyle = 'unordered';
  } else {
    tag.listValue = [{ uuid: nanoid(), text: '', checked: false }];
  }
};

const parseTag = (el: Element, parentUuid: string | null, ctx: ParseContext): Tag => {
  const id = el.localName;
  const declaredType = attrPromptly(el, 'type') as InputType | null;
  const type: InputType = declaredType ?? inferType(el);
  const tag = blankTag(id, type, parentUuid);
  tag.pinned = attrPromptly(el, 'pinned') === 'true';
  tag.disabled = attrPromptly(el, 'disabled') === 'true';
  tag.notes = attrPromptly(el, 'notes') ?? '';

  switch (type) {
    case 'text':
      tag.textValue = directTextOnly(el);
      break;
    case 'checkbox':
      tag.checkboxValue = directTextOnly(el).trim().toLowerCase() === 'true';
      break;
    case 'list':
      parseList(el, tag);
      break;
    case 'example': {
      const examples = elementChildren(el).filter(
        (c) => c.localName === 'example' || c.localName === 'ex',
      );
      const parsed: ExampleItem[] = examples.map((ex) => {
        const inputEl = elementChildren(ex).find((c) => c.localName === 'input');
        const outputEl = elementChildren(ex).find((c) => c.localName === 'output');
        return {
          uuid: nanoid(),
          input: inputEl ? directTextOnly(inputEl) : '',
          output: outputEl ? directTextOnly(outputEl) : '',
        };
      });
      tag.exampleValue =
        parsed.length > 0 ? parsed : [{ uuid: nanoid(), input: '', output: '' }];
      break;
    }
    case 'group': {
      const childIds: string[] = [];
      for (const c of elementChildren(el)) {
        const childTag = parseTag(c, tag.uuid, ctx);
        ctx.byUuid[childTag.uuid] = childTag;
        childIds.push(childTag.uuid);
      }
      if (childIds.length > 0) ctx.childOrder[tag.uuid] = childIds;
      break;
    }
  }
  return tag;
};

const remapRefs = (raw: string, idToUuid: Map<string, string>): string =>
  raw.replace(REF_REGEX, (match, key) => {
    const next = idToUuid.get(key);
    return next ? `{{ref:${next}}}` : match;
  });

const remapTagRefs = (tag: Tag, idToUuid: Map<string, string>): void => {
  switch (tag.type) {
    case 'text':
      tag.textValue = remapRefs(tag.textValue, idToUuid);
      break;
    case 'list':
      tag.listValue = tag.listValue.map((i) => ({ ...i, text: remapRefs(i.text, idToUuid) }));
      break;
    case 'example':
      tag.exampleValue = tag.exampleValue.map((e) => ({
        ...e,
        input: remapRefs(e.input, idToUuid),
        output: remapRefs(e.output, idToUuid),
      }));
      break;
  }
};

export const importPromptlyXml = (xmlText: string): ImportResult => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');
  const errEl = doc.querySelector('parsererror');
  if (errEl) throw new ImportError('Could not parse file as XML.');
  const root = doc.documentElement;
  if (!root || root.localName !== 'prompt') {
    throw new ImportError('Root element must be <prompt>.');
  }

  const settings: SettingsState = {
    role: '',
    thinkStepByStep: false,
    selfCritique: false,
    copyMode: 'raw',
  };
  const copyModeAttr = attrPromptly(root, 'copyMode');
  if (copyModeAttr === 'raw' || copyModeAttr === 'markdown') {
    settings.copyMode = copyModeAttr as CopyMode;
  }

  const ctx: ParseContext = { byUuid: {}, childOrder: {}, rootOrder: [] };

  for (const child of elementChildren(root)) {
    if (
      isPromptlyEl(child, 'role') ||
      (child.localName === 'role' && !attrPromptly(child, 'type'))
    ) {
      settings.role = directTextOnly(child);
      continue;
    }
    if (isPromptlyEl(child, 'directive')) {
      settings.thinkStepByStep = true;
      continue;
    }
    if (isPromptlyEl(child, 'critique')) {
      settings.selfCritique = true;
      continue;
    }
    if (isSettingsEl(child)) continue;
    if (
      child.localName === 'directive' &&
      directTextOnly(child).trim().toLowerCase().startsWith('think step')
    ) {
      settings.thinkStepByStep = true;
      continue;
    }
    if (
      child.localName === 'critique' &&
      directTextOnly(child).trim().startsWith(SELF_CRITIQUE_TEXT.slice(0, 12))
    ) {
      settings.selfCritique = true;
      continue;
    }
    const tag = parseTag(child, null, ctx);
    ctx.byUuid[tag.uuid] = tag;
    ctx.rootOrder.push(tag.uuid);
  }

  // Remap references that were saved as {{ref:id}} → {{ref:uuid}} using the new UUIDs.
  const idToUuid = new Map<string, string>();
  for (const t of Object.values(ctx.byUuid)) idToUuid.set(t.id, t.uuid);
  for (const t of Object.values(ctx.byUuid)) remapTagRefs(t, idToUuid);

  const tagsState: TagsState = {
    byUuid: ctx.byUuid,
    rootOrder: ctx.rootOrder,
    childOrder: ctx.childOrder,
  };

  return { tags: tagsState, settings };
};
