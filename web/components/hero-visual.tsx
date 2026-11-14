import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Flame } from "lucide-react";

/**
 * The hero visual. It is the one place on the site that shows a flame rather
 * than a number, and it carries the headline finding: the solid-material
 * oxygen ceiling.
 */
export function HeroVisual({ priority = false }: { priority?: boolean }) {
  return (
    <figure className="reveal reveal-delay-1">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-ink">
        <Image
          src="/images/bass-ii.jpg"
          alt="A solid-fuel flame burning in microgravity during the BASS-II investigation"
          width={1200}
          height={797}
          priority={priority}
          className="h-full w-full object-cover"
          sizes="(max-width: 1024px) 100vw, 48vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4">
          <div>
            <div className="text-[12.5px] text-white/75">PMMA film, microgravity</div>
            <div className="mt-1 font-mono text-[26px] leading-none tracking-[-0.03em] text-white">
              13.6–22.2%{" "}
              <span className="text-[14px] text-white/70">O₂</span>
            </div>
          </div>
          <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[12.5px] text-white">
            Solid ceiling
          </span>
        </div>
      </div>
      <figcaption className="mt-3 flex items-center justify-between text-[12.5px] text-faint">
        <span>NASA PSI · BASS-II · CC0 1.0</span>
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

/** Small diagrams used in the feature grid. */
export function MapGlyph() {
  return (
    <svg viewBox="0 0 240 96" className="h-24 w-full" role="img" aria-hidden="true">
      <rect x="0" y="0" width="240" height="96" fill="none" />
      {[18, 42, 66, 90].map((y) => (
        <line
          key={y}
          x1="76"
          y1={y}
          x2="232"
          y2={y}
          stroke="var(--line)"
          strokeWidth="1"
          strokeDasharray="2 5"
        />
      ))}
      <rect x="166" y="8" width="66" height="80" fill="rgba(194,65,12,0.05)" />
      <line
        x1="166"
        y1="4"
        x2="166"
        y2="92"
        stroke="var(--flame)"
        strokeWidth="1"
        strokeDasharray="3 4"
      />
      <rect x="96" y="13" width="26" height="6" rx="3" fill="#B45309" />
      <rect x="86" y="38" width="40" height="6" rx="3" fill="#0E7490" />
      <rect x="92" y="61" width="66" height="6" rx="3" fill="#6D28D9" />
      <circle cx="96" cy="16" r="2.4" fill="#B45309" />
      <circle cx="92" cy="41" r="2.4" fill="#0E7490" />
      <circle cx="92" cy="64" r="2.4" fill="#6D28D9" />
      <text
        x="166"
        y="90"
        textAnchor="middle"
        fill="var(--flame)"
        fontSize="8"
        fontFamily="var(--font-plex-mono)"
      >
        ≥30% O₂
      </text>
    </svg>
  );
}

export function ExplorerGlyph() {
  return (
    <svg viewBox="0 0 240 96" className="h-24 w-full" role="img" aria-hidden="true">
      {[14, 38, 62, 86].map((y) => (
        <rect key={y} x="0" y={y} width="240" height="1" fill="var(--line)" />
      ))}
      {[52, 108, 164, 214].map((x) => (
        <rect key={x} x={x} y="8" width="1" height="80" fill="var(--line)" />
      ))}
      <rect x="6" y="18" width="42" height="4" rx="2" fill="var(--line-strong)" />
      <rect x="58" y="18" width="44" height="4" rx="2" fill="var(--line-strong)" />
      <rect x="114" y="18" width="44" height="4" rx="2" fill="var(--line-strong)" />
      <rect x="170" y="18" width="38" height="4" rx="2" fill="var(--line-strong)" />
      {[42, 66].map((y) => (
        <g key={y}>
          <rect x="6" y={y} width="30" height="4" rx="2" fill="var(--ink)" opacity="0.7" />
          <rect x="58" y={y} width="26" height="4" rx="2" fill="var(--ink)" opacity="0.35" />
          <rect x="114" y={y} width="38" height="4" rx="2" fill="var(--ink)" opacity="0.35" />
          <rect x="170" y={y} width="30" height="4" rx="2" fill="var(--ink)" opacity="0.35" />
        </g>
      ))}
      <circle cx="192" cy="44" r="5" fill="var(--flame)" opacity="0.9" />
    </svg>
  );
}

export function ChatGlyph() {
  return (
    <svg viewBox="0 0 240 96" className="h-24 w-full" role="img" aria-hidden="true">
      <rect x="84" y="8" width="150" height="26" rx="5" fill="var(--panel-2)" stroke="var(--line)" />
      <rect x="8" y="42" width="186" height="44" rx="5" fill="none" stroke="var(--line)" />
      <rect x="16" y="52" width="118" height="4" rx="2" fill="var(--ink)" opacity="0.55" />
      <rect x="16" y="62" width="160" height="4" rx="2" fill="var(--ink)" opacity="0.3" />
      <rect x="16" y="72" width="96" height="4" rx="2" fill="var(--ink)" opacity="0.3" />
      <circle cx="16" cy="20" r="4" fill="var(--flame)" />
    </svg>
  );
}

export function ScaleGlyph() {
  return (
    <svg viewBox="0 0 240 96" className="h-24 w-full" role="img" aria-hidden="true">
      <rect x="0" y="52" width="240" height="1" fill="var(--line-strong)" />
      {Array.from({ length: 30 }).map((_, index) => (
        <rect
          key={index}
          x={index * 8}
          y={index % 5 === 0 ? 40 : 47}
          width="1"
          height={index % 5 === 0 ? 12 : 5}
          fill={index % 5 === 0 ? "var(--line-strong)" : "var(--line)"}
        />
      ))}
      <rect x="120" y="30" width="2" height="22" fill="var(--flame)" />
      <circle cx="121" cy="28" r="4" fill="var(--flame)" />
    </svg>
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
