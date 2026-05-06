import type { Middleware } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';
import type { ListItem, Tag, TagsState } from '@/features/tags/types';
import type { SettingsState } from '@/features/settings/settingsSlice';
import type { LibraryState } from '@/features/library/types';

const KEY_DRAFT = 'promptly:draft';
const KEY_LIBRARY = 'promptly:library';
const DEBOUNCE_MS = 300;

interface DraftSnapshot {
  tags: TagsState;
  settings: SettingsState;
}

interface PersistedShape {
  tags: TagsState;
  settings: SettingsState;
  library: LibraryState;
}

const SKIP_ACTION_TYPES = new Set([
  'tags/replaceAll',
  'settings/replaceAll',
  'library/replaceAll',
]);

// Migrate a tag from any earlier shape to the current Tag interface.
const migrateTag = (raw: Record<string, unknown>): Tag => {
  const t = raw as Partial<Tag> & { listValue?: unknown };
  const listValueRaw = t.listValue;
  let listValue: ListItem[];
  if (Array.isArray(listValueRaw)) {
    if (listValueRaw.length === 0) {
      listValue = [{ uuid: nanoid(), text: '', checked: false }];
    } else if (typeof listValueRaw[0] === 'string') {
      listValue = (listValueRaw as unknown as string[]).map((text) => ({
        uuid: nanoid(),
        text,
        checked: false,
      }));
    } else {
      listValue = (listValueRaw as ListItem[]).map((i) => ({
        uuid: i.uuid ?? nanoid(),
        text: i.text ?? '',
        checked: Boolean(i.checked),
      }));
    }
  } else {
    listValue = [{ uuid: nanoid(), text: '', checked: false }];
  }
  return {
    uuid: t.uuid ?? nanoid(),
    id: t.id ?? 'tag',
    type: (t.type as Tag['type']) ?? 'text',
    parentUuid: (t.parentUuid as string | null | undefined) ?? null,
    textValue: t.textValue ?? '',
    checkboxValue: Boolean(t.checkboxValue),
    listValue,
    listStyle: (t.listStyle as Tag['listStyle']) ?? 'unordered',
    listChildName: (t.listChildName as string) ?? 'item',
    exampleValue:
      Array.isArray(t.exampleValue) && t.exampleValue.length > 0
        ? t.exampleValue.map((e) => ({
            uuid: e.uuid ?? nanoid(),
            input: e.input ?? '',
            output: e.output ?? '',
          }))
        : [{ uuid: nanoid(), input: '', output: '' }],
    pinned: Boolean(t.pinned),
    disabled: Boolean(t.disabled),
    notes: t.notes ?? '',
  };
};

const migrateTagsState = (raw: Record<string, unknown>): TagsState => {
  const byUuidRaw = (raw.byUuid as Record<string, unknown>) ?? {};
  const byUuid: Record<string, Tag> = {};
  for (const [uuid, t] of Object.entries(byUuidRaw)) {
    byUuid[uuid] = { ...migrateTag(t as Record<string, unknown>), uuid };
  }
  let rootOrder: string[] = [];
  let childOrder: Record<string, string[]> = {};
  if (Array.isArray(raw.rootOrder)) {
    rootOrder = (raw.rootOrder as string[]).filter((u) => byUuid[u]);
    childOrder = {};
    if (raw.childOrder && typeof raw.childOrder === 'object') {
      for (const [parent, kids] of Object.entries(raw.childOrder as Record<string, string[]>)) {
        if (byUuid[parent]) {
          childOrder[parent] = (kids ?? []).filter((u) => byUuid[u]);
        }
      }
    }
  } else if (Array.isArray(raw.order)) {
    // Legacy shape — flat order, all top-level.
    rootOrder = (raw.order as string[]).filter((u) => byUuid[u]);
    for (const u of rootOrder) byUuid[u].parentUuid = null;
  }
  return { byUuid, rootOrder, childOrder };
};

export const loadDraft = (): DraftSnapshot | null => {
  try {
    const raw = localStorage.getItem(KEY_DRAFT);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { tags?: Record<string, unknown>; settings?: SettingsState };
    return {
      tags: parsed.tags ? migrateTagsState(parsed.tags) : { byUuid: {}, rootOrder: [], childOrder: {} },
      settings:
        parsed.settings ??
        ({ role: '', thinkStepByStep: false, selfCritique: false, copyMode: 'raw' } as SettingsState),
    };
  } catch {
    return null;
  }
};

export const loadLibrary = (): LibraryState | null => {
  try {
    const raw = localStorage.getItem(KEY_LIBRARY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LibraryState;
    if (!parsed?.items) return parsed;
    parsed.items = parsed.items.map((item) => ({
      ...item,
      payload: {
        ...item.payload,
        tags: migrateTagsState(item.payload.tags as unknown as Record<string, unknown>),
      },
    }));
    return parsed;
  } catch {
    return null;
  }
};

let draftTimer: ReturnType<typeof setTimeout> | null = null;
let libraryTimer: ReturnType<typeof setTimeout> | null = null;

export const persistenceMiddleware: Middleware<object, PersistedShape> = (store) => (next) => (action) => {
  const result = next(action);
  const type = (action as { type?: string }).type ?? '';
  if (SKIP_ACTION_TYPES.has(type)) return result;

  if (type.startsWith('tags/') || type.startsWith('settings/')) {
    if (draftTimer) clearTimeout(draftTimer);
    draftTimer = setTimeout(() => {
      try {
        const state = store.getState();
        const snapshot: DraftSnapshot = { tags: state.tags, settings: state.settings };
        localStorage.setItem(KEY_DRAFT, JSON.stringify(snapshot));
      } catch {
        /* ignore quota errors */
      }
    }, DEBOUNCE_MS);
  }

  if (type.startsWith('library/')) {
    if (libraryTimer) clearTimeout(libraryTimer);
    libraryTimer = setTimeout(() => {
      try {
        const state = store.getState();
        localStorage.setItem(KEY_LIBRARY, JSON.stringify(state.library));
      } catch {
        /* ignore */
      }
    }, DEBOUNCE_MS);
  }

  return result;
};
