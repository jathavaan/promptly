import { configureStore } from '@reduxjs/toolkit';
import { tagsActions, tagsReducer } from '@/features/tags/tagsSlice';
import { globalsActions, globalsReducer } from '@/features/globals/globalsSlice';
import { libraryActions, libraryReducer } from '@/features/library/librarySlice';
import { tutorialReducer } from '@/features/tutorial/tutorialSlice';
import { loadDraft, loadLibrary, persistenceMiddleware } from './persistence';

export const store = configureStore({
  reducer: {
    tags: tagsReducer,
    globals: globalsReducer,
    library: libraryReducer,
    tutorial: tutorialReducer,
  },
  middleware: (getDefault) => getDefault().concat(persistenceMiddleware),
});

const draft = loadDraft();
if (draft?.tags) store.dispatch(tagsActions.replaceAll(draft.tags));
if (draft?.globals) store.dispatch(globalsActions.replaceAll(draft.globals));
const lib = loadLibrary();
if (lib) store.dispatch(libraryActions.replaceAll(lib));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
