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
import { type Organisation, type OrganisationType } from "./data/organisations";

interface Props {
  organisations: Organisation[];
  error: string | null;
}

export default function OrganisationsCatalogueClient({
  organisations,
  error,
}: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<OrganisationType[]>([
    "show all",
  ]);
  const [selectedOrganisation, setSelectedOrganisation] =
    useState<Organisation | null>(null);
  const [showFiltersDialog, setShowFiltersDialog] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredOrganisations = useMemo(() => {
    let filtered = organisations;

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (org) =>
          org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          org.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          org.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (!selectedFilters.includes("show all")) {
      filtered = filtered.filter((org) => {
        if (selectedFilters.includes("inductions open") && org.inductionsOpen)
          return true;
        return selectedFilters.includes(org.category as OrganisationType);
      });
    }

    return filtered;
  }, [searchQuery, selectedFilters, organisations]);

  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return organisations
      .filter(
        (org) =>
          org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          org.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 5);
  }, [searchQuery, organisations]);

  return (
    <>
      {/* Search and filters */}
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

      {/* Results */}
      <div className="text-sm text-muted-foreground">
        {isLoading
          ? "Loading..."
          : `Showing ${filteredOrganisations.length} organisations`}
      </div>

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
      )}

      {!isLoading && filteredOrganisations.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No organisations found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters to find what you&apos;re looking
            for.
          </p>
        </div>
      )}

      {/* Dialogs */}
      <FiltersDialog
        open={showFiltersDialog}
        onOpenChange={setShowFiltersDialog}
        selectedFilters={selectedFilters}
        onFiltersChange={setSelectedFilters}
      />
      <OrganisationDialog
        organisation={selectedOrganisation}
        open={!!selectedOrganisation}
        onOpenChange={(open) => !open && setSelectedOrganisation(null)}
      />
    </>
  );
}
