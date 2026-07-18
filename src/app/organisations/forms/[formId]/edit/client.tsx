'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Save,
  Check,
  Loader2,
  Link2,
  Pencil,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { editorReducer, isMutating, type EditorAction, type EditorState } from './editor-reducer';
import { BlockPalette } from './_components/block-palette';
import { BuilderCanvas } from './_components/builder-canvas';
import { BlockInspector } from './_components/block-inspector';
import { PageTabs } from './_components/page-tabs';
import { ThemeEditor } from './_components/theme-editor';
import { FormSettingsSheet } from './_components/form-settings';
import { BuilderPreview } from './_components/builder-preview';
import type { FormBlock, FormBlockType, FormSchema } from '@/lib/forms/schema';
import type { FormStatus } from '@/lib/forms/strapi-forms';

interface BuilderClientProps {
  uid: string;
  initial: {
    title: string;
    status: FormStatus;
    startDate: string | null;
    endDate: string | null;
    schema: FormSchema;
    updatedAt: string | null;
  };
}

type SaveState = 'saved' | 'saving' | 'unsaved';
const AUTOSAVE_MS = 60_000;

function useIsDesktop() {
  const [desktop, setDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return desktop;
}

export function BuilderClient({ uid, initial }: BuilderClientProps) {
  const [state, rawDispatch] = useReducer(editorReducer, {
    title: initial.title,
    status: initial.status,
    startDate: initial.startDate,
    endDate: initial.endDate,
    schema: initial.schema,
    selectedPageId: initial.schema.pages[0]?.id ?? '',
    selectedBlockId: null,
  } satisfies EditorState);

  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);

  const isDesktop = useIsDesktop();
  const stateRef = useRef(state);
  stateRef.current = state;
  const dirtyRef = useRef(false);
  const past = useRef<EditorState[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const apiUrl = `/api/organisations/forms/${uid}`;
  const draftKey = `form-builder:${uid}`;
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/platform/forms/${uid}` : '';

  // Dispatch wrapper: snapshot for undo + mark dirty on mutating actions.
  const dispatch = useCallback((action: EditorAction) => {
    if (isMutating(action)) {
      past.current.push(stateRef.current);
      if (past.current.length > 50) past.current.shift();
      dirtyRef.current = true;
      setSaveState('unsaved');
    }
    rawDispatch(action);
  }, []);

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (prev) {
      rawDispatch({ type: 'REPLACE_ALL', state: prev });
      dirtyRef.current = true;
      setSaveState('unsaved');
    }
  }, []);

  // ----- Save -----
  const buildPayload = useCallback(() => {
    const s = stateRef.current;
    return {
      schema: s.schema,
      title: s.title,
      form_status: s.status,
      start_date: s.startDate,
      end_date: s.endDate,
    };
  }, []);

  const persistLocal = useCallback(() => {
    try {
      localStorage.setItem(
        draftKey,
        JSON.stringify({ state: stateRef.current, savedAt: Date.now() }),
      );
    } catch {
      /* ignore */
    }
  }, [draftKey]);

  const save = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!dirtyRef.current && !opts?.silent) {
        toast.success('Already up to date');
        return;
      }
      setSaveState('saving');
      persistLocal();
      try {
        const res = await fetch(apiUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload()),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json?.success) {
          setSaveState('unsaved');
          toast.error(json?.error ?? 'Could not save the form');
          return;
        }
        dirtyRef.current = false;
        setSaveState('saved');
        setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        try {
          localStorage.removeItem(draftKey);
        } catch {
          /* ignore */
        }
        if (!opts?.silent) toast.success('Form saved');
      } catch {
        setSaveState('unsaved');
        if (!opts?.silent) toast.error('Could not save the form');
      }
    },
    [apiUrl, buildPayload, persistLocal, draftKey],
  );

  // localStorage restore prompt on mount (newer local draft than server).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const serverTime = initial.updatedAt ? Date.parse(initial.updatedAt) : 0;
      if (parsed?.savedAt && parsed.savedAt > serverTime && parsed.state) {
        toast('Unsaved changes found', {
          description: 'Restore your local edits from last session?',
          action: {
            label: 'Restore',
            onClick: () => {
              rawDispatch({ type: 'REPLACE_ALL', state: parsed.state });
              dirtyRef.current = true;
              setSaveState('unsaved');
            },
          },
        });
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 60s debounced autosave.
  useEffect(() => {
    if (!dirtyRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void save({ silent: true }), AUTOSAVE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [state, save]);

  // Flush on tab hide (beacon → the ?beacon=1 POST alias for PUT).
  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState !== 'hidden' || !dirtyRef.current) return;
      persistLocal();
      try {
        const blob = new Blob([JSON.stringify(buildPayload())], { type: 'text/plain' });
        navigator.sendBeacon(`${apiUrl}?beacon=1`, blob);
        dirtyRef.current = false;
      } catch {
        /* ignore */
      }
    };
    document.addEventListener('visibilitychange', onHidden);
    return () => document.removeEventListener('visibilitychange', onHidden);
  }, [apiUrl, buildPayload, persistLocal]);

  // Keyboard: Cmd/Ctrl+Z undo, Cmd/Ctrl+S save.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      } else if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void save();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, save]);

  // ----- Derived -----
  const currentPage =
    state.schema.pages.find((p) => p.id === state.selectedPageId) ?? state.schema.pages[0];
  const selectedBlock: FormBlock | null = useMemo(() => {
    if (!state.selectedBlockId) return null;
    for (const page of state.schema.pages) {
      const b = page.blocks.find((bl) => bl.id === state.selectedBlockId);
      if (b) return b;
    }
    return null;
  }, [state.schema, state.selectedBlockId]);

  const addBlock = (type: FormBlockType) => {
    dispatch({ type: 'ADD_BLOCK', pageId: currentPage.id, blockType: type });
    setMobilePaletteOpen(false);
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const inspector = (
    <BlockInspector
      block={selectedBlock}
      schema={state.schema}
      currentPageId={currentPage.id}
      onUpdate={(patch) =>
        selectedBlock && dispatch({ type: 'UPDATE_BLOCK', blockId: selectedBlock.id, patch })
      }
    />
  );

  return (
    <div className="flex h-[calc(100vh-1.5rem)] flex-col">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-border pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="h-9 w-9" aria-label="Back to forms">
            <Link href="/organisations/forms">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="relative flex min-w-0 flex-1 items-center">
            <Input
              value={state.title}
              onChange={(e) => dispatch({ type: 'SET_META', patch: { title: e.target.value } })}
              className="h-9 max-w-xs border-transparent bg-transparent px-2 text-base font-semibold shadow-none hover:border-border focus-visible:border-input"
              aria-label="Form title"
            />
            <Pencil className="pointer-events-none -ml-6 h-3.5 w-3.5 text-muted-foreground" />
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={copyShareLink}
              className="gap-1.5 text-muted-foreground"
            >
              <Link2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <ThemeEditor
              theme={state.schema.theme}
              onChange={(theme) => dispatch({ type: 'SET_THEME', theme })}
            />
            <FormSettingsSheet
              status={state.status}
              startDate={state.startDate}
              endDate={state.endDate}
              settings={state.schema.settings}
              onMeta={(patch) => dispatch({ type: 'SET_META', patch })}
              onSettings={(settings) => dispatch({ type: 'SET_SETTINGS', settings })}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreviewing((p) => !p)}
              className="gap-1.5"
            >
              {previewing ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {previewing ? 'Edit' : 'Preview'}
            </Button>
            <SaveIndicator state={saveState} lastSaved={lastSaved} />
            <Button type="button" size="sm" onClick={() => void save()} className="gap-1.5">
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        </div>

        {!previewing && (
          <PageTabs
            schema={state.schema}
            selectedPageId={state.selectedPageId}
            onSelect={(pageId) => dispatch({ type: 'SELECT_PAGE', pageId })}
            onAdd={() => dispatch({ type: 'ADD_PAGE' })}
            onUpdatePage={(pageId, patch) => dispatch({ type: 'UPDATE_PAGE', pageId, patch })}
            onDeletePage={(pageId) => dispatch({ type: 'DELETE_PAGE', pageId })}
            onReorder={(activeId, overId) => dispatch({ type: 'REORDER_PAGES', activeId, overId })}
          />
        )}
      </div>

      {/* Body */}
      {previewing ? (
        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/30 py-2">
          <BuilderPreview schema={state.schema} title={state.title} />
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-[260px_1fr_340px]">
          {/* Palette (desktop) */}
          <aside className="hidden min-h-0 overflow-y-auto border-r border-border py-4 pr-4 lg:block">
            <BlockPalette onAdd={addBlock} />
          </aside>

          {/* Canvas */}
          <main className="min-h-0 overflow-y-auto bg-muted/20 px-3 py-4 sm:px-6">
            <div className="mx-auto max-w-2xl">
              {/* Mobile add-block trigger */}
              <div className="mb-3 lg:hidden">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMobilePaletteOpen(true)}
                  className="w-full gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  Add block
                </Button>
              </div>
              <BuilderCanvas
                page={currentPage}
                selectedBlockId={state.selectedBlockId}
                onSelect={(blockId) => dispatch({ type: 'SELECT_BLOCK', blockId })}
                onDuplicate={(blockId) => dispatch({ type: 'DUPLICATE_BLOCK', blockId })}
                onDelete={(blockId) => dispatch({ type: 'DELETE_BLOCK', blockId })}
                onReorder={(activeId, overId) =>
                  dispatch({ type: 'REORDER_BLOCKS', pageId: currentPage.id, activeId, overId })
                }
                onAddFirst={() => addBlock('short-text')}
              />
            </div>
          </main>

          {/* Inspector (desktop) */}
          <aside className="hidden min-h-0 border-l border-border lg:block">{inspector}</aside>
        </div>
      )}

      {/* Mobile palette sheet */}
      <Sheet open={!isDesktop && mobilePaletteOpen} onOpenChange={setMobilePaletteOpen}>
        <SheetContent side="left" className="w-80 overflow-y-auto">
          <SheetTitle className="px-4 pt-4">Add a block</SheetTitle>
          <div className="p-4">
            <BlockPalette onAdd={addBlock} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile inspector sheet */}
      <Sheet
        open={!isDesktop && !previewing && !!selectedBlock}
        onOpenChange={(open) => {
          if (!open) dispatch({ type: 'SELECT_BLOCK', blockId: null });
        }}
      >
        <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-sm">
          <SheetTitle className="sr-only">Edit block</SheetTitle>
          {inspector}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SaveIndicator({ state, lastSaved }: { state: SaveState; lastSaved: string | null }) {
  if (state === 'saving') {
    return (
      <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Saving…
      </span>
    );
  }
  if (state === 'unsaved') {
    return <span className="hidden text-xs text-muted-foreground sm:inline">Unsaved changes</span>;
  }
  return (
    <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
      <Check className="h-3.5 w-3.5 text-green" />
      {lastSaved ? `Saved · ${lastSaved}` : 'Saved'}
    </span>
  );
}
