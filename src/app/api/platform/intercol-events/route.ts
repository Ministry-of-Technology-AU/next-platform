import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { strapiGet } from '@/lib/apis/strapi';

let cachedEvents: any = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

export async function GET() {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const now = Date.now();

    // Fetch from Strapi if cache is empty or expired
    if (!cachedEvents || now - cacheTimestamp > CACHE_TTL) {
      try {
        const eventsReq = await strapiGet('/intercollegiate-events', {
          sort: ['from:asc'],
          pagination: {
            pageSize: 1000,
          },
        });

        cachedEvents = eventsReq;
        cacheTimestamp = now;
      } catch (strapiError) {
        console.error('Strapi API error in intercol-events:', strapiError);

        return NextResponse.json(
          {
            success: false,
            error: 'Failed to fetch events from Strapi',
          },
          { status: 500 }
        );
      }
    }

    // Handle Strapi response structures
    let eventsData = [];

    if (Array.isArray(cachedEvents)) {
      eventsData = cachedEvents;
    } else if (Array.isArray(cachedEvents?.data)) {
      eventsData = cachedEvents.data;
    } else if (Array.isArray(cachedEvents?.data?.data)) {
      eventsData = cachedEvents.data.data;
    } else {
      console.error('Unexpected Strapi response:', cachedEvents);

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid response structure from Strapi',
        },
        { status: 500 }
      );
    }

    // Transform Strapi data into frontend format
    const events = eventsData.map((item: any) => {
      const attrs = item.attributes || item;

      const rawCategory = String(attrs.category || 'other')
        .trim()
        .toLowerCase();

      const validCategories = [
        'sports',
        'cultural',
        'academic',
        'tech',
        'other',
      ];

      const category = validCategories.includes(rawCategory)
        ? rawCategory
        : 'other';

      return {
        id: item.id.toString(),
        name: attrs.event_title || 'Untitled Event',
        hostCollege: attrs.college_name || 'College not specified',
        category,
        eventType: attrs.event_type || 'single_event',
        description: attrs.short_description || '',
        fullDescription:
          typeof attrs.description === 'string'
            ? attrs.description
            : '',
        bannerUrl: attrs.image_url || null,
        location: attrs.location || 'Location not specified',
        startDate: attrs.from || '',
        endDate: attrs.to || null,
        registrationUrl: attrs.form_link || null,
        registrationDeadline: attrs.deadline || null,
        websiteUrl: attrs.website_link || null,
        tags: attrs.tag || '',
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        events,
      },
    });
  } catch (error) {
    console.error('Error fetching intercollegiate events:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch intercollegiate events',
      },
      { status: 500 }
    );
  }
}