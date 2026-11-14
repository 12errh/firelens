"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { StatusDot } from "@/components/ui";

const nav = [
  { href: "/", label: "Overview" },
  { href: "/investigations", label: "Investigations" },
  { href: "/evidence", label: "Evidence map" },
  { href: "/assistant", label: "Assistant" },
  { href: "/methodology", label: "Methodology" },
];

function Mark() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
      <path
        d="M16 4.5 25 27H7L16 4.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        className="text-line-strong"
      />
      <path
        d="M16 11.5 21.2 25H10.8L16 11.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
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
    <header className="sticky top-0 z-50 border-b border-line bg-canvas/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[62px] max-w-[1240px] items-center justify-between gap-6 px-5 sm:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label="Flame in Freefall home">
          <Mark />
          <span className="flex flex-col">
            <span className="font-mono text-[11.5px] font-semibold tracking-[0.14em] text-ink">
              FLAME<span className="text-flame">/</span>FREEFALL
            </span>
            <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-faint">
              PSI evidence workbench
            </span>
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
                  "relative px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors",
                  active ? "text-ink" : "text-muted hover:text-ink",
                )}
              >
                {item.label}
                {active ? (
                  <span className="absolute inset-x-3 -bottom-[13px] h-px bg-flame" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <div className="flex items-center gap-2 border border-line bg-white/[0.02] px-2.5 py-1.5">
            <StatusDot tone="moss" pulse />
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
              PSI snapshot · 14 Nov 2026
            </span>
          </div>
        </div>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center border border-line text-muted transition-colors hover:text-ink lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close navigation" : "Open navigation"}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-line bg-canvas lg:hidden">
          <nav className="mx-auto grid max-w-[1240px] grid-cols-2 gap-px bg-line" aria-label="Mobile">
            {nav.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "bg-canvas px-5 py-4 font-mono text-[11px] uppercase tracking-[0.1em]",
                    active ? "text-flame" : "text-muted",
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
