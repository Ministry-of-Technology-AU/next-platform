'use client';

import { Plus, Lock, Sparkles, Layers } from 'lucide-react';
import type { FormBlockType } from '@/lib/forms/schema';
import { BLOCK_META, PALETTE_GROUPS } from './block-meta';

interface BlockPaletteProps {
  onAdd: (type: FormBlockType) => void;
  isFormActive?: boolean;
}

/** Left pane: grouped, click-to-add block buttons (spec §8.1). */
export function BlockPalette({ onAdd, isFormActive = false }: BlockPaletteProps) {
  // If the form is active, filter out the Questions group completely
  const visibleGroups = isFormActive
    ? PALETTE_GROUPS.filter((g) => g.title !== 'Questions')
    : PALETTE_GROUPS;

  return (
    <div className="space-y-6">
      {isFormActive && (
        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-3.5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300">
              <Lock className="h-3 w-3" />
            </span>
            Form is Live
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            Question schema is locked to prevent corrupting live submissions. You can still add and edit layout & content blocks.
          </p>
        </div>
      )}

      {visibleGroups.map((group) => (
        <section key={group.title} className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {group.title === 'Content' ? (
                <Layers className="h-3 w-3" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              {group.title}
            </h3>
            <span className="text-[10px] font-medium text-muted-foreground/70">
              {group.types.length} {group.types.length === 1 ? 'type' : 'types'}
            </span>
          </div>

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
                  className="group relative flex items-center gap-3 rounded-xl border border-transparent bg-background/60 p-2 text-left transition-all duration-150 hover:border-border hover:bg-accent/70 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]"
                >
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/60 text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary">
                    <Icon className="h-4 w-4 transition-transform duration-150 group-hover:scale-110" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-foreground group-hover:text-primary">
                      {meta.label}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">{meta.hint}</span>
                  </span>
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity duration-150 group-hover:bg-background group-hover:opacity-100 group-hover:shadow-xs">
                    <Plus className="h-3.5 w-3.5" />
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
