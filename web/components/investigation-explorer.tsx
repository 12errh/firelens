"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";
import type { CompactInvestigation } from "@/lib/types";
import { formatNumber, formatO2, phaseLabel } from "@/lib/data";
import { cn } from "@/lib/cn";
import { Badge, DataNote } from "@/components/ui";
import { PHASE_COLOR } from "@/lib/tokens";

const KIND_FILTERS = [
  { id: "all", label: "All records" },
  { id: "flight", label: "Flight" },
  { id: "analysis", label: "Analysis" },
  { id: "ground", label: "Ground" },
] as const;

const PHASE_FILTERS = [
  { id: "all", label: "All phases" },
  { id: "solid", label: "Solid" },
  { id: "liquid", label: "Liquid" },
  { id: "gas", label: "Gas" },
] as const;


const CURATED_ORDER = [
  "PSI-25",
  "PSI-98",
  "PSI-99",
  "PSI-100",
  "PSI-69",
  "PSI-68",
  "PSI-159",
  "PSI-22",
  "PSI-20",
  "PSI-102",
  "PSI-101",
  "PSI-26",
  "PSI-39",
  "PSI-23",
  "PSI-10",
  "PSI-107",
  "PSI-106",
  "PSI-47",
  "PSI-21",
  "PSI-142",
  "PSI-62",
  "PSI-60",
  "PSI-115",
  "PSI-117",
];

const KIND_TONE: Record<string, "flame" | "ice" | "violet" | "neutral"> = {
  flight: "flame",
  analysis: "violet",
  ground: "ice",
};

type SortKey = "curated" | "o2" | "tables" | "id";

