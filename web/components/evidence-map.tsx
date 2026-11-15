"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Info } from "lucide-react";
import type { EvidencePoint } from "@/lib/types";
import { formatO2, phaseLabel } from "@/lib/data";
import { cn } from "@/lib/cn";
import "@/components/evidence-map.css";

const WIDTH = 1080;
const PLOT_LEFT = 268;
const PLOT_RIGHT = 936;
const VALUE_RIGHT = 1076;
const PLOT_TOP = 30;
const ROW_HEIGHT = 22;

const GROUP_HEIGHT = 34;
const SUBHEAD_HEIGHT = 18;
const EMPTY_HEIGHT = 46;
const TICKS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

const x = (value: number) =>
  PLOT_LEFT +
  (Math.min(100, Math.max(0, value)) / 100) * (PLOT_RIGHT - PLOT_LEFT);

type Phase = "solid" | "liquid" | "gas";

const PHASES: Phase[] = ["solid", "liquid", "gas"];

const SUBHEAD: Record<Phase, string> = {
  solid: "SOLID MATERIALS",
  liquid: "LIQUID FUELS",
  gas: "GASEOUS FUELS",
};

const phaseOf = (point: EvidencePoint): Phase =>
  point.phase === "solid" || point.phase === "liquid" || point.phase === "gas"
    ? point.phase
    : "gas";

const datasetCount = (count: number) =>
  `${count} dataset${count === 1 ? "" : "s"}`;

type Node =
  | {
      kind: "group";
      y: number;
      label: string;
      sub: string;
      count: string;
    }
  | { kind: "subhead"; y: number; label: string; count: number }
  | { kind: "empty"; y: number }
  | { kind: "row"; y: number; point: EvidencePoint };

function sortRows(rows: EvidencePoint[]) {
  return [...rows].sort((a, b) => {
    const aMin = a.o2?.min ?? 0;
    const bMin = b.o2?.min ?? 0;
    if (aMin !== bMin) return aMin - bMin;
    return (a.o2?.max ?? 0) - (b.o2?.max ?? 0);
  });
}

