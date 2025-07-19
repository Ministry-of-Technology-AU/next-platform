"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home,
  BookOpen,
  FileText,
  Award,
  Calendar,
  Library,
  Users,
  UtensilsCrossed,
  Bus,
  Building,
  Palette,
  Theater,
  Image as ImageIcon,
  PartyPopper,
  Megaphone,
  Newspaper,
  Search,
  Phone,
  FolderOpen,
  Bookmark,
  Settings,
  HelpCircle,
  Zap,
  MailPlus,
  Clock,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import sidebarData from "@/components/sidebar/sidebar-entries.json";

// Icon mapping
const iconMap = {
  Home,
  BookOpen,
  FileText,
  Award,
  Calendar,
  Library,
  Users,
  UtensilsCrossed,
  Bus,
  Building,
  Palette,
  Theater,
  Image: ImageIcon,
  PartyPopper,
  Megaphone,
  Newspaper,
  Search,
  Phone,
  FolderOpen,
  Bookmark,
  Settings,
  HelpCircle,
  MailPlus,
  Clock,
  User,
};

interface SidebarItem {
  title: string;
  icon: string;
  href: string;
}

interface SidebarCategory {
  id: string;
  title: string;
  items: SidebarItem[];
}

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className="border-r border-border" collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0">
            <Image
              src="https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg"
              alt="Ministry of Technology"
              width={48}
              height={48}
              className="rounded-lg object-cover transition-all duration-500 ease-in-out group-data-[state=collapsed]:w-8 group-data-[state=collapsed]:h-8"
            />
          </div>
          <div className="flex flex-col justify-center min-w-0 overflow-hidden transition-all duration-500 ease-in-out group-data-[state=collapsed]:w-0 group-data-[state=collapsed]:opacity-0">
            <h3 className="text-lg font-semibold text-foreground truncate leading-tight whitespace-nowrap">
                Platform
              </h3>
            <p className="text-xs text-muted-foreground leading-tight whitespace-nowrap">
                by Ministry of Technology
              </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        {sidebarData.categories.map((category: SidebarCategory) => (
          <SidebarGroup key={category.id}>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 py-1">
                {category.title}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {category.items.map((item: SidebarItem) => {
                  const IconComponent =
                    iconMap[item.icon as keyof typeof iconMap];
                  const isActive = pathname === item.href;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={cn(
                          "group relative",
                          "transition-all duration-200 ease-in-out",
                          "hover:bg-primary-light/50 hover:text-accent-foreground",
                          isActive &&
                            "bg-primary text-primary-foreground hover:bg-primary/90",
                          isCollapsed ? "justify-center" : "justify-start"
                        )}
                        tooltip={isCollapsed ? item.title : undefined}
                      >
                        <Link
                          href={item.href}
                          className="flex items-center gap-3 w-full"
                        >
                          {IconComponent && (
                            <IconComponent className="size-4 flex-shrink-0 transition-all duration-500 ease-in-out" />
                          )}
                          <span className="truncate text-sm font-medium transition-all duration-500 ease-in-out overflow-hidden group-data-[state=collapsed]:w-0 group-data-[state=collapsed]:opacity-0 whitespace-nowrap">
                              {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="text-xs text-muted-foreground text-center transition-all duration-500 ease-in-out overflow-hidden group-data-[state=collapsed]:w-0 group-data-[state=collapsed]:opacity-0">
            <p>Developed and maintained by</p>
            <p>the Ministry of Technology</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
