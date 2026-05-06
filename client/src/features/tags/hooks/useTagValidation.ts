import { useMemo } from 'react';
import { useAppSelector } from '@/app/hooks';
import { REF_REGEX, type Tag, type TagsState } from '@/features/tags/types';
import { isValidXmlName, xmlNameError } from '@/utils/xmlName';

export type IssueLevel = 'error' | 'warning';

export interface TagIssue {
  level: IssueLevel;
  message: string;
}

export interface ValidationResult {
  byUuid: Record<string, TagIssue[]>;
  totalErrors: number;
  totalWarnings: number;
}

const collectRefs = (text: string): string[] => {
  const out: string[] = [];
  REF_REGEX.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = REF_REGEX.exec(text)) !== null) out.push(m[1]);
  return out;
};

const tagOutgoingRefs = (tag: Tag): string[] => {
  switch (tag.type) {
    case 'text':
      return collectRefs(tag.textValue);
    case 'list':
      return tag.listValue.flatMap((i) => collectRefs(i.text));
    case 'example':
      return tag.exampleValue.flatMap((e) => [...collectRefs(e.input), ...collectRefs(e.output)]);
    default:
      return [];
  }
};

export const validateTags = (state: TagsState): ValidationResult => {
  const byUuid: Record<string, TagIssue[]> = {};
  const idCounts = new Map<string, number>();
  for (const t of Object.values(state.byUuid)) {
    idCounts.set(t.id, (idCounts.get(t.id) ?? 0) + 1);
  }
  const known = new Set(Object.keys(state.byUuid));

  for (const t of Object.values(state.byUuid)) {
    const issues: TagIssue[] = [];
    const idErr = xmlNameError(t.id);
    if (idErr) issues.push({ level: 'error', message: idErr });
    if ((idCounts.get(t.id) ?? 0) > 1 && isValidXmlName(t.id)) {
      issues.push({ level: 'error', message: `Duplicate ID "${t.id}".` });
    }
    if (t.type === 'list' && t.listStyle === 'xml' && !isValidXmlName(t.listChildName)) {
      issues.push({ level: 'error', message: 'List child element name is not a valid XML name.' });
    }
    const refs = tagOutgoingRefs(t);
    for (const r of refs) {
      if (r === t.uuid) continue;
      if (!known.has(r)) {
        issues.push({ level: 'warning', message: 'Reference points to a missing tag.' });
        break;
      }
    }
    const empty =
      (t.type === 'text' && t.textValue.trim().length === 0) ||
      (t.type === 'list' && t.listValue.every((i) => i.text.trim().length === 0)) ||
      (t.type === 'example' &&
        t.exampleValue.every((e) => !e.input.trim() && !e.output.trim())) ||
      (t.type === 'group' && (state.childOrder[t.uuid] ?? []).length === 0);
    if (empty) issues.push({ level: 'warning', message: 'Empty value.' });
    byUuid[t.uuid] = issues;
  }
  let totalErrors = 0;
  let totalWarnings = 0;
  for (const list of Object.values(byUuid)) {
    for (const i of list) {
      if (i.level === 'error') totalErrors += 1;
      else totalWarnings += 1;
    }
  }
  return { byUuid, totalErrors, totalWarnings };
};

export const useTagValidation = (): ValidationResult => {
  const state = useAppSelector((s) => s.tags);
  return useMemo(() => validateTags(state), [state]);
};
