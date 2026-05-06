import type { Tag } from '@/features/tags/types';
import type { TagIssue } from '@/features/tags/hooks/useTagValidation';

export interface TagItemProps {
  tag: Tag;
  issues: TagIssue[];
  isGroupTarget?: boolean;
}
