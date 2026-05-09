import { useMemo } from 'react';
import { useAppSelector } from '@/app/hooks';
import { renderPrompt, type RenderMode } from './render';

export const usePromptRender = (mode: RenderMode = 'clean'): string => {
  const tags = useAppSelector((s) => s.tags);
  const globals = useAppSelector((s) => s.globals);
  return useMemo(() => renderPrompt({ tags, globals }, mode), [tags, globals, mode]);
};
