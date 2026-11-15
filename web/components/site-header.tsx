"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { StatusDot } from "@/components/ui";
import { ThemeToggle } from "@/components/theme-toggle";
import { FlameLogo } from "@/components/flame-logo";

const nav = [
  { href: "/", label: "Overview" },
  { href: "/investigations", label: "Investigations" },
  { href: "/evidence", label: "Evidence map" },
  { href: "/assistant", label: "Assistant" },
  { href: "/methodology", label: "Methodology" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function Mark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[11px] border border-line bg-panel text-ink",
        className,
      )}
    >
      <FlameLogo className="h-6 w-6" decorative />
    </span>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between gap-6 px-6 lg:px-10">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-3"
          aria-label="Flame in Freefall home"
        >
          <Mark className="h-10 w-10 transition-colors group-hover:border-line-strong" />
          <span className="flex flex-col">
            <span className="text-[15px] font-semibold leading-[1.2] tracking-[-0.015em] text-ink">
              Flame in Freefall
            </span>
            <span className="mt-0.5 text-[11.5px] leading-[1.2] text-faint">
              PSI evidence workbench
            </span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-0.5 rounded-full border border-line bg-panel/70 p-1 lg:flex"
          aria-label="Primary"
        >
          {nav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13.5px] leading-5 transition-colors",
                  active
                    ? "bg-panel-2 font-medium text-ink"
                    : "text-muted hover:bg-panel-2/60 hover:text-ink",
                )}
              >
                {active ? (
                  <span className="h-1 w-1 rounded-full bg-flame" aria-hidden="true" />
                ) : null}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full border border-line bg-panel px-3 py-1.5 text-[12.5px] leading-4 text-muted xl:inline-flex">
            <StatusDot tone="moss" />
            Snapshot 14 Nov 2026
          </span>

          <ThemeToggle />

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-line-strong hover:text-ink lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close navigation" : "Open navigation"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-line bg-panel lg:hidden">
          <nav className="mx-auto max-w-[1200px] px-4 py-3" aria-label="Mobile">
            <div className="grid gap-0.5">
              {nav.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-3 text-[15px] transition-colors",
                      active
                        ? "bg-panel-2 font-medium text-ink"
                        : "text-muted hover:bg-panel-2/60 hover:text-ink",
                    )}
                  >
                    {item.label}
                    {active ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-flame" aria-hidden="true" />
                    ) : null}
                  </Link>
                );
              })}
            </div>
            <div className="mt-2 flex items-center gap-2 border-t border-line px-3 pb-1 pt-4 text-[12.5px] text-faint">
              <StatusDot tone="moss" />
              PSI snapshot 14 Nov 2026 · 24 investigations
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
