import type { Metadata } from "next";
import { Nunito, Nunito_Sans} from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import {TourProvider} from "@/components/guided-tour";
import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";

const nunito = Nunito({
  variable: "--font-heading",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

const nunitoSans = Nunito_Sans({
  variable: "--font-body",
  weight: ["200","300", "400", "500", "600", "700", "800", "900"],
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
    <html lang="en">
      <body className={`${nunito.variable} ${nunitoSans.variable} antialiased`}>
        <SessionProvider>
          <TooltipProvider>
            <TourProvider
              autoStart={false}
            >
              <SidebarProvider defaultOpen={false}>
                <div className="flex min-h-screen w-full">
                  <AppSidebar />
                  <div className="flex flex-1 flex-col">
                    <Navbar />
                    <Suspense>
                    <main className="flex-1 overflow-auto p-4 sm:p-6">
                      {children}
                    </main>
                    </Suspense>
                  </div>
                </div>
              </SidebarProvider>
            </TourProvider>
          </TooltipProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
