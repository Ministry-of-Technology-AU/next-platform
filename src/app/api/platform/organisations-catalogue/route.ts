import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { strapiGet } from '@/lib/apis/strapi';
import { getUserIdByEmail } from '@/lib/userid';

// const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1000&h=400&fit=crop';
const DEFAULT_BANNER = 'https://picsum.photos/1000/400';

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

    const userEmail = session.user.email;
    
    // Get the user's Strapi ID
    const userId = await getUserIdByEmail(userEmail);
    
    // Fetch organizations data from Strapi
    let organisationsReq;
    
    try {
      organisationsReq = await strapiGet('/organisations', {
        populate: {
          profile: {
            fields: ['id', 'username', 'email', 'profile_url']
          },
          circle1_humans: {
            fields: ['id', 'username', 'email']
          },
          circle2_humans: {
            fields: ['id', 'username', 'email']
          },
          members: {
            fields: ['id', 'username', 'email']
          },
          interested_applicants: {
            fields: ['id', 'username', 'email']
          },
          banner: {
            fields: ['url']
          }
        },
        pagination: {
          pageSize: 1000
        }
      });
    } catch (strapiError) {
      console.error('Strapi API error:', strapiError);
      // Return empty data if Strapi endpoint doesn't exist or has issues
      return NextResponse.json({
        success: true,
        data: {
          organisations: [],
          types: [],
          userEmail,
          userId
        }
      });
    }

    // Handle different possible response structures from Strapi
    let organisationsData = [];
    
    if (Array.isArray(organisationsReq)) {
      // Direct array response
      organisationsData = organisationsReq;
    } else if (organisationsReq && Array.isArray(organisationsReq.data)) {
      // Wrapped in data property
      organisationsData = organisationsReq.data;
    } else if (organisationsReq && organisationsReq.data && Array.isArray(organisationsReq.data.data)) {
      // Double wrapped (some Strapi versions)
      organisationsData = organisationsReq.data.data;
    } else {
      console.error('Unexpected Strapi response structure:', organisationsReq);
      return NextResponse.json({
        success: false,
        error: 'Invalid response structure from Strapi'
      }, { status: 500 });
    }

    console.log('Processed organisations data:', organisationsData.length, 'items');

    // Transform the data to match frontend expectations
    const organisations = organisationsData.map((x: any) => {
      try {
        const attrs = x.attributes || {};
        
        // Normalize type to lowercase for consistency
        const normalizedType = (attrs.type || 'other').toLowerCase();
        
        // Get banner image with fallback
        let bannerUrl = DEFAULT_BANNER;
        if (attrs.banner?.data) {
          const bannerData = Array.isArray(attrs.banner.data) 
            ? attrs.banner.data[0] 
            : attrs.banner.data;
          bannerUrl = bannerData?.attributes?.url || DEFAULT_BANNER;
        }

        // Get logo image from profile user's profile_url
        let logoUrl: string | null = null;
        if (attrs.profile?.data) {
          const profileData = Array.isArray(attrs.profile.data) 
            ? attrs.profile.data[0] 
            : attrs.profile.data;
          logoUrl = profileData?.attributes?.profile_url || null;
        }

        return {
          id: x.id.toString(),
          name: attrs.name || 'Untitled Organization',
          type: normalizedType,
          description: attrs.short_description || '',
          fullDescription: attrs.description || attrs.short_description || '',
          bannerUrl: bannerUrl,
          logoUrl: logoUrl,
          
          // Member relations
          circle1_humans: (attrs.circle1_humans?.data || []).map((member: any) => ({
            id: member.id,
            username: member.attributes?.username || 'Unknown User',
            email: member.attributes?.email || 'No email'
          })),
          circle2_humans: (attrs.circle2_humans?.data || []).map((member: any) => ({
            id: member.id,
            username: member.attributes?.username || 'Unknown User',
            email: member.attributes?.email || 'No email'
          })),
          members: (attrs.members?.data || []).map((member: any) => ({
            id: member.id,
            username: member.attributes?.username || 'Unknown User',
            email: member.attributes?.email || 'No email'
          })),
          interested_applicants: (attrs.interested_applicants?.data || []).map((member: any) => ({
            id: member.id,
            username: member.attributes?.username || 'Unknown User',
            email: member.attributes?.email || 'No email'
          })),
          
          // Induction details
          inductionsOpen: attrs.induction || false,
          inductionEnd: attrs.induction_end || null,
          inductionDescription: attrs.induction_description || '',
          
          // Social links with fallback to empty strings
          instagram: attrs.instagram || '',
          twitter: attrs.twitter || '',
          linkedin: attrs.linkedin || '',
          youtube: attrs.youtube || '',
          website: attrs.website_blog || '',
          whatsapp: attrs.whatsapp || '',
          
          // Additional fields
          calendarEventId: attrs.calendar_event_id || null,
          createdAt: attrs.createdAt || new Date().toISOString(),
          updatedAt: attrs.updatedAt || new Date().toISOString(),
        };
      } catch (transformError) {
        console.error('Error transforming organization:', x, transformError);
        return null;
      }
    }).filter(Boolean);

    console.log('Successfully transformed', organisations.length, 'organizations');

    // Get unique types for filtering
    const types = [...new Set(organisations.map((org: any) => org.type))];

    return NextResponse.json({
      success: true,
      data: {
        organisations,
        types,
        userEmail,
        userId
      }
    });

  } catch (error) {
    console.error('Error fetching organisations:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch organisations' },
      { status: 500 }
    );
  }
}