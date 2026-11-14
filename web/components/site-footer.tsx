import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FlameLogo } from "@/components/flame-logo";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-panel">
      <div className="mx-auto max-w-[1200px] px-6 py-16 lg:px-10">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <FlameLogo className="h-7 w-7" />
              <span className="text-[15px] font-semibold text-ink">Flame in Freefall</span>
            </div>
            <p className="mt-5 max-w-sm text-[14px] leading-6 text-muted">
              An evidence workbench for combustion research in reduced gravity. Built on
              the public NASA Physical Sciences Informatics snapshot, with every number
              traceable to a source table.
            </p>
            <p className="mt-5 max-w-sm text-[14px] leading-5 text-faint">
              Independent project for NASA Space Apps Challenge 2026. Not affiliated with,
              sponsored by, or endorsed by NASA. No NASA logos or insignia are used.
            </p>
          </div>

          <div>
            <div className="text-[14px] font-medium text-ink">Explore</div>
            <ul className="mt-4 space-y-3 text-[14px] text-muted">
              <li>
                <Link href="/investigations" className="transition-colors hover:text-ink">
                  Investigation explorer
                </Link>
              </li>
              <li>
                <Link href="/evidence" className="transition-colors hover:text-ink">
                  Oxygen × gravity map
                </Link>
              </li>
              <li>
                <Link href="/assistant" className="transition-colors hover:text-ink">
                  Evidence assistant
                </Link>
              </li>
              <li>
                <Link href="/methodology" className="transition-colors hover:text-ink">
                  Sources and methodology
                </Link>
              </li>
              <li>
                <a
                  href="https://12errh.github.io/firelens/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
                >
                  Project deck
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-[14px] font-medium text-ink">Primary sources</div>
            <ul className="mt-4 space-y-3 text-[14px] text-muted">
              <li>
                <a
                  href="https://psi.nasa.gov/physci/repo/search?q=combustion"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
                >
                  NASA PSI repository
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
                </a>
              </li>
              <li>
                <a
                  href="https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
                >
                  Flame in Freefall challenge
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
                </a>
              </li>
              <li>
                <a
                  href="https://www.nasa.gov/missions/station/a-researchers-guide-to-combustion-science/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
                >
                  Researcher&apos;s guide
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
                </a>
              </li>
              <li>
                <a
                  href="https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
                >
                  NASA Combustion Science
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-[14px] text-faint sm:flex-row sm:items-center sm:justify-between">
          <span>PSI snapshot 14 Nov 2026 · 24 investigations · 22 tables</span>
          <span>23 of 24 records CC0 1.0 · PSI-10 license not stated</span>
        </div>
      </div>
    </footer>
  );
}
