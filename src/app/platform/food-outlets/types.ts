// Food Outlet types

export type FoodType = 'veg' | 'non-veg' | 'egg';
export type FoodCategory = 'Snacks' | 'Main Course' | 'Beverages' | 'Desserts' | 'Pizza' | 'Pasta' | 'Sides' | 'Coffee' | 'Juices' | 'Smoothies' | 'Healthy' | 'Rolls' | 'Wraps';

export interface FoodItem {
    id: string;
    name: string;
    price: number;
    category: FoodCategory | string;
    calories: number | null;
    foodType: FoodType;
}

export interface FoodOutlet {
    id: string;
    name: string;
    location: string;
    description: string;
    cuisine: string;
    contactNumber: string;
    logoUrl: string | null;
    isOpen: boolean;
    openingHours: string;
    rating: number;
    ratingCount: number;
    items: FoodItem[];
}

// Search result types
export interface SearchResult {
    type: 'outlet' | 'item';
    outlet: FoodOutlet;
    item?: FoodItem;
}

// For future form submissions
export interface CalorieReport {
    itemId: string;
    outletId: string;
    calories: number;
    reportedBy?: string;
}

export interface RatingSubmission {
    outletId: string;
    rating: number;
    review?: string;
    submittedBy?: string;
}

// ─── Meal Planner Types ────────────────────────────────────

export interface NutrientBreakdown {
    protein: number;   // grams
    carbs: number;     // grams
    fat: number;       // grams
    fiber: number;     // grams
}

export interface MealPlanItem {
    id: string;
    name: string;
    price: number;
    calories: number;
    foodType: FoodType;
    nutrients: NutrientBreakdown;
    outletId?: string;      // set if added from an outlet
    outletName?: string;    // display name of the outlet
    isCustom: boolean;      // true if user-created
}

export interface Meal {
    id: string;
    name: string;       // e.g. "Breakfast", or user-defined
    items: MealPlanItem[];
}

export interface DayPlan {
    date: string;        // ISO date string (YYYY-MM-DD)
    meals: Meal[];
    saved: boolean;
}

export type WeekPlan = Record<string, DayPlan>;  // keyed by ISO date
