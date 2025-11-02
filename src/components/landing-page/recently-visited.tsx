"use client";

import React from 'react';
import Link from 'next/link';
import { recentlyVisited } from './data/platform-data';
import { TourStep } from '../guided-tour';

interface RecentlyVisitedProps {
  className?: string;
}

export default function RecentlyVisited({ className }: RecentlyVisitedProps) {
  return (
    <div className={`flex flex-col gap-3 sm:gap-4 ${className}`}>
      <h3 className="text-lg font-semibold !text-left text-primary dark:text-primary-bright">Recently Visited</h3>
        <TourStep id="recently-visited" order={1} position="right" content="Access your recently visited tools quickly from here." title="Recently Visited">
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
        {recentlyVisited.slice(0, 4).map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-center gap-2 sm:gap-3 shadow-lg bg-card rounded-xl px-2 sm:px-3 py-2 hover:bg-neutral-extralight transition-colors duration-200 group min-w-0 w-full h-12 sm:h-14 lg:h-16"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-card flex items-center justify-center flex-shrink-0">
              {item.icon && <item.icon className="w-4 h-4 sm:w-6 sm:h-6 text-primary dark:text-primary-bright group-hover:scale-110 transition-transform duration-200" />}
            </div>
            <span className="text-xs sm:text-sm font-medium group-hover:text-primary dark:group-hover:text-primary-bright transition-colors truncate">
              {item.name}
            </span>
          </Link>
        ))}

      </div>
          </TourStep>

    </div>

  );

}