export function InvestigationExplorer({
  records,
}: {
  records: CompactInvestigation[];
}) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<(typeof KIND_FILTERS)[number]["id"]>("all");
  const [phase, setPhase] = useState<(typeof PHASE_FILTERS)[number]["id"]>("all");
  const [o2Only, setO2Only] = useState(false);
  const [sort, setSort] = useState<SortKey>("curated");

  const kindCounts = useMemo(() => {
    const counts: Record<string, number> = { all: records.length };
    for (const record of records) {
      counts[record.kind] = (counts[record.kind] ?? 0) + 1;
    }
    return counts;
  }, [records]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const list = records.filter((record) => {
      if (kind !== "all" && record.kind !== kind) return false;
      if (phase !== "all" && !record.phases.includes(phase)) return false;
      if (o2Only && !record.o2) return false;
      if (term && !record.searchText.includes(term)) return false;
      return true;
    });

    return list.sort((a, b) => {
      if (sort === "o2") {
        return (b.o2?.max ?? -1) - (a.o2?.max ?? -1);
      }
      if (sort === "tables") {
        return b.tableCount - a.tableCount || a.id.localeCompare(b.id);
      }
      if (sort === "id") {
        return a.id.localeCompare(b.id, undefined, { numeric: true });
      }
      const ai = CURATED_ORDER.indexOf(a.id);
      const bi = CURATED_ORDER.indexOf(b.id);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi) || a.id.localeCompare(b.id);
    });
  }, [records, query, kind, phase, o2Only, sort]);

  const hasFilters = query || kind !== "all" || phase !== "all" || o2Only || sort !== "curated";

  function reset() {
    setQuery("");
    setKind("all");
    setPhase("all");
    setO2Only(false);
    setSort("curated");
  }

  return (
    <div>
      <div className="panel p-4 sm:p-5">
        <label className="relative block">
          <span className="sr-only">Search investigations</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
            strokeWidth={1.5}
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a record, material, acronym, or objective…"
            className="h-11 w-full rounded-md border border-line bg-panel pl-10 pr-10 text-[15px] text-ink placeholder:text-faint focus:border-flame focus:outline-none focus:ring-2 focus:ring-flame/15"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-ink"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </label>

        <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {KIND_FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setKind(item.id)}
                className={cn(
                  "rounded-full border px-3.5 py-2 text-[14px] transition-colors",
                  kind === item.id
                    ? "border-flame/40 bg-flame/10 text-flame"
                    : "border-line text-muted hover:border-line-strong hover:text-ink",
                )}
              >
                {item.label}
                <span className="ml-1.5 text-[14px] text-faint">{kindCounts[item.id] ?? 0}</span>
              </button>
            ))}
            <span className="mx-1 hidden h-4 w-px bg-line sm:block" />
            {PHASE_FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPhase(item.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[14px] transition-colors",
                  phase === item.id
                    ? "border-line-strong bg-panel-2 text-ink"
                    : "border-line text-muted hover:border-line-strong hover:text-ink",
                )}
              >
                {item.id !== "all" ? (
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: PHASE_COLOR[item.id] }}
                  />
                ) : null}
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setO2Only((value) => !value)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3.5 py-2 text-[14px] transition-colors",
                o2Only
                  ? "border-ice/40 bg-ice/[0.08] text-ice"
                  : "border-line text-muted hover:border-line-strong hover:text-ink",
              )}
              aria-pressed={o2Only}
            >
              <span
                className={cn(
                  "h-2 w-2 border",
                  o2Only ? "border-ice bg-ice" : "border-faint bg-transparent",
                )}
              />
              O₂ reported
            </button>
            <label className="flex items-center gap-2 text-[15px] text-faint">
              Sort
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
                className="h-9 rounded border border-line bg-panel px-3 text-[14px] text-muted focus:border-flame focus:outline-none"
              >
                <option value="curated">Curated</option>
                <option value="o2">O₂ max</option>
                <option value="tables">Most tables</option>
                <option value="id">Record ID</option>
              </select>
            </label>
            {hasFilters ? (
              <button
                type="button"
                onClick={reset}
                className="text-[15px] text-flame hover:text-ink"
              >
                Reset
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 border-b border-line pb-3">
        <span className="text-[15px] text-muted">
          {filtered.length} of {records.length} records
        </span>
        <span className="hidden text-[15px] text-faint sm:block">
          O₂ range · reported test condition
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="panel mt-5 flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="font-mono text-[26px] text-flame">0</div>
          <h2 className="mt-3 text-[17px] text-ink">No record matches those filters.</h2>
          <p className="mt-2 max-w-sm text-[14px] leading-5 text-muted">
            Try a broader search term, or reset to the full 24-record snapshot.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-5 border border-line px-3 py-2 text-[15px] text-ink hover:border-line-strong"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <div className="grid grid-cols-[minmax(0,2.1fr)_minmax(0,0.9fr)_minmax(0,1.2fr)_minmax(0,1.45fr)_minmax(0,0.65fr)_24px] gap-4 border-b border-line px-4 py-2 text-[15px] text-faint">
              <span>Record</span>
              <span>Evidence type</span>
              <span>Environment</span>
              <span>Oxygen condition</span>
              <span>Tables</span>
              <span />
            </div>
            <div>
              {filtered.map((record) => {
                const color = record.phases[0] ? PHASE_COLOR[record.phases[0]] : PHASE_COLOR.aerosol;
                return (
                  <Link
                    key={record.id}
                    href={`/investigations/${record.id}`}
                    className="group grid grid-cols-[minmax(0,2.1fr)_minmax(0,0.9fr)_minmax(0,1.2fr)_minmax(0,1.45fr)_minmax(0,0.65fr)_24px] items-center gap-4 border-b border-line px-4 py-4 transition-colors hover:bg-panel-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] text-faint">
                          {record.id}
                        </span>
                        {record.analog ? <span className="text-[15px] tracking-wider text-violet">analog</span> : null}
                      </div>
                      <div className="mt-1 truncate text-[14px] text-ink">
                        {record.acronym ?? record.title}
                      </div>
                      <div className="mt-0.5 truncate text-[14px] text-muted">{record.title}</div>
                    </div>

                    <div className="flex flex-col items-start gap-1">
                      <Badge tone={KIND_TONE[record.kind]}>{record.kindLabel}</Badge>
                      <span className="text-[15px] text-faint">
                        {record.subResearchArea ?? "Unclassified"}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[15px] text-muted">
                        {record.gravity === "microgravity" ? "Microgravity" : "Normal gravity"}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {record.phases.length ? (
                          record.phases.map((item) => (
                            <span
                              key={item}
                              className="text-[15px] text-faint"
                            >
                              {phaseLabel(item)}
                            </span>
                          ))
                        ) : (
                          <span className="text-[15px] text-faint">
                            not classified
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      {record.o2 ? (
                        <>
                          <div className="relative h-1.5 max-w-[170px] bg-panel-2">
                            <div
                              className="absolute inset-y-0"
                              style={{
                                left: `${record.o2.min}%`,
                                width: `${Math.max(record.o2.max - record.o2.min, 1)}%`,
                                backgroundColor: color,
                              }}
                            />
                            <div
                              className="absolute -top-0.5 h-2.5 border-l border-dashed border-lunar/70"
                              style={{ left: "30%" }}
                              title="Lunar habitat threshold: 30% O₂"
                            />
                          </div>
                          <div className="mt-1.5 flex items-baseline gap-2">
                            <span className="font-mono text-[14px] tabular text-ink">
                              {formatO2(record.o2)}
                            </span>
                            <span className="text-[15px] text-faint">
                              n={record.o2.n}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-[15px] text-faint">
                          Not reported
                        </div>
                      )}
                    </div>

                    <div className="font-mono text-[14px] tabular text-muted">
                      {record.tableCount}
                      <span className="ml-1 text-[15px] text-faint">
                        {record.tableCount === 1 ? "table" : "tables"}
                      </span>
                      <div className="mt-1 text-[15px] text-faint">
                        {formatNumber(record.publicationCount)} pubs
                      </div>
                    </div>

                    <ArrowUpRight
                      className="h-3.5 w-3.5 text-faint transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-flame"
                      strokeWidth={1.5}
                    />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mobile cards */}
          <div className="grid gap-3 pt-4 md:hidden">
            {filtered.map((record) => {
              const color = record.phases[0] ? PHASE_COLOR[record.phases[0]] : PHASE_COLOR.aerosol;
              return (
                <Link
                  key={record.id}
                  href={`/investigations/${record.id}`}
                  className="panel panel-hover p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[15px] text-faint">
                        {record.id}
                      </span>
                      <h3 className="mt-1 text-[15px] leading-5 text-ink">
                        {record.acronym ?? record.title}
                      </h3>
                    </div>
                    <Badge tone={KIND_TONE[record.kind]}>{record.kindLabel}</Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[14px] leading-5 text-muted">
                    {record.summary ?? record.title}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                    <span className="text-[15px] text-faint">
                      {record.gravity === "microgravity" ? "µg" : "1 g"} · {record.tableCount}{" "}
                      {record.tableCount === 1 ? "table" : "tables"}
                    </span>
                    <span className="font-mono text-[14px] tabular text-ink">
                      {record.o2 ? formatO2(record.o2) : "O₂ n/r"}
                    </span>
                  </div>
                  {record.o2 ? (
                    <div className="relative mt-2 h-1 bg-panel-2">
                      <div
                        className="absolute inset-y-0"
                        style={{
                          left: `${record.o2.min}%`,
                          width: `${Math.max(record.o2.max - record.o2.min, 1)}%`,
                          backgroundColor: color,
                        }}
                      />
                      <div
                        className="absolute -top-0.5 h-2 border-l border-dashed border-lunar/70"
                        style={{ left: "30%" }}
                      />
                    </div>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </>
      )}

      <div className="mt-6 max-w-2xl">
        <DataNote>
          “Not reported” means the PSI summary table does not contain the value. It does not
          mean zero, safe, or untested in every configuration. Final-oxygen readings are
          excluded from test conditions.
        </DataNote>
      </div>
    </div>
  );
}
