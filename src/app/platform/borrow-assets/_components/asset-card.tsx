'use client';

import Image from 'next/image';
import { Asset } from '../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bookmark, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssetCardProps {
  asset: Asset;
  onRequestBorrow: (assetId: string) => void;
  onToggleBookmark: (assetId: string) => void;
}

export function AssetCard({ asset, onRequestBorrow, onToggleBookmark }: AssetCardProps) {
  const isAvailable = asset.status === 'available';
  
  return (
    <Card className={cn(
      "flex flex-col h-full overflow-hidden transition-opacity",
      !isAvailable && "opacity-60"
    )}>
      <CardHeader className="relative p-0">
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          {asset.Image?.url ? (
            <Image
              src={asset.Image.url}
              alt={asset.Image.alternativeText || asset.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400 text-sm">
              No Image Available
            </div>
          )}
          <button
            onClick={() => onToggleBookmark(asset.id)}
            className="absolute top-3 right-3 p-1 rounded-md hover:bg-white/80 transition-colors"
            aria-label={asset.bookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <Bookmark
              className={cn(
                'h-5 w-5 transition-all',
                asset.bookmarked
                  ? 'fill-gray-800 text-gray-800'
                  : 'fill-none text-white stroke-2'
              )}
            />
          </button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <CardTitle className="text-lg mb-2">{asset.name}</CardTitle>
        {asset.model && (
          <p className="text-sm text-gray-600 mb-2 font-medium">Model: {asset.model}</p>
        )}
        <CardDescription className="text-sm mb-3 line-clamp-2">
          {asset.description}
        </CardDescription>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs capitalize">
            {asset.type === 'mobile' ? 'Mobile Phone' : asset.type}
          </Badge>
          {asset.bookmarked && (
            <Badge variant="outline" className="text-xs">
              ⭐ Bookmarked
            </Badge>
          )}
        </div>
        {!isAvailable && asset.last_borrow_request && (
          <p className="text-xs text-gray-600">
            Last borrowed: {new Date(asset.last_borrow_request.updatedAt).toLocaleDateString()}
          </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={() => onRequestBorrow(asset.id)}
          className="w-full"
          variant={isAvailable ? 'default' : 'outline'}
          disabled={!isAvailable}
        >
          <span className="flex items-center justify-center gap-2">
            {isAvailable ? 'Request Borrow' : 'Currently Unavailable'}
            {isAvailable && <ArrowRight className="h-4 w-4" />}
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
}
