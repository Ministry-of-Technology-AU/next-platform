'use client';

import { useState } from 'react';
import { ChevronRight, Folder, FolderOpen, Heart } from 'lucide-react';
import { haptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import { FAVOURITES_VIEW, type WikiFolder } from '../types';

interface FolderTreeProps {
  folders: WikiFolder[];
  view: string;
  favouriteCount: number;
  onSelect: (view: string) => void;
}

const ROW =
  'flex min-h-11 w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none';
const ACTIVE = 'bg-primary/10 font-semibold text-primary dark:text-primary-bright';

export function FolderTree({ folders, view, favouriteCount, onSelect }: FolderTreeProps) {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set(['academic']));
  const roots = folders.filter((f) => f.parentId === null);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  const select = (id: string) => {
    void haptic.select();
    onSelect(id);
  };

  return (
    <nav aria-label="Folders" className="flex flex-col gap-1">
      <p className="px-3 pb-1 text-sm text-muted-foreground">Folders</p>

      <button
        type="button"
        onClick={() => select(FAVOURITES_VIEW)}
        aria-current={view === FAVOURITES_VIEW ? 'page' : undefined}
        className={cn(ROW, view === FAVOURITES_VIEW && ACTIVE)}
      >
        <Heart className="size-4 shrink-0" aria-hidden />
        <span className="flex-1">Favourites</span>
        {favouriteCount > 0 && <span className="text-xs text-muted-foreground">{favouriteCount}</span>}
      </button>

      {roots.map((root) => {
        const children = folders.filter((f) => f.parentId === root.id);
        const isOpen = expanded.has(root.id);
        const Icon = isOpen && children.length > 0 ? FolderOpen : Folder;

        return (
          <div key={root.id}>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => {
                  select(root.id);
                  if (children.length > 0 && !isOpen) toggle(root.id);
                }}
                aria-current={view === root.id ? 'page' : undefined}
                className={cn(ROW, 'flex-1', view === root.id && ACTIVE)}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="flex-1">{root.name}</span>
              </button>
              {children.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    void haptic.tap();
                    toggle(root.id);
                  }}
                  aria-expanded={isOpen}
                  aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${root.name}`}
                  className="flex size-11 shrink-0 items-center justify-center rounded-md outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <ChevronRight className={cn('size-4 transition-transform motion-reduce:transition-none', isOpen && 'rotate-90')} />
                </button>
              )}
            </div>

            {isOpen && children.length > 0 && (
              <div className="ml-5 flex flex-col gap-0.5 border-l pl-2">
                {children.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => select(child.id)}
                    aria-current={view === child.id ? 'page' : undefined}
                    className={cn(ROW, view === child.id && ACTIVE)}
                  >
                    <Folder className="size-4 shrink-0" aria-hidden />
                    {child.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
