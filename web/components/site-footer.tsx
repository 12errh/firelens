import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FlameLogo } from "@/components/flame-logo";
import { TickRule } from "@/components/ui";

const explore = [
  { href: "/investigations", label: "Investigation explorer" },
  { href: "/evidence", label: "Oxygen × gravity map" },
  { href: "/assistant", label: "Evidence assistant" },
  { href: "/methodology", label: "Sources and methodology" },
];

const sources = [
  {
    href: "https://psi.nasa.gov/physci/repo/search?q=combustion",
    label: "NASA PSI repository",
  },
  {
    href: "https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/",
    label: "Flame in Freefall challenge",
  },
  {
    href: "https://www.nasa.gov/missions/station/a-researchers-guide-to-combustion-science/",
    label: "Researcher's guide to combustion",
  },
  {
    href: "https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/",
    label: "NASA Combustion Science",
  },
];

const resources = [
  { href: "https://12errh.github.io/firelens/", label: "Project deck" },
  { href: "https://12errh.github.io/firelens/flame-in-freefall.pdf", label: "PDF demo" },
  { href: "https://github.com/12errh/firelens", label: "Source on GitHub" },
];

function ExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={
        "group inline-flex items-center gap-1.5 transition-colors hover:text-ink " +
        (className ?? "")
      }
    >
      {children}
      <ArrowUpRight
        className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        strokeWidth={1.6}
      />
    </a>
  );
}

function ResourceLink({ href, label }: { href: string; label: string }) {
  return (
    <ExternalLink
      href={href}
      className="rounded-full border border-line bg-canvas px-3.5 py-2 text-[13px] font-medium text-muted hover:border-line-strong"
    >
      {label}
    </ExternalLink>
  );
}

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[12.5px] font-medium text-ink">{children}</div>;
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-panel">
      <TickRule className="opacity-60" />

      <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
        <div className="flex flex-col gap-8 py-12 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <div className="flex max-w-xl items-start gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-canvas text-ink">
              <FlameLogo className="h-7 w-7" decorative />
            </span>
            <div>
              <div className="text-[16px] font-semibold tracking-[-0.015em] text-ink">
                Flame in Freefall
              </div>
              <p className="mt-1.5 text-[13.5px] leading-6 text-muted">
                An evidence workbench for combustion research in reduced gravity. Every
                number is traceable to a public NASA PSI source table.
              </p>
              <p className="mt-3 text-[12.5px] leading-5 text-faint">
                Independent project for NASA Space Apps Challenge 2026. Not affiliated
                with, sponsored by, or endorsed by NASA. No NASA logos or insignia are
                used.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 lg:shrink-0">
            {resources.map((resource) => (
              <ResourceLink key={resource.href} {...resource} />
            ))}
          </div>
        </div>

        <div className="grid gap-8 border-t border-line py-9 sm:grid-cols-2 lg:grid-cols-[1fr_1.1fr_1fr] lg:gap-10 lg:py-10">
          <nav aria-label="Explore the workbench">
            <ColumnTitle>Explore</ColumnTitle>
            <ul className="mt-4 space-y-3 text-[13.5px] text-muted">
              {explore.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-colors hover:text-ink">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Primary sources">
            <ColumnTitle>Primary sources</ColumnTitle>
            <ul className="mt-4 space-y-3 text-[13.5px] text-muted">
              {sources.map((item) => (
                <li key={item.href}>
                  <ExternalLink href={item.href}>{item.label}</ExternalLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="sm:col-span-2 lg:col-span-1">
            <ColumnTitle>Project and team</ColumnTitle>
            <ul className="mt-4 space-y-3 text-[13.5px] text-muted">
              <li>Team R1 (Lahore) — Rehan and Ayesha Khan</li>
              <li>NASA Space Apps Challenge 2026</li>
              <li>
                <ExternalLink href="https://github.com/12errh/firelens">
                  Source on GitHub
                </ExternalLink>
              </li>
              <li className="text-faint">Data snapshot 14 Nov 2026</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-line py-6 text-[12.5px] leading-5 text-faint sm:flex-row sm:items-center sm:justify-between">
          <span>
            PSI snapshot 14 Nov 2026 · 24 investigations · 22 tables · 2,870 rows
          </span>
          <span>23 of 24 records CC0 1.0 · PSI-10 license not stated</span>
        </div>
      </div>
    </footer>
  );
}
