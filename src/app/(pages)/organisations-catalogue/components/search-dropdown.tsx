"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Organisation } from "../data/organisations";

interface SearchDropdownProps {
  suggestions: Organisation[];
  onSelect: (organisation: Organisation) => void;
  onClose: () => void;
}

export function SearchDropdown({
  suggestions,
  onSelect,
  onClose,
}: SearchDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <Card
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto"
    >
      <div className="p-2">
        {suggestions.map((org) => (
          <div
            key={org.id}
            className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
            onClick={() => onSelect(org)}
          >
            <div>
              <div className="font-medium text-sm">{org.name}</div>
              <div className="text-xs text-muted-foreground capitalize">
                {org.category}
              </div>
            </div>
            {org.inductionsOpen && (
              <Badge variant="secondary" className="text-xs">
                Open
              </Badge>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
