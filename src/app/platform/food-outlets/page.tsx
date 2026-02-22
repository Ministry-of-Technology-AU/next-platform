import FoodOutletsClient from "./food-outlets-client";
import MealPlanner from "./_components/meal-planner";
import { cookies } from "next/headers";
import { FoodOutlet } from "./types";

async function getData(): Promise<FoodOutlet[]> {
    const cookieStore = await cookies();
    try {
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

        const response = await fetch(`${baseUrl}/api/platform/food-outlets`, {
            cache: 'no-store',
            headers: { 'Cookie': cookieStore.toString() },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error('Error fetching food outlets:', error);
        return [];
    }
}

export default async function FoodOutletsPage() {
    const outlets = await getData();

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Food Feature</h1>
                    <p className="text-muted-foreground">
                        Explore food outlets in and around Ashoka University
                    </p>
                </div>

                {/* Main Content - Split Layout */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Panel - Food Outlets Explorer (60%) */}
                    <div className="w-full lg:w-[60%]">
                        <FoodOutletsClient outlets={outlets} />
                    </div>

                    {/* Right Panel - Meal Planner (40%) */}
                    <div className="w-full lg:w-[40%]">
                        <MealPlanner />
                    </div>
                </div>
            </div>
        </div>
    );
}
