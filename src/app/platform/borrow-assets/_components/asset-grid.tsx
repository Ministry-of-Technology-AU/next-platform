'use client';

import { Asset } from '../types';
import { AssetCard } from './asset-card';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AssetGridProps {
  assets: Asset[];
  title: string;
  onToggleBookmark: (assetId: string) => void;
}

export function AssetGrid({ assets, title, onToggleBookmark }: AssetGridProps) {
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Borrow Request</DialogTitle>
            <DialogDescription>
              {selectedAsset ? (
                <>
                  You are requesting to borrow: <strong>{selectedAsset.name}</strong>
                  <br />
                  <br />
                  This is a template dialog. Implement your borrow request form here.
                </>
              ) : (
                'Loading...'
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
