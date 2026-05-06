import type { SettingsState } from '@/features/settings/settingsSlice';
import type { TagsState } from '@/features/tags/types';

export type LibraryKind = 'prompt' | 'template';

export interface PromptlyFile {
  version: 1;
  tags: TagsState;
  settings: SettingsState;
}

export interface SavedItem {
  uuid: string;
  name: string;
  kind: LibraryKind;
  createdAt: string;
  payload: PromptlyFile;
}

export interface LibraryState {
  items: SavedItem[];
}
