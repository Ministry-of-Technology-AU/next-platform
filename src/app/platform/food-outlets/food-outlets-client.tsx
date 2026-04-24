"use client";

import { useState, useMemo, useCallback } from "react";
import { Search, SlidersHorizontal, X, Store, UtensilsCrossed, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { FoodOutlet, FoodItem, FoodType, SearchResult } from "./types";
import OutletCard from "./_components/outlet-card";
import OutletItemsModal from "./_components/outlet-items-modal";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FoodOutletsClientProps {
    outlets: FoodOutlet[];
}

const FOOD_TYPES: { value: FoodType | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'veg', label: 'Veg' },
    { value: 'non-veg', label: 'Non-Veg' },
    { value: 'egg', label: 'Egg' },
];

const CATEGORIES = [
    'All',
    'Snacks',
    'Main Course',
    'Beverages',
    'Coffee',
    'Desserts',
];

const ALL_ALLERGENS = [
    "Dairy",
    "Gluten",
    "Nuts",
    "Soy",
    "Eggs",
    "Fish",
    "Shellfish",
    "Sesame"
];

export default function FoodOutletsClient({ outlets }: FoodOutletsClientProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [foodTypeFilter, setFoodTypeFilter] = useState<FoodType | 'all'>('all');
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 300]);
    const [allowedAllergens, setAllowedAllergens] = useState<string[]>(ALL_ALLERGENS);
    const [selectedOutlet, setSelectedOutlet] = useState<FoodOutlet | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    // Calculate max price from all items
    const maxPrice = useMemo(() => {
        let max = 0;
        outlets.forEach(outlet => {
            outlet.items.forEach(item => {
                if (item.price > max) max = item.price;
            });
        });
        return Math.ceil(max / 50) * 50; // Round up to nearest 50
    }, [outlets]);

    // Search results - unified search for outlets and items
    const searchResults = useMemo((): SearchResult[] => {
        if (!searchTerm.trim()) return [];
        const term = searchTerm.toLowerCase();
        const results: SearchResult[] = [];

        outlets.forEach(outlet => {
            // Check if outlet name matches
            if (outlet.name.toLowerCase().includes(term)) {
                results.push({ type: 'outlet', outlet });
            }

            // Check items - show item with outlet context
            outlet.items.forEach(item => {
                if (item.name.toLowerCase().includes(term)) {
                    results.push({ type: 'item', outlet, item });
                }
            });
        });

        return results.slice(0, 10); // Limit results
    }, [outlets, searchTerm]);

    // Filter outlets based on criteria
    const filteredOutlets = useMemo(() => {
        const allowedValues = allowedAllergens.map(a => a.toLowerCase());

        return outlets.filter(outlet => {
            // Check if any items match the filters
            const hasMatchingItems = outlet.items.some(item => {
                const matchesFoodType = foodTypeFilter === 'all' || item.foodType === foodTypeFilter;
                const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
                const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];

                const itemAllergens = (item.allergens || "None").split(',').map(a => a.trim().toLowerCase()).filter(a => a !== 'none' && a !== '');
                const matchesAllergens = itemAllergens.length === 0 || itemAllergens.every(a => allowedValues.includes(a));

                return matchesFoodType && matchesCategory && matchesPrice && matchesAllergens;
            });

            return hasMatchingItems;
        });
    }, [outlets, foodTypeFilter, categoryFilter, priceRange, allowedAllergens]);

    const handleOutletClick = useCallback((outlet: FoodOutlet) => {
        setSelectedOutlet(outlet);
        setModalOpen(true);
    }, []);

    const handleSearchResultClick = useCallback((result: SearchResult) => {
        if (result.type === 'outlet') {
            setSelectedOutlet(result.outlet);
            setModalOpen(true);
            setSearchTerm("");
        }
        // Items are not clickable, just display
    }, []);

    const clearFilters = () => {
        setFoodTypeFilter('all');
        setCategoryFilter('All');
        setPriceRange([0, maxPrice]);
        setAllowedAllergens(ALL_ALLERGENS);
    };

    const hasActiveFilters = foodTypeFilter !== 'all' || categoryFilter !== 'All' || priceRange[0] > 0 || priceRange[1] < maxPrice || allowedAllergens.length !== ALL_ALLERGENS.length;

    // Shared content as JSX element (NOT a component function — avoids remount on state change)
    const outletsContent = (
        <>
            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search outlets or food items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10"
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto">
                        {searchResults.map((result, index) => (
                            <div
                                key={`${result.outlet.id}-${result.item?.id || 'outlet'}-${index}`}
                                onClick={() => handleSearchResultClick(result)}
                                className={`flex items-center gap-3 p-3 border-b border-border last:border-b-0 ${result.type === 'outlet' ? 'cursor-pointer hover:bg-muted/50' : ''
                                    }`}
                            >
                                {result.type === 'outlet' ? (
                                    <>
                                        <Store className="w-5 h-5 text-primary shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{result.outlet.name}</p>
                                            <p className="text-xs text-muted-foreground">{result.outlet.location}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm">
                                            <span className="text-secondary-dark">★ {result.outlet.rating}</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <UtensilsCrossed className="w-5 h-5 text-muted-foreground shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{result.item?.name}</p>
                                            <p className="text-xs text-muted-foreground">at {result.outlet.name}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-medium">{result.item?.isMRP ? `MRP: ₹${result.item?.price}` : `₹${result.item?.price}`}</span>
                                            {result.item?.allergens && result.item.allergens.toLowerCase().trim() !== 'none' && result.item.allergens.trim() !== '' && (
                                                <>
                                                    <span className="text-muted-foreground">•</span>
                                                    <span className="text-yellow-600 text-xs">Allergens: {result.item.allergens}</span>
                                                </>
                                            )}
                                            <span className="text-muted-foreground">•</span>
                                            <span className="text-secondary-dark">★ {result.outlet.rating}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
                {/* Food Type Toggles */}
                <div className="flex border border-border rounded-lg overflow-hidden">
                    {FOOD_TYPES.map(type => (
                        <button
                            key={type.value}
                            onClick={() => setFoodTypeFilter(type.value)}
                            className={`px-3 py-1.5 text-sm transition-colors ${foodTypeFilter === type.value
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted'
                                }`}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>

                {/* Category Select */}
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        {CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Price Range */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1">
                            <SlidersHorizontal className="w-4 h-4" />
                            ₹{priceRange[0]} - ₹{priceRange[1]}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                        <div className="space-y-4">
                            <p className="text-sm font-medium">Price Range</p>
                            <Slider
                                value={priceRange}
                                onValueChange={(value) => setPriceRange(value as [number, number])}
                                min={0}
                                max={maxPrice}
                                step={10}
                            />
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>₹{priceRange[0]}</span>
                                <span>₹{priceRange[1]}</span>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Allergen Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            Allergens
                            {allowedAllergens.length !== ALL_ALLERGENS.length && (
                                <Badge variant="secondary" className="px-1 py-0 h-4 min-w-4 flex items-center justify-center text-[10px] ml-1">
                                    {allowedAllergens.length}
                                </Badge>
                            )}
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Safe to consume</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {ALL_ALLERGENS.map((allergen) => (
                            <DropdownMenuCheckboxItem
                                key={allergen}
                                checked={allowedAllergens.includes(allergen)}
                                onCheckedChange={(checked) => {
                                    setAllowedAllergens((prev) =>
                                        checked
                                            ? [...prev, allergen]
                                            : prev.filter((a) => a !== allergen)
                                    );
                                }}
                            >
                                {allergen}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                        <X className="w-4 h-4 mr-1" />
                        Clear
                    </Button>
                )}
            </div>

            {/* Results count */}
            <p className="text-sm text-muted-foreground mb-4">
                {filteredOutlets.length} outlet{filteredOutlets.length !== 1 ? 's' : ''} found
            </p>

            {/* Outlet Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredOutlets.map(outlet => (
                    <OutletCard
                        key={outlet.id}
                        outlet={outlet}
                        onClick={() => handleOutletClick(outlet)}
                    />
                ))}
            </div>

            {/* Empty state */}
            {filteredOutlets.length === 0 && (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                    <UtensilsCrossed className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No outlets found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters</p>
                </div>
            )}
        </>
    );

    return (
        <>
            {/* Desktop: Direct render */}
            <div className="hidden lg:block">
                <div className="bg-card rounded-lg border border-border p-4">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Store className="w-5 h-5" />
                        Food Outlets (in and around Ashoka)
                    </h2>
                    {outletsContent}
                </div>
            </div>

            {/* Mobile: Accordion */}
            <div className="lg:hidden">
                <Accordion type="single" collapsible defaultValue="outlets">
                    <AccordionItem value="outlets" className="border rounded-lg">
                        <AccordionTrigger className="px-4 hover:no-underline">
                            <div className="flex items-center gap-2">
                                <Store className="w-5 h-5" />
                                <span className="font-semibold">Food Outlets (in and around Ashoka)</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                            {outletsContent}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            {/* Items Modal */}
            <OutletItemsModal
                outlet={selectedOutlet}
                open={modalOpen}
                onOpenChange={setModalOpen}
                allowedAllergens={allowedAllergens}
            />
        </>
    );
}

