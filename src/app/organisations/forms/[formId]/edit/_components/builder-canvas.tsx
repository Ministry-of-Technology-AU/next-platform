'use client';

import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { GripVertical, Copy, Trash2, GitBranch, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isInputBlock, type FormBlock, type FormPage } from '@/lib/forms/schema';
import { BLOCK_META } from './block-meta';
import { BlockPreview } from './block-preview';

interface BuilderCanvasProps {
  page: FormPage;
  selectedBlockId: string | null;
  onSelect: (blockId: string) => void;
  onDuplicate: (blockId: string) => void;
  onDelete: (blockId: string) => void;
  onReorder: (activeId: string, overId: string) => void;
  onAddFirst: () => void;
}

export function BuilderCanvas({
  page,
  selectedBlockId,
  onSelect,
  onDuplicate,
  onDelete,
  onReorder,
  onAddFirst,
}: BuilderCanvasProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);
  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (over && active.id !== over.id) onReorder(active.id as string, over.id as string);
  };

  const activeBlock = page.blocks.find((b) => b.id === activeId) ?? null;

  if (page.blocks.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 text-center">
        <p className="text-sm font-medium text-foreground">This page is empty</p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Add a block from the palette, or start with a question.
        </p>
        <Button onClick={onAddFirst} variant="outline" className="mt-4 gap-1.5">
          <Plus className="h-4 w-4" />
          Add a question
        </Button>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={page.blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {page.blocks.map((block) => (
            <SortableBlockCard
              key={block.id}
              block={block}
              selected={block.id === selectedBlockId}
              onSelect={() => onSelect(block.id)}
              onDuplicate={() => onDuplicate(block.id)}
              onDelete={() => onDelete(block.id)}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeBlock ? (
          <div className="rounded-xl border border-primary bg-card p-4 opacity-90 shadow-lg">
            <BlockCardHeader block={activeBlock} dragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function BlockCardHeader({
  block,
  dragging = false,
  dragHandleProps,
}: {
  block: FormBlock;
  dragging?: boolean;
  dragHandleProps?: Record<string, unknown>;
}) {
  const meta = BLOCK_META[block.type];
  const Icon = meta.icon;
  const hasCondition = !!block.visibleWhen && block.visibleWhen.rules.length > 0;
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Drag to reorder"
        className={`flex h-7 w-6 flex-shrink-0 items-center justify-center rounded text-muted-foreground ${
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        } hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
        {...dragHandleProps}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {meta.label}
      </span>
      {isInputBlock(block) && block.required && (
        <span className="text-xs font-medium text-destructive">Required</span>
      )}
      {hasCondition && (
        <span className="flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
          <GitBranch className="h-3 w-3" />
          Logic
        </span>
      )}
    </div>
  );
}

function SortableBlockCard({
  block,
  selected,
  onSelect,
  onDuplicate,
  onDelete,
}: {
  block: FormBlock;
  selected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={onSelect}
      className={`group cursor-pointer rounded-xl border bg-card p-4 transition-shadow ${
        selected ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-muted-foreground/40'
      } ${isDragging ? 'opacity-40' : ''}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <BlockCardHeader block={block} dragHandleProps={{ ...attributes, ...listeners }} />
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Duplicate block"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            aria-label="Delete block"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="pointer-events-none select-none pl-8">
        <BlockPreview block={block} />
      </div>
    </div>
  );
}
