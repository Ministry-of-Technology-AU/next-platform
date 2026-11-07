'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FolderOpen, Folders, Heart, Search, SearchX, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { haptic } from '@/lib/haptics';
import { DocumentGrid, DocumentGridSkeleton } from './_components/document-grid';
import { EmptyState } from './_components/empty-state';
import { FolderTree } from './_components/folder-tree';
import { PreviewPane } from './_components/preview-pane';
import { FAVOURITES_VIEW, type WikiData, type WikiDocument } from './types';
import { documentsInFolder, loadFavourites, saveFavourites, searchDocuments } from './utils';

export function PlatformResourcesClient({ folders, documents }: WikiData) {
  const [view, setView] = useState<string>(FAVOURITES_VIEW);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [favouriteIds, setFavouriteIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [foldersOpen, setFoldersOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFavouriteIds(loadFavourites());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveFavourites(favouriteIds);
  }, [favouriteIds, hydrated]);

  const favouriteSet = useMemo(() => new Set(favouriteIds), [favouriteIds]);
  const selected = documents.find((d) => d.id === selectedId) ?? null;
  const searching = query.trim().length > 0;

  const shown = useMemo(() => {
    if (searching) return searchDocuments(documents, query);
    if (view === FAVOURITES_VIEW) return documents.filter((d) => favouriteSet.has(d.id));
    return documentsInFolder(documents, folders, view);
  }, [searching, query, view, documents, folders, favouriteSet]);

  const heading = searching
    ? `Results for "${query.trim()}"`
    : view === FAVOURITES_VIEW
      ? 'Favourites'
      : (folders.find((f) => f.id === view)?.name ?? 'Folder');

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
  };

  const selectView = (next: string) => {
    setView(next);
    setSelectedId(null);
    setFoldersOpen(false);
    closeSearch();
  };

  const toggleFavourite = (document: WikiDocument) =>
    setFavouriteIds((prev) => (prev.includes(document.id) ? prev.filter((id) => id !== document.id) : [...prev, document.id]));

  // "/" opens search, Escape closes the preview. Neither fires while typing in a field.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (event.key === '/' && !typing && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setSearchOpen(true);
        requestAnimationFrame(() => searchRef.current?.focus());
      } else if (event.key === 'Escape' && !typing) {
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const loadingFavourites = view === FAVOURITES_VIEW && !searching && !hydrated;

  let body: React.ReactNode;
  if (loadingFavourites) {
    body = <DocumentGridSkeleton />;
  } else if (shown.length === 0) {
    body = searching ? (
      <EmptyState icon={SearchX} title="No matches" description="Nothing matches that search. Try a subject name, like Economics, or a shorter word." />
    ) : view === FAVOURITES_VIEW ? (
      <EmptyState
        icon={Heart}
        title="No favourites yet"
        description="Press the heart on any document and it will wait for you here. Go on, start browsing."
        action={
          <Button className="button-animated" onClick={() => selectView('academic')}>
            <FolderOpen /> Start browsing
          </Button>
        }
      />
    ) : (
      <EmptyState icon={FolderOpen} title="Nothing here yet" description="No documents have been added to this folder. Check the other folders in the sidebar." />
    );
  } else {
    body = (
      <DocumentGrid
        documents={shown}
        favouriteIds={favouriteSet}
        selectedId={selectedId}
        onOpen={(d) => setSelectedId(d.id)}
        onToggleFavourite={toggleFavourite}
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-[17rem_minmax(0,1fr)] md:items-start md:gap-6">
      <aside className="hidden max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl border bg-card p-3 shadow-lg md:sticky md:top-4 md:block">
        <FolderTree folders={folders} view={searching ? '' : view} favouriteCount={favouriteIds.length} onSelect={selectView} />
      </aside>

      <Sheet open={foldersOpen} onOpenChange={setFoldersOpen}>
        <SheetContent side="left" className="w-72 overflow-y-auto p-3">
          <SheetHeader className="sr-only">
            <SheetTitle>Folders</SheetTitle>
            <SheetDescription>Choose a folder to see its documents.</SheetDescription>
          </SheetHeader>
          <FolderTree folders={folders} view={searching ? '' : view} favouriteCount={favouriteIds.length} onSelect={selectView} />
        </SheetContent>
      </Sheet>

      <section className="min-w-0">
        {selected ? (
          <PreviewPane
            document={selected}
            favourited={favouriteSet.has(selected.id)}
            onToggleFavourite={() => toggleFavourite(selected)}
            onClose={() => setSelectedId(null)}
          />
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2">
              <Button
                variant="outline"
                className="h-11 md:hidden"
                onClick={() => {
                  void haptic.tap();
                  setFoldersOpen(true);
                }}
              >
                <Folders /> Folders
              </Button>
              <h2 className="min-w-0 flex-1 truncate text-lg font-bold sm:text-xl">{heading}</h2>
              {searchOpen ? (
                <div className="flex items-center gap-1">
                  <Input
                    ref={searchRef}
                    type="search"
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
                    placeholder="Search by name or subject"
                    aria-label="Search documents"
                    className="h-11 w-44 sm:h-9 sm:w-64"
                  />
                  <Button variant="ghost" size="icon" className="size-11 sm:size-9" onClick={closeSearch} aria-label="Close search">
                    <X />
                  </Button>
                </div>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-11 rounded-full shadow-sm sm:size-10"
                      onClick={() => {
                        void haptic.tap();
                        setSearchOpen(true);
                      }}
                      aria-label="Search documents"
                      aria-keyshortcuts="/"
                    >
                      <Search />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Search (press /)</TooltipContent>
                </Tooltip>
              )}
            </div>

            <div aria-live="polite">{body}</div>
          </>
        )}
      </section>
    </div>
  );
}
