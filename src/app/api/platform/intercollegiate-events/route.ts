import { NextRequest, NextResponse } from 'next/server'
import { strapiGet } from '@/lib/apis/strapi'

interface Event {
  id: number;
  title: string;
  logo: string;
  dates: string;
  description: string;
  deadline: string;
  endDate: string;
  tags: Array<{ name: string; color: string }>;
  registrationLink: string;
  websiteLink: string;
}

// GET /api/intercollegiate-events - Fetch intercollegiate events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Build query parameters
    const queryParams: any = {
      populate: 'tags',
      pagination: {
        pageSize: parseInt(searchParams.get('pageSize') || '200')
      }
    }
    
    // Add filters if provided
    if (searchParams.get('search')) {
      queryParams.filters = {
        $or: [
          { event_title: { $containsi: searchParams.get('search') } },
          { description: { $containsi: searchParams.get('search') } },
          { short_description: { $containsi: searchParams.get('search') } }
        ]
      }
    }
    
    // Add date filters if provided
    if (searchParams.get('fromDate')) {
      queryParams.filters = {
        ...queryParams.filters,
        from: { $gte: searchParams.get('fromDate') }
      }
    }
    
    if (searchParams.get('toDate')) {
      queryParams.filters = {
        ...queryParams.filters,
        to: { $lte: searchParams.get('toDate') }
      }
    }
    
    const data = await strapiGet('/intercollegiate-events', queryParams)
    
    if (!data || !data.data) {
      return NextResponse.json({
        success: true,
        data: []
      }, { status: 200 })
    }
    
    // Map the Strapi response to the expected format
    const mappedEvents: Event[] = data.data.map((item: any) => {
      const attributes = item.attributes
      return {
        id: item.id,
        title: attributes.event_title,
        logo: attributes.image_url || "/placeholder.svg?height=60&width=60",
        dates: `${attributes.from} - ${attributes.to}`,
        description: attributes.short_description || attributes.description || "",
        deadline: attributes.deadline,
        endDate: attributes.to,
        tags: attributes.tags ? attributes.tags.map((tag: any) => ({
          name: tag.name,
          color: tag.color
        })) : [],
        registrationLink: attributes.form_link,
        websiteLink: attributes.website_link
      }
    })
    
    return NextResponse.json({
      success: true,
      data: mappedEvents
    }, { status: 200 })
    
  } catch (error) {
    console.error("Error fetching intercollegiate events:", error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch intercollegiate events'
    }, { status: 500 })
  }
}