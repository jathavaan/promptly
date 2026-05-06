import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';
import type {
  ExampleItem,
  InputType,
  ListItem,
  ListStyle,
  Tag,
  TagsState,
} from './types';

const blankListItem = (): ListItem => ({ uuid: nanoid(), text: '', checked: false });

const blankTag = (
  id: string,
  type: InputType = 'text',
  parentUuid: string | null = null,
): Tag => ({
  uuid: nanoid(),
  id,
  type,
  parentUuid,
  textValue: '',
  checkboxValue: false,
  listValue: [blankListItem()],
  listStyle: 'unordered',
  listChildName: 'item',
  exampleValue: [{ uuid: nanoid(), input: '', output: '' }],
  pinned: false,
  disabled: false,
  notes: '',
});

const initialState: TagsState = { byUuid: {}, rootOrder: [], childOrder: {} };

const uniqueId = (state: TagsState, base: string): string => {
  const existing = new Set(Object.values(state.byUuid).map((t) => t.id));
  if (!existing.has(base)) return base;
  let i = 2;
  while (existing.has(`${base}${i}`)) i += 1;
  return `${base}${i}`;
};

const removeFromParent = (state: TagsState, uuid: string) => {
  const tag = state.byUuid[uuid];
  if (!tag) return;
  if (tag.parentUuid === null) {
    state.rootOrder = state.rootOrder.filter((u) => u !== uuid);
  } else {
    const arr = state.childOrder[tag.parentUuid];
    if (arr) state.childOrder[tag.parentUuid] = arr.filter((u) => u !== uuid);
  }
};

const insertInParent = (
  state: TagsState,
  uuid: string,
  parentUuid: string | null,
  index?: number,
) => {
  if (parentUuid === null) {
    if (typeof index === 'number') state.rootOrder.splice(index, 0, uuid);
    else state.rootOrder.push(uuid);
  } else {
    if (!state.childOrder[parentUuid]) state.childOrder[parentUuid] = [];
    if (typeof index === 'number') state.childOrder[parentUuid].splice(index, 0, uuid);
    else state.childOrder[parentUuid].push(uuid);
  }
};

const collectDescendants = (state: TagsState, uuid: string): string[] => {
  const result: string[] = [];
  const stack = [...(state.childOrder[uuid] ?? [])];
  while (stack.length) {
    const cur = stack.pop()!;
    result.push(cur);
    stack.push(...(state.childOrder[cur] ?? []));
  }
  return result;
};

const tagsSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    addPresetTag(
      state,
      action: PayloadAction<{ id: string; type: InputType; parentUuid?: string | null }>,
    ) {
      const id = uniqueId(state, action.payload.id);
      const parentUuid = action.payload.parentUuid ?? null;
      const tag = blankTag(id, action.payload.type, parentUuid);
      state.byUuid[tag.uuid] = tag;
      insertInParent(state, tag.uuid, parentUuid);
    },
    removeTag(state, action: PayloadAction<string>) {
      const uuid = action.payload;
      const descendants = collectDescendants(state, uuid);
      removeFromParent(state, uuid);
      delete state.byUuid[uuid];
      delete state.childOrder[uuid];
      for (const d of descendants) {
        delete state.byUuid[d];
        delete state.childOrder[d];
      }
    },
    setTagId(state, action: PayloadAction<{ uuid: string; id: string }>) {
      const t = state.byUuid[action.payload.uuid];
      if (t) t.id = action.payload.id;
    },
    setTagType(state, action: PayloadAction<{ uuid: string; type: InputType }>) {
      const t = state.byUuid[action.payload.uuid];
      if (t) t.type = action.payload.type;
    },
    setTextValue(state, action: PayloadAction<{ uuid: string; value: string }>) {
      const t = state.byUuid[action.payload.uuid];
      if (t) t.textValue = action.payload.value;
    },
    setCheckboxValue(state, action: PayloadAction<{ uuid: string; value: boolean }>) {
      const t = state.byUuid[action.payload.uuid];
      if (t) t.checkboxValue = action.payload.value;
    },
    setListStyle(state, action: PayloadAction<{ uuid: string; style: ListStyle }>) {
      const t = state.byUuid[action.payload.uuid];
      if (t) t.listStyle = action.payload.style;
    },
    setListChildName(state, action: PayloadAction<{ uuid: string; name: string }>) {
      const t = state.byUuid[action.payload.uuid];
      if (t) t.listChildName = action.payload.name;
    },
    addListItem(state, action: PayloadAction<{ uuid: string }>) {
      const t = state.byUuid[action.payload.uuid];
      if (t) t.listValue.push(blankListItem());
    },
    setListItemText(
      state,
      action: PayloadAction<{ uuid: string; itemUuid: string; text: string }>,
    ) {
      const t = state.byUuid[action.payload.uuid];
      if (!t) return;
      const item = t.listValue.find((i) => i.uuid === action.payload.itemUuid);
      if (item) item.text = action.payload.text;
    },
    setListItemChecked(
      state,
      action: PayloadAction<{ uuid: string; itemUuid: string; checked: boolean }>,
    ) {
      const t = state.byUuid[action.payload.uuid];
      if (!t) return;
      const item = t.listValue.find((i) => i.uuid === action.payload.itemUuid);
      if (item) item.checked = action.payload.checked;
    },
    removeListItem(state, action: PayloadAction<{ uuid: string; itemUuid: string }>) {
      const t = state.byUuid[action.payload.uuid];
      if (!t) return;
      t.listValue = t.listValue.filter((i) => i.uuid !== action.payload.itemUuid);
    },
    addExample(state, action: PayloadAction<{ uuid: string }>) {
      const t = state.byUuid[action.payload.uuid];
      if (t) t.exampleValue.push({ uuid: nanoid(), input: '', output: '' });
    },
    setExample(
      state,
      action: PayloadAction<{
        uuid: string;
        exampleUuid: string;
        field: 'input' | 'output';
        value: string;
      }>,
    ) {
      const t = state.byUuid[action.payload.uuid];
      if (!t) return;
      const ex = t.exampleValue.find((e) => e.uuid === action.payload.exampleUuid);
      if (ex) ex[action.payload.field] = action.payload.value;
    },
    removeExample(state, action: PayloadAction<{ uuid: string; exampleUuid: string }>) {
      const t = state.byUuid[action.payload.uuid];
      if (!t) return;
      t.exampleValue = t.exampleValue.filter((e) => e.uuid !== action.payload.exampleUuid);
    },
    setFlag(
      state,
      action: PayloadAction<{
        uuid: string;
        flag: 'pinned' | 'disabled';
        value: boolean;
      }>,
    ) {
      const t = state.byUuid[action.payload.uuid];
      if (t) t[action.payload.flag] = action.payload.value;
    },
    setNotes(state, action: PayloadAction<{ uuid: string; notes: string }>) {
      const t = state.byUuid[action.payload.uuid];
      if (t) t.notes = action.payload.notes;
    },
    reorderWithinParent(
      state,
      action: PayloadAction<{ parentUuid: string | null; from: number; to: number }>,
    ) {
      const { parentUuid, from, to } = action.payload;
      if (from === to) return;
      const arr =
        parentUuid === null
          ? state.rootOrder
          : (state.childOrder[parentUuid] ?? (state.childOrder[parentUuid] = []));
      if (from < 0 || from >= arr.length || to < 0 || to >= arr.length) return;
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
    },
    moveToParent(
      state,
      action: PayloadAction<{ uuid: string; newParentUuid: string | null; index?: number }>,
    ) {
      const { uuid, newParentUuid, index } = action.payload;
      const tag = state.byUuid[uuid];
      if (!tag) return;
      // Block moving into own descendant.
      if (newParentUuid !== null) {
        const descendants = collectDescendants(state, uuid);
        if (uuid === newParentUuid || descendants.includes(newParentUuid)) return;
        if (state.byUuid[newParentUuid]?.type !== 'group') return;
      }
      removeFromParent(state, uuid);
      tag.parentUuid = newParentUuid;
      insertInParent(state, uuid, newParentUuid, index);
    },
    // Drop one tag onto another. If the target is a group, add the active tag
    // as a child. Otherwise create a new group in the target's slot containing
    // both the target and the active tag.
    mergeIntoGroup(
      state,
      action: PayloadAction<{ activeUuid: string; targetUuid: string }>,
    ) {
      const { activeUuid, targetUuid } = action.payload;
      if (activeUuid === targetUuid) return;
      const active = state.byUuid[activeUuid];
      const target = state.byUuid[targetUuid];
      if (!active || !target) return;
      const descendants = collectDescendants(state, activeUuid);
      if (descendants.includes(targetUuid)) return;

      if (target.type === 'group') {
        removeFromParent(state, activeUuid);
        active.parentUuid = targetUuid;
        insertInParent(state, activeUuid, targetUuid);
        return;
      }

      const groupId = uniqueId(state, 'group');
      const group = blankTag(groupId, 'group', target.parentUuid);
      state.byUuid[group.uuid] = group;

      const parentArr =
        target.parentUuid === null ? state.rootOrder : state.childOrder[target.parentUuid];
      if (parentArr) {
        const idx = parentArr.indexOf(targetUuid);
        if (idx !== -1) parentArr.splice(idx, 1, group.uuid);
      }

      target.parentUuid = group.uuid;
      state.childOrder[group.uuid] = [targetUuid];

      removeFromParent(state, activeUuid);
      active.parentUuid = group.uuid;
      state.childOrder[group.uuid].push(activeUuid);
    },
    duplicateTag(state, action: PayloadAction<string>) {
      const src = state.byUuid[action.payload];
      if (!src) return;
      // Recursively copy this tag and its descendants, remapping uuids.
      const idMap = new Map<string, string>();
      const copyOne = (origUuid: string, parentUuid: string | null): Tag => {
        const orig = state.byUuid[origUuid];
        const fresh = nanoid();
        idMap.set(origUuid, fresh);
        const copy: Tag = {
          ...orig,
          uuid: fresh,
          parentUuid,
          listValue: orig.listValue.map((i) => ({ ...i, uuid: nanoid() })),
          exampleValue: orig.exampleValue.map((e) => ({ ...e, uuid: nanoid() })),
        };
        if (origUuid === src.uuid) copy.id = uniqueId(state, src.id);
        state.byUuid[fresh] = copy;
        const childUuids = state.childOrder[origUuid] ?? [];
        const newChildren: string[] = [];
        for (const cu of childUuids) newChildren.push(copyOne(cu, fresh).uuid);
        if (newChildren.length) state.childOrder[fresh] = newChildren;
        return copy;
      };
      const copy = copyOne(src.uuid, src.parentUuid);
      // Insert next to original.
      const targetArr =
        src.parentUuid === null ? state.rootOrder : state.childOrder[src.parentUuid];
      if (targetArr) {
        const idx = targetArr.indexOf(src.uuid);
        targetArr.splice(idx + 1, 0, copy.uuid);
      }
    },
    seedStarter(state) {
      // Seed a minimal starter layout per common-prompt-tag patterns.
      const make = (id: string, type: InputType, opts?: Partial<Tag>): Tag => {
        const tag: Tag = { ...blankTag(id, type, null), ...opts };
        state.byUuid[tag.uuid] = tag;
        state.rootOrder.push(tag.uuid);
        return tag;
      };
      make('context', 'text');
      make('task', 'text');
      make('rules', 'list');
      make('output_format', 'text');
      make('important', 'text', { pinned: true });
    },
    replaceAll(_state, action: PayloadAction<TagsState>) {
      return action.payload;
    },
    clearAll() {
      return initialState;
    },
  },
});

export const tagsActions = tagsSlice.actions;
export const tagsReducer = tagsSlice.reducer;
export const blankExample = (): ExampleItem => ({ uuid: nanoid(), input: '', output: '' });
