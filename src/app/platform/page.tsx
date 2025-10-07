import { Separator } from '@/components/ui/separator';
import PlatformCarousel from '@/components/landing-page/platform-carousel';
import RecentlyVisited from '@/components/landing-page/recently-visited';
import PopularToolsGrid from '@/components/landing-page/popular-tools-grid';
import DashboardStats from '@/components/landing-page/dashboard-stats';

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 md:py-6 lg:py-8 min-w-0">
        {/* Main Section - Mobile: Stack vertically, Desktop: Side by side */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* Recently Visited - Mobile: 2x2 grid, Desktop: Single column */}
          <div className="w-full lg:w-1/4 order-1 lg:order-1">
            <RecentlyVisited className="w-full" />
          </div>
          
          {/* Main Carousel - Mobile: Full width, Desktop: Remaining space */}
          <div className="flex-1 w-full order-2 lg:order-2 min-w-0">
            <PlatformCarousel />
          </div>
        </div>

        <Separator className="my-6 sm:my-8" />

        {/* Most Popular Section */}
        <div className="mb-6 sm:mb-8">
          <PopularToolsGrid />
        </div>

        <Separator className="my-6 sm:my-8" />

        {/* Platform Insights Section */}
        <div className="mb-6 sm:mb-8">
          <DashboardStats />
        </div>
      </div>
    </div>
  );
}