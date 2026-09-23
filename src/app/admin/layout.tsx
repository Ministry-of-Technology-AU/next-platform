import type { Metadata } from "next";
import { Nunito, Nunito_Sans } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/navbar/navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import adminPortalSidebarData from "@/components/sidebar/admin-portal-sidebar-entries.json";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TourProvider } from "@/components/guided-tour";
import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

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
  title: "Admin Portal | Platform",
  description: "Engineered by the Ministry of Technology of Ashoka University",
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim()) || [];
  
  const isAuthorized =
    (session?.user?.email && adminEmails.includes(session.user.email)) ||
    session?.user?.role === 'ashoka_admin' ||
    session?.user?.access?.includes('ashoka_admin');
  const bypassAuth = process.env.BYPASS_AUTH === 'true';

  if (!isAuthorized && !bypassAuth) {
    redirect("/unauthorized"); // or "/login"
  }

  return (
    <div className={`${nunito.variable} ${nunitoSans.variable} antialiased`}>
      <TooltipProvider>
        <TourProvider autoStart={false}>
          <SidebarProvider defaultOpen={false}>
            <div className="flex min-h-screen w-full overflow-x-hidden">
              <AppSidebar data={adminPortalSidebarData} basePath="/admin" title="Admin Portal" />
              <div className="flex flex-1 flex-col min-w-0 h-screen overflow-y-auto">
                <Navbar />
                <Suspense>
                  <main id="main-content" tabIndex={-1} className="flex-1 pt-6 pb-4 px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 focus:outline-hidden">
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
