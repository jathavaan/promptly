import type { PromptlyFile } from '@/features/library/types';
import type { GlobalsState } from '@/features/globals/globalsSlice';
import type { TagsState } from '@/features/tags/types';
import { renderPrompt } from '@/features/preview/render';

export const buildPromptlyFile = (tags: TagsState, globals: GlobalsState): PromptlyFile => ({
  version: 1,
  tags,
  globals,
});

export const exportPromptlyXml = (tags: TagsState, globals: GlobalsState): string =>
  renderPrompt({ tags, globals }, 'promptly');
