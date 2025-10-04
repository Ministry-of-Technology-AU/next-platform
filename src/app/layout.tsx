import type { Metadata } from "next";
import { Nunito, Nunito_Sans} from "next/font/google";
import "./globals.css";
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
          <Suspense>
            <main>
              {children}
            </main>
          </Suspense>
        </SessionProvider>
      </body>
    </html>
  );
}
