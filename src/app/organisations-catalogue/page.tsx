"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Filter, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { OrganisationCard } from "./components/organisation-card";
import { OrganisationDialog } from "./components/organisations-dialog";
import { FiltersDialog } from "./components/filters-dialog";
import { SearchDropdown } from "./components/search-dropdown";
import { TourStep } from "@/components/guided-tour";
import { apiGet } from "@/lib/apis";
import {
  organisations,
  type Organisation,
  type OrganisationType,
} from "./data/organisations";

export default function OrganisationsCataloguePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
    const [courses, setCourses] = useState<any[] | null>(null);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
      apiGet("/platform/organisation-catalogue?format=json")
        .then((json) => {
          setCourses(json.organisations || []);
          console.log("orgs:", json.organisations); // log the payload directly
        })
        .catch((e) => setErr(e.message));
    }, []);
  const [selectedFilters, setSelectedFilters] = useState<OrganisationType[]>([
    "show all",
  ]);
  const [selectedOrganisation, setSelectedOrganisation] =
    useState<Organisation | null>(null);
  const [showFiltersDialog, setShowFiltersDialog] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Filter and search logic
  const filteredOrganisations = useMemo(() => {
    let filtered = organisations;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (org) =>
          org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          org.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          org.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filters
    if (!selectedFilters.includes("show all")) {
      filtered = filtered.filter((org) => {
        if (selectedFilters.includes("inductions open") && org.inductionsOpen)
          return true;
        return selectedFilters.includes(org.category as OrganisationType);
      });
    }

    return filtered;
  }, [searchQuery, selectedFilters]);

  // Search suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return organisations
      .filter(
        (org) =>
          org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          org.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 5);
  }, [searchQuery]);

  return (
    <div className="container px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">
            Organisations Catalogue
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-4xl">
          Find and connect with all 73 student organizations through our
          catalogue—featuring clubs, societies, fests, collectives, ISOs,
          leagues, and more!
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <TourStep
          id="organisation-search"
          order={1}
          title="Search for Organisations!"
          content="Find organisations by name, category, or description."
          position="right"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search organisations..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              className="pl-10"
            />
            {showSearchDropdown && searchSuggestions.length > 0 && (
              <SearchDropdown
                suggestions={searchSuggestions}
                onSelect={(org) => {
                  setSearchQuery(org.name);
                  setShowSearchDropdown(false);
                }}
                onClose={() => setShowSearchDropdown(false)}
              />
            )}
          </div>
        </TourStep>
        <TourStep
          id="organisation-filters"
          order={2}
          title="Filters & Preferences"
          content="Customize your view with filters for categories and preferences."
          position="right"
        >
          <Button
            variant="outline"
            onClick={() => setShowFiltersDialog(true)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters & Preferences
            {selectedFilters.length > 0 &&
              !selectedFilters.includes("show all") && (
                <Badge variant="secondary" className="ml-1">
                  {selectedFilters.length}
                </Badge>
              )}
          </Button>
        </TourStep>
      </div>

      {/* Active Filters */}
      {selectedFilters.length > 0 && !selectedFilters.includes("show all") && (
        <div className="flex flex-wrap gap-2">
          {selectedFilters.map((filter) => (
            <Badge key={filter} variant="secondary" className="capitalize">
              {filter}
            </Badge>
          ))}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {isLoading
          ? "Loading..."
          : `Showing ${filteredOrganisations.length} organisations`}
      </div>

      {/* Organisations Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <TourStep
          id="organisation-results"
          order={3}
          title="Browse Organisations"
          content="Explore the organisations that match your search and filters. Click on any card to view more details about the organisation!"
          position="top"
        >
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredOrganisations.map((organisation) => (
              <div key={organisation.id} className="break-inside-avoid">
                <OrganisationCard
                  organisation={organisation}
                  onClick={() => setSelectedOrganisation(organisation)}
                />
              </div>
            ))}
          </div>
        </TourStep>
      )}

      {/* No Results */}
      {!isLoading && filteredOrganisations.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No organisations found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters to find what you're looking
            for.
          </p>
        </div>
      )}

      {/* Dialogs */}
      <TourStep
        id="organisation-filters-dialog"
        order={4}
        title="Filters & Preferences Dialog"
        content="Use the filters dialog to select categories and preferences that suit your interests. You can choose multiple categories and toggle options like 'Inductions Open'."
      >
          <FiltersDialog
            open={showFiltersDialog}
            onOpenChange={setShowFiltersDialog}
            selectedFilters={selectedFilters}
            onFiltersChange={setSelectedFilters}
          />;
      </TourStep>
      <TourStep
        id="organisation-details"
        order={5}
        title="Organisation Details"
        content="View detailed information about the organisation, including its description, members, and contact information."
      >
        <OrganisationDialog
          organisation={selectedOrganisation}
          open={!!selectedOrganisation}
          onOpenChange={(open) => !open && setSelectedOrganisation(null)}
        />
      </TourStep>
    </div>
  );
}
