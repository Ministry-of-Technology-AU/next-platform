"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { recentlyVisited as staticRecentlyVisited } from './data/platform-data';
import { TourStep } from '../guided-tour';
import { LucideIcon } from 'lucide-react';
import {
  Home,
  CalendarSync,
  Award,
  Library,
  Users,
  Car,
  CalendarDays,
  PartyPopper,
  UserCog,
  Settings,
  HelpCircle,
  ClipboardPenLine,
  MailPlus,
  Clock,
  WifiPen,
  User,
  GalleryHorizontalEnd,
  ShoppingBag,
  Puzzle,
  Route
} from "lucide-react";
import sidebarData from "@/components/sidebar/sidebar-entries.json";

// Icon mapping from app-sidebar
const iconMap: Record<string, LucideIcon> = {
  Home,
  ClipboardPenLine,
  CalendarSync,
  Award,
  Library,
  Users,
  Car,
  CalendarDays,
  PartyPopper,
  UserCog,
  Settings,
  HelpCircle,
  MailPlus,
  Clock,
  WifiPen,
  User,
  GalleryHorizontalEnd,
  ShoppingBag,
  Puzzle,
  Route
};

interface RecentlyVisitedProps {
  className?: string;
}

interface VisitedItem {
  name: string;
  href: string;
  icon: LucideIcon | null;
}

export default function RecentlyVisited({ className }: RecentlyVisitedProps) {
  const [items, setItems] = useState<VisitedItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateItems = () => {
      try {
        const stored = localStorage.getItem("recently-visited");
        if (stored) {
          const paths: string[] = JSON.parse(stored);

          // Map paths to metadata
          const mappedItems = paths.map(path => {
            // Find in sidebarData
            let foundItem: { title: string; icon: string; href: string } | undefined;

            for (const category of sidebarData.categories) {
              const found = category.items.find(item => `/platform${item.href}` === path || item.href === path || path.endsWith(item.href));
              if (found) {
                foundItem = found;
                break;
              }
            }

            if (foundItem) {
              const Icon = iconMap[foundItem.icon];
              return {
                name: foundItem.title,
                href: path,
                icon: Icon
              };
            }

            // Fallback to static data if not in sidebar (legacy support?)
            const staticFound = staticRecentlyVisited.find(item => item.href === path);
            if (staticFound) {
              return {
                name: staticFound.name,
                href: staticFound.href,
                icon: staticFound.icon
              };
            }

            // Fallback: derive name from path
            const name = path.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || "Tool";
            return {
              name: name,
              href: path,
              icon: null
            };
          });

          setItems(mappedItems.slice(0, 4));
        } else {
          setItems([]);
        }
      } catch (e) {
        console.error("Error parsing recently visited", e);
      }
    };

    updateItems();

    const handleUpdate = () => updateItems();
    window.addEventListener("recently-visited-updated", handleUpdate);
    // Also listen to storage events from other tabs
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("recently-visited-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  if (!mounted) return null; // Avoid hydration mismatch

  if (items.length === 0) {
    // transform staticRecentlyVisited to VisitedItem format for default view
    const defaultItems = staticRecentlyVisited.slice(0, 4).map(item => ({
      name: item.name,
      href: item.href,
      icon: item.icon
    }));

    return (
      <div className={`flex flex-col gap-3 sm:gap-4 ${className}`}>
        <h3 className="text-lg font-semibold !text-left text-primary dark:text-primary-bright">Recently Visited</h3>
        <TourStep id="recently-visited" order={1} position="right" content="Access your recently visited tools quickly from here." title="Recently Visited">
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
            {defaultItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 sm:gap-3 shadow-lg bg-card rounded-xl px-2 sm:px-3 py-2 hover:bg-neutral-extralight transition-colors duration-200 group min-w-0 w-full h-12 sm:h-14 lg:h-16"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-card flex items-center justify-center flex-shrink-0">
                  {item.icon ? <item.icon className="w-4 h-4 sm:w-6 sm:h-6 text-primary dark:text-primary-bright group-hover:scale-110 transition-transform duration-200" /> : <div className="w-4 h-4 sm:w-6 sm:h-6 bg-primary/20 rounded-full" />}
                </div>
                <span className="text-xs sm:text-sm font-medium group-hover:text-primary dark:group-hover:text-primary-bright transition-colors truncate">
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </TourStep>
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-3 sm:gap-4 ${className}`}>
      <h3 className="text-lg font-semibold !text-left text-primary dark:text-primary-bright">Recently Visited</h3>
      <TourStep id="recently-visited" order={1} position="right" content="Access your recently visited tools quickly from here." title="Recently Visited">
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 sm:gap-3 shadow-lg bg-card rounded-xl px-2 sm:px-3 py-2 hover:bg-neutral-extralight transition-colors duration-200 group min-w-0 w-full h-12 sm:h-14 lg:h-16"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-card flex items-center justify-center flex-shrink-0">
                {item.icon ? <item.icon className="w-4 h-4 sm:w-6 sm:h-6 text-primary dark:text-primary-bright group-hover:scale-110 transition-transform duration-200" /> : <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gray-200 rounded-full" />}
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