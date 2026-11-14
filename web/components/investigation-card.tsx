import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Investigation } from "@/lib/types";
import { formatO2, phaseLabel } from "@/lib/data";
import { Badge } from "@/components/ui";

const PHASE_TONE: Record<string, "flame" | "ice" | "violet" | "neutral"> = {
  solid: "flame",
  liquid: "ice",
  gas: "violet",
  aerosol: "neutral",
};

export function InvestigationCard({ investigation }: { investigation: Investigation }) {
  const primaryTable = investigation.tables.find((table) => table.o2) ?? investigation.tables[0];
  const phase = primaryTable?.phase ?? null;
  const image = investigation.image;

  return (
    <Link
      href={`/investigations/${investigation.id}`}
      className="group panel panel-hover flex flex-col overflow-hidden"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-ink">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            width={1200}
            height={800}
            className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
            loading="eager"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-mono text-[52px] tracking-[-0.06em] text-white/15">
              {investigation.acronym ?? investigation.id}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-panel via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {phase ? <Badge tone={PHASE_TONE[phase] ?? "neutral"}>{phaseLabel(phase)}</Badge> : null}
          <Badge tone="neutral">
            {investigation.gravity === "microgravity" ? "µg" : "1 g"}
          </Badge>
        </div>
        {primaryTable?.o2 ? (
          <div className="absolute bottom-3 right-3 rounded-full border border-line bg-panel/90 px-2.5 py-1 backdrop-blur">
            <span className="font-mono text-[14px] tabular text-ink">
              {formatO2(primaryTable.o2)}
            </span>
            <span className="ml-1.5 text-[15px] text-faint">
              O₂
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[15px] text-faint">
            {investigation.id} · {investigation.kindLabel}
          </span>
          <ArrowUpRight
            className="h-3.5 w-3.5 text-faint transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-flame"
            strokeWidth={1.5}
          />
        </div>
        <h3 className="mt-2.5 text-[18px] font-medium leading-6 tracking-[-0.015em] text-ink">
          {investigation.acronym ?? investigation.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[14.5px] leading-6 text-muted">
          {investigation.summary ?? investigation.title}
        </p>
        <div className="mt-4 flex items-center gap-3 border-t border-line pt-3 text-[15px] text-faint">
          <span>{investigation.tableCount} tables</span>
          <span className="h-2.5 w-px bg-line" />
          <span>{investigation.publicationCount} publications</span>
          {investigation.analog ? (
            <>
              <span className="h-2.5 w-px bg-line" />
              <span className="text-violet">analog</span>
            </>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
