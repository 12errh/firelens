"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Info } from "lucide-react";
import type { EvidencePoint } from "@/lib/types";
import { formatO2, phaseLabel } from "@/lib/data";
import { cn } from "@/lib/cn";
import { Badge, ScrollHint } from "@/components/ui";
import { CANVAS, FAINT, FLAME, INK, MUTED, PHASE_COLOR } from "@/lib/tokens";


const LANES = [
  {
    id: "partial",
    label: "Partial gravity",
    sub: "Moon 1/6 g · Mars 0.38 g",
    y: 104,
    phase: null,
    empty: true,
  },
  {
    id: "micro-solid",
    label: "Microgravity",
    sub: "Solid materials",
    y: 202,
    phase: "solid",
    empty: false,
  },
  {
    id: "micro-liquid",
    label: "Microgravity",
    sub: "Liquid fuels",
    y: 272,
    phase: "liquid",
    empty: false,
  },
  {
    id: "micro-gas",
    label: "Microgravity",
    sub: "Gaseous fuels",
    y: 342,
    phase: "gas",
    empty: false,
  },
  {
    id: "normal-solid",
    label: "Normal gravity",
    sub: "Solid materials · 1 g",
    y: 412,
    phase: "solid",
    empty: false,
  },
] as const;

const WIDTH = 1080;
const HEIGHT = 476;
const PLOT_LEFT = 214;
const PLOT_RIGHT = 1004;
const PLOT_TOP = 55;
const PLOT_BOTTOM = 426;

const x = (value: number) => PLOT_LEFT + (value / 100) * (PLOT_RIGHT - PLOT_LEFT);

function lanePoints(points: EvidencePoint[], lane: (typeof LANES)[number]) {
  if (!lane.phase) return [];
  if (lane.id === "normal-solid") {
    return points.filter((p) => p.gravity === "normal_gravity" && p.phase === "solid");
  }
  return points.filter((p) => p.gravity === "microgravity" && p.phase === lane.phase);
}

