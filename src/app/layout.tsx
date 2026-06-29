import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, Space_Mono } from "next/font/google";
import "./globals.css";

import { Providers } from "@/providers";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site-header";

// Display + numerals: technical grotesque used with restraint.
const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Body: engineering-humanist sans.
const sans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Data: week IDs, dates, the weekday rail — ledger character.
const mono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Weekly Report",
  description: "Générateur de rapport hebdomadaire d'activités",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <SiteHeader />
          <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
            {children}
          </main>
        </Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
