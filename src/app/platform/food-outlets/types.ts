// Food Outlet types

export interface FoodItem {
    id: string;
    name: string;
    price: number;
    category: string;
    calories: number | null; // null if not yet reported
    foodType: 'veg' | 'non-veg' | 'egg';
    rating: number | null; // average rating, null if no ratings yet
    ratingCount: number;
}

export interface FoodOutlet {
    id: string;
    name: string;
    location: string;
    description: string;
    cuisine: string;
    isOpen: boolean;
    openingHours: string;
    items: FoodItem[];
}

// For future form submissions
export interface CalorieReport {
    itemId: string;
    outletId: string;
    calories: number;
    reportedBy?: string;
}

export interface RatingSubmission {
    itemId: string;
    outletId: string;
    rating: number;
    review?: string;
    submittedBy?: string;
}
