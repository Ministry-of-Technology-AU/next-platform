'use client';

import { AssetCategory } from '../types';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface FilterBarProps {
  selectedCategory: AssetCategory | 'All';
  onCategoryChange: (category: AssetCategory | 'All') => void;
}

const categories: (AssetCategory | 'All')[] = ['All', 'Techmin', 'Jazbaa'];

export function FilterBar({ selectedCategory, onCategoryChange }: FilterBarProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search assets..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="sm:w-auto">
          <Filter className="h-4 w-4 mr-2" />
          Filters & Preferences
        </Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange(category)}
            className="rounded-full"
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
}
