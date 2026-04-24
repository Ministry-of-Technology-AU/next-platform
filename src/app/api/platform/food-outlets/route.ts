import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const strapiUrl = process.env.STRAPI_URL;
        
        if (!strapiUrl) {
            console.warn('STRAPI_URL is not defined in environment variables');
            return NextResponse.json(
                { success: false, error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Fetch from Strapi, populating both the items array (components) and the logo image
        const response = await fetch(`${strapiUrl}/food-outlets?populate=items,logo`, {
            headers: {
                'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`,
            },
            // Revalidate cache every 60 seconds or define custom caching depending on needs
            next: { revalidate: 60 } 
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch from Strapi: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        // Safely map the Strapi response to our expected frontend schema
        // Handling both Strapi v4 (attributes) and v5 (flattened) structures for safety
        const foodOutlets = result.data.map((item: any) => {
            const attrs = item.attributes || item;
            
            // Extract logo URL if available (handling both Strapi v4 and v5 media structures)
            let logoUrl = null;
            if (attrs.logo?.data?.attributes?.url) { // Strapi v4
                logoUrl = attrs.logo.data.attributes.url;
            } else if (attrs.logo?.url) { // Strapi v5 or flattened
                logoUrl = attrs.logo.url;
            }

            return {
                id: attrs.outletId || item.documentId || item.id?.toString(),
                documentId: item.documentId || item.id?.toString(),
                name: attrs.name,
                location: attrs.location || '',
                description: attrs.description || '',
                cuisine: attrs.cuisine || '',
                contactNumber: attrs.contactNumber || '',
                logoUrl: logoUrl,
                isOpen: attrs.isOpen ?? true,
                openingHours: attrs.openingHours || '',
                rating: attrs.rating || null,
                ratingCount: attrs.ratingCount || 0,
                // Map the items list
                items: (attrs.items || []).map((foodItem: any) => ({
                    id: foodItem.id?.toString() || Math.random().toString(36).substring(7),
                    name: foodItem.name,
                    price: foodItem.price,
                    category: foodItem.category,
                    calories: foodItem.calories || null,
                    foodType: foodItem.foodType || 'veg',
                    isMRP: foodItem.isMRP || false,
                    allergens: foodItem.allergens || 'None'
                }))
            };
        });

        return NextResponse.json({
            success: true,
            data: foodOutlets
        });
    } catch (error) {
        console.error('Error fetching food outlets from Strapi:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch food outlets' },
            { status: 500 }
        );
    }
}
