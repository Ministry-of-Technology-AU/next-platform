"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { OrganisationType } from "../data/organisations";

interface FiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFilters: OrganisationType[];
  onFiltersChange: (filters: OrganisationType[]) => void;
}

const filterOptions: { value: OrganisationType; label: string }[] = [
  { value: "show all", label: "Show All" },
  { value: "inductions open", label: "Inductions Open" },
  { value: "ministry", label: "Ministry" },
  { value: "society", label: "Society" },
  { value: "club", label: "Club" },
  { value: "other", label: "Other" },
  { value: "fests", label: "Fests" },
  { value: "collectives", label: "Collectives" },
];

export function FiltersDialog({
  open,
  onOpenChange,
  selectedFilters,
  onFiltersChange,
}: FiltersDialogProps) {
  const [tempFilters, setTempFilters] =
    useState<OrganisationType[]>(selectedFilters);

  const handleFilterChange = (filter: OrganisationType, checked: boolean) => {
    if (filter === "show all") {
      setTempFilters(checked ? ["show all"] : []);
    } else {
      const newFilters = checked
        ? [...tempFilters.filter((f) => f !== "show all"), filter]
        : tempFilters.filter((f) => f !== filter);
      setTempFilters(newFilters);
    }
  };

  const handleApply = () => {
    onFiltersChange(tempFilters);
    onOpenChange(false);
  };

  const handleReset = () => {
    setTempFilters(["show all"]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filters & Preferences</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            {filterOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={option.value}
                  checked={tempFilters.includes(option.value)}
                  onCheckedChange={(checked) =>
                    handleFilterChange(option.value, checked as boolean)
                  }
                />
                <Label htmlFor={option.value} className="text-sm font-medium">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleApply}>Apply Filters</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
