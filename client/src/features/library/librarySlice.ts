import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';
import type { LibraryKind, LibraryState, PromptlyFile, SavedItem } from './types';

const initialState: LibraryState = { items: [] };

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    save: {
      reducer: (state, action: PayloadAction<SavedItem>) => {
        const clash = state.items.some(
          (i) => i.kind === action.payload.kind && i.name === action.payload.name,
        );
        if (clash) return;
        state.items.unshift(action.payload);
      },
      prepare: (input: { name: string; kind: LibraryKind; payload: PromptlyFile }) => ({
        payload: {
          uuid: nanoid(),
          name: input.name,
          kind: input.kind,
          createdAt: new Date().toISOString(),
          payload: input.payload,
        } satisfies SavedItem,
      }),
    },
    rename(state, action: PayloadAction<{ uuid: string; name: string }>) {
      const it = state.items.find((i) => i.uuid === action.payload.uuid);
      if (!it) return;
      const clash = state.items.some(
        (i) =>
          i.uuid !== action.payload.uuid &&
          i.kind === it.kind &&
          i.name === action.payload.name,
      );
      if (clash) return;
      it.name = action.payload.name;
    },
    duplicate(state, action: PayloadAction<string>) {
      const src = state.items.find((i) => i.uuid === action.payload);
      if (!src) return;
      const used = new Set(
        state.items.filter((i) => i.kind === src.kind).map((i) => i.name),
      );
      let copyName = `${src.name} (copy)`;
      let n = 2;
      while (used.has(copyName)) {
        copyName = `${src.name} (copy ${n})`;
        n += 1;
      }
      const copy: SavedItem = {
        ...src,
        uuid: nanoid(),
        name: copyName,
        createdAt: new Date().toISOString(),
      };
      const idx = state.items.findIndex((i) => i.uuid === action.payload);
      state.items.splice(idx + 1, 0, copy);
    },
    remove(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.uuid !== action.payload);
    },
    replaceAll(_state, action: PayloadAction<LibraryState>) {
      return action.payload;
    },
  },
});

export const libraryActions = librarySlice.actions;
export const libraryReducer = librarySlice.reducer;
