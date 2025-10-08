'use client';

import { useState, useMemo } from 'react';
import { Asset, AssetCategory } from './types';
import { FilterBar } from './_components/filter-bar';
import { AssetGrid } from './_components/asset-grid';

interface BorrowAssetsClientProps {
  initialAssets: Asset[];
}

export function BorrowAssetsClient({ initialAssets }: BorrowAssetsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'All'>('All');
  const [assets, setAssets] = useState<Asset[]>(initialAssets);

  const handleToggleBookmark = (assetId: string) => {
    setAssets((prevAssets) =>
      prevAssets.map((asset) =>
        asset.id === assetId
          ? { ...asset, bookmarked: !asset.bookmarked }
          : asset
      )
    );
  };

  const { availableAssets, unavailableAssets } = useMemo(() => {
    const filtered = selectedCategory === 'All'
      ? assets
      : assets.filter((asset) => asset.category === selectedCategory);

    return {
      availableAssets: filtered.filter((asset) => asset.status === 'available'),
      unavailableAssets: filtered.filter((asset) => asset.status === 'unavailable'),
    };
  }, [assets, selectedCategory]);

  return (
    <div className="mt-6">
      <FilterBar
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

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
    </div>
  );
}
