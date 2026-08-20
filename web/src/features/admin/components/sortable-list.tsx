// Lista reordenável por arrasto com alça dedicada.

import { Reorder, useDragControls } from 'motion/react';
import { GripVertical } from 'lucide-react';
import type { ReactNode } from 'react';
import { useI18n } from '@/shared/i18n/i18n-provider';

interface SortableItemProps {
  value: { id: string };
  children: ReactNode;
}

function SortableItem({ value, children }: SortableItemProps) {
  const controls = useDragControls();
  const { t } = useI18n();

  return (
    <Reorder.Item
      value={value}
      dragListener={false}
      dragControls={controls}
      className="row-hover flex items-center gap-3 border-b border-rule bg-canvas py-3 pl-2 pr-1"
      whileDrag={{ boxShadow: 'var(--shadow-overlay)', zIndex: 10 }}
    >
      <button
        type="button"
        onPointerDown={(event) => controls.start(event)}
        aria-label={t.admin.actions.dragToReorder}
        className="cursor-grab touch-none p-1 text-ink-muted/60 transition-colors hover:text-ink active:cursor-grabbing"
      >
        <GripVertical className="size-4" aria-hidden="true" />
      </button>

      <div className="min-w-0 flex-1">{children}</div>
    </Reorder.Item>
  );
}

interface SortableListProps<T extends { id: string }> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T) => ReactNode;
}

export function SortableList<T extends { id: string }>({ items, onReorder, renderItem }: SortableListProps<T>) {
  return (
    <Reorder.Group axis="y" values={items} onReorder={onReorder} className="border-t border-rule">
      {items.map((item) => (
        <SortableItem key={item.id} value={item}>
          {renderItem(item)}
        </SortableItem>
      ))}
    </Reorder.Group>
  );
}
