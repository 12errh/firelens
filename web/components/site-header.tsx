"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { StatusDot, TickRule } from "@/components/ui";

const nav = [
  { href: "/", label: "Overview" },
  { href: "/investigations", label: "Investigations" },
  { href: "/evidence", label: "Evidence map" },
  { href: "/assistant", label: "Assistant" },
  { href: "/methodology", label: "Methodology" },
];

function Mark() {
  return (
    <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
      <path
        d="M16 4.5 25 27H7L16 4.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        className="text-ink"
      />
      <path
        d="M16 11.5 21.2 25H10.8L16 11.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        className="text-flame"
      />
      <path d="M16 16.5 18.3 23h-4.6L16 16.5Z" className="fill-flame" />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-6 px-6 lg:px-10">        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          aria-label="Flame in Freefall home"
        >
          <Mark />
          <span className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
              Flame in Freefall
            </span>
            <span className="mt-1 text-[14px] text-faint">PSI evidence workbench</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {nav.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded px-3 py-2 text-[14px] transition-colors",
                  active
                    ? "font-medium text-ink"
                    : "text-muted hover:bg-panel-2 hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 xl:flex">
          <StatusDot tone="moss" />
          <span className="text-[14px] text-faint">Snapshot 14 Nov 2026</span>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded border border-line text-muted transition-colors hover:bg-panel-2 hover:text-ink lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close navigation" : "Open navigation"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <TickRule className="opacity-70" />

      {open ? (
        <div id="mobile-nav" className="border-t border-line bg-panel lg:hidden">
          <nav className="mx-auto grid max-w-[1200px] gap-1 px-4 py-4" aria-label="Mobile">
            {nav.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded px-3 py-3 text-[15px]",
                    active ? "bg-panel-2 font-medium text-ink" : "text-muted",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
