"use client";

import * as React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useIsMac } from "@/hooks/useIsMac";
import { Button } from "@/components/ui/button";
import { User, Newspaper, HelpCircle, LogOut, UserPen, LogIn, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { TourTrigger } from "../guided-tour";
import { SidebarTrigger } from "../ui/sidebar";
import ThemeToggle from "@/components/ui/theme-toggle";
import ClientOnly from "../client-only";
import Link from "next/link";
import { useRouter } from "next/navigation";
import sidebarEntries from "@/components/sidebar/sidebar-entries.json";
import FeedbackDialog from "./FeedbackDialog";

// Search Command Component
const SearchCommand = React.memo(function SearchCommand() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const isMac = useIsMac();

  // Keyboard shortcut listener
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (href: string) => {
    setOpen(false);
    router.push(`/platform${href}`);
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            className="relative h-8 w-8 p-0 xl:h-9 xl:w-60 xl:justify-start xl:px-3 xl:py-2 dark:bg-neutral-light"
          >
            <Search className="h-4 w-4 xl:mr-2" />
            <span className="hidden xl:inline-flex">Search features...</span>
            <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
              <span className="text-xs">{isMac ? "⌘" : "Ctrl"}</span>K
            </kbd>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="xl:hidden">
          <p className="text-sm">
            Search features
            <br />
            <span className="text-xs text-muted-foreground">
              {isMac ? "⌘" : "Ctrl"} + K
            </span>
          </p>
        </TooltipContent>
      </Tooltip>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search features..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {sidebarEntries.categories.map((category) => (
            <React.Fragment key={category.id}>
              <CommandGroup heading={category.title}>
                {category.items.map((item) => (
                  <CommandItem
                    key={item.href}
                    onSelect={() => handleSelect(item.href)}
                    className="cursor-pointer"
                  >
                    <span>{item.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
});

// Authentication Section Component
const AuthSection = React.memo(function AuthSection() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Button variant="ghost" size="icon" disabled className="h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10">
        <User className="size-4 xs:size-4.5 sm:size-5 animate-pulse" />
      </Button>
    );
  }

  if (!session) {
    // Show login button when not authenticated
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="default"
            size="sm"
            onClick={() => signIn("google")}
            className="gap-1 xs:gap-1.5 sm:gap-2 h-8 xs:h-9 sm:h-10 px-2 xs:px-3 sm:px-4 text-xs xs:text-sm"
          >
            <LogIn className="size-3 xs:size-3.5 sm:size-4" />
            <span className="hidden xs:inline">Sign In</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="hidden sm:block">
          <p className="text-sm">Sign in with your Ashoka email</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Show user avatar and dropdown when authenticated
  return (
    <Tooltip>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="User profile" className="h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10">
            <Avatar className="h-full w-full">
              <TooltipTrigger asChild>
                <AvatarImage
                  src={session.user?.image || ""}
                  alt="User Avatar"
                />
              </TooltipTrigger>
              <AvatarFallback>
                <User className="size-4 xs:size-4.5 sm:size-5" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 xs:w-72">
          <div className="flex items-center space-x-2 p-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session.user?.image || ""} alt="Avatar" />
              <AvatarFallback>
                <User className="size-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1 min-w-0 flex-1">
              <p className="text-sm font-medium leading-none truncate">
                {session.user?.name}
              </p>
              <p className="text-xs leading-none text-muted-foreground truncate">
                {session.user?.email}
              </p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <UserPen className="mr-2 h-4 w-4" />
            <Link href="/platform/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut()}
            className="text-red-600 dark:text-red-400"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Tooltip>
  );
});

export default function Navbar() {
  const isMac = useIsMac();
  return (
    <nav className="w-full flex fixed top-0 items-center justify-between px-2 xs:px-3 sm:px-4 md:px-6 py-2 sm:py-3 border-b border-border bg-background backdrop-blur-md z-50">
      {/* Left: Logo and text */}
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarTrigger className="hover:text-primary-extralight dark:hover:text-primary-light dark:text-primary-bright" />
          </TooltipTrigger>
          <TooltipContent side="right" align="center" className="text-white hidden sm:block">
            Toggle Sidebar
            <div className="text-xs text-white/80 mt-1">
              Shortcut:{" "}
              <kbd className="font-mono text-gray-dark bg-white px-1 py-0.5 rounded">
                {isMac ? "⌘" : "Ctrl"} + B
              </kbd>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Right: Search, Help, Feedback, theme toggle, profile */}
      <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-2 ml-auto">
        {/* Search Command */}
        <SearchCommand />
        
        {/* Help button - Launches global tooltips */}
        <Tooltip>
          <TourTrigger>
            <TooltipTrigger asChild>
              <Button variant="animatedGhost" size="icon" aria-label="Help" className="h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10">
                <HelpCircle className="size-4 xs:size-4.5 sm:size-5" />
              </Button>
            </TooltipTrigger>
          </TourTrigger>
          <TooltipContent className="hidden sm:block">
            <p className="text-sm">Need help? See a Guided Tour (not implemented for all features yet)!</p>
          </TooltipContent>
        </Tooltip>

        {/* Feedback Button - Launches a modal*/}
        <Tooltip>
          <Dialog>
            <DialogTrigger asChild>
              <TooltipTrigger asChild>
                <Button
                  variant="animatedGhost"
                  size="icon"
                  aria-label="Feedback"
                  className="h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10"
                >
                  <Newspaper className="size-4 xs:size-4.5 sm:size-5" />
                </Button>
              </TooltipTrigger>
            </DialogTrigger>
          <FeedbackDialog isOpen={true} onClose={() => {}} />
          </Dialog>
          <TooltipContent className="hidden sm:block">
            <p className="text-sm">Give us your feedback!</p>
          </TooltipContent>
        </Tooltip>

        {/* Dark/Light Mode Toggle button */}
        <Tooltip>
          <ThemeToggle />
          <TooltipContent className="hidden sm:block">
            <p className="text-sm text-white">
              Toggle dark/light mode
              <br />
              <span className="text-xs text-white/80">
                Shortcut:{" "}
                <kbd className="text-gray-dark font-mono bg-white px-1 py-0.5 rounded">
                  {isMac ? "⌘" : "Ctrl"} + D
                </kbd>
              </span>
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Authentication Section */}
        <ClientOnly 
          fallback={
            <Button variant="ghost" size="icon" disabled className="h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10">
              <User className="size-4 xs:size-4.5 sm:size-5 animate-pulse" />
            </Button>
          }
        >
          <AuthSection />
        </ClientOnly>
      </div>
    </nav>
  );
} 