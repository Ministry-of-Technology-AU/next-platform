import { NextResponse } from 'next/server';

// Dummy data for food outlets - structured to match future Strapi collection
const foodOutlets = [
    {
        id: 'dhaba',
        name: 'Dhaba',
        location: 'Near Mess Building',
        description: 'Traditional North Indian cuisine with a campus twist. Popular for late-night snacks and chai.',
        cuisine: 'North Indian',
        contactNumber: '+91 98765 43210',
        logoUrl: null, // Will be set when actual logos are available
        isOpen: true,
        openingHours: '8:00 AM - 11:00 PM',
        rating: 4.3,
        ratingCount: 245,
        items: [
            { id: 'dhaba-1', name: 'Masala Maggi', price: 40, category: 'Snacks', calories: 320, foodType: 'veg' },
            { id: 'dhaba-2', name: 'Cheese Maggi', price: 50, category: 'Snacks', calories: 410, foodType: 'veg' },
            { id: 'dhaba-3', name: 'Aloo Paratha', price: 45, category: 'Main Course', calories: 280, foodType: 'veg' },
            { id: 'dhaba-4', name: 'Egg Bhurji', price: 50, category: 'Main Course', calories: 220, foodType: 'egg' },
            { id: 'dhaba-5', name: 'Chai', price: 15, category: 'Beverages', calories: 80, foodType: 'veg' },
            { id: 'dhaba-6', name: 'Cold Coffee', price: 60, category: 'Beverages', calories: 180, foodType: 'veg' },
            { id: 'dhaba-7', name: 'Samosa', price: 20, category: 'Snacks', calories: 150, foodType: 'veg' },
            { id: 'dhaba-8', name: 'Bread Omelette', price: 40, category: 'Main Course', calories: 260, foodType: 'egg' },
        ]
    },
    {
        id: 'chicago-pizza',
        name: 'Chicago Pizza',
        location: 'Food Court, Ground Floor',
        description: 'Authentic Chicago-style deep dish pizzas and Italian fast food.',
        cuisine: 'Italian',
        contactNumber: '+91 98765 43211',
        logoUrl: null,
        isOpen: true,
        openingHours: '10:00 AM - 10:00 PM',
        rating: 4.4,
        ratingCount: 189,
        items: [
            { id: 'cp-1', name: 'Margherita Pizza', price: 199, category: 'Pizza', calories: 680, foodType: 'veg' },
            { id: 'cp-2', name: 'Pepperoni Pizza', price: 249, category: 'Pizza', calories: 820, foodType: 'non-veg' },
            { id: 'cp-3', name: 'Garlic Bread', price: 89, category: 'Sides', calories: 220, foodType: 'veg' },
            { id: 'cp-4', name: 'Pasta Alfredo', price: 169, category: 'Pasta', calories: 520, foodType: 'veg' },
            { id: 'cp-5', name: 'Chicken Wings', price: 189, category: 'Sides', calories: 380, foodType: 'non-veg' },
            { id: 'cp-6', name: 'BBQ Chicken Pizza', price: 279, category: 'Pizza', calories: 780, foodType: 'non-veg' },
        ]
    },
    {
        id: 'nescafe',
        name: 'Nescafe Corner',
        location: 'Library Building',
        description: 'Quick coffee and snacks for study sessions. Perfect for caffeine fixes between classes.',
        cuisine: 'Cafe',
        contactNumber: '+91 98765 43212',
        logoUrl: null,
        isOpen: true,
        openingHours: '7:30 AM - 9:00 PM',
        rating: 4.2,
        ratingCount: 312,
        items: [
            { id: 'nc-1', name: 'Cappuccino', price: 80, category: 'Coffee', calories: 120, foodType: 'veg' },
            { id: 'nc-2', name: 'Latte', price: 90, category: 'Coffee', calories: 150, foodType: 'veg' },
            { id: 'nc-3', name: 'Espresso', price: 60, category: 'Coffee', calories: 5, foodType: 'veg' },
            { id: 'nc-4', name: 'Sandwich (Veg)', price: 70, category: 'Snacks', calories: 280, foodType: 'veg' },
            { id: 'nc-5', name: 'Sandwich (Chicken)', price: 90, category: 'Snacks', calories: 320, foodType: 'non-veg' },
            { id: 'nc-6', name: 'Brownie', price: 50, category: 'Desserts', calories: 220, foodType: 'veg' },
            { id: 'nc-7', name: 'Hot Chocolate', price: 85, category: 'Beverages', calories: 180, foodType: 'veg' },
        ]
    },
    {
        id: 'south-express',
        name: 'South Express',
        location: 'Near Sports Complex',
        description: 'Authentic South Indian dishes - dosas, idlis, and filter coffee.',
        cuisine: 'South Indian',
        contactNumber: '+91 98765 43213',
        logoUrl: null,
        isOpen: true,
        openingHours: '7:00 AM - 9:30 PM',
        rating: 4.5,
        ratingCount: 267,
        items: [
            { id: 'se-1', name: 'Masala Dosa', price: 60, category: 'Main Course', calories: 210, foodType: 'veg' },
            { id: 'se-2', name: 'Plain Dosa', price: 45, category: 'Main Course', calories: 180, foodType: 'veg' },
            { id: 'se-3', name: 'Idli (2 pcs)', price: 35, category: 'Main Course', calories: 120, foodType: 'veg' },
            { id: 'se-4', name: 'Vada (2 pcs)', price: 40, category: 'Snacks', calories: 220, foodType: 'veg' },
            { id: 'se-5', name: 'Filter Coffee', price: 30, category: 'Beverages', calories: 60, foodType: 'veg' },
            { id: 'se-6', name: 'Uttapam', price: 55, category: 'Main Course', calories: 190, foodType: 'veg' },
            { id: 'se-7', name: 'Rava Dosa', price: 65, category: 'Main Course', calories: 200, foodType: 'veg' },
        ]
    },
    {
        id: 'juice-junction',
        name: 'Juice Junction',
        location: 'Academic Block B',
        description: 'Fresh fruit juices, smoothies, and healthy snacks.',
        cuisine: 'Healthy',
        contactNumber: '+91 98765 43214',
        logoUrl: null,
        isOpen: false,
        openingHours: '9:00 AM - 6:00 PM',
        rating: 4.3,
        ratingCount: 145,
        items: [
            { id: 'jj-1', name: 'Orange Juice', price: 50, category: 'Juices', calories: 110, foodType: 'veg' },
            { id: 'jj-2', name: 'Mango Smoothie', price: 70, category: 'Smoothies', calories: 180, foodType: 'veg' },
            { id: 'jj-3', name: 'Mixed Fruit Bowl', price: 80, category: 'Healthy', calories: 150, foodType: 'veg' },
            { id: 'jj-4', name: 'Watermelon Juice', price: 40, category: 'Juices', calories: 80, foodType: 'veg' },
            { id: 'jj-5', name: 'Protein Shake', price: 100, category: 'Smoothies', calories: 250, foodType: 'veg' },
            { id: 'jj-6', name: 'Green Detox', price: 90, category: 'Healthy', calories: 90, foodType: 'veg' },
        ]
    },
    {
        id: 'roll-house',
        name: 'Roll House',
        location: 'Food Court, First Floor',
        description: 'Kolkata-style kathi rolls, wraps, and street food favorites.',
        cuisine: 'Street Food',
        contactNumber: '+91 98765 43215',
        logoUrl: null,
        isOpen: true,
        openingHours: '11:00 AM - 11:00 PM',
        rating: 4.4,
        ratingCount: 198,
        items: [
            { id: 'rh-1', name: 'Paneer Roll', price: 80, category: 'Rolls', calories: 320, foodType: 'veg' },
            { id: 'rh-2', name: 'Chicken Roll', price: 100, category: 'Rolls', calories: 380, foodType: 'non-veg' },
            { id: 'rh-3', name: 'Egg Roll', price: 70, category: 'Rolls', calories: 290, foodType: 'egg' },
            { id: 'rh-4', name: 'Double Egg Roll', price: 90, category: 'Rolls', calories: 380, foodType: 'egg' },
            { id: 'rh-5', name: 'Mutton Roll', price: 120, category: 'Rolls', calories: 420, foodType: 'non-veg' },
            { id: 'rh-6', name: 'Veg Wrap', price: 75, category: 'Wraps', calories: 280, foodType: 'veg' },
        ]
    }
];

export async function GET() {
    try {
        // In future, this will fetch from Strapi collection
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