export function EvidenceMap({
  points,
  className,
  showLegend = true,
}: {
  points: EvidencePoint[];
  className?: string;
  showLegend?: boolean;
}) {
  const plotted = useMemo(
    () => points.filter((p) => p.o2 && p.gravity !== "partial_gravity_analog"),
    [points],
  );
  const analog = points.filter((p) => p.gravity === "partial_gravity_analog");
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = points.find((p) => p.id === activeId) ?? null;

  return (
    <div className={cn("relative", className)}>
      {showLegend ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
          <div className="flex flex-wrap items-center gap-4">
            {(["solid", "liquid", "gas"] as const).map((phase) => (
              <span key={phase} className="flex items-center gap-2">
                <span
                  className="h-1.5 w-5 rounded-full"
                  style={{ backgroundColor: PHASE_COLOR[phase] }}
                />
                <span className="text-[15px] text-muted">
                  {phaseLabel(phase)}
                </span>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[15px] text-faint">
            <Info className="h-3 w-3" strokeWidth={1.5} />
            Hover or tap a range for provenance
          </div>
        </div>
      ) : null}

      <ScrollHint className="mb-2">Scroll sideways for the full oxygen range</ScrollHint>

      <div className="overflow-x-auto scroll-thin">
        <div className="min-w-[820px]">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full"
            role="img"
            aria-label="Oxygen concentration versus gravity environment for NASA PSI combustion experiments. Solid materials are only tested below 23 percent oxygen; partial gravity has no datasets."
          >
            <defs>
              <pattern
                id="lunar-hatch"
                width="7"
                height="7"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="7"
                  stroke={FLAME}
                  strokeWidth="1"
                  opacity="0.14"
                />
              </pattern>
            </defs>

            <rect
              x={x(30)}
              y={PLOT_TOP}
              width={x(100) - x(30)}
              height={PLOT_BOTTOM - PLOT_TOP}
              fill="url(#lunar-hatch)"
            />
            <rect
              x={x(30)}
              y={PLOT_TOP}
              width={x(100) - x(30)}
              height={PLOT_BOTTOM - PLOT_TOP}
              fill={FLAME}
              opacity="0.035"
            />
            <line
              x1={x(30)}
              y1={PLOT_TOP - 6}
              x2={x(30)}
              y2={PLOT_BOTTOM}
              stroke={FLAME}
              strokeWidth="1"
              strokeDasharray="3 4"
              opacity="0.7"
            />
            <text
              x={x(30) + 8}
              y={PLOT_TOP - 12}
              fill={FLAME}
              fontFamily="var(--font-plex-mono)"
              fontSize="11"
            >
              Lunar habitat target ≥30% O₂
            </text>
            <text
              x={PLOT_RIGHT}
              y={PLOT_TOP - 12}
              textAnchor="end"
              fill={FAINT}
              fontFamily="var(--font-plex-mono)"
              fontSize="8"
            >
              Spacesuit 100% O₂
            </text>

            {[0, 10, 20, 30, 40, 60, 80, 100].map((tick) => (
              <g key={tick}>
                <line
                  x1={x(tick)}
                  y1={PLOT_TOP}
                  x2={x(tick)}
                  y2={PLOT_BOTTOM}
                  stroke={tick === 30 ? FLAME : INK}
                  strokeWidth="1"
                  opacity={tick === 30 ? 0.35 : 0.08}
                  strokeDasharray={tick === 30 ? "3 4" : undefined}
                />
                <text
                  x={x(tick)}
                  y={PLOT_BOTTOM + 22}
                  textAnchor="middle"
                  fill={tick === 30 ? FLAME : FAINT}
                  fontFamily="var(--font-plex-mono)"
                  fontSize="11"
                >
                  {tick}
                </text>
              </g>
            ))}

            {LANES.map((lane) => {
              const laneData = lanePoints(plotted, lane);
              const offsets = laneData.length
                ? laneData.map(
                    (_, index) =>
                      (index - (laneData.length - 1) / 2) * Math.min(10, 30 / laneData.length),
                  )
                : [];
              return (
                <g key={lane.id}>
                  <text
                    x={0}
                    y={lane.y - 3}
                    fill={INK}
                    fontFamily="var(--font-plex-sans)"
                    fontSize="12.5"
                    fontWeight="500"
                  >
                    {lane.label}
                  </text>
                  <text
                    x={0}
                    y={lane.y + 12}
                    fill={FAINT}
                    fontFamily="var(--font-plex-sans)"
                    fontSize="11.5"
                  >
                    {lane.sub}
                  </text>

                  {lane.empty ? (
                    <>
                      <rect
                        x={PLOT_LEFT}
                        y={lane.y - 22}
                        width={PLOT_RIGHT - PLOT_LEFT}
                        height={44}
                        fill={FLAME}
                        fillOpacity="0.035"
                        stroke={FLAME}
                        strokeOpacity="0.3"
                        strokeDasharray="4 5"
                      />
                      <text
                        x={(PLOT_LEFT + PLOT_RIGHT) / 2}
                        y={lane.y - 2}
                        textAnchor="middle"
                        fill={FLAME}
                        fontFamily="var(--font-plex-sans)"
                        fontSize="12"
                        fontWeight="500"
                      >
                        No direct partial-gravity dataset
                      </text>
                      <text
                        x={(PLOT_LEFT + PLOT_RIGHT) / 2}
                        y={lane.y + 13}
                        textAnchor="middle"
                        fill={FAINT}
                        fontFamily="var(--font-plex-sans)"
                        fontSize="11.5"
                      >
                        0 direct datasets · E-FIELD is an analog
                      </text>
                    </>
                  ) : (
                    <>
                      <line
                        x1={PLOT_LEFT}
                        y1={lane.y}
                        x2={PLOT_RIGHT}
                        y2={lane.y}
                        stroke={INK}
                        strokeOpacity="0.12"
                        strokeDasharray="2 5"
                      />
                      {laneData.map((point, index) => {
                        const y = lane.y + offsets[index];
                        const color = PHASE_COLOR[point.phase ?? "gas"] ?? MUTED;
                        const isActive = activeId === point.id;
                        return (
                          <g
                            key={point.id}
                            role="button"
                            tabIndex={0}
                            aria-label={`${point.label}: ${formatO2(point.o2)} oxygen, ${point.rows} table rows`}
                            onMouseEnter={() => setActiveId(point.id)}
                            onFocus={() => setActiveId(point.id)}
                            onClick={() => setActiveId(point.id)}
                            className="cursor-pointer outline-none"
                          >
                            <rect
                              x={x(point.o2!.min) - 6}
                              y={y - 10}
                              width={Math.max(x(point.o2!.max) - x(point.o2!.min) + 12, 16)}
                              height={20}
                              fill="transparent"
                            />
                            <rect
                              x={x(point.o2!.min)}
                              y={y - 4}
                              width={Math.max(x(point.o2!.max) - x(point.o2!.min), 2.5)}
                              height={8}
                              rx={3}
                              style={{ fill: color }}
                              opacity={isActive ? 1 : 0.82}
                              stroke={isActive ? INK : "transparent"}
                              strokeWidth="0.8"
                            />
                            <circle
                              cx={x(point.o2!.min)}
                              cy={y}
                              r={isActive ? 4 : 2.8}
                              style={{ fill: color }}
                            />
                            <circle
                              cx={x(point.o2!.max)}
                              cy={y}
                              r={isActive ? 4 : 2.8}
                              style={{ fill: color }}
                              stroke={CANVAS}
                              strokeWidth="1"
                            />
                          </g>
                        );
                      })}
                      <text
                        x={PLOT_RIGHT + 12}
                        y={lane.y - 2}
                        fill={MUTED}
                        fontFamily="var(--font-plex-mono)"
                        fontSize="10.5"
                      >
                        {laneData.length} {laneData.length === 1 ? "dataset" : "datasets"}
                      </text>
                      <text
                        x={PLOT_RIGHT + 12}
                        y={lane.y + 11}
                        fill={FAINT}
                        fontFamily="var(--font-plex-mono)"
                        fontSize="10.5"
                      >
                        max {Math.max(...laneData.map((p) => p.o2!.max)).toFixed(1)}%
                      </text>
                    </>
                  )}
                </g>
              );
            })}

            <text
              x={(PLOT_LEFT + PLOT_RIGHT) / 2}
              y={HEIGHT - 10}
              textAnchor="middle"
              fill={FAINT}
              fontFamily="var(--font-plex-mono)"
              fontSize="10.5"
            >
              Oxygen concentration, % by volume (reported test condition)
            </text>
          </svg>
        </div>
      </div>

      <div className="mt-2 min-h-[52px] border-t border-line pt-3">
        {active ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5">
              <span
                className="mt-1 h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: PHASE_COLOR[active.phase ?? "gas"] }}
              />
              <div>
                <div className="text-[14px] text-ink">{active.label}</div>
                <div className="mt-0.5 text-[15px] text-muted">
                  {formatO2(active.o2)} O₂ · {active.rows} table rows ·{" "}
                  {active.o2?.basis ?? "reported"} · {phaseLabel(active.phase)} ·{" "}
                  {active.gravityLabel}
                </div>
              </div>
            </div>
            <Link
              href={`/investigations/${active.investigationId}`}
              className="group inline-flex shrink-0 items-center gap-1 text-[15px] text-flame"
            >
              Open {active.investigationId}
              <ArrowUpRight
                className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                strokeWidth={1.5}
              />
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[14px] leading-5 text-faint">
              Ranges are reported test conditions, not model predictions. Final-oxygen
              readings are excluded from test conditions.
            </p>
            <span className="text-[15px] text-faint">
              {plotted.length} plotted datasets
            </span>
          </div>
        )}
      </div>

      {analog.length ? (
        <div className="mt-3 flex flex-col gap-2 border border-violet/20 bg-violet/[0.04] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[14px] leading-5 text-muted">
            <span className="text-[15px] text-violet">
              Analog only ·
            </span>{" "}
            E-FIELD used electric fields to mimic some partial-gravity effects. It is not
            a gravity measurement, and its summary table does not report O₂.
          </p>
          <Link
            href="/investigations/PSI-22"
            className="shrink-0 text-[15px] text-violet hover:text-ink"
          >
            Inspect analog →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
