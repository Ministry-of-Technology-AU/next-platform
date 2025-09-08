"use client";

import { useState, useEffect } from "react";
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
import { Search, Save } from "lucide-react";
import { defaultColors } from "../data/calendar-data";
import type { Preferences, Organization } from "../types/calendar";
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
  apiEndpoint?: string;
  organizations: Organization[];
}

export function PreferencesSidebar({
  open,
  onOpenChange,
  preferences,
  onPreferencesChange,
  selectedDate,
  onDateSelect,
  apiEndpoint = "/api/events/preferences",
  organizations = []
}: PreferencesSidebarProps) {
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Handle client-side only rendering
  useEffect(() => {
    setMounted(true);
  }, []);

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
    // Simply toggle the current category
    const isCurrentlySelected = preferences.selectedCategories.includes(category);
    let newSelected: string[];
    
    if (isCurrentlySelected) {
      // If deselecting, remove from the list
      newSelected = preferences.selectedCategories.filter(cat => cat !== category);
      
      // Make sure we have at least one category selected
      if (newSelected.length === 0) {
        // If we're removing the last category, ensure we keep it selected
        newSelected = [category];
      }
    } else {
      // If selecting, add to the list
      newSelected = [...preferences.selectedCategories, category];
      
      // Remove "all" if it exists and we have specific categories
      if (newSelected.includes("all") && newSelected.length > 1) {
        newSelected = newSelected.filter(cat => cat !== "all");
      }
    }

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

  const handleSavePreferences = async () => {
    try {
      setIsSaving(true);
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ preferences }) // Wrap preferences in an object
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save preferences: ${response.statusText}`);
      }
      
      // Get response data
      const data = await response.json();
      
      // Update preferences with the saved data if it's returned
      if (data && data.data) {
        onPreferencesChange(data.data);
      }
      
      // Show success message
      alert("Preferences saved successfully!");
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert(`Error saving preferences: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
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
            {mounted && (
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && onDateSelect(date)}
                className="rounded-md border mx-auto max-w-full w-85"
              />
            )}
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
                  {/* Custom header instead of Accordion11Trigger */}
                  <div className="capitalize text-sm text-left flex items-center w-full py-2 border-b">
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

                    {/* Right: Palette */}
                    <div className="flex items-center space-x-2 ml-auto">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className="w-5 h-5 rounded border hover:scale-110 transition-transform"
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
                    </div>
                    
                    {/* Separate accordion trigger with just the chevron */}
                    <Accordion11Trigger className="ml-2 p-0">
                      <span className="sr-only">Toggle {category}</span>
                    </Accordion11Trigger>
                  </div>

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
                        {getFilteredOrganizations(category).length > 0 ? (
                          getFilteredOrganizations(category).map((org) => (
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
                          ))
                        ) : (
                          <div className="text-sm text-muted-foreground py-2 text-center">
                            No organizations found
                          </div>
                        )}
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
              disabled={isSaving}
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
                ${isSaving ? 'opacity-70' : ''}
              `}
              style={{ minWidth: "3.5rem" }}
            >
              <span className="flex items-center w-full justify-center group-hover:justify-start">
                <Save
                  className={`w-15 h-15 flex-shrink-0 text-center ${isSaving ? 'animate-pulse' : ''}`}
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
                  {isSaving ? 'Saving...' : 'Save Preferences'}
                </span>
              </span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
