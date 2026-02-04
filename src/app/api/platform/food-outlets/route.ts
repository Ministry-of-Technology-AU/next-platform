import { NextResponse } from 'next/server';

// Dummy data for food outlets
const foodOutlets = [
    {
        id: 'dhaba',
        name: 'Dhaba',
        location: 'Near Mess Building',
        description: 'Traditional North Indian cuisine with a campus twist. Popular for late-night snacks and chai.',
        cuisine: 'North Indian',
        isOpen: true,
        openingHours: '8:00 AM - 11:00 PM',
        items: [
            { id: 'dhaba-1', name: 'Masala Maggi', price: 40, category: 'Snacks', calories: 320, foodType: 'veg', rating: 4.2, ratingCount: 156 },
            { id: 'dhaba-2', name: 'Cheese Maggi', price: 50, category: 'Snacks', calories: 410, foodType: 'veg', rating: 4.5, ratingCount: 203 },
            { id: 'dhaba-3', name: 'Aloo Paratha', price: 45, category: 'Main Course', calories: 280, foodType: 'veg', rating: 4.3, ratingCount: 178 },
            { id: 'dhaba-4', name: 'Egg Bhurji', price: 50, category: 'Main Course', calories: 220, foodType: 'egg', rating: 4.1, ratingCount: 134 },
            { id: 'dhaba-5', name: 'Chai', price: 15, category: 'Beverages', calories: 80, foodType: 'veg', rating: 4.6, ratingCount: 312 },
            { id: 'dhaba-6', name: 'Cold Coffee', price: 60, category: 'Beverages', calories: 180, foodType: 'veg', rating: 4.0, ratingCount: 98 },
            { id: 'dhaba-7', name: 'Samosa', price: 20, category: 'Snacks', calories: 150, foodType: 'veg', rating: 4.4, ratingCount: 245 },
            { id: 'dhaba-8', name: 'Bread Omelette', price: 40, category: 'Main Course', calories: 260, foodType: 'egg', rating: 4.2, ratingCount: 167 },
        ]
    },
    {
        id: 'chicago-pizza',
        name: 'Chicago Pizza',
        location: 'Food Court, Ground Floor',
        description: 'Authentic Chicago-style deep dish pizzas and Italian fast food.',
        cuisine: 'Italian',
        isOpen: true,
        openingHours: '10:00 AM - 10:00 PM',
        items: [
            { id: 'cp-1', name: 'Margherita Pizza', price: 199, category: 'Pizza', calories: 680, foodType: 'veg', rating: 4.3, ratingCount: 189 },
            { id: 'cp-2', name: 'Pepperoni Pizza', price: 249, category: 'Pizza', calories: 820, foodType: 'non-veg', rating: 4.5, ratingCount: 156 },
            { id: 'cp-3', name: 'Garlic Bread', price: 89, category: 'Sides', calories: 220, foodType: 'veg', rating: 4.1, ratingCount: 134 },
            { id: 'cp-4', name: 'Pasta Alfredo', price: 169, category: 'Pasta', calories: 520, foodType: 'veg', rating: 4.0, ratingCount: 98 },
            { id: 'cp-5', name: 'Chicken Wings', price: 189, category: 'Sides', calories: 380, foodType: 'non-veg', rating: 4.4, ratingCount: 145 },
            { id: 'cp-6', name: 'BBQ Chicken Pizza', price: 279, category: 'Pizza', calories: 780, foodType: 'non-veg', rating: 4.6, ratingCount: 178 },
        ]
    },
    {
        id: 'nescafe',
        name: 'Nescafe Corner',
        location: 'Library Building',
        description: 'Quick coffee and snacks for study sessions. Perfect for caffeine fixes between classes.',
        cuisine: 'Cafe',
        isOpen: true,
        openingHours: '7:30 AM - 9:00 PM',
        items: [
            { id: 'nc-1', name: 'Cappuccino', price: 80, category: 'Coffee', calories: 120, foodType: 'veg', rating: 4.2, ratingCount: 267 },
            { id: 'nc-2', name: 'Latte', price: 90, category: 'Coffee', calories: 150, foodType: 'veg', rating: 4.3, ratingCount: 234 },
            { id: 'nc-3', name: 'Espresso', price: 60, category: 'Coffee', calories: 5, foodType: 'veg', rating: 4.0, ratingCount: 156 },
            { id: 'nc-4', name: 'Sandwich (Veg)', price: 70, category: 'Snacks', calories: 280, foodType: 'veg', rating: 3.8, ratingCount: 123 },
            { id: 'nc-5', name: 'Sandwich (Chicken)', price: 90, category: 'Snacks', calories: 320, foodType: 'non-veg', rating: 4.1, ratingCount: 98 },
            { id: 'nc-6', name: 'Brownie', price: 50, category: 'Desserts', calories: 220, foodType: 'veg', rating: 4.5, ratingCount: 189 },
            { id: 'nc-7', name: 'Hot Chocolate', price: 85, category: 'Beverages', calories: 180, foodType: 'veg', rating: 4.4, ratingCount: 145 },
        ]
    },
    {
        id: 'south-express',
        name: 'South Express',
        location: 'Near Sports Complex',
        description: 'Authentic South Indian dishes - dosas, idlis, and filter coffee.',
        cuisine: 'South Indian',
        isOpen: true,
        openingHours: '7:00 AM - 9:30 PM',
        items: [
            { id: 'se-1', name: 'Masala Dosa', price: 60, category: 'Main Course', calories: 210, foodType: 'veg', rating: 4.5, ratingCount: 234 },
            { id: 'se-2', name: 'Plain Dosa', price: 45, category: 'Main Course', calories: 180, foodType: 'veg', rating: 4.2, ratingCount: 167 },
            { id: 'se-3', name: 'Idli (2 pcs)', price: 35, category: 'Main Course', calories: 120, foodType: 'veg', rating: 4.3, ratingCount: 189 },
            { id: 'se-4', name: 'Vada (2 pcs)', price: 40, category: 'Snacks', calories: 220, foodType: 'veg', rating: 4.1, ratingCount: 145 },
            { id: 'se-5', name: 'Filter Coffee', price: 30, category: 'Beverages', calories: 60, foodType: 'veg', rating: 4.7, ratingCount: 312 },
            { id: 'se-6', name: 'Uttapam', price: 55, category: 'Main Course', calories: 190, foodType: 'veg', rating: 4.0, ratingCount: 98 },
            { id: 'se-7', name: 'Rava Dosa', price: 65, category: 'Main Course', calories: 200, foodType: 'veg', rating: 4.4, ratingCount: 156 },
        ]
    },
    {
        id: 'juice-junction',
        name: 'Juice Junction',
        location: 'Academic Block B',
        description: 'Fresh fruit juices, smoothies, and healthy snacks.',
        cuisine: 'Healthy',
        isOpen: false,
        openingHours: '9:00 AM - 6:00 PM',
        items: [
            { id: 'jj-1', name: 'Orange Juice', price: 50, category: 'Juices', calories: 110, foodType: 'veg', rating: 4.3, ratingCount: 178 },
            { id: 'jj-2', name: 'Mango Smoothie', price: 70, category: 'Smoothies', calories: 180, foodType: 'veg', rating: 4.6, ratingCount: 234 },
            { id: 'jj-3', name: 'Mixed Fruit Bowl', price: 80, category: 'Healthy', calories: 150, foodType: 'veg', rating: 4.4, ratingCount: 123 },
            { id: 'jj-4', name: 'Watermelon Juice', price: 40, category: 'Juices', calories: 80, foodType: 'veg', rating: 4.2, ratingCount: 145 },
            { id: 'jj-5', name: 'Protein Shake', price: 100, category: 'Smoothies', calories: 250, foodType: 'veg', rating: 4.1, ratingCount: 89 },
            { id: 'jj-6', name: 'Green Detox', price: 90, category: 'Healthy', calories: 90, foodType: 'veg', rating: 3.9, ratingCount: 67 },
        ]
    },
    {
        id: 'roll-house',
        name: 'Roll House',
        location: 'Food Court, First Floor',
        description: 'Kolkata-style kathi rolls, wraps, and street food favorites.',
        cuisine: 'Street Food',
        isOpen: true,
        openingHours: '11:00 AM - 11:00 PM',
        items: [
            { id: 'rh-1', name: 'Paneer Roll', price: 80, category: 'Rolls', calories: 320, foodType: 'veg', rating: 4.3, ratingCount: 189 },
            { id: 'rh-2', name: 'Chicken Roll', price: 100, category: 'Rolls', calories: 380, foodType: 'non-veg', rating: 4.5, ratingCount: 234 },
            { id: 'rh-3', name: 'Egg Roll', price: 70, category: 'Rolls', calories: 290, foodType: 'egg', rating: 4.4, ratingCount: 198 },
            { id: 'rh-4', name: 'Double Egg Roll', price: 90, category: 'Rolls', calories: 380, foodType: 'egg', rating: 4.3, ratingCount: 156 },
            { id: 'rh-5', name: 'Mutton Roll', price: 120, category: 'Rolls', calories: 420, foodType: 'non-veg', rating: 4.6, ratingCount: 145 },
            { id: 'rh-6', name: 'Veg Wrap', price: 75, category: 'Wraps', calories: 280, foodType: 'veg', rating: 4.0, ratingCount: 98 },
        ]
    }
];

export async function GET() {
    try {
        // In future, this will fetch from database
        return NextResponse.json({
            success: true,
            data: foodOutlets
        });
    } catch (error) {
        console.error('Error fetching food outlets:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch food outlets' },
            { status: 500 }
        );
    }
}
