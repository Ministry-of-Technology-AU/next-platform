import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { strapiGet } from '@/lib/apis/strapi';
import { getUserIdByEmail } from '@/lib/userid';
import { getDerivedCycleStatus, type CycleStatus } from '@/app/organisations/inductions/types';
import { normalizeEndDateToEndOfDay } from '@/lib/date-utils';

const DEFAULT_BANNER = 'https://res.cloudinary.com/dslawnz50/image/upload/v1769686905/platform-ads/1769686891126-ad-banner-1769686891125-orgs_catalogue_default.jpg';

function isDefaultBanner(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return true;
  const trimmed = url.trim().toLowerCase();
  if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') return true;
  if (trimmed.includes('orgs_catalogue_default')) return true;
  if (trimmed.includes('1769686891126-ad-banner-1769686891125-orgs_catalogue_default')) return true;
  if (trimmed.includes('1769686905') && trimmed.includes('default')) return true;
  if (trimmed === '/orgs_catalogue_default.png' || trimmed.endsWith('/orgs_catalogue_default.png')) return true;
  if (trimmed === DEFAULT_BANNER.toLowerCase()) return true;
  return false;
}

// In-memory cache for organisations data (12 hours TTL)
let cachedOrgsData: any = null;
let cacheTimestamp = 0;
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours (43,200,000 ms)

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

    const now = Date.now();
    // Use cached data if available and fresh
    if (!cachedOrgsData || (now - cacheTimestamp) > CACHE_TTL) {
      try {
        const organisationsReq = await strapiGet('/organisations', {
          populate: {
            profile: {
              fields: ['profile_url', 'username', 'email']
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

    if (Array.isArray(cachedOrgsData)) {
      organisationsData = cachedOrgsData;
    } else if (cachedOrgsData && Array.isArray(cachedOrgsData.data)) {
      organisationsData = cachedOrgsData.data;
    } else if (cachedOrgsData && cachedOrgsData.data && Array.isArray(cachedOrgsData.data.data)) {
      organisationsData = cachedOrgsData.data.data;
    } else {
      console.error('Unexpected Strapi response structure:', cachedOrgsData);
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
        let hasBanner = false;

        const rawBannerUrl = attrs.banner_url || attrs.bannerUrl;
        const bannerData = attrs.banner?.data ? (Array.isArray(attrs.banner.data) ? attrs.banner.data[0] : attrs.banner.data) : null;
        const mediaBannerUrl = bannerData?.attributes?.url || bannerData?.url;

        const candidateUrl = (rawBannerUrl && typeof rawBannerUrl === 'string' && rawBannerUrl.trim()) 
          ? rawBannerUrl.trim() 
          : (mediaBannerUrl && typeof mediaBannerUrl === 'string' && mediaBannerUrl.trim())
            ? mediaBannerUrl.trim()
            : null;

        if (candidateUrl && !isDefaultBanner(candidateUrl)) {
          bannerUrl = candidateUrl;
          hasBanner = true;
        } else {
          bannerUrl = DEFAULT_BANNER;
          hasBanner = false;
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

        // Only consider truly active cycles for the student catalog using derived status
        const activeCyclesOnly = cyclesData.filter((c: any) => {
          const ca = c.attributes || c || {};
          const rawStatus = (ca.status as CycleStatus) || 'draft';
          const derivedStatus = getDerivedCycleStatus(rawStatus, ca.start_date, ca.end_date);
          return derivedStatus === 'active';
        });

        // Roles on offer in one cycle, with the live form to apply through.
        const positionsForCycle = (cycle: any) => {
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
            const formAttrs = formObj?.attributes || formObj || {};
            const rawFormUid = formAttrs?.form_uid || formObj?.form_uid || (typeof formRound?.attributes?.form === 'string' ? formRound.attributes.form : null);
            const isFormUsable = formAttrs?.form_status !== 'inactive';
            const formUid = isFormUsable && rawFormUid ? rawFormUid : null;

            return {
              id: (role.id || '').toString(),
              title: roleAttrs.name || 'Role Candidate',
              department: roleAttrs.department || 'General',
              description: roleAttrs.description || '',
              tier: roleAttrs.tier || 'tier-1',
              formUid: formUid || null,
            };
          });
        };

        // An organisation may run several cycles at once. Each one is described
        // in full here so the inductions catalogue can show them as separate
        // drives; the flat fields below stay one-per-org for the directory.
        const inductionCycles = activeCyclesOnly.map((cycle: any) => {
          const ca = cycle.attributes || cycle || {};
          const stats = ca.stats || {};
          const ext = ca.deadline_extension ?? stats?.deadlineExtension ?? null;
          const endDate = ca.end_date || attrs.induction_end || null;
          return {
            id: (cycle.id ?? ca.id ?? '').toString(),
            name: ca.name || null,
            description: ca.description || '',
            endDate,
            openPositions: positionsForCycle(cycle),
            deadlineExtension: ext
              ? {
                  extendedAt: ext.extendedAt,
                  previousDeadline: ext.previousDeadline,
                  newDeadline: ext.newDeadline || endDate,
                  reason: ext.reason || null,
                }
              : null,
          };
        });

        // Sort so the flat fields below describe the cycle closing soonest.
        const sortedCycles = [...inductionCycles].sort((a: any, b: any) => {
          const aIso = a.endDate ? normalizeEndDateToEndOfDay(a.endDate) : null;
          const bIso = b.endDate ? normalizeEndDateToEndOfDay(b.endDate) : null;
          const at = aIso ? new Date(aIso).getTime() : NaN;
          const bt = bIso ? new Date(bIso).getTime() : NaN;
          if (isNaN(at) && isNaN(bt)) return 0;
          if (isNaN(at)) return 1;
          if (isNaN(bt)) return -1;
          return at - bt;
        });

        const openPositions = inductionCycles.flatMap((c: any) => c.openPositions);

        const primaryCycle = sortedCycles[0] ?? null;
        const cycleName = primaryCycle?.name || null;
        const cycleDescription = primaryCycle?.description || '';
        const cycleEndDate = primaryCycle?.endDate || attrs.induction_end || null;
        const deadlineExtension = primaryCycle?.deadlineExtension ?? null;

        // hasActiveCycle is true only when there is a genuinely 'active' cycle
        const hasActiveCycle = activeCyclesOnly.length > 0;
        const isLegacyOpen =
          attrs.induction === true &&
          (!attrs.induction_end ||
            new Date(normalizeEndDateToEndOfDay(attrs.induction_end) || attrs.induction_end).getTime() >= Date.now());

        return {
          id: x.id.toString(),
          name: attrs.name || 'Untitled Organization',
          type: normalizedType,
          description: attrs.short_description || '',
          fullDescription: attrs.description || attrs.short_description || '',
          bannerUrl: bannerUrl,
          hasBanner: hasBanner,
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
          inductionsOpen: hasActiveCycle || isLegacyOpen,
          inductionEnd: cycleEndDate,
          inductionDescription: attrs.induction_description || cycleDescription || '',
          cycleName: cycleName || undefined,
          cycleDescription: cycleDescription || attrs.induction_description || '',
          openPositions,
          inductionCycles,
          deadlineExtension: deadlineExtension,

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

function isTechMinOrg(org: any): boolean {
  if (!org) return false;
  if (String(org.id) === '1' || org.id === 1) return true;
  const name = (org?.name || '').toLowerCase().trim();
  const email = (org?.email || '').toLowerCase().trim();
  const desc = (org?.description || '').toLowerCase();
  return (
    name === 'ministry of technology' ||
    name.includes('ministry of technology') ||
    name.includes('tech min') ||
    name.includes('tech ministry') ||
    name.includes('technology ministry') ||
    email.startsWith('tech.ministry') ||
    email.startsWith('technology.ministry') ||
    desc.includes('ministry of technology')
  );
}

function sortCatalogOrganisations(a: any, b: any): number {
  // 1. Tech Min is ALWAYS first
  const aTechMin = isTechMinOrg(a);
  const bTechMin = isTechMinOrg(b);
  if (aTechMin && !bTechMin) return -1;
  if (bTechMin && !aTechMin) return 1;

  // 2. Orgs with custom banner come before orgs without banner
  const aBanner = a.hasBanner || (a.bannerUrl && !a.bannerUrl.includes('default')) ? 1 : 0;
  const bBanner = b.hasBanner || (b.bannerUrl && !b.bannerUrl.includes('default')) ? 1 : 0;
  if (bBanner !== aBanner) {
    return bBanner - aBanner;
  }

  // 3. Alphabetical order within each group
  return (a.name || '').localeCompare(b.name || '');
}

    // Sort organisations: Tech Min first, then custom banner orgs alphabetically, then rest alphabetically
    const sortedOrganisations = [...organisations].sort(sortCatalogOrganisations);

    // Get unique types for filtering
    const types = [...new Set(sortedOrganisations.map((org: any) => org.type))];

    const response = NextResponse.json({
      success: true,
      data: {
        organisations: sortedOrganisations,
        types,
        userEmail,
        userId
      }
    });

    response.headers.set('Cache-Control', 'public, max-age=43200, s-maxage=43200, stale-while-revalidate=21600');
    return response;

  } catch (error) {
    console.error('Error fetching organisations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch organisations' },
      { status: 500 }
    );
  }
}