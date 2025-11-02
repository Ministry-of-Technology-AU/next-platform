'use client';

import { Asset } from '../types';
import { AssetCard } from './asset-card';
import { useState } from 'react';
import AssetDialog from './asset-dialog';

interface AssetGridProps {
  assets: Asset[];
  title: string;
  onToggleBookmark: (assetId: string) => void;
  onRequestSuccess?: () => void;
}

export function AssetGrid({ assets, title, onToggleBookmark, onRequestSuccess }: AssetGridProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleRequestBorrow = (assetId: string) => {
    setSelectedAssetId(assetId);
    setIsDialogOpen(true);
  };

  const selectedAsset = assets.find((asset) => asset.id === selectedAssetId);

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {assets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onRequestBorrow={handleRequestBorrow}
              onToggleBookmark={onToggleBookmark}
            />
          ))}
        </div>
      </div>

      <AssetDialog
        asset={selectedAsset || null}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onRequestSuccess={onRequestSuccess}
      />
    </>
  );
}
