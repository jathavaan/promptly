import { configureStore } from '@reduxjs/toolkit';
import { tagsActions, tagsReducer } from '@/features/tags/tagsSlice';
import { settingsActions, settingsReducer } from '@/features/settings/settingsSlice';
import { libraryActions, libraryReducer } from '@/features/library/librarySlice';
import { loadDraft, loadLibrary, persistenceMiddleware } from './persistence';

export const store = configureStore({
  reducer: {
    tags: tagsReducer,
    settings: settingsReducer,
    library: libraryReducer,
  },
  middleware: (getDefault) => getDefault().concat(persistenceMiddleware),
});

const draft = loadDraft();
if (draft?.tags) store.dispatch(tagsActions.replaceAll(draft.tags));
if (draft?.settings) store.dispatch(settingsActions.replaceAll(draft.settings));
const lib = loadLibrary();
if (lib) store.dispatch(libraryActions.replaceAll(lib));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
