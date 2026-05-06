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
      if (it) it.name = action.payload.name;
    },
    duplicate(state, action: PayloadAction<string>) {
      const src = state.items.find((i) => i.uuid === action.payload);
      if (!src) return;
      const copy: SavedItem = {
        ...src,
        uuid: nanoid(),
        name: `${src.name} (copy)`,
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
