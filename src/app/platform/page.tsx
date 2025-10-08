import HeroCarousel from '@/components/landing-page/hero-carousel';
import QuickAccessCards from '@/components/landing-page/quick-access-cards';
import PopularToolsCarousel from '@/components/landing-page/popular-tools-carousel';
import DashboardStats from '@/components/landing-page/dashboard-stats';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 py-2 xs:py-3 sm:py-4 md:py-6 lg:py-8">
        {/* Hero Carousel */}
        <HeroCarousel />

        <Separator className="my-3 xs:my-4 sm:my-5 md:my-6" />

        {/* Quick Access Cards */}
        <QuickAccessCards />

        <Separator className="my-3 xs:my-4 sm:my-5 md:my-6" />

        {/* Dashboard Statistics */}
        <DashboardStats />

        <Separator className="my-3 xs:my-4 sm:my-5 md:my-6" />

        {/* Popular Tools Carousel */}
        <PopularToolsCarousel />
      </div>
    </div>
  );
}