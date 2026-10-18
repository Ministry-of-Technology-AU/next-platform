'use client';

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark, PackageOpen, RefreshCw, SearchX } from 'lucide-react';
import { toast } from 'sonner';
import { TourStep } from '@/components/guided-tour';
import { ShortcutsDialog } from '@/components/shortcuts-dialog';
import { Button } from '@/components/ui/button';
import { haptic } from '@/lib/haptics';
import { isTypingTarget } from '@/lib/utils';
import { SHORTCUTS, TABS } from './data';
import type { Asset, AssetTab, BookmarkInput, BorrowAssetsData } from './types';
import { ALL_TYPES, filterAssets, inTab, typesInTab } from './utils';
import { AssetSection, EmptyState } from './_components/asset-grid';
import { RequestSheet } from './_components/request-sheet';
import { Toolbar } from './_components/toolbar';

interface BorrowAssetsClientProps {
  initialData: BorrowAssetsData;
  initialError: string | null;
}

export function BorrowAssetsClient({ initialData, initialError }: BorrowAssetsClientProps) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const [assets, setAssets] = useState<Asset[]>(initialData.assets);
  const [tab, setTab] = useState<AssetTab>('All');
  const [type, setType] = useState<string>(ALL_TYPES);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [requesting, setRequesting] = useState<Asset | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // A server refresh (retry, or after a request) hands down fresh data.
  useEffect(() => setAssets(initialData.assets), [initialData.assets]);

  const types = useMemo(() => typesInTab(assets, tab), [assets, tab]);
  const activeType = types.includes(type) ? type : ALL_TYPES;
  const { available, out } = useMemo(
    () => filterAssets(assets, tab, activeType, deferredQuery),
    [assets, tab, activeType, deferredQuery],
  );
  const tabCounts = useMemo(
    () => Object.fromEntries(TABS.map(({ value }) => [value, assets.filter((a) => inTab(a, value)).length])) as Record<AssetTab, number>,
    [assets],
  );

  const changeTab = useCallback((next: AssetTab) => {
    setTab(next);
    setType(ALL_TYPES);
  }, []);

  const patchAsset = (id: string, patch: Partial<Asset>) =>
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  async function toggleBookmark(asset: Asset) {
    const bookmarked = !asset.bookmarked;
    patchAsset(asset.id, { bookmarked });
    try {
      const body: BookmarkInput = { action: 'bookmark', assetId: asset.id, bookmarked };
      const res = await fetch('/api/platform/borrow-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      patchAsset(asset.id, { bookmarked: !bookmarked });
      void haptic.error();
      toast.error(bookmarked ? `Couldn't save ${asset.name}. Try again.` : `Couldn't remove ${asset.name} from Saved. Try again.`);
    }
  }

  function onRequested(asset: Asset) {
    patchAsset(asset.id, { pendingForMe: true });
    setRequesting(null);
  }

  // Bare-key shortcuts, all registered here. They stay out of the way while typing or in a dialog.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      if (requesting || shortcutsOpen) return;
      if (e.key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === '?') {
        e.preventDefault();
        setShortcutsOpen(true);
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        const next = TABS[Number(e.key) - 1]?.value;
        if (next) {
          void haptic.select();
          changeTab(next);
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [requesting, shortcutsOpen, changeTab]);

  const clearFilters = () => {
    void haptic.tap();
    setQuery('');
    setType(ALL_TYPES);
  };

  const showOwner = tab === 'All' || tab === 'Saved';
  const nothingMatches = available.length === 0 && out.length === 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      <TourStep
        id="borrow-toolbar"
        title="Find an item"
        content="Switch between Techmin and Jazbaa, narrow by type, or search. Press / to jump to search and ? for every shortcut."
        order={1}
      >
        <Toolbar
          tab={tab}
          onTabChange={changeTab}
          tabCounts={tabCounts}
          types={types}
          type={activeType}
          onTypeChange={setType}
          query={query}
          onQueryChange={setQuery}
          searchRef={searchRef}
        />
      </TourStep>

      {initialError ? (
        <EmptyState
          icon={<RefreshCw className="size-5" />}
          title="The item list didn't load"
          description={initialError}
          action={
            <Button
              variant="outline"
              disabled={refreshing}
              onClick={() => {
                void haptic.tap();
                startRefresh(() => router.refresh());
              }}
            >
              <RefreshCw className={refreshing ? 'size-4 animate-spin' : 'size-4'} />
              {refreshing ? 'Trying again' : 'Try again'}
            </Button>
          }
        />
      ) : nothingMatches ? (
        <TabEmptyState tab={tab} filtered={deferredQuery.trim() !== '' || activeType !== ALL_TYPES} query={deferredQuery} onClear={clearFilters} />
      ) : (
        <TourStep
          id="borrow-grid"
          title="Borrow or save"
          content="Tap Borrow to request an item. Out on loan? Save it with the bookmark and find it later in the Saved tab."
          order={2}
        >
          <div className="space-y-8 sm:space-y-10">
            <AssetSection
              title="Available now"
              assets={available}
              showOwner={showOwner}
              onBorrow={setRequesting}
              onToggleBookmark={toggleBookmark}
            />
            <AssetSection
              title="Out on loan"
              assets={out}
              showOwner={showOwner}
              onBorrow={setRequesting}
              onToggleBookmark={toggleBookmark}
            />
          </div>
        </TourStep>
      )}

      <RequestSheet
        asset={requesting}
        defaultPhone={initialData.phone}
        onClose={() => setRequesting(null)}
        onRequested={onRequested}
      />
      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} shortcuts={SHORTCUTS} />
    </div>
  );
}

interface TabEmptyStateProps {
  tab: AssetTab;
  filtered: boolean;
  query: string;
  onClear: () => void;
}

function TabEmptyState({ tab, filtered, query, onClear }: TabEmptyStateProps) {
  if (filtered) {
    return (
      <EmptyState
        icon={<SearchX className="size-5" />}
        title={query.trim() ? `Nothing matches "${query.trim()}"` : 'Nothing of that type here'}
        description="Try another word, or clear the filters to see everything in this tab."
        action={
          <Button variant="outline" onClick={onClear}>
            Clear filters
          </Button>
        }
      />
    );
  }
  if (tab === 'Saved') {
    return (
      <EmptyState
        icon={<Bookmark className="size-5" />}
        title="Nothing saved yet"
        description="Tap the bookmark on any item to keep it here. Handy for things that are out on loan right now."
      />
    );
  }
  if (tab === 'Jazbaa') {
    return (
      <EmptyState
        icon={<PackageOpen className="size-5" />}
        title="Jazbaa hasn't listed anything yet"
        description="Their kit will show up here as soon as it's added."
      />
    );
  }
  return (
    <EmptyState
      icon={<PackageOpen className="size-5" />}
      title="Nothing to borrow yet"
      description="Items will show up here once a team lists them. Check back soon."
    />
  );
}
