import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { strapiGet } from '@/lib/apis/strapi';
import { getUserIdByEmail } from '@/lib/userid';

const DEFAULT_BANNER = '/orgs_catalogue_default.png';

// In-memory cache for organisations data (30s TTL)
let cachedOrgsData: any = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30_000; // 30 seconds

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

    // Check in-memory cache first
    const now = Date.now();
    let organisationsReq;

    if (cachedOrgsData && (now - cacheTimestamp) < CACHE_TTL) {
      organisationsReq = cachedOrgsData;
    } else {
      // Fetch fresh from Strapi
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
            },
            induction_cycles: {
              populate: {
                roles: {
                  populate: {
                    pipeline_rounds: {
                      populate: {
                        form: {
                          fields: ['id', 'form_uid', 'title', 'form_status']
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          pagination: {
            pageSize: 1000
          }
        });

        // Update cache
        cachedOrgsData = organisationsReq;
        cacheTimestamp = now;
      } catch (strapiError) {
        console.error('Strapi API error in organisations-catalogue:', strapiError);
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
    }

    // Handle different possible response structures from Strapi
    let organisationsData = [];

    if (Array.isArray(organisationsReq)) {
      organisationsData = organisationsReq;
    } else if (organisationsReq && Array.isArray(organisationsReq.data)) {
      organisationsData = organisationsReq.data;
    } else if (organisationsReq && organisationsReq.data && Array.isArray(organisationsReq.data.data)) {
      organisationsData = organisationsReq.data.data;
    } else {
      console.error('Unexpected Strapi response structure:', organisationsReq);
      return NextResponse.json({
        success: false,
        error: 'Invalid response structure from Strapi'
      }, { status: 500 });
    }

    // Transform the data to match frontend expectations
    const organisations = organisationsData.map((x: any) => {
      try {
        const attrs = x.attributes || x || {};

        // Normalize type to lowercase for consistency
        const normalizedType = (attrs.type || 'other').toLowerCase();

        // Get banner image with fallback
        let bannerUrl = DEFAULT_BANNER;
        if (attrs.banner_url) {
          bannerUrl = attrs.banner_url;
        } else if (attrs.banner?.data) {
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

        const cyclesData = attrs.induction_cycles?.data || attrs.induction_cycles || [];

        // Open positions derived from induction cycles and roles
        const openPositions = cyclesData.flatMap((cycle: any) => {
          const cycleAttrs = cycle.attributes || cycle || {};
          const rolesData = cycleAttrs.roles?.data || cycleAttrs.roles || [];
          return rolesData.map((role: any) => {
            const roleAttrs = role.attributes || role || {};
            const rounds = roleAttrs.pipeline_rounds?.data || roleAttrs.pipeline_rounds || [];
            
            // Find the primary form round for candidates
            const formRound = rounds.find((r: any) => {
              const ra = r.attributes || r || {};
              return ra.type === 'form';
            });
            const formObj = formRound?.attributes?.form?.data || formRound?.form?.data || formRound?.form;
            const formUid = formObj?.attributes?.form_uid || formObj?.form_uid || (typeof formRound?.attributes?.form === 'string' ? formRound.attributes.form : null);

            return {
              id: (role.id || '').toString(),
              title: roleAttrs.name || 'Role Candidate',
              department: roleAttrs.department || 'General',
              description: roleAttrs.description || '',
              tier: roleAttrs.tier || 'tier-1',
              formUid: formUid || null,
            };
          });
        });

        const hasActiveCycle = cyclesData.some((c: any) => {
          const ca = c.attributes || c || {};
          return ca.status === 'active' || ca.status === 'draft';
        });

        return {
          id: x.id.toString(),
          name: attrs.name || 'Untitled Organization',
          type: normalizedType,
          description: attrs.short_description || '',
          fullDescription: attrs.description || attrs.short_description || '',
          bannerUrl: bannerUrl,
          logoUrl: logoUrl,
          email: attrs.email || null,

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
          inductionsOpen: attrs.induction === true || hasActiveCycle || openPositions.length > 0,
          inductionEnd: attrs.induction_end || null,
          inductionDescription: attrs.induction_description || '',
          openPositions,

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

    // Get unique types for filtering
    const types = [...new Set(organisations.map((org: any) => org.type))];

    const response = NextResponse.json({
      success: true,
      data: {
        organisations,
        types,
        userEmail,
        userId
      }
    });

    response.headers.set('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=30');
    return response;

  } catch (error) {
    console.error('Error fetching organisations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch organisations' },
      { status: 500 }
    );
  }
}