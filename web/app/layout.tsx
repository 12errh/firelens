import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Flame in Freefall — NASA PSI evidence workbench",
    template: "%s · Flame in Freefall",
  },
  description:
    "An evidence workbench for combustion research in reduced gravity. Explore 24 NASA PSI investigations, 22 experimental tables, and the gaps between microgravity, lunar, and Mars fire safety.",
  keywords: [
    "NASA PSI",
    "combustion science",
    "microgravity",
    "fire safety",
    "lunar habitat",
    "Mars",
    "Space Apps",
  ],
  openGraph: {
    title: "Flame in Freefall — NASA PSI evidence workbench",
    description:
      "Every number traceable to a NASA PSI source table. Explore the oxygen × gravity evidence gap for spacecraft, lunar, and Mars fire safety.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-canvas text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[100] focus:bg-flame focus:rounded focus:px-3 focus:py-2 focus:text-[14px] focus:text-white"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
