import { Separator } from '@/components/ui/separator';
import PlatformCarousel from '@/components/landing-page/platform-carousel';
import RecentlyVisited from '@/components/landing-page/recently-visited';
import PopularToolsGrid from '@/components/landing-page/popular-tools-grid';
import DashboardStats from '@/components/landing-page/dashboard-stats';
import { TourStep } from '@/components/guided-tour';
import { cookies } from 'next/headers';

async function getData() {
  const cookieStore = await cookies();

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/platform/landing-page`, {
    cache: 'no-store',
    headers: { 'Cookie': cookieStore.toString() },
  });
  const data = await response?.json();

  return data;
}

export default async function Home() {
  const data = await getData();
  const adverts = data?.adverts?.data;
  const recentlyVisited = data?.recentlyVisited;

  console.log(adverts);
  return (

    <div className="min-h-screen bg-background flex flex-col">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 md:py-6 lg:py-8 min-w-0">
        {/* Main Section - Mobile: Stack vertically, Desktop: Side by side */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* Recently Visited - Mobile: 2x2 grid, Desktop: Single column */}
          <div className="w-full lg:w-1/4 order-1 lg:order-1">
            <TourStep id="recently-visited" order={1} position="right" content="Access your recently visited tools quickly from here." title="Recently Visited">
              <RecentlyVisited className="w-full" />
            </TourStep>
          </div>

          {/* Main Carousel - Mobile: Full width, Desktop: Remaining space */}
          <div className="flex-1 w-full order-2 lg:order-2 min-w-0">
            <TourStep id="platform-carousel" order={2} position="right" content="Discover new and popular tools in this carousel." title="Platform Carousel">
              <PlatformCarousel adverts={adverts} />
            </TourStep>
          </div>
        </div>

        <Separator className="my-6 sm:my-8" />

        {/* Most Popular Section */}
        <div className="mb-6 sm:mb-8">
          <TourStep id="popular-tools" order={3} position="right" content="Explore the most popular tools used by others." title="Popular Tools">
            <PopularToolsGrid />
          </TourStep>
        </div>

        <Separator className="my-6 sm:my-8" />

        {/* Platform Insights Section */}
        <div className="mb-6 sm:mb-8">
          <TourStep id="platform-insights" order={4} position="right" content="View key statistics and insights about the platform." title="Platform Insights">
            <DashboardStats />
          </TourStep>
        </div>
      </div>
    </div>
  );
}