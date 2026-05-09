import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import Stack from '@mui/material/Stack';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { tagsActions } from './tagsSlice';
import { TagItem } from './TagItem/TagItem';
import { useTagValidation } from './hooks/useTagValidation';

export interface TagListProps {
  parentUuid: string | null;
}

const CENTER_THRESHOLD = 0.45; // center 90% of the row counts as "drop on"

export const TagList = ({ parentUuid }: TagListProps) => {
  const dispatch = useAppDispatch();
  const rawOrder = useAppSelector((s) =>
    parentUuid === null ? s.tags.rootOrder : (s.tags.childOrder[parentUuid] ?? []),
  );
  const byUuid = useAppSelector((s) => s.tags.byUuid);
  const showStatic = useAppSelector((s) => s.globals.showStaticInBuilder);
  const order = showStatic ? rawOrder : rawOrder.filter((u) => !byUuid[u]?.static);
  const validation = useTagValidation();
  const [groupTarget, setGroupTarget] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over, delta, activatorEvent } = event;
    if (!over || over.id === active.id) {
      if (groupTarget !== null) setGroupTarget(null);
      return;
    }
    const overRect = over.rect;
    if (!overRect) {
      if (groupTarget !== null) setGroupTarget(null);
      return;
    }
    const startY = (activatorEvent as PointerEvent | MouseEvent).clientY ?? 0;
    const pointerY = startY + delta.y;
    const center = overRect.top + overRect.height / 2;
    const threshold = overRect.height * CENTER_THRESHOLD;
    const next = Math.abs(pointerY - center) < threshold ? String(over.id) : null;
    if (next !== groupTarget) setGroupTarget(next);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setGroupTarget(null);
    if (!over || active.id === over.id) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (groupTarget === overId) {
      dispatch(tagsActions.mergeIntoGroup({ activeUuid: activeId, targetUuid: overId }));
      return;
    }
    const from = rawOrder.indexOf(activeId);
    const to = rawOrder.indexOf(overId);
    if (from < 0 || to < 0) return;
    dispatch(tagsActions.reorderWithinParent({ parentUuid, from, to }));
  };

  const handleDragCancel = () => setGroupTarget(null);

  if (order.length === 0) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={order} strategy={rectSortingStrategy}>
        <Stack spacing={1.25}>
          {order.map((uuid) => {
            const tag = byUuid[uuid];
            if (!tag) return null;
            return (
              <TagItem
                key={uuid}
                tag={tag}
                issues={validation.byUuid[uuid] ?? []}
                isGroupTarget={groupTarget === uuid}
              />
            );
          })}
        </Stack>
      </SortableContext>
    </DndContext>
  );
};
