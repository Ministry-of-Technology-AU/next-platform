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
import { GripVertical, Copy, Trash2, GitBranch, Plus, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isInputBlock, type FormBlock, type FormPage } from '@/lib/forms/schema';
import { BLOCK_META } from './block-meta';
import { BlockPreview } from './block-preview';

interface BuilderCanvasProps {
  page: FormPage;
  selectedBlockId: string | null;
  isFormActive?: boolean;
  onSelect: (blockId: string) => void;
  onDuplicate: (blockId: string) => void;
  onDelete: (blockId: string) => void;
  onReorder: (activeId: string, overId: string) => void;
  onAddFirst: () => void;
}

export function BuilderCanvas({
  page,
  selectedBlockId,
  isFormActive = false,
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
      <div className="flex min-h-[45vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-background/50 p-8 text-center backdrop-blur-xs transition-all">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground shadow-xs">
          {isFormActive ? <Lock className="h-6 w-6 text-amber-500" /> : <Plus className="h-6 w-6 text-primary" />}
        </div>
        <p className="mt-3 text-base font-semibold text-foreground">This page is empty</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          {isFormActive
            ? 'This form is live. You can add text, headings, images, or dividers from the palette.'
            : 'Add a block from the palette to start building your questions and content.'}
        </p>
        <Button onClick={onAddFirst} variant="default" size="sm" className="mt-5 gap-1.5 shadow-xs">
          <Plus className="h-4 w-4" />
          {isFormActive ? 'Add content block' : 'Add a question'}
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
        <div className="space-y-3 pb-8">
          {page.blocks.map((block) => (
            <SortableBlockCard
              key={block.id}
              block={block}
              isFormActive={isFormActive}
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
          <div className="rounded-xl border border-primary/50 bg-card p-4 opacity-95 shadow-xl ring-2 ring-primary/20">
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
        className={`flex h-7 w-6 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors ${
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        } hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
        {...dragHandleProps}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-0.5 text-xs font-semibold text-foreground">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        {meta.label}
      </span>
      {isInputBlock(block) && block.required && (
        <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
          Required
        </span>
      )}
      {hasCondition && (
        <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
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
  isFormActive,
  onSelect,
  onDuplicate,
  onDelete,
}: {
  block: FormBlock;
  selected: boolean;
  isFormActive: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const isInput = isInputBlock(block);
  // Hide duplicate if form is active and block is a question
  const canDuplicate = !(isFormActive && isInput);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={onSelect}
      className={`group relative cursor-pointer rounded-xl p-3.5 sm:p-5 transition-all duration-150 ${
        selected
          ? 'bg-card ring-2 ring-primary/40 shadow-sm border border-primary/20'
          : 'bg-card/40 border border-border/50 hover:bg-card hover:border-border/80 hover:shadow-xs'
      } ${isDragging ? 'opacity-30' : ''}`}
    >
      <div className="mb-2.5 flex items-center justify-between">
        <BlockCardHeader block={block} dragHandleProps={{ ...attributes, ...listeners }} />
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100">
          {canDuplicate && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Duplicate block"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label="Delete block"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="pointer-events-none select-none pl-7 sm:pl-8">
        <BlockPreview block={block} />
      </div>
    </div>
  );
}
