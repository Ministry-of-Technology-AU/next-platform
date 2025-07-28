"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Search, Save } from "lucide-react";
import { organizations, defaultColors } from "../data/calendar-data";
import type { Preferences } from "../types/calendar";
import { Button } from "@/components/ui/button";

interface PreferencesSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: Preferences;
  onPreferencesChange: (preferences: Preferences) => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function PreferencesSidebar({
  open,
  onOpenChange,
  preferences,
  onPreferencesChange,
  selectedDate,
  onDateSelect,
}: PreferencesSidebarProps) {
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

  const categories = [
    "clubs",
    "societies",
    "departments",
    "ministries",
    "others",
  ] as const;

  const getFilteredOrganizations = (category: string) => {
    const searchTerm = searchTerms[category] || "";
    return organizations
      .filter((org) => org.category === category)
      .filter((org) =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  };

  const handleOrganizationToggle = (orgId: string) => {
    const newSelected = preferences.selectedOrganizations.includes(orgId)
      ? preferences.selectedOrganizations.filter((id) => id !== orgId)
      : [...preferences.selectedOrganizations, orgId];

    onPreferencesChange({
      ...preferences,
      selectedOrganizations: newSelected,
    });
  };

  const handleCategoryToggle = (category: string) => {
    const newSelected = preferences.selectedCategories.includes(category)
      ? preferences.selectedCategories.filter((cat) => cat !== category)
      : [...preferences.selectedCategories, category];

    onPreferencesChange({
      ...preferences,
      selectedCategories: newSelected,
    });
  };

  const handleColorChange = (category: string, color: string) => {
    onPreferencesChange({
      ...preferences,
      categoryColors: {
        ...preferences.categoryColors,
        [category]: color,
      },
    });
  };

  const handleSelectAll = () => {
    onPreferencesChange({
      ...preferences,
      selectedCategories: ["all"],
    });
  };

  const handleSavePreferences = () => {
    // TODO: Implement backend save functionality
    alert("Preferences saved successfully!");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-96 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Calendar Preferences</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Mini Calendar */}
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && onDateSelect(date)}
              className="rounded-md border"
            />
          </div>

          {/* Category Selection */}
          <div>
            <h3 className="font-medium mb-3">Show Categories</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all"
                  checked={preferences.selectedCategories.includes("all")}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="all" className="text-sm font-medium">
                  All
                </label>
              </div>
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={preferences.selectedCategories.includes(category)}
                    onCheckedChange={() => handleCategoryToggle(category)}
                    disabled={preferences.selectedCategories.includes("all")}
                  />
                  <label htmlFor={category} className="text-sm capitalize">
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Organization Preferences */}
          <div>
            <h3 className="font-medium mb-3">Select Organizations</h3>
            <Accordion type="multiple" className="w-full">
              {categories.map((category) => (
                <AccordionItem key={category} value={category}>
                  <AccordionTrigger className="capitalize">
                    {category}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder={`Search ${category}...`}
                          value={searchTerms[category] || ""}
                          onChange={(e) =>
                            setSearchTerms({
                              ...searchTerms,
                              [category]: e.target.value,
                            })
                          }
                          className="pl-8"
                        />
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {getFilteredOrganizations(category).map((org) => (
                          <div
                            key={org.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={org.id}
                              checked={preferences.selectedOrganizations.includes(
                                org.id
                              )}
                              onCheckedChange={() =>
                                handleOrganizationToggle(org.id)
                              }
                            />
                            <label htmlFor={org.id} className="text-sm">
                              {org.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Color Preferences */}
          <div>
            <h3 className="font-medium mb-3">Category Colors</h3>
            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category} className="space-y-2">
                  <label className="text-sm capitalize font-medium">
                    {category}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {defaultColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(category, color)}
                        className="w-6 h-6 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform"
                        style={{
                          backgroundColor: color,
                          borderColor:
                            preferences.categoryColors[category] === color
                              ? "#000"
                              : "#d1d5db",
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t">
            <Button onClick={handleSavePreferences} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
