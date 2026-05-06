import type { PromptlyFile } from '@/features/library/types';
import type { SettingsState } from '@/features/settings/settingsSlice';
import type { TagsState } from '@/features/tags/types';
import { renderPrompt } from '@/features/preview/render';

export const buildPromptlyFile = (tags: TagsState, settings: SettingsState): PromptlyFile => ({
  version: 1,
  tags,
  settings,
});

export const exportPromptlyXml = (tags: TagsState, settings: SettingsState): string =>
  renderPrompt({ tags, settings }, 'promptly');