function buildLayout(points: EvidencePoint[]) {
  const plotted = points.filter(
    (point) => point.o2 && point.gravity !== "partial_gravity_analog",
  );
  const micro = sortRows(
    plotted.filter((point) => point.gravity === "microgravity"),
  );
  const normal = sortRows(
    plotted.filter((point) => point.gravity === "normal_gravity"),
  );
  const analog = points.filter(
    (point) => point.gravity === "partial_gravity_analog",
  );

  const nodes: Node[] = [];
  let cursor = 42;

  nodes.push({
    kind: "group",
    y: cursor,
    label: "Partial gravity",
    sub: "MOON 1/6 g · MARS 0.38 g",
    count: datasetCount(0),
  });
  cursor += GROUP_HEIGHT;

  nodes.push({ kind: "empty", y: cursor });
  cursor += EMPTY_HEIGHT;

  nodes.push({
    kind: "group",
    y: cursor,
    label: "Microgravity",
    sub: "STATION EXPERIMENTS · 3 PHASES",
    count: datasetCount(micro.length),
  });
  cursor += GROUP_HEIGHT;

  for (const phase of PHASES) {
    const rows = micro.filter((point) => phaseOf(point) === phase);
    if (!rows.length) continue;
    nodes.push({
      kind: "subhead",
      y: cursor,
      label: SUBHEAD[phase],
      count: rows.length,
    });
    cursor += SUBHEAD_HEIGHT;
    for (const point of rows) {
      nodes.push({ kind: "row", y: cursor, point });
      cursor += ROW_HEIGHT;
    }
  }

  nodes.push({
    kind: "group",
    y: cursor,
    label: "Normal gravity",
    sub: "EARTH 1 g · SOLID MATERIALS",
    count: datasetCount(normal.length),
  });
  cursor += GROUP_HEIGHT;

  for (const point of normal) {
    nodes.push({ kind: "row", y: cursor, point });
    cursor += ROW_HEIGHT;
  }

  const plotBottom = cursor + 10;

  return {
    nodes,
    plotted,
    analog,
    plotBottom,
    tickY: plotBottom + 18,
    axisTitleY: plotBottom + 38,
    height: plotBottom + 46,
  };
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
  const { nodes, plotted, analog, plotBottom, tickY, axisTitleY, height } =
    useMemo(() => buildLayout(points), [points]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = points.find((point) => point.id === activeId) ?? null;

  return (
    <div className={cn("ev-map relative", className)}>
      {showLegend ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-line pb-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {PHASES.map((phase) => (
              <span key={phase} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={cn("ev-swatch", `ev-swatch-${phase}`)}
                />
                <span className="text-[14px] text-muted">
                  {phaseLabel(phase)}
                </span>
              </span>
            ))}
            <span
              className="h-3 w-px bg-line"
              aria-hidden="true"
            />
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="ev-median-key" />
              <span className="text-[14px] text-muted">median</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[13.5px] text-faint">
            <Info className="h-3.5 w-3.5" strokeWidth={1.5} />
            Hover or tap a row for provenance
          </div>
        </div>
      ) : null}

      <div className="xl:hidden">
        <div className="flex items-baseline justify-between border-b border-line pb-1">
          <span className="font-mono text-[9px] uppercase tracking-[0.09em] text-faint">
            Dataset
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.09em] text-faint">
            O₂ % by volume
          </span>
        </div>

        <div className="relative mt-1 h-5 border-b border-line">
          {TICKS.map((tick) => (
            <span
              key={`compact-tick-${tick}`}
              className={cn(
                "ev-m-tick absolute bottom-0.5",
                tick === 30 && "ev-m-tick-hot",
              )}
              style={{
                left: `${tick}%`,
                transform:
                  tick === 0
                    ? "none"
                    : tick === 100
                      ? "translateX(-100%)"
                      : "translateX(-50%)",
              }}
            >
              {tick}
            </span>
          ))}
        </div>

        <p className="mt-1.5 text-[10px] leading-4 text-faint">
          Shaded band = lunar habitat target ≥30% O₂. Bar = reported min–max,
          dot = median.
        </p>

        <div>
          {nodes.map((node, index) => {
            if (node.kind === "group") {
              return (
                <div
                  key={`m-group-${node.label}`}
                  className={cn(
                    "flex items-baseline justify-between gap-3",
                    index === 0 ? "mt-2" : "mt-5",
                  )}
                >
                  <div>
                    <div className="text-[14px] font-medium text-ink">
                      {node.label}
                    </div>
                    <div className="mt-0.5 font-mono text-[9px] tracking-[0.06em] text-faint">
                      {node.sub}
                    </div>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] text-faint">
                    {node.count}
                  </span>
                </div>
              );
            }

            if (node.kind === "subhead") {
              return (
                <div
                  key={`m-subhead-${node.label}`}
                  className="mt-3 flex items-baseline justify-between gap-3"
                >
                  <span className="font-mono text-[8.5px] tracking-[0.09em] text-muted">
                    {node.label}
                  </span>
                  <span className="font-mono text-[8.5px] text-faint">
                    {node.count}
                  </span>
                </div>
              );
            }

            if (node.kind === "empty") {
              return (
                <div
                  key="m-partial-empty"
                  className="ev-m-empty my-2 rounded px-3 py-2.5"
                >
                  <p className="ev-m-empty-title">
                    No direct partial-gravity dataset
                  </p>
                  <p className="ev-m-empty-body mt-0.5">
                    E-FIELD is an electric-field analog and reports no O₂
                  </p>
                </div>
              );
            }

            const point = node.point;
            const phase = phaseOf(point);
            const o2 = point.o2!;
            const isActive = activeId === point.id;

            return (
              <button
                key={`m-row-${point.id}`}
                type="button"
                className="ev-m-row block w-full py-1.5 text-left"
                data-active={isActive ? "" : undefined}
                onMouseEnter={() => setActiveId(point.id)}
                onFocus={() => setActiveId(point.id)}
                onClick={() => setActiveId(point.id)}
                aria-label={`${point.label}: ${formatO2(o2)} oxygen, median ${o2.median}%, ${point.rows} table rows, ${point.gravityLabel}`}
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="text-[12.5px] leading-4 text-ink">
                    {point.label}
                  </span>
                  <span className="shrink-0 font-mono text-[10.5px] text-muted">
                    {formatO2(o2)}
                  </span>
                </span>
                <span className="ev-m-track" aria-hidden="true">
                  <span className="ev-m-band" />
                  <span className="ev-m-target" />
                  <span
                    className={cn("ev-m-bar", `ev-m-bar-${phase}`)}
                    style={{
                      left: `${o2.min}%`,
                      width: `${Math.max(o2.max - o2.min, 1.6)}%`,
                    }}
                  />
                  <span
                    className={cn("ev-m-median", `ev-m-median-${phase}`)}
                    style={{ left: `${o2.median}%` }}
                  />
                </span>
                {isActive ? (
                  <span className="mt-1 block text-[10.5px] leading-4 text-muted">
                    {formatO2(o2)} O₂ · median {o2.median}% · {point.rows} table
                    rows · {o2.basis ?? "reported"} basis
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="hidden xl:block">
        <svg
          viewBox={`0 0 ${WIDTH} ${height}`}
          className="w-full"
            role="group"
            aria-label="Per-dataset reported oxygen ranges for 13 NASA PSI combustion tables. Partial gravity has no direct datasets; the E-FIELD entry is an electric-field analog without reported oxygen. Use Tab to move between rows."
          >
            <rect
              className="ev-band"
              x={x(30)}
              y={PLOT_TOP}
              width={PLOT_RIGHT - x(30)}
              height={plotBottom - PLOT_TOP}
            />

            {TICKS.map((tick) =>
              tick === 30 ? null : (
                <line
                  key={`grid-${tick}`}
                  className="ev-grid-line"
                  x1={x(tick)}
                  y1={PLOT_TOP}
                  x2={x(tick)}
                  y2={plotBottom}
                />
              ),
            )}

            <line
              className="ev-target-line"
              x1={x(30)}
              y1={PLOT_TOP}
              x2={x(30)}
              y2={plotBottom}
            />

            <line
              className="ev-axis"
              x1={PLOT_LEFT}
              y1={plotBottom}
              x2={PLOT_RIGHT}
              y2={plotBottom}
            />

            <text className="ev-colhead" x={0} y={16}>
              DATASET
            </text>
            <text
              className="ev-colhead"
              x={VALUE_RIGHT}
              y={16}
              textAnchor="end"
            >
              REPORTED O₂ RANGE
            </text>

            <text
              className="ev-band-label"
              x={x(30) + 8}
              y={PLOT_TOP + 16}
            >
              LUNAR HABITAT ≥30% O₂
            </text>

            {nodes.map((node) => {
              if (node.kind === "group") {
                return (
                  <g key={`group-${node.label}`}>
                    <text
                      className="ev-group"
                      x={0}
                      y={node.y + 16}
                    >
                      {node.label}
                    </text>
                    <text
                      className="ev-group-sub"
                      x={0}
                      y={node.y + 29}
                    >
                      {node.sub}
                    </text>
                    <text
                      className="ev-group-count"
                      x={VALUE_RIGHT}
                      y={node.y + 16}
                      textAnchor="end"
                    >
                      {node.count}
                    </text>
                  </g>
                );
              }

              if (node.kind === "subhead") {
                return (
                  <g key={`subhead-${node.label}`}>
                    <text
                      className="ev-subhead"
                      x={0}
                      y={node.y + 12}
                    >
                      {node.label}
                    </text>
                    <text
                      className="ev-subcount"
                      x={VALUE_RIGHT}
                      y={node.y + 12}
                      textAnchor="end"
                    >
                      {node.count}
                    </text>
                  </g>
                );
              }

              if (node.kind === "empty") {
                return (
                  <g key="partial-empty">
                    <rect
                      className="ev-empty"
                      x={PLOT_LEFT}
                      y={node.y + 3}
                      width={PLOT_RIGHT - PLOT_LEFT}
                      height={40}
                    />
                    <text
                      className="ev-empty-title"
                      x={(PLOT_LEFT + PLOT_RIGHT) / 2}
                      y={node.y + 22}
                      textAnchor="middle"
                    >
                      No direct partial-gravity dataset
                    </text>
                    <text
                      className="ev-empty-body"
                      x={(PLOT_LEFT + PLOT_RIGHT) / 2}
                      y={node.y + 36}
                      textAnchor="middle"
                    >
                      E-FIELD is an electric-field analog and reports no O₂
                    </text>
                  </g>
                );
              }

              const point = node.point;
              const phase = phaseOf(point);
              const o2 = point.o2!;
              const cy = node.y + ROW_HEIGHT / 2;
              const isActive = activeId === point.id;

              return (
                <g
                  key={point.id}
                  className="ev-row"
                  data-active={isActive ? "" : undefined}
                  role="button"
                  tabIndex={0}
                  aria-label={`${point.label}: ${formatO2(o2)} oxygen, median ${o2.median}%, ${point.rows} table rows, ${point.gravityLabel}`}
                  onMouseEnter={() => setActiveId(point.id)}
                  onFocus={() => setActiveId(point.id)}
                  onClick={() => setActiveId(point.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setActiveId(point.id);
                    }
                    if (event.key === "Escape") setActiveId(null);
                  }}
                  style={{ color: `var(--ev-${phase})` }}
                >
                  <rect
                    className="ev-hit"
                    x={0}
                    y={node.y}
                    width={VALUE_RIGHT}
                    height={ROW_HEIGHT}
                  />
                  <text className="ev-label" x={0} y={cy + 4}>
                    {point.label}
                  </text>
                  <rect
                    className={cn("ev-bar", `ev-bar-${phase}`)}
                    x={x(o2.min)}
                    y={cy - 4}
                    width={Math.max(x(o2.max) - x(o2.min), 4)}
                    height={8}
                    rx={4}
                  />
                  <circle
                    className={cn("ev-median", `ev-median-${phase}`)}
                    cx={x(o2.median)}
                    cy={cy}
                    r={3.3}
                  />
                  <text
                    className="ev-value"
                    x={VALUE_RIGHT}
                    y={cy + 3.5}
                    textAnchor="end"
                  >
                    {formatO2(o2)}
                  </text>
                </g>
              );
            })}

            {TICKS.map((tick) => (
              <text
                key={`tick-${tick}`}
                className={cn(
                  "ev-axis-label",
                  tick === 30 && "ev-tick-hot",
                )}
                x={x(tick)}
                y={tickY}
                textAnchor="middle"
              >
                {tick}
              </text>
            ))}

            <text
              className="ev-axis-title"
              x={(PLOT_LEFT + PLOT_RIGHT) / 2}
              y={axisTitleY}
              textAnchor="middle"
            >
              Oxygen concentration, % by volume (reported test condition)
            </text>
        </svg>
      </div>

      <div
        className="mt-3 min-h-[54px] border-t border-line pt-3"
        aria-live="polite"
      >
        {active ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5">
              <span
                aria-hidden="true"
                className={cn("ev-dot mt-1.5", `ev-dot-${phaseOf(active)}`)}
              />
              <div>
                <div className="text-[14px] text-ink">{active.label}</div>
                <div className="mt-0.5 text-[13.5px] leading-5 text-muted">
                  {formatO2(active.o2)} O₂ · {active.rows} table rows ·{" "}
                  {active.o2?.basis ?? "reported"} basis · {phaseLabel(active.phase)} ·{" "}
                  {active.gravityLabel}
                </div>
              </div>
            </div>
            <Link
              href={`/investigations/${active.investigationId}`}
              className="group inline-flex shrink-0 items-center gap-1 text-[14px] text-flame"
            >
              Open {active.investigationId}
              <ArrowUpRight
                className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                strokeWidth={1.5}
              />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:justify-between">
            <p className="text-[13.5px] leading-5 text-faint">
              Bar = reported min–max O₂ · dot = median. Ranges are test
              conditions, not flammability limits.
            </p>
            <span className="shrink-0 text-[13.5px] text-faint">
              {plotted.length} plotted datasets · {analog.length} analog
            </span>
          </div>
        )}
      </div>

      {analog.length ? (
        <div className="mt-3 flex flex-col gap-2 border border-violet/20 bg-violet/[0.04] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13.5px] leading-5 text-muted">
            <span className="text-[13.5px] text-violet">Analog only ·</span>{" "}
            E-FIELD used electric fields to mimic some partial-gravity effects.
            It is not a gravity measurement, and its summary table does not
            report O₂.
          </p>
          <Link
            href="/investigations/PSI-22"
            className="shrink-0 text-[13.5px] text-violet hover:text-ink"
          >
            Inspect analog →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
