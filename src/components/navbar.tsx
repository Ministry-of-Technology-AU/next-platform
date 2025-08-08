"use client";

import * as React from "react";
import Image from "next/image";
import { useIsMac } from "@/hooks/useIsMac";
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
import { TourTrigger } from "./guided-tour";
import { SidebarTrigger } from "./ui/sidebar";
import ThemeToggle from "@/components/ui/theme-toggle";


export default function Navbar() {
const isMac = useIsMac();
  return (
    <nav className="w-full flex sticky top-0 items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-background backdrop-blur-md z-50">
      {/* Left: Logo and text */}
      <div className="flex items-center gap-2 min-w-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarTrigger className="hover:text-primary-extralight dark:hover:text-primary-light" />
          </TooltipTrigger>
          <TooltipContent side="right" align="center" className="text-white">
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

      {/* Right: Help, Feedback, theme toggle, profile */}
      <div className="flex items-center gap-1 sm:gap-2 ml-auto">
        {/* Help button - Launches global tooltips */}
        <Tooltip>
          <TourTrigger>
            <TooltipTrigger asChild>
              <Button variant="animatedGhost" size="icon" aria-label="Help">
                <HelpCircle className="size-5" />
              </Button>
            </TooltipTrigger>
          </TourTrigger>
          <TooltipContent>
            <p className="text-sm">Need help? See tooltips!</p>
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
                >
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
          <ThemeToggle
            onClick={() => {
              // Replicate the old toggle logic
              const next = !document.documentElement.classList.contains("dark");
              document.documentElement.classList.toggle("dark", next);
            }}
          />
          <TooltipContent>
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