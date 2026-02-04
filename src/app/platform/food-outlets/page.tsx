import FoodOutletsClient from "./food-outlets-client";
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Food Outlets</h1>
                    <p className="text-muted-foreground">
                        Discover food options in and around campus. View menus, check calories, and leave ratings.
                    </p>
                </div>
                <FoodOutletsClient outlets={outlets} />
            </div>
        </div>
    );
}
