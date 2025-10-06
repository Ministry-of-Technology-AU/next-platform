"use client";

import React from 'react';
import Link from 'next/link';
import { recentlyVisited } from './data/platform-data';

interface RecentlyVisitedProps {
  className?: string;
}

export default function RecentlyVisited({ className }: RecentlyVisitedProps) {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <h3 className="text-lg font-semibold !text-left text-primary dark:text-secondary">Recently Visited</h3>
      <div className="flex md:flex-col gap-3">
        {recentlyVisited.slice(0, 4).map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-center gap-3 shadow-lg bg-card rounded-xl px-3 py-2 hover:bg-neutral-extralight transition-colors duration-200 group min-w-0 w-full flex-1 md:flex-none h-14 md:h-16"
          >
            <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center flex-shrink-0">
              {item.icon && <item.icon className="w-6 h-6 text-primary dark:text-secondary group-hover:scale-110 transition-transform duration-200" />}
            </div>
            <span className="text-sm font-medium group-hover:text-primary dark:group-hover:text-secondary transition-colors truncate">
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}