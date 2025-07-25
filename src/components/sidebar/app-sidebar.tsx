"use client";

import * as React from "react";
import { useIsMac } from "@/hooks/useIsMac";
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
  Tv,
  Car,
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
  ClipboardPenLine,
  MailPlus,
  Clock,
  User,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import sidebarData from "@/components/sidebar/sidebar-entries.json";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Icon mapping
const iconMap = {
  Home,
  ClipboardPenLine,
  FileText,
  Award,
  Calendar,
  Library,
  Users,
  Tv,
  Car,
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
  ShoppingBag,
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

  // Icon collapse state
  const [iconCollapse, setIconCollapse] = React.useState(isCollapsed);
  const collapseDelay = 2500; // ms, adjust as needed
  const collapseTimeout = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (isCollapsed) {
      // Set iconCollapse to true after a delay
      collapseTimeout.current = setTimeout(() => {
        setIconCollapse(true);
      }, collapseDelay);
    } else {
      // Immediately set iconCollapse to false and clear timeout
      setIconCollapse(false);
      if (collapseTimeout.current) {
        clearTimeout(collapseTimeout.current);
        collapseTimeout.current = null;
      }
    }
    // Cleanup on unmount
    return () => {
      if (collapseTimeout.current) {
        clearTimeout(collapseTimeout.current);
      }
    };
  }, [isCollapsed, collapseDelay]);

  const isMac = useIsMac();

  return (
    <Sidebar className="border-r border-border flex flex-col h-screen bg-white dark:bg-black overflow-y-auto" collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
              <div className="flex-shrink-0 cursor-pointer">
                <Image
                  src="/MoT logo.png"
                  alt="Ministry of Technology"
                  width={48}
                  height={48}
                  className="rounded-lg object-cover transition-all duration-500 ease-in-out group-data-[state=collapsed]:w-8 group-data-[state=collapsed]:h-8"
                />
              </div>
          <div className="flex flex-col justify-center min-w-0 overflow-hidden transition-all duration-500 ease-in-out group-data-[state=collapsed]:w-0 group-data-[state=collapsed]:opacity-0">
            <h3 className="text-lg font-semibold text-primary truncate leading-tight whitespace-nowrap !text-left">
                Platform
              </h3>
            <p className="text-xs text-muted-foreground leading-tight whitespace-wrap">
                by Technology Ministry
              </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2 overflow-y-auto min-h-0">
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
                          "group relative w-full flex items-center transition-all duration-200 ease-in-out",
                          "hover:bg-primary-light/50 hover:text-accent-foreground",
                          isActive &&
                            "bg-primary text-primary-foreground hover:bg-primary/90",
                          // When collapsed
                          "group-data-[state=collapsed]:justify-center",
                          "group-data-[state=collapsed]:gap-0",
                          "group-data-[state=collapsed]:px-0",
                          // When expanded (default)
                          "justify-start gap-3 px-2"
                        )}
                        tooltip={iconCollapse ? item.title : undefined}
                      >
                        <Link
                          href={item.href}
                          className="flex items-center w-full"
                        >
                          <IconComponent className="size-4 group-data-[state=collapsed]:mx-auto" />
                          <span className={cn(
                            "truncate text-sm font-medium transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap",
                            iconCollapse && "w-0 opacity-0"
                          )}>
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

      {!isCollapsed && (<SidebarFooter className="p-4">
        <div className="text-xs text-muted-foreground text-left transition-all duration-500 ease-in-out overflow-hidden group-data-[state=collapsed]:w-0 group-data-[state=collapsed]:opacity-0">
            <p>Developed & maintained by</p>
            <p className="text-primary text-bold">the Ministry of Technology</p>
        </div>
      </SidebarFooter>)}
    </Sidebar>
  );
}