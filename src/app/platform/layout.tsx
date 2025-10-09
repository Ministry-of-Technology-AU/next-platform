import type { Metadata } from "next";
import { Nunito, Nunito_Sans } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TourProvider } from "@/components/guided-tour";
import { Suspense } from "react";

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
              <div className="flex min-h-screen w-full overflow-x-hidden">
                <AppSidebar />
                <div className="flex flex-1 flex-col min-w-0">
                  <Navbar />
                  <Suspense>
                    <main className="flex-1 overflow-auto pt-2 pb-4 px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8">
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
