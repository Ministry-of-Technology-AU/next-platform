'use client';

import { useState } from 'react';
import {
  Plus,
  Settings2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ConditionEditor } from './condition-editor';
import type { FormSchema, RuleGroup } from '@/lib/forms/schema';

interface PageFooterProps {
  schema: FormSchema;
  selectedPageId: string;
  onSelect: (pageId: string) => void;
  onAdd: () => void;
  onUpdatePage: (pageId: string, patch: { title?: string; visibleWhen?: RuleGroup | undefined }) => void;
  onDeletePage: (pageId: string) => void;
  onReorder: (activeId: string, overId: string) => void;
}

export function PageFooter({
  schema,
  selectedPageId,
  onSelect,
  onAdd,
  onUpdatePage,
  onDeletePage,
  onReorder,
}: PageFooterProps) {
  const pages = schema.pages;
  const currentIndex = Math.max(0, pages.findIndex((p) => p.id === selectedPageId));
  const currentPage = pages[currentIndex] ?? pages[0];
  const [popoverOpenPageId, setPopoverOpenPageId] = useState<string | null>(null);

  const prevPage = () => {
    if (currentIndex > 0) onSelect(pages[currentIndex - 1].id);
  };

  const nextPage = () => {
    if (currentIndex < pages.length - 1) onSelect(pages[currentIndex + 1].id);
  };

  return (
    <footer className="flex-shrink-0 z-30 flex items-center justify-between gap-3 border-t border-border/80 bg-card/95 px-3 py-2 backdrop-blur-md sm:px-5">
      {/* Left: Page Stepper & Index */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-muted-foreground mr-1">
          <Layers className="h-3.5 w-3.5" />
          <span>
            Page {currentIndex + 1} of {pages.length}
          </span>
        </div>

        <div className="flex items-center gap-0.5 rounded-lg border border-border/60 bg-muted/40 p-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md text-muted-foreground hover:bg-background hover:text-foreground disabled:opacity-40"
            disabled={currentIndex === 0}
            onClick={prevPage}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md text-muted-foreground hover:bg-background hover:text-foreground disabled:opacity-40"
            disabled={currentIndex === pages.length - 1}
            onClick={nextPage}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Center: Scrollable Page Pills List */}
      <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 overflow-x-auto px-2 py-0.5 scrollbar-none">
        {pages.map((page, index) => {
          const active = page.id === selectedPageId;
          const hasCondition = !!page.visibleWhen && page.visibleWhen.rules.length > 0;

          return (
            <div key={page.id} className="relative flex items-center flex-shrink-0">
              <button
                type="button"
                onClick={() => onSelect(page.id)}
                className={`group flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-150 active:scale-[0.98] ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                    active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-background/80 text-muted-foreground'
                  }`}
                >
                  {index + 1}
                </span>

                <span className="max-w-[120px] truncate sm:max-w-[180px]">
                  {page.title || `Page ${index + 1}`}
                </span>

                {hasCondition && (
                  <span
                    className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                      active
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-primary/10 text-primary'
                    }`}
                    title="This page has conditional visibility rules"
                  >
                    <GitBranch className="h-2.5 w-2.5" />
                    Logic
                  </span>
                )}
              </button>

              {active && (
                <Popover
                  open={popoverOpenPageId === page.id}
                  onOpenChange={(open) => setPopoverOpenPageId(open ? page.id : null)}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="ml-1 h-7 w-7 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label="Page settings & logic"
                    >
                      <Settings2 className="h-3.5 w-3.5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="center" side="top" className="w-84 max-w-[95vw] space-y-4 p-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <div className="flex items-center gap-1.5 font-semibold text-sm text-foreground">
                        <Settings2 className="h-4 w-4 text-primary" />
                        Page {index + 1} Settings & Logic
                      </div>
                      {hasCondition && (
                        <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                          <GitBranch className="h-3 w-3" />
                          Conditional
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Page title</label>
                      <Input
                        value={page.title ?? ''}
                        placeholder={`Page ${index + 1}`}
                        className="h-8 text-xs"
                        onChange={(e) => onUpdatePage(page.id, { title: e.target.value })}
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Displayed in multi-page stepper and respondent headers.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Page order</label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 flex-1 gap-1 text-xs"
                          disabled={index === 0}
                          onClick={() => onReorder(page.id, pages[index - 1].id)}
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                          Move earlier
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 flex-1 gap-1 text-xs"
                          disabled={index === pages.length - 1}
                          onClick={() => onReorder(page.id, pages[index + 1].id)}
                        >
                          Move later
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="border-t border-border pt-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                          <GitBranch className="h-3.5 w-3.5 text-primary" />
                          Visibility Branching Logic
                        </span>
                      </div>
                      <ConditionEditor
                        schema={schema}
                        currentPageId={page.id}
                        ownerId={null}
                        isPage
                        group={page.visibleWhen}
                        onChange={(group) => onUpdatePage(page.id, { visibleWhen: group })}
                      />
                    </div>

                    {pages.length > 1 && (
                      <div className="border-t border-border pt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-full gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => {
                            setPopoverOpenPageId(null);
                            onDeletePage(page.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete this page
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              )}
            </div>
          );
        })}
      </div>

      {/* Right: Add Page Button & Page Blocks Summary */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="hidden md:inline-block text-[11px] font-medium text-muted-foreground">
          {currentPage ? `${currentPage.blocks.length} ${currentPage.blocks.length === 1 ? 'block' : 'blocks'}` : ''}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          className="h-8 gap-1.5 rounded-xl border-dashed border-border/80 px-2.5 text-xs font-semibold hover:border-primary hover:bg-primary/5 hover:text-primary active:scale-[0.98]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Add</span> Page
        </Button>
      </div>
    </footer>
  );
}
