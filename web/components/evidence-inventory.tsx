"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpRight, RotateCcw } from "lucide-react";
import type { EvidencePoint } from "@/lib/types";
import { formatNumber, formatO2, phaseLabel } from "@/lib/data";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui";

const PHASE_COLOR: Record<string, string> = {
  solid: "#ff8a4c",
  liquid: "#6fd6e8",
  gas: "#b7a6ff",
  aerosol: "#9aa6b7",
};

type PhaseFilter = "all" | "solid" | "liquid" | "gas";
type GravityFilter = "all" | "microgravity" | "normal_gravity" | "partial_gravity_analog";
type SortKey = "o2" | "rows" | "id";

const PHASE_FILTERS: { value: PhaseFilter; label: string }[] = [
  { value: "all", label: "All phases" },
  { value: "solid", label: "Solid" },
  { value: "liquid", label: "Liquid" },
  { value: "gas", label: "Gas" },
];

const GRAVITY_FILTERS: { value: GravityFilter; label: string }[] = [
  { value: "all", label: "All gravity" },
  { value: "microgravity", label: "Microgravity" },
  { value: "normal_gravity", label: "1 g" },
  { value: "partial_gravity_analog", label: "Analog" },
];

function gravityLabel(point: EvidencePoint) {
  if (point.gravity === "partial_gravity_analog") return "Analog";
  if (point.gravity === "normal_gravity") return "1 g";
  return "µg";
}

function gravityTone(point: EvidencePoint): "violet" | "neutral" | "ice" {
  if (point.gravity === "partial_gravity_analog") return "violet";
  if (point.gravity === "normal_gravity") return "neutral";
  return "ice";
}

