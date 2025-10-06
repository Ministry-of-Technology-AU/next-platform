import { Separator } from '@/components/ui/separator';
import PlatformCarousel from '@/components/landing-page/platform-carousel';
import RecentlyVisited from '@/components/landing-page/recently-visited';
import PopularToolsCarousel from '@/components/landing-page/popular-tools-carousel';
import DashboardStats from '@/components/landing-page/dashboard-stats';

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col min-w-0">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 md:py-6 lg:py-8 min-w-0">
        {/* Main Carousel Section */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mb-8">
          {/* Recently Visited Cards */}
          <RecentlyVisited className="lg:w-1/4 w-full" />
          
          {/* Main Carousel */}
          <div className="flex-1 w-full pr-4">
            <PlatformCarousel />
          </div>
        </div>

        <Separator className="my-8" />

        {/* Most Popular Section */}
        <div className="mb-8">
          <PopularToolsCarousel />
        </div>

        <Separator className="my-8" />

        {/* Platform Insights Section */}
        <div className="mb-8">
          <DashboardStats />
        </div>
      </div>
    </div>
  );
}