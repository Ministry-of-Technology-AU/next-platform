"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AnimatedSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function AnimatedSearch({
  onSearch,
  placeholder = "Search events...",
}: AnimatedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleToggle = () => {
    if (isExpanded && searchQuery) {
      setSearchQuery("");
      onSearch("");
    }
    setIsExpanded(!isExpanded);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <div className="flex items-center">
      <div
        className={cn(
          "flex items-center transition-all duration-300 ease-in-out",
          isExpanded ? "w-64" : "w-10"
        )}
      >
        {isExpanded ? (
          <div className="flex items-center w-full border rounded-md">
            <Input
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={placeholder}
              className="border-0 focus-visible:ring-0"
              autoFocus
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className="h-10 w-10 p-0"
          >
            <Search className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
