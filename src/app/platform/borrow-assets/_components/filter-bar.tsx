'use client';

import { AssetTab, AssetType } from '../types';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger} from '@/components/ui/shadcn-io/tabs';

interface FilterBarProps {
  selectedTab: AssetTab;
  onTabChange: (tab: AssetTab) => void;
  selectedTypes: Set<AssetType>;
  onTypeToggle: (type: AssetType) => void;
  availableTypes: AssetType[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function FilterBar({
  selectedTab,
  onTabChange,
  selectedTypes,
  onTypeToggle,
  availableTypes,
  searchQuery,
  onSearchChange,
}: FilterBarProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search assets..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <Tabs value={selectedTab} onValueChange={(value) => onTabChange(value as AssetTab)}>
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="All">All</TabsTrigger>
          <TabsTrigger value="Techmin">Techmin</TabsTrigger>
          <TabsTrigger value="Jazbaa">Coming Soon</TabsTrigger>
          <TabsTrigger value="Bookmarks">Bookmarks</TabsTrigger>
        </TabsList>
      </Tabs>

      {availableTypes.length > 0 && selectedTab !== 'Bookmarks' && (
        <div className="flex gap-3 flex-wrap justify-center">
          {availableTypes.map((type) => (
            <Badge
              key={type}
              variant={selectedTypes.has(type) ? 'default' : 'outline'}
              className="cursor-pointer select-none text-xs px-3 py-1.5"
              onClick={() => onTypeToggle(type)}
            >
              {type}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
