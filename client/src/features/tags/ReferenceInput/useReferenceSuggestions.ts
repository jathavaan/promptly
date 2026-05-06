import { useMemo } from 'react';
import type { RefCandidate } from './reference-input.types';

export const useReferenceSuggestions = (
  candidates: RefCandidate[],
  query: string,
): RefCandidate[] =>
  useMemo(() => {
    const q = query.toLowerCase();
    const starts = candidates.filter((c) => c.id.toLowerCase().startsWith(q));
    if (starts.length > 0 || q.length === 0) return starts;
    return candidates.filter((c) => c.id.toLowerCase().includes(q));
  }, [candidates, query]);
