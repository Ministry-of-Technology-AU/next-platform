'use client';

import React, { createContext, useContext, useState } from 'react';

interface CategoryColors {
  [key: string]: string;
}

interface CategoryColorsContextType {
  categoryColors: CategoryColors;
  setCategoryColors: (colors: CategoryColors) => void;
}

const CategoryColorsContext = createContext<CategoryColorsContextType | undefined>(undefined);

export function CategoryColorsProvider({ children }: { children: React.ReactNode }) {
  const [categoryColors, setCategoryColors] = useState<CategoryColors>({
    clubs: '#ff6b6b',
    societies: '#4ecdc4',
    departments: '#45b7d1',
    ministries: '#f9ca24',
    others: '#6c5ce7',
  });

  return (
    <CategoryColorsContext.Provider value={{ categoryColors, setCategoryColors }}>
      {children}
    </CategoryColorsContext.Provider>
  );
}

export function useCategoryColors() {
  const context = useContext(CategoryColorsContext);
  if (!context) {
    throw new Error('useCategoryColors must be used within CategoryColorsProvider');
  }
  return context;
}
