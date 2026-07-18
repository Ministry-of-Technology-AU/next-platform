'use client';

import { Plus, Settings2, Trash2, ChevronLeft, ChevronRight, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ConditionEditor } from './condition-editor';
import type { FormSchema, RuleGroup } from '@/lib/forms/schema';

interface PageTabsProps {
  schema: FormSchema;
  selectedPageId: string;
  onSelect: (pageId: string) => void;
  onAdd: () => void;
  onUpdatePage: (pageId: string, patch: { title?: string; visibleWhen?: RuleGroup | undefined }) => void;
  onDeletePage: (pageId: string) => void;
  onReorder: (activeId: string, overId: string) => void;
}

export function PageTabs({
  schema,
  selectedPageId,
  onSelect,
  onAdd,
  onUpdatePage,
  onDeletePage,
  onReorder,
}: PageTabsProps) {
  const pages = schema.pages;

  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
      {pages.map((page, index) => {
        const active = page.id === selectedPageId;
        const hasCondition = !!page.visibleWhen && page.visibleWhen.rules.length > 0;
        return (
          <div key={page.id} className="flex flex-shrink-0 items-center">
            <button
              type="button"
              onClick={() => onSelect(page.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {hasCondition && <GitBranch className="h-3 w-3" />}
              {page.title || `Page ${index + 1}`}
            </button>

            {active && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground"
                    aria-label="Page settings"
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-80 space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Page name</label>
                    <Input
                      value={page.title ?? ''}
                      placeholder={`Page ${index + 1}`}
                      onChange={(e) => onUpdatePage(page.id, { title: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                      disabled={index === 0}
                      onClick={() => onReorder(page.id, pages[index - 1].id)}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Move left
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                      disabled={index === pages.length - 1}
                      onClick={() => onReorder(page.id, pages[index + 1].id)}
                    >
                      Move right
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="border-t border-border pt-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Page visibility</p>
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onDeletePage(page.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete page
                    </Button>
                  )}
                </PopoverContent>
              </Popover>
            )}
          </div>
        );
      })}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onAdd}
        className="flex-shrink-0 gap-1 text-muted-foreground"
      >
        <Plus className="h-4 w-4" />
        Page
      </Button>
    </div>
  );
}
