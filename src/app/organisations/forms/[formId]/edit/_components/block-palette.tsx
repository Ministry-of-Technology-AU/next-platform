'use client';

import { Plus } from 'lucide-react';
import type { FormBlockType } from '@/lib/forms/schema';
import { BLOCK_META, PALETTE_GROUPS } from './block-meta';

interface BlockPaletteProps {
  onAdd: (type: FormBlockType) => void;
}

/** Left pane: grouped, click-to-add block buttons (spec §8.1). */
export function BlockPalette({ onAdd }: BlockPaletteProps) {
  return (
    <div className="space-y-6">
      {PALETTE_GROUPS.map((group) => (
        <section key={group.title}>
          <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {group.title}
          </h3>
          <div className="grid grid-cols-1 gap-1.5">
            {group.types.map((type) => {
              const meta = BLOCK_META[type];
              const Icon = meta.icon;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onAdd(type)}
                  aria-label={`Add ${meta.label}`}
                  className="group flex items-center gap-3 rounded-lg border border-transparent px-2.5 py-2 text-left transition-colors hover:border-border hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {meta.label}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">{meta.hint}</span>
                  </span>
                  <Plus className="h-4 w-4 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
