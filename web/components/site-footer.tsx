import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-panel/60">
      <div className="mx-auto max-w-[1240px] px-5 py-12 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <div className="font-mono text-[11px] font-semibold tracking-[0.14em] text-ink">
              FLAME<span className="text-flame">/</span>FREEFALL
            </div>
            <p className="mt-4 max-w-sm text-[12.5px] leading-6 text-muted">
              An evidence workbench for combustion research in reduced gravity. Built on
              the public NASA Physical Sciences Informatics snapshot, with every number
              traceable to a source table.
            </p>
            <p className="mt-5 max-w-sm text-[11px] leading-5 text-faint">
              Independent project for NASA Space Apps Challenge 2026. Not affiliated with,
              sponsored by, or endorsed by NASA. No NASA logos or insignia are used.
            </p>
          </div>

          <div>
            <div className="label">Explore</div>
            <ul className="mt-4 space-y-2.5 text-[12.5px] text-muted">
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
                  Sources & methodology
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="label">Primary sources</div>
            <ul className="mt-4 space-y-2.5 text-[12.5px] text-muted">
              <li>
                <a
                  href="https://psi.nasa.gov/physci/repo/search?q=combustion"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-ink"
                >
                  NASA PSI repository
                  <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
                </a>
              </li>
              <li>
                <a
                  href="https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-ink"
                >
                  Flame in Freefall challenge
                  <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
                </a>
              </li>
              <li>
                <a
                  href="https://www.nasa.gov/missions/station/a-researchers-guide-to-combustion-science/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-ink"
                >
                  Researcher&apos;s guide
                  <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
                </a>
              </li>
              <li>
                <a
                  href="https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-ink"
                >
                  NASA Combustion Science
                  <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-5 font-mono text-[9px] uppercase tracking-[0.1em] text-faint sm:flex-row sm:items-center sm:justify-between">
          <span>PSI snapshot · 14 Nov 2026 · 24 investigations · 22 tables</span>
          <span>23/24 records CC0 1.0 · PSI-10 license not stated</span>
        </div>
      </div>
    </footer>
  );
}
