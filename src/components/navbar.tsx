"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sun, Moon, User, Newspaper, HelpCircle, LogOut, UserPen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SidebarTrigger } from "./ui/sidebar";

// Simple dark/light toggle (uses 'dark' class on html)
function ThemeToggle() {
  const [isDark, setIsDark] = React.useState(false);
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
  }, []);
  const toggle = () => {
    setIsDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };
  return (
    <TooltipTrigger asChild>
      <Button
        variant="default"
        size="icon"
        aria-label="Toggle theme"
        onClick={toggle}
      >
        {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
      </Button>
    </TooltipTrigger>
  );
}

export default function Navbar() {
  return (
    <nav className="w-full flex top-0 items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-background backdrop-blur-md stick z-50">
      {/* Left: Logo and text */}
      <div className="flex items-center gap-2 min-w-0">
        <SidebarTrigger />
      </div>

      {/* Right: Help, Feedback, theme toggle, profile */}
      <div className="flex items-center gap-1 sm:gap-2 ml-auto">
        {/* Help button - Launches global tooltips */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Help">
              <HelpCircle className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">Need help? See tooltips!</p>
          </TooltipContent>
        </Tooltip>

        {/* Feedback Button - Launches a modal*/}
        <Tooltip>
          <Dialog>
            <DialogTrigger asChild>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Feedback">
                  <Newspaper className="size-5" />
                </Button>
              </TooltipTrigger>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Your Feedback</DialogTitle>
                <DialogDescription>
                  We appreciate your feedback! Please share your thoughts or
                  report issues.
                </DialogDescription>
                <form className="mt-4">
                  <textarea
                    className="w-full p-2 border border-border rounded-md"
                    rows={4}
                    placeholder="Type your feedback here..."
                  />
                  <div className="mt-2 flex justify-end">
                    <Button type="submit">Submit</Button>
                  </div>
                </form>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <TooltipContent>
            <p className="text-sm">Give us your feedback!</p>
          </TooltipContent>
        </Tooltip>

        {/* Dark/Light Mode Toggle button */}
        <Tooltip>
          <ThemeToggle />
          <TooltipContent>
            <p className="text-sm">Toggle dark/light mode</p>
          </TooltipContent>
        </Tooltip>

        {/* Profile Avatar button - Launches a dropdown */}
        <Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="User profile">
                <Avatar>
                  <TooltipTrigger asChild>
                    <AvatarImage
                      src="https://github.com/sohamtulsyan.png"
                      alt="User Avatar"
                    />
                  </TooltipTrigger>
                  <AvatarFallback>
                    <User className="size-5" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <UserPen />
                <span className="ml-2">Visit Profile Page</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut />
                <span className="ml-2">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Tooltip>
      </div>
    </nav>
  );
} 