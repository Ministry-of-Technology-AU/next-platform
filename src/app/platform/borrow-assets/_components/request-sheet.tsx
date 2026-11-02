'use client';

import { useState } from 'react';
import { Package } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Asset } from '../types';
import { assetImageUrl, categoryLabel } from '../utils';
import { RequestForm } from './request-form';

interface RequestSheetProps {
  /** The item being requested. Null closes the sheet. */
  asset: Asset | null;
  defaultPhone: string;
  onClose: () => void;
  onRequested: (asset: Asset) => void;
}

function AssetSummary({ asset }: { asset: Asset }) {
  return (
    <div className="flex items-center gap-3 text-left">
      <div className="size-14 shrink-0 overflow-hidden rounded-lg border bg-muted">
        {asset.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={assetImageUrl(asset.image.url, 160)} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <Package className="size-5" aria-hidden />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="line-clamp-1 font-heading font-semibold">{asset.name}</p>
        <p className="line-clamp-1 text-sm text-muted-foreground">
          {[categoryLabel(asset.type), `from ${asset.owner}`].join(' · ')}
        </p>
      </div>
    </div>
  );
}

/** Bottom drawer on phones (thumb reach, swipe to dismiss), centred dialog on desktop. */
export function RequestSheet({ asset, defaultPhone, onClose, onRequested }: RequestSheetProps) {
  const isMobile = useIsMobile();
  const open = asset !== null;
  // Keep showing the last item while the sheet animates closed.
  const [shown, setShown] = useState<Asset | null>(asset);
  if (asset && asset !== shown) setShown(asset);
  const onOpenChange = (next: boolean) => {
    if (!next) onClose();
  };

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
        <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[92dvh]">
          {shown && (
            <>
              <DrawerHeader className="gap-3 px-4 pb-4 text-left">
                <DrawerTitle className="sr-only">Borrow {shown.name}</DrawerTitle>
                <DrawerDescription className="sr-only">Pick a return date and tell the team what it&apos;s for.</DrawerDescription>
                <AssetSummary asset={shown} />
              </DrawerHeader>
              <RequestForm key={shown.id} asset={shown} defaultPhone={defaultPhone} onRequested={onRequested} />
            </>
          )}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] max-w-xl flex-col gap-0 p-0">
        {shown && (
          <>
            <DialogHeader className="gap-4 p-6 pb-5">
              <DialogTitle>Borrow this item</DialogTitle>
              <DialogDescription className="sr-only">Pick a return date and tell the team what it&apos;s for.</DialogDescription>
              <AssetSummary asset={shown} />
            </DialogHeader>
            <RequestForm
              key={shown.id}
              asset={shown}
              defaultPhone={defaultPhone}
              onCancel={onClose}
              onRequested={onRequested}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
