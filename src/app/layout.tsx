import type { Metadata } from "next";
import { Nunito, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GoogleAnalytics } from '@next/third-parties/google'
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";

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

const GA_ID = process.env.GOOGLE_ANALYTICS_ID || '';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${nunito.variable} ${nunitoSans.variable} antialiased`}>
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
        <ThemeProvider
          defaultTheme="system"
          storageKey="platform-theme"
        >
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
        </ThemeProvider>
      </body>
    </html>
  );
}
