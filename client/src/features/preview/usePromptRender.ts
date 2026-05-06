import { useMemo } from 'react';
import { useAppSelector } from '@/app/hooks';
import { renderPrompt, type RenderMode } from './render';

export const usePromptRender = (mode: RenderMode = 'clean'): string => {
  const tags = useAppSelector((s) => s.tags);
  const settings = useAppSelector((s) => s.settings);
  return useMemo(() => renderPrompt({ tags, settings }, mode), [tags, settings, mode]);
};
