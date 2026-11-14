import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-canvas text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[100] focus:bg-flame focus:px-3 focus:py-2 focus:font-mono focus:text-[11px] focus:uppercase focus:tracking-wider focus:text-black"
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
