import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from "@/components/ui/sonner";

const rubik = Rubik({
  variable: "--font-heading",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

const rubikBody = Rubik({
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
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
      <body className={`${rubik.variable} ${rubikBody.variable} antialiased`}>
        <SessionProvider
          refetchInterval={5 * 60} // Refetch session every 5 minutes instead of 30 seconds
          refetchOnWindowFocus={false} // Don't refetch when window gains focus
        >
          <Suspense>
            <main>
              {children}
              <Analytics />
              <SpeedInsights />
            </main>
            <Toaster position="top-right" />
          </Suspense>
        </SessionProvider>
      </body>
    </html>
  );
}
