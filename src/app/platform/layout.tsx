import type { Metadata } from "next";
import { Nunito, Nunito_Sans } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/navbar/navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import platformSidebarData from "@/components/sidebar/sidebar-entries.json";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TourProvider } from "@/components/guided-tour";
import { Suspense } from "react";
import { NewToolAlert } from "@/components/new-tool-alert";
import { WhatsNewModal } from "@/components/whats-new-modal";
import { RecentPageTracker } from "@/components/landing-page/recent-page-tracker";

const nunito = Nunito({
  variable: "--font-heading",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

const nunitoSans = Nunito_Sans({
  variable: "--font-body",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Platform",
  description: "Engineered by the Ministry of Technology of Ashoka University",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${nunito.variable} ${nunitoSans.variable} antialiased`}>
      <TooltipProvider>
        <TourProvider
          autoStart={false}
        >
          <SidebarProvider defaultOpen={false}>
            <NewToolAlert
              href="/platform/trajectory-planner"
              title="Trajectory Planner"
              checkSeenKey="TRAJECTORY_PLANNER_TOUR_SEEN_V1"
              blockIfNewVersion={true}
            />
            <WhatsNewModal />
            <RecentPageTracker />
            <div className="flex min-h-screen w-full overflow-x-hidden">
              <AppSidebar data={platformSidebarData} basePath="/platform" title="Platform" />
              <div className="flex flex-1 flex-col min-w-0 h-screen overflow-y-auto">
                <Navbar />
                <Suspense>
                  <main className="flex-1 pt-6 pb-4 px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8">
                    {children}
                  </main>
                </Suspense>
              </div>
            </div>
          </SidebarProvider>
        </TourProvider>
      </TooltipProvider>
    </div>
  );
}
