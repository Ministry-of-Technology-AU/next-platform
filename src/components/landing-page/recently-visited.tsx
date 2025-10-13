"use client";

import React from 'react';
import Link from 'next/link';
import { recentlyVisited } from './data/platform-data';

interface RecentlyVisitedProps {
  className?: string;
}

// Color themes for each item
const itemThemes: Record<number, { bg: string; iconColor: string; hoverColor: string }> = {
  1: { bg: "bg-blue-50 dark:bg-blue-950/30", iconColor: "text-blue-600 dark:text-blue-400", hoverColor: "group-hover:text-blue-600 dark:group-hover:text-blue-400" },
  2: { bg: "bg-green-50 dark:bg-green-950/30", iconColor: "text-green-600 dark:text-green-400", hoverColor: "group-hover:text-green-600 dark:group-hover:text-green-400" },
  3: { bg: "bg-amber-50 dark:bg-amber-950/30", iconColor: "text-amber-600 dark:text-amber-400", hoverColor: "group-hover:text-amber-600 dark:group-hover:text-amber-400" },
  4: { bg: "bg-purple-50 dark:bg-purple-950/30", iconColor: "text-purple-600 dark:text-purple-400", hoverColor: "group-hover:text-purple-600 dark:group-hover:text-purple-400" },
};

export default function RecentlyVisited({ className }: RecentlyVisitedProps) {
  return (
    <div className={`flex flex-col gap-3 sm:gap-4 ${className}`}>
      <h3 className="text-lg font-semibold !text-left text-primary dark:text-secondary">Recently Visited</h3>
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
        {recentlyVisited.slice(0, 4).map((item) => {
          const theme = itemThemes[item.id] || itemThemes[1];
          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-2 sm:gap-3 bg-white dark:bg-background/70 border border-gray-200 dark:border-border rounded-xl px-2 sm:px-3 py-2 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 group min-w-0 w-full h-12 sm:h-14 lg:h-16"
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${theme.bg} flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                {item.icon && <item.icon className={`w-4 h-4 sm:w-6 sm:h-6 ${theme.iconColor}`} />}
              </div>
              <span className={`text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 ${theme.hoverColor} transition-colors duration-300 truncate`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}