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
import { cn } from "@/lib/utils";
import {
  getSidebarInterface,
  resolveHref,
  resolveSidebar,
  type SidebarInterfaceId,
} from "./registry";
import type { SidebarItem, SidebarCategory } from "./types";

interface AppSidebarProps {
  /** Which interface config to render. */
  interfaceId?: SidebarInterfaceId;
  /** `session.user.role`, resolved once by the layout. */
  role?: string;
  /** `session.user.access`, resolved once by the layout. */
  access?: string[];
  /** Overrides the interface's own title. Rarely needed. */
  title?: string;
}

export function AppSidebar({
  interfaceId = "platform",
  role,
  access,
  title: titleOverride,
}: AppSidebarProps) {
  const iface = getSidebarInterface(interfaceId);
  const basePath = iface.basePath;
  const title = titleOverride ?? iface.title;

  // Baked once per mount. The layout that renders this is a server component
  // that persists across client-side navigation, so this does not recompute
  // when the user moves between tools — only on a full page load.
  const accessKey = (access ?? []).join(",");
  const visibleCategories = React.useMemo(
    () => resolveSidebar(iface, role, access ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [iface, role, accessKey]
  );
  const pathname = usePathname();
  const { state, open, isMobile, openMobile, setOpenMobile } = useSidebar();
  const isDrawerOpen = isMobile ? openMobile : open;
  const isCollapsed = state === "collapsed";

  const handleLinkClick = () => {
    if (isMobile && openMobile) {
      setOpenMobile(false);
    }
  };

  // Icon collapse state - only hide text when truly collapsed
  // On mobile, when sidebar is open, we want to show the text
  const [iconCollapse, setIconCollapse] = React.useState(isCollapsed);
  const hideLabels = !isDrawerOpen;
  const collapseDelay = 2500; // ms
  const collapseTimeout = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (isCollapsed) {
      collapseTimeout.current = setTimeout(() => {
        setIconCollapse(true);
      }, collapseDelay);
    } else {
      setIconCollapse(false);
      if (collapseTimeout.current) {
        clearTimeout(collapseTimeout.current);
        collapseTimeout.current = null;
      }
    }
    return () => {
      if (collapseTimeout.current) {
        clearTimeout(collapseTimeout.current);
      }
    };
  }, [isCollapsed, collapseDelay]);

  useIsMac();

  return (
    <Sidebar
      className="border-r border-border flex flex-col h-screen bg-background xoverflow-y-auto"
      collapsible="icon"
      aria-label={`${title} navigation`}
    >
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 cursor-pointer">
            <Image
              src="/logo.png"
              alt="Ministry of Technology"
              width={48}
              height={48}
              className="rounded-lg object-cover transition-all duration-500 ease-in-out group-data-[state=collapsed]:w-8 group-data-[state=collapsed]:h-8"
              priority
            />
          </div>
          <div className="flex flex-col justify-center min-w-0 overflow-hidden transition-all duration-500 ease-in-out group-data-[state=collapsed]:w-0 group-data-[state=collapsed]:opacity-0">
            <h3 className="text-lg font-semibold text-primary dark:text-primary-bright truncate leading-tight whitespace-nowrap !text-left">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground leading-tight whitespace-wrap">
              by Techmin
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2 overflow-y-auto min-h-0">
        {visibleCategories.map((category: SidebarCategory) => (
          <SidebarGroup key={category.id}>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 py-1">
                {category.title}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {category.items.map((item: SidebarItem) => {
                  const IconComponent = item.icon;

                  const isCrossLink =
                    item.absolute ||
                    item.href.startsWith("..") ||
                    item.href.startsWith("http");
                  const fullHref = resolveHref(item, basePath);

                  // A section root (href "/") must not light up for its children.
                  const isSectionRoot =
                    !isCrossLink &&
                    (item.href === "/" || item.href === "");
                  const isActive =
                    pathname === fullHref ||
                    (!isSectionRoot &&
                      fullHref !== "/" &&
                      pathname.startsWith(`${fullHref}/`));

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
                          "justify-start gap-3 px-2",
                          // Focus indicator compliance
                          "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:outline-none"
                        )}
                        tooltip={iconCollapse ? item.title : undefined}
                      >
                        <Link
                          href={fullHref}
                          className="flex items-center w-full"
                          onClick={handleLinkClick}
                          aria-current={isActive ? "page" : undefined}
                        >
                          <div className="relative transition-all duration-500">
                            {IconComponent ? (
                              <IconComponent
                                aria-hidden="true"
                                className={cn(
                                  "size-4 group-data-[state=collapsed]:mx-auto flex-shrink-0",
                                  item.isNew &&
                                    !isActive &&
                                    "text-primary dark:text-secondary-extradark animate-pulse"
                                )}
                              />
                            ) : (
                              <div
                                aria-hidden="true"
                                className="size-4 group-data-[state=collapsed]:mx-auto flex-shrink-0 rounded-full bg-muted-foreground/35 animate-pulse"
                              />
                            )}
                            {item.isNew && (
                              <span
                                aria-hidden="true"
                                className="absolute -top-1 -right-1 flex h-2 w-2"
                              >
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary dark:bg-secondary-extradark opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary dark:bg-secondary-extradark"></span>
                              </span>
                            )}
                          </div>

                          <span
                            className={cn(
                              "truncate text-sm font-medium transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ml-3 group-data-[state=collapsed]:ml-0 flex-1 text-left",
                              hideLabels && "w-0 opacity-0 ml-0"
                            )}
                          >
                            {item.title}
                          </span>

                          {/* Fallback accessible label for screen readers when visual text is collapsed */}
                          {hideLabels && (
                            <span className="sr-only">{item.title}</span>
                          )}

                          {item.isNew && (
                            <>
                              {!hideLabels && (
                                <span
                                  className={cn(
                                    "ml-auto inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider transition-all duration-200",
                                    isActive
                                      ? "bg-primary-foreground/20 text-primary-foreground"
                                      : "bg-primary/15 text-primary dark:bg-secondary-extradark/15 dark:text-secondary-extradark border border-primary/25 dark:border-secondary-extradark/30 shadow-xs"
                                  )}
                                >
                                  New
                                </span>
                              )}
                              <span className="sr-only"> (New)</span>
                            </>
                          )}
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

      {!isCollapsed && (
        <SidebarFooter className="p-4">
          <div className="text-xs text-muted-foreground text-left transition-all duration-500 ease-in-out overflow-hidden group-data-[state=collapsed]:w-0 group-data-[state=collapsed]:opacity-0">
            <p>Developed & maintained by</p>
            <p className="text-primary dark:text-secondary-extradark text-bold">
              the Ministry of Technology
            </p>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}