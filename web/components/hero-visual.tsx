import Link from "next/link";
import { ArrowUpRight, Flame } from "lucide-react";
import { CombustionBenchFigure } from "@/components/figures/combustion-bench/figure";

/**
 * The hero visual: an isometric combustion bench whose flame morphs from a 1 g
 * teardrop to a microgravity sphere as the gravity knob is turned. It is the
 * premise of the whole project drawn as one instrument.
 */
export function HeroVisual({ priority = false }: { priority?: boolean }) {
  return (
    <figure className="reveal reveal-delay-1">
      <div className="overflow-hidden rounded-lg border border-line bg-panel">
        <CombustionBenchFigure className="px-2 pt-3 sm:px-4" />
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line px-4 py-3">
          <div className="text-[13px] leading-5 text-muted">
            Turn the knob: the flame falls to a sphere as gravity reaches zero.
          </div>
          <span className="font-mono text-[13px] tabular text-ink">
            13.6–22.2%{" "}
            <span className="text-faint">O₂ solid ceiling</span>
          </span>
        </div>
      </div>
      <figcaption className="mt-3 flex items-center justify-between text-[12.5px] text-faint">
        <span>Drawn from the archive · BASS-II, PSI-25 · CC0 1.0</span>
        <a
          href="https://psi.nasa.gov/physci/repo/search?q=PSI-25"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 hover:text-ink"
        >
          Source <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </figcaption>
    </figure>
  );
}

export function HeroKicker() {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[14px] text-muted">
      <span className="flex items-center gap-1.5 text-flame">
        <Flame className="h-3.5 w-3.5" strokeWidth={1.75} />
        NASA Space Apps 2026
      </span>
      <span className="text-line-strong">/</span>
      <span>Flame in Freefall challenge</span>
    </div>
  );
}

export function HomeLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-[15px] text-muted transition-colors hover:text-flame"
    >
      {children}
      <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
    </Link>
  );
}
