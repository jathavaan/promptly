import type { GlobalsState } from '@/features/globals/globalsSlice';
import type { TagsState } from '@/features/tags/types';

export type LibraryKind = 'prompt' | 'template';

export interface PromptlyFile {
  version: 1;
  tags: TagsState;
  globals: GlobalsState;
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
