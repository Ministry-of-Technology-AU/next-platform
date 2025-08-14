"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion11,
  Accordion11Content,
  Accordion11Item,
  Accordion11Trigger,
} from "@/components/ui/shadcn-io/accordion-11";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Search, Save, Palette } from "lucide-react";
import { organizations, defaultColors } from "../data/calendar-data";
import type { Preferences } from "../types/calendar";
import { Button } from "@/components/ui/button";
import { TourStep } from "@/components/guided-tour";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";


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

  const handleSavePreferences = () => {
    alert("Preferences saved successfully!");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-96 overflow-y-auto px-5">
        <SheetHeader>
          <SheetTitle>Preferences</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Mini Calendar */}
          <TourStep
            id="calendar-preferences"
            order={3}
            title="Select a Date!"
            content="Select a date to view events for that date."
            position="right"
          >
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && onDateSelect(date)}
              className="rounded-md border mx-auto max-w-full w-85"
            />
          </TourStep>

          {/* Organization Preferences with Category Checkboxes */}
          <div>
            <h3 className="font-medium mb-3">Categories and Organizations</h3>
            <Accordion11
              type="single"
              collapsible
              className="w-full max-w-2xl"
              defaultValue="3"
            >
              {categories.map((category) => (
                <Accordion11Item
                  key={category}
                  value={category}
                  className="flex flex-col justify-start !w-full"
                >
                  <Accordion11Trigger className="capitalize text-sm text-left flex items-center w-full">
                    {/* Left: Checkbox + Category */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${category}`}
                        checked={preferences.selectedCategories.includes(
                          category
                        )}
                        onCheckedChange={() => handleCategoryToggle(category)}
                        className="rounded-xs mx-3 w-4 h-4 transition-transform duration-200 ease-in-out data-[state=checked]:scale-110"
                      />
                      <span className="font-semibold text-sm">{category}</span>
                    </div>

                    {/* Right: Palette + Chevron */}
                    <div className="flex items-center space-x-2 ml-auto">
                      <Button
                        variant="animatedGhost"
                        className="hover:text-primary"
                      >
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              className="w-5 h-5 rounded border"
                              style={{
                                backgroundColor:
                                  preferences.categoryColors[category],
                              }}
                            />
                          </PopoverTrigger>
                          <PopoverContent className="flex flex-wrap gap-2 w-50">
                            {defaultColors.map((color) => (
                              <button
                                key={color}
                                onClick={() =>
                                  handleColorChange(category, color)
                                }
                                className="w-6 h-6 rounded border-2 border-gray-300 hover:scale-110 transition-transform"
                                style={{
                                  backgroundColor: color,
                                  borderColor:
                                    preferences.categoryColors[category] ===
                                    color
                                      ? "#000"
                                      : "#d1d5db",
                                }}
                              />
                            ))}
                          </PopoverContent>
                        </Popover>
                      </Button>
                      {/* Chevron will still render automatically as part of AccordionTrigger */}
                    </div>
                  </Accordion11Trigger>

                  <Accordion11Content>
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
                              className="rounded-md w-5 h-5 transition-transform duration-200 ease-in-out data-[state=checked]:scale-110"
                            />
                            <label htmlFor={org.id} className="text-sm">
                              {org.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Accordion11Content>
                </Accordion11Item>
              ))}
            </Accordion11>
          </div>


          {/* Save Button */}
          <div className="pt-4 border-t">
            <Button
              onClick={handleSavePreferences}
              className={`
                fixed
                bottom-6
                right-6
                z-50
                h-14
                w-14
                rounded-full
                flex
                items-center
                justify-center
                bg-primary/70
                shadow-lg
                transition-all
                duration-300
                group
                hover:w-56
                hover:rounded-3xl
                hover:justify-start
                px-4
                overflow-hidden
              `}
              style={{ minWidth: "3.5rem" }}
            >
              <span className="flex items-center w-full justify-center group-hover:justify-start">
                <Save
                  className="w-15 h-15 flex-shrink-0 text-center"
                  strokeWidth={2.5}
                />
                <span
                  className={`
      ml-4
      text-lg
      font-semibold
      whitespace-nowrap
      hidden
      group-hover:inline
      transition-all
      duration-300
    `}
                >
                  Save Preferences
                </span>
              </span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
