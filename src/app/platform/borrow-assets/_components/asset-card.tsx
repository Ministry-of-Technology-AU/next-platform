'use client';

import Image from 'next/image';
import { Asset } from '../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bookmark, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Format date consistently to avoid hydration mismatch
function formatDateIST(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

interface AssetCardProps {
  asset: Asset;
  onRequestBorrow: (assetId: string) => void;
  onToggleBookmark: (assetId: string) => void;
}

export function AssetCard({ asset, onRequestBorrow, onToggleBookmark }: AssetCardProps) {
  const isAvailable = asset.status === 'available';
  
  const getStatusColor = (status: Asset['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'borrowed':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'overdue':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'unavailable':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: Asset['status']) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'borrowed':
        return 'Currently Borrowed';
      case 'overdue':
        return 'Overdue';
      case 'unavailable':
        return 'Unavailable';
      default:
        return 'Unknown';
    }
  };
  
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
        <div className="flex items-center flex-wrap gap-2 mb-2">
          <Badge variant="secondary" className="text-xs capitalize">
            {asset.type === 'mobile' ? 'Mobile Phone' : asset.type}
          </Badge>
          <Badge className={cn("text-xs", getStatusColor(asset.status))}>
            {getStatusText(asset.status)}
          </Badge>
          {asset.bookmarked && (
            <Badge variant="outline" className="text-xs">
              Bookmarked
            </Badge>
          )}
        </div>
        {!isAvailable && asset.last_borrow_request && (
          <p className="text-xs text-gray-600">
            Last activity: {formatDateIST(asset.last_borrow_request.updatedAt)}
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
            {isAvailable ? 'Request Borrow' : 
             asset.status === 'borrowed' ? 'Currently Borrowed' :
             asset.status === 'overdue' ? 'Overdue Return' :
             'Currently Unavailable'}
            {isAvailable && <ArrowRight className="h-4 w-4" />}
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
}
