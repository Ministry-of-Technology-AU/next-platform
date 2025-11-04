'use client';

import * as React from 'react';
import { Filter, Save, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { ChecklistProgress, ChecklistItem } from './checklist-progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {
  Accordion11,
  Accordion11Content,
  Accordion11Item,
  Accordion11Trigger,
} from '@/components/ui/shadcn-io/accordion-11';
import { OrganizationType, Organization } from '../types';
import { defaultColors } from '../../events-calendar/data/calendar-data';
import { useCategoryColors } from './category-colors-context';
import { toast } from 'sonner';

interface FilterPreferences {
  selectedOrganizations: string[];
  selectedCategories: string[];
  categoryColors: Record<string, string>;
}

interface OrgsChecklistItem {
  name: string;
  deadline: string;
  isDone: boolean;
}

interface FiltersSidebarProps {
  filters: Set<OrganizationType>;
  onFilterChange: (filters: Set<OrganizationType>) => void;
  onPreferencesChange?: (preferences: FilterPreferences) => void;
  isIconOnly?: boolean;
}

export function FiltersSidebar({ filters, onFilterChange, onPreferencesChange, isIconOnly = false }: FiltersSidebarProps) {
  const { categoryColors, setCategoryColors } = useCategoryColors();
  
  const [checklistItems, setChecklistItems] = React.useState<ChecklistItem[]>([]);
  const [checklistLoading, setChecklistLoading] = React.useState(true);
  
  const [organizations, setOrganizations] = React.useState<Organization[]>([]);
  const [organizationsLoading, setOrganizationsLoading] = React.useState(true);
  
  const [preferences, setPreferences] = React.useState<FilterPreferences>({
    selectedOrganizations: [],
    selectedCategories: ['clubs', 'societies', 'departments', 'ministries', 'others'],
    categoryColors: categoryColors,
  });
  
  const [searchTerms, setSearchTerms] = React.useState<Record<string, string>>({});
  const [mounted, setMounted] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const categories = ['clubs', 'societies', 'departments', 'ministries', 'others'] as const;

  // Fetch organizations
  React.useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setOrganizationsLoading(true);
        const response = await fetch('/api/platform/organisations-catalogue');
        if (!response.ok) throw new Error('Failed to fetch organizations');
        const data = await response.json();
        // Handle nested structure from API
        const orgs = data.data?.organisations || data.organisations || data.data || [];
        setOrganizations(orgs);
      } catch (error) {
        console.error('Error fetching organizations:', error);
        setOrganizations([]);
      } finally {
        setOrganizationsLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

    // Fetch user preferences on mount
  React.useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch('/api/platform/organisations-catalogue/preferences');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.preferences) {
            const newPreferences = {
              ...data.preferences,
              categoryColors: data.preferences.categoryColors || categoryColors,
            };
            setPreferences(newPreferences);
            setCategoryColors(data.preferences.categoryColors || categoryColors);
            
            // Notify parent component of initial preferences load
            if (onPreferencesChange) {
              onPreferencesChange(newPreferences);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      }
    };

    fetchPreferences();
    // Only run once on mount 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Replace session API with a fetch to Strapi user profile, using a dedicated endpoint
  React.useEffect(() => {
    const fetchChecklist = async () => {
      try {
        setChecklistLoading(true);
        // Get checklist by calling dedicated organisations-catalogue/user-checklist endpoint
        // Expect a JSON object with a `checklist` array field from the Strapi user object
        const response = await fetch('/api/platform/organisations-catalogue/checklist', {
          credentials: 'include', // forward cookies if on server
        });
        const data = await response.json();
        console.log('Checklist raw response:', data); // LOG FOR DEBUG
        if (data?.success && Array.isArray(data.checklist)) {
          const items = data.checklist.map((item: OrgsChecklistItem) => ({
            id: item.name.toLowerCase().replace(/\s+/g, '-'),
            label: item.name,
            deadline: item.deadline,
            completed: item.isDone,
          }));
          setChecklistItems(items);
        } else {
          setChecklistItems([]);
        }
      } catch (error) {
        console.error('Error fetching checklist from Strapi user:', error);
        setChecklistItems([]);
      } finally {
        setChecklistLoading(false);
      }
    };
    fetchChecklist();
  }, []);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Helper function to reload preferences
  const reloadPreferences = React.useCallback(async () => {
    try {
      const prefsResponse = await fetch('/api/platform/organisations-catalogue/preferences');
      if (prefsResponse.ok) {
        const prefsData = await prefsResponse.json();
        if (prefsData.success && prefsData.preferences) {
          const newPreferences = {
            ...prefsData.preferences,
            categoryColors: prefsData.preferences.categoryColors || preferences.categoryColors,
          };
          setPreferences(newPreferences);
          setCategoryColors(prefsData.preferences.categoryColors || preferences.categoryColors);
          
          // Notify parent component of preferences change
          if (onPreferencesChange) {
            onPreferencesChange(newPreferences);
          }
          return newPreferences;
        }
      }
    } catch (reloadError) {
      console.error('Error reloading preferences:', reloadError);
    }
    return null;
  }, [preferences.categoryColors, setCategoryColors, onPreferencesChange]);

  const toggleChecklistItem = (itemId: string) => {
    setChecklistItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const getFilteredOrganizations = (category: string) => {
    const searchTerm = searchTerms[category] || '';
    
    return organizations
      .filter((org) => {
        const orgType = org.type.toLowerCase();
        // Map categories to organization types
        if (category === 'clubs') return orgType === 'club';
        if (category === 'societies') return orgType === 'society';
        if (category === 'departments') return orgType === 'iso' || orgType === 'league';
        if (category === 'ministries') return orgType === 'ministry';
        if (category === 'others') return !['club', 'society', 'ministry', 'fest', 'collective', 'iso', 'league'].includes(orgType);
        return false;
      })
      .filter((org) =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  };

  const handleOrganizationToggle = (orgId: string) => {
    const newSelected = preferences.selectedOrganizations.includes(orgId)
      ? preferences.selectedOrganizations.filter((id) => id !== orgId)
      : [...preferences.selectedOrganizations, orgId];

    setPreferences({
      ...preferences,
      selectedOrganizations: newSelected,
    });
  };

  const handleCategoryToggle = (category: string) => {
    const isCurrentlySelected = preferences.selectedCategories.includes(category);
    let newSelected: string[];
    
    if (isCurrentlySelected) {
      newSelected = preferences.selectedCategories.filter(cat => cat !== category);
      
      // Make sure we have at least one category selected
      if (newSelected.length === 0) {
        newSelected = [category];
      }
    } else {
      newSelected = [...preferences.selectedCategories, category];
    }

    setPreferences({
      ...preferences,
      selectedCategories: newSelected,
    });
  };

  const handleColorChange = (category: string, color: string) => {
    const newColors = {
      ...preferences.categoryColors,
      [category]: color,
    };
    setPreferences({
      ...preferences,
      categoryColors: newColors,
    });
    // Sync to context so organization cards update in real-time
    setCategoryColors(newColors);
  };

  const handleSavePreferences = async () => {
    try {
      setIsSaving(true);
      // Transform checklistItems to API format: { name, deadline, isDone }
      const checklistToPost = checklistItems.map((item) => ({
        name: item.label,
        deadline: item.deadline,
        isDone: item.completed,
      }));
      const response = await fetch('/api/platform/organisations-catalogue/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences, checklist: checklistToPost }),
        credentials: 'include', // handle cookies
      });
      if (!response.ok) {
        throw new Error(`Failed to save preferences: ${response.statusText}`);
      }
      const data = await response.json();
      
      // Reload preferences after saving to ensure we have the latest data
      await reloadPreferences();
      
      toast.success('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error(`Error saving preferences: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const activeFilterCount = filters.size;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className={`relative h-12 gap-2 rounded-full border-neutral-300 hover:bg-neutral-100 transition-all ${
            isIconOnly 
              ? 'w-12 p-0 flex items-center justify-center' 
              : 'px-6'
          }`}
        >
          <Filter className="h-5 w-5 flex-shrink-0" />
          {!isIconOnly && (
            <span className="text-sm font-medium">
              Filters & Preferences
            </span>
          )}
          {activeFilterCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-900 text-xs font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="overflow-y-auto px-5">
        <SheetHeader>
          <SheetTitle className='text-xs'>Filters and Preferences</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* My Club Checklist Section */}
          <div className="border border-neutral-200 rounded-lg p-4">
            <h3 className="font-medium mb-3">My Club Checklist</h3>
            {checklistLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : checklistItems.length > 0 ? (
              <ChecklistProgress
                items={checklistItems}
                onToggleItem={toggleChecklistItem}
              />
            ) : (
              <div className="text-sm text-muted-foreground py-4 text-center">
                No orgs to display
              </div>
            )}
          </div>

          {/* Categories and Organizations - Updated Section */}
          <div>
            <h3 className="font-medium mb-3">Categories and Organizations</h3>
            {organizationsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Accordion11
                type="single"
                collapsible
                className="w-full max-w-2xl"
                defaultValue="clubs"
              >
                {categories.map((category) => (
                  <Accordion11Item
                    key={category}
                    value={category}
                    className="flex flex-col justify-start !w-full"
                  >
                    {/* Custom header with checkbox, category name, and color picker */}
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
                        <span className="font-semibold text-sm capitalize">
                          {category}
                        </span>
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
                                      ? '#000'
                                      : '#d1d5db',
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
                            value={searchTerms[category] || ''}
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
                                <label htmlFor={org.id} className="text-sm cursor-pointer">
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
            )}
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t">
            <Button
              onClick={handleSavePreferences}
              disabled={isSaving || organizationsLoading}
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
                ${isSaving || organizationsLoading ? 'opacity-70' : ''}
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