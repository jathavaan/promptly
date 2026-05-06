import { useMemo } from 'react';
import { useAppSelector } from '@/app/hooks';
import type { RefCandidate } from '@/features/tags/ReferenceInput/reference-input.types';
import { isValidXmlName } from '@/utils/xmlName';

export const useRefCandidates = (selfUuid: string): RefCandidate[] => {
  const tags = useAppSelector((s) => s.tags);
  return useMemo(
    () =>
      Object.values(tags.byUuid)
        .filter((t) => t.uuid !== selfUuid && isValidXmlName(t.id))
        .map((t) => ({ uuid: t.uuid, id: t.id })),
    [tags, selfUuid],
  );
};
