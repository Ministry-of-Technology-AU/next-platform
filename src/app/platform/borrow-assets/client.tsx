'use client';

import { useState, useMemo } from 'react';
import { Asset, AssetTab, AssetType } from './types';
import { FilterBar } from './_components/filter-bar';
import { AssetGrid } from './_components/asset-grid';

interface BorrowAssetsClientProps {
  initialAssets: Asset[];
}

export function BorrowAssetsClient({ initialAssets }: BorrowAssetsClientProps) {
  const [selectedTab, setSelectedTab] = useState<AssetTab>('All');
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<Set<AssetType>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleToggleBookmark = (assetId: string) => {
    setAssets((prevAssets) =>
      prevAssets.map((asset) =>
        asset.id === assetId
          ? { ...asset, bookmarked: !asset.bookmarked }
          : asset
      )
    );
  };

  const handleTabChange = (newTab: AssetTab) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedTab(newTab);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  };

  const handleTypeToggle = (type: AssetType) => {
    setSelectedTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const availableTypes = useMemo(() => {
    if (selectedTab === 'Bookmarks') return [];
    
    const tabFiltered = selectedTab === 'All'
      ? assets
      : assets.filter((asset) => asset.tab === selectedTab);

    const types = new Set<AssetType>();
    tabFiltered.forEach((asset) => types.add(asset.type));
    return Array.from(types).sort();
  }, [assets, selectedTab]);

  useMemo(() => {
    setSelectedTypes(new Set(availableTypes));
  }, [availableTypes]);

  const { availableAssets, unavailableAssets, techminBookmarks, jazbaaBookmarks } = useMemo(() => {
    // Handle Bookmarks tab separately
    if (selectedTab === 'Bookmarks') {
      const bookmarked = assets.filter((asset) => asset.bookmarked);
      
      return {
        availableAssets: [],
        unavailableAssets: [],
        techminBookmarks: bookmarked.filter((asset) => asset.tab === 'Techmin'),
        jazbaaBookmarks: bookmarked.filter((asset) => asset.tab === 'Jazbaa'),
      };
    }

    // Regular tab filtering
    let filtered = assets;

    if (selectedTab !== 'All') {
      filtered = filtered.filter((asset) => asset.tab === selectedTab);
    }

    if (selectedTypes.size > 0) {
      filtered = filtered.filter((asset) => selectedTypes.has(asset.type));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (asset) =>
          asset.name.toLowerCase().includes(query) ||
          asset.description.toLowerCase().includes(query) ||
          asset.type.toLowerCase().includes(query)
      );
    }

    return {
      availableAssets: filtered.filter((asset) => asset.status === 'available'),
      unavailableAssets: filtered.filter((asset) => asset.status === 'unavailable'),
      techminBookmarks: [],
      jazbaaBookmarks: [],
    };
  }, [assets, selectedTab, selectedTypes, searchQuery]);

  return (
    <div>
      <FilterBar
        selectedTab={selectedTab}
        onTabChange={handleTabChange}
        selectedTypes={selectedTypes}
        onTypeToggle={handleTypeToggle}
        availableTypes={availableTypes}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div
        className={`transition-opacity duration-300 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {selectedTab === 'Bookmarks' ? (
          <>
            {techminBookmarks.length > 0 && (
              <AssetGrid
                assets={techminBookmarks}
                title="Techmin Bookmarks"
                onToggleBookmark={handleToggleBookmark}
              />
            )}

            {jazbaaBookmarks.length > 0 && (
              <AssetGrid
                assets={jazbaaBookmarks}
                title="Jazbaa Bookmarks"
                onToggleBookmark={handleToggleBookmark}
              />
            )}

            {techminBookmarks.length === 0 && jazbaaBookmarks.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No bookmarked assets yet. Click the bookmark icon on any asset to save it here.
              </div>
            )}
          </>
        ) : (
          <>
            {availableAssets.length > 0 && (
              <AssetGrid
                assets={availableAssets}
                title="Available"
                onToggleBookmark={handleToggleBookmark}
              />
            )}

            {unavailableAssets.length > 0 && (
              <AssetGrid
                assets={unavailableAssets}
                title="Currently Unavailable"
                onToggleBookmark={handleToggleBookmark}
              />
            )}

            {availableAssets.length === 0 && unavailableAssets.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No assets found matching your filters.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
