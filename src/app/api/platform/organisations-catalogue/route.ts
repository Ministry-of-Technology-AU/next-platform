import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { strapiGet } from '@/lib/apis/strapi';
import { getUserIdByEmail } from '@/lib/userid';

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
            fields: ['profile_url']
          },
          circle1_humans: {
            fields: ['id', 'username', 'email']
          },
          circle2_humans: {
            fields: ['id', 'username', 'email']
          },
          interested_applicants: {
            fields: ['id', 'username', 'email']
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

    // console.log('Raw Strapi response:', JSON.stringify(organisationsReq, null, 2));

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
        return {
          id: x.id.toString(), // Convert to string for consistency
          title: x.attributes?.name || 'Untitled Organization',
          type: x.attributes?.type?.charAt(0).toUpperCase() + x.attributes?.type?.slice(1) || 'Club',
          description: x.attributes?.short_description || '',
          fullDescription: x.attributes?.description || x.attributes?.short_description || '',
          imageUrl: x.attributes?.profile?.data?.[0]?.attributes?.profile_url || null,
          profile_url: x.attributes?.profile?.data?.[0]?.attributes?.profile_url || null,
          categories: [], // Will need to be added to Strapi schema if needed
          inductionsOpen: x.attributes?.induction || false,
          createdAt: x.attributes?.createdAt || new Date().toISOString(),
          updatedAt: x.attributes?.updatedAt || new Date().toISOString(),
          circle1_humans: (x.attributes?.circle1_humans?.data || []).map((member: any) => ({
            id: member.id,
            username: member.attributes?.username || 'Unknown User',
            email: member.attributes?.email || 'No email'
          })),
          circle2_humans: (x.attributes?.circle2_humans?.data || []).map((member: any) => ({
            id: member.id,
            username: member.attributes?.username || 'Unknown User',
            email: member.attributes?.email || 'No email'
          })),
          interested_applicants: (x.attributes?.interested_applicants?.data || []).map((member: any) => ({
            id: member.id,
            username: member.attributes?.username || 'Unknown User',
            email: member.attributes?.email || 'No email'
          })),
          // Social links
          instagram: x.attributes?.instagram || null,
          twitter: x.attributes?.twitter || null,
          linkedin: x.attributes?.linkedin || null,
          youtube: x.attributes?.youtube || null,
          website: x.attributes?.website_blog || null,
          whatsapp: x.attributes?.whatsapp || null,
        };
      } catch (transformError) {
        console.error('Error transforming organization:', x, transformError);
        return null;
      }
    }).filter(Boolean); // Remove any null entries from failed transformations

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