export function EvidenceInventory({ points }: { points: EvidencePoint[] }) {
  const [phase, setPhase] = useState<PhaseFilter>("all");
  const [gravity, setGravity] = useState<GravityFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("o2");
  const [ascending, setAscending] = useState(false);

  const rows = useMemo(() => {
    const filtered = points.filter((point) => {
      if (phase !== "all" && point.phase !== phase) return false;
      if (gravity !== "all" && point.gravity !== gravity) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortKey === "id") {
        return ascending
          ? a.investigationId.localeCompare(b.investigationId)
          : b.investigationId.localeCompare(a.investigationId);
      }
      if (sortKey === "rows") {
        return ascending ? a.rows - b.rows : b.rows - a.rows;
      }
      const aMax = a.o2?.max ?? -1;
      const bMax = b.o2?.max ?? -1;
      return ascending ? aMax - bMax : bMax - aMax;
    });
  }, [points, phase, gravity, sortKey, ascending]);

  const activeFilters = phase !== "all" || gravity !== "all";

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setAscending((value) => !value);
    } else {
      setSortKey(key);
      setAscending(false);
    }
  }

  function SortIndicator({ column }: { column: SortKey }) {
    if (sortKey !== column) return null;
    return ascending ? (
      <ArrowUp className="h-3 w-3" strokeWidth={1.5} />
    ) : (
      <ArrowDown className="h-3 w-3" strokeWidth={1.5} />
    );
  }

  return (
    <div className="panel overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-line p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {PHASE_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              aria-pressed={phase === filter.value}
              onClick={() => setPhase(filter.value)}
              className={cn(
                "border px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.08em] transition-colors",
                phase === filter.value
                  ? "border-flame/40 bg-flame/[0.08] text-flame"
                  : "border-line text-faint hover:border-line-strong hover:text-ink",
              )}
            >
              {filter.label}
            </button>
          ))}
          <span className="mx-1 hidden h-4 w-px bg-line sm:block" />
          {GRAVITY_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              aria-pressed={gravity === filter.value}
              onClick={() => setGravity(filter.value)}
              className={cn(
                "border px-2.5 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.08em] transition-colors",
                gravity === filter.value
                  ? "border-ice/40 bg-ice/[0.07] text-ice"
                  : "border-line text-faint hover:border-line-strong hover:text-ink",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="font-mono text-[8.5px] uppercase tracking-[0.08em] text-faint">
            {rows.length} of {points.length} points
          </span>
          {activeFilters ? (
            <button
              type="button"
              onClick={() => {
                setPhase("all");
                setGravity("all");
              }}
              className="inline-flex items-center gap-1 font-mono text-[8.5px] uppercase tracking-[0.08em] text-muted transition-colors hover:text-ink"
            >
              <RotateCcw className="h-2.5 w-2.5" strokeWidth={1.5} />
              Reset
            </button>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto scroll-thin">
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line bg-white/[0.015]">
              <th className="px-3 py-2.5 font-mono text-[8px] font-normal uppercase tracking-[0.08em] text-faint">
                <button
                  type="button"
                  onClick={() => toggleSort("id")}
                  className="inline-flex items-center gap-1 uppercase transition-colors hover:text-ink"
                >
                  Investigation <SortIndicator column="id" />
                </button>
              </th>
              <th className="px-3 py-2.5 font-mono text-[8px] font-normal uppercase tracking-[0.08em] text-faint">
                Gravity
              </th>
              <th className="px-3 py-2.5 font-mono text-[8px] font-normal uppercase tracking-[0.08em] text-faint">
                Phase
              </th>
              <th className="px-3 py-2.5 text-right font-mono text-[8px] font-normal uppercase tracking-[0.08em] text-faint">
                <button
                  type="button"
                  onClick={() => toggleSort("o2")}
                  className="inline-flex items-center gap-1 uppercase transition-colors hover:text-ink"
                >
                  O₂ range <SortIndicator column="o2" />
                </button>
              </th>
              <th className="px-3 py-2.5 font-mono text-[8px] font-normal uppercase tracking-[0.08em] text-faint">
                O₂ envelope
              </th>
              <th className="px-3 py-2.5 text-right font-mono text-[8px] font-normal uppercase tracking-[0.08em] text-faint">
                Pressure
              </th>
              <th className="px-3 py-2.5 text-right font-mono text-[8px] font-normal uppercase tracking-[0.08em] text-faint">
                <button
                  type="button"
                  onClick={() => toggleSort("rows")}
                  className="inline-flex items-center gap-1 uppercase transition-colors hover:text-ink"
                >
                  Rows <SortIndicator column="rows" />
                </button>
              </th>
              <th className="px-3 py-2.5 font-mono text-[8px] font-normal uppercase tracking-[0.08em] text-faint">
                Flags
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((point) => {
              const color = PHASE_COLOR[point.phase ?? "aerosol"] ?? "#9aa6b7";
              return (
                <tr
                  key={point.id}
                  className="border-b border-line/70 transition-colors last:border-b-0 hover:bg-white/[0.02]"
                >
                  <td className="px-3 py-3">
                    <Link
                      href={`/investigations/${point.investigationId}`}
                      className="group inline-flex items-start gap-2"
                    >
                      <span className="font-mono text-[9px] uppercase tracking-[0.06em] text-faint transition-colors group-hover:text-flame">
                        {point.investigationId}
                      </span>
                      <span className="max-w-[210px] text-[11px] leading-4 text-ink group-hover:text-flame">
                        {point.label}
                      </span>
                      <ArrowUpRight
                        className="mt-0.5 h-2.5 w-2.5 shrink-0 text-faint transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-flame"
                        strokeWidth={1.5}
                      />
                    </Link>
                    <div className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.06em] text-faint">
                      {point.shortLabel}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone={gravityTone(point)}>{gravityLabel(point)}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1.5 text-[10.5px] text-muted">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      {phaseLabel(point.phase)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right font-mono text-[10.5px] tabular text-ink">
                    {formatO2(point.o2)}
                  </td>
                  <td className="px-3 py-3">
                    {point.o2 ? (
                      <div className="relative h-2.5 w-[120px] bg-white/[0.05]">
                        <div
                          className="absolute inset-y-0 z-0"
                          style={{
                            left: `${point.o2.min}%`,
                            width: `${Math.max(point.o2.max - point.o2.min, 1)}%`,
                            backgroundColor: color,
                          }}
                        />
                        <div
                          className="absolute -top-1 z-10 h-[18px] border-l border-dashed border-flame/80"
                          style={{ left: "30%" }}
                          title="Lunar habitat threshold: 30% O₂"
                        />
                      </div>
                    ) : (
                      <span className="font-mono text-[8.5px] uppercase tracking-[0.06em] text-faint">
                        Not reported
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right font-mono text-[10px] tabular text-muted">
                    {point.pressure
                      ? `${point.pressure.min}–${point.pressure.max} atm`
                      : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right font-mono text-[10px] tabular text-muted">
                    {formatNumber(point.rows)}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {point.analog ? <Badge tone="violet">Analog</Badge> : null}
                      {point.gravity === "normal_gravity" ? (
                        <Badge tone="neutral">1 g comp.</Badge>
                      ) : null}
                      {point.o2 && point.o2.max >= 30 ? (
                        <Badge tone="flame">≥30%</Badge>
                      ) : null}
                      {!point.o2 && !point.analog ? (
                        <Badge tone="neutral">No O₂</Badge>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!rows.length ? (
          <div className="px-5 py-10 text-center">
            <p className="text-[12px] text-ink">No evidence points match those filters.</p>
            <button
              type="button"
              onClick={() => {
                setPhase("all");
                setGravity("all");
              }}
              className="mt-2 font-mono text-[9px] uppercase tracking-[0.08em] text-flame hover:text-ink"
            >
              Clear filters
            </button>
          </div>
        ) : null}
      </div>

      <div className="border-t border-line px-4 py-3 text-[10.5px] leading-5 text-faint">
        Ranges are reported initial/ambient test conditions. The dashed line marks the 30%
        O₂ lunar habitat target. Analog entries are not gravity measurements.
      </div>
    </div>
  );
}
