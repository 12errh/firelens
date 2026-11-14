"use client";

import { useState } from "react";
import { ArrowUpRight, AlertTriangle, Table2 } from "lucide-react";
import type { ExperimentalTable } from "@/lib/types";
import { formatO2, phaseLabel } from "@/lib/data";
import { cn } from "@/lib/cn";
import { Badge, ScrollHint } from "@/components/ui";
import { PHASE_COLOR } from "@/lib/tokens";


export function TablePreview({ tables }: { tables: ExperimentalTable[] }) {
  const [active, setActive] = useState(0);

  if (!tables.length) {
    return (
      <div className="panel flex flex-col items-center justify-center px-6 py-12 text-center">
        <Table2 className="h-5 w-5 text-faint" strokeWidth={1.25} />
        <p className="mt-3 text-[14px] text-ink">No experimental summary table in this snapshot.</p>
        <p className="mt-1 max-w-sm text-[14px] leading-5 text-muted">
          The investigation may be a modeling/analysis record, or its table was not published
          with this release. Raw data may still be available in PSI.
        </p>
      </div>
    );
  }

  const table = tables[active];

  return (
    <div className="panel overflow-hidden">
      {tables.length > 1 ? (
        <div className="flex overflow-x-auto border-b border-line scroll-thin">
          {tables.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                "relative shrink-0 border-r border-line px-4 py-3 text-left transition-colors",
                index === active ? "bg-panel-2 text-ink" : "text-muted hover:text-ink",
              )}
            >
              <span className="block text-[12.5px] text-faint">
                Table {String(index + 1).padStart(2, "0")}
              </span>
              <span className="mt-0.5 block text-[14px]">{item.name}</span>
              {index === active ? (
                <span className="absolute inset-x-0 bottom-0 h-px bg-flame" />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      <div className="border-b border-line p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="neutral">{phaseLabel(table.phase)}</Badge>
              <Badge tone="neutral">{table.rowCount} rows</Badge>
              {table.version ? <Badge tone="neutral">v{table.version}</Badge> : null}
            </div>
            <h3 className="mt-3 text-[16px] font-medium text-ink">{table.name}</h3>
            <p className="mt-1 text-[12.5px] text-faint">
              {table.fileName}
            </p>
          </div>
          <a
            href={table.downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded border border-line px-3 py-2 text-[14px] text-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            Source CSV
            <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
          </a>
        </div>

        <div className="mt-4 grid gap-px border border-line bg-line sm:grid-cols-3">
          <div className="bg-panel px-3 py-2.5">
            <div className="label text-[12.5px]">Oxygen</div>
            <div className="mt-1 font-mono text-[14px] tabular text-ink">
              {formatO2(table.o2)}
            </div>
            {table.o2 ? (
              <div className="mt-1 text-[12.5px] text-faint">
                {table.o2.basis ?? "reported"} · n={table.o2.n}
              </div>
            ) : null}
          </div>
          <div className="bg-panel px-3 py-2.5">
            <div className="label text-[12.5px]">Pressure</div>
            <div className="mt-1 font-mono text-[14px] tabular text-ink">
              {table.pressure
                ? `${table.pressure.min}–${table.pressure.max} atm`
                : "Not reported"}
            </div>
            {table.pressure ? (
              <div className="mt-1 text-[12.5px] text-faint">
                n={table.pressure.n}
              </div>
            ) : null}
          </div>
          <div className="bg-panel px-3 py-2.5">
            <div className="label text-[12.5px]">Fuels / materials</div>
            <div className="mt-1 truncate text-[14px] text-ink" title={table.fuelValues.join(", ")}>
              {table.fuelValues.length ? table.fuelValues.slice(0, 3).join(", ") : "Not reported"}
            </div>
            {table.fuelValues.length > 3 ? (
              <div className="mt-1 text-[12.5px] text-faint">
                +{table.fuelValues.length - 3} more
              </div>
            ) : null}
          </div>
        </div>

        {table.o2 ? (
          <div className="mt-4">
            <div className="relative h-1.5 bg-panel-2">
              <div
                className="absolute inset-y-0"
                style={{
                  left: `${table.o2.min}%`,
                  width: `${Math.max(table.o2.max - table.o2.min, 1)}%`,
                  backgroundColor: PHASE_COLOR[table.phase ?? "gas"] ?? PHASE_COLOR.aerosol,
                }}
              />
              <div
                className="absolute -top-0.5 z-10 h-2.5 border-l border-dashed border-flame/80"
                style={{ left: "30%" }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[12.5px] text-faint">
              <span>0% O₂</span>
              <span className="text-flame/80">30% lunar target</span>
              <span>100%</span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-2.5">
        <span className="text-[12.5px] text-faint">
          Source preview · first {Math.min(table.preview.length, table.rowCount)} rows
        </span>
        <span className="text-[12.5px] text-faint">
          {table.columns.length > 12
            ? `${table.columns.length} columns · showing first 12`
            : `${table.columns.length} columns`}
        </span>
      </div>

      <ScrollHint className="border-b border-line px-4 py-2">
        Scroll sideways for every column
      </ScrollHint>

      <div className="max-h-[420px] overflow-auto scroll-thin">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-panel-2">
            <tr>
              {table.columns.slice(0, 12).map((column) => (
                <th
                  key={column}
                  className="whitespace-nowrap border-b border-line px-3 py-2.5 text-[15px] font-normal text-faint"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.preview.map((row, index) => (
              <tr key={index} className="border-b border-line/70 last:border-b-0">
                {table.columns.slice(0, 12).map((column) => {
                  const value = row[column];
                  return (
                    <td
                      key={column}
                      className="max-w-[220px] truncate whitespace-nowrap px-3 py-2 font-mono text-[14px] text-muted"
                      title={value ?? ""}
                    >
                      {value && value.length ? value : <span className="text-faint/60">—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {table.rowsTruncated ? (
        <div className="border-t border-line px-4 py-3 text-[14px] leading-5 text-faint">
          Only the first 1,100 normalized rows are stored in this browser payload. The full
          table is available from the source CSV.
        </div>
      ) : null}

      {table.malformedO2.length ? (
        <div className="flex gap-2.5 border-t border-amber-400/20 bg-amber-400/[0.04] px-4 py-3">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" strokeWidth={1.5} />
          <p className="text-[14px] leading-5 text-amber-100/70">
            Excluded malformed O₂ values:{" "}
            <span className="font-mono text-amber-200">{table.malformedO2.join(", ")}</span>. They
            were not silently corrected.
          </p>
        </div>
      ) : null}

      <div className="border-t border-line px-4 py-3 text-[14px] leading-5 text-faint">
        Blank cells are reproduced as blank — not zero. Ranges and approximations are preserved
        from the source. This is a preview, not a cleaned replacement for the published table.
      </div>
    </div>
  );
}
