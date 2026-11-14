import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Database, ScanLine, ShieldCheck, Table2 } from "lucide-react";
import { formatNumber, stats } from "@/lib/data";
import { AssistantChat } from "@/components/assistant-chat";
import { Badge, Metric, PageIntro, StatusDot } from "@/components/ui";

export const metadata: Metadata = {
  title: "Evidence assistant",
  description:
    "Ask questions about the NASA PSI combustion snapshot. Structured evidence first, citations on every answer, and a deterministic fallback when the language model is offline.",
};

const STEPS = [
  {
    label: "Structured evidence first",
    body: "The question is matched against normalized tables, computed findings, and investigation metadata — not a generic web index.",
  },
  {
    label: "Document RAG if configured",
    body: "If the research team's RAG endpoint is available, its cited document answer is used before any language model.",
  },
  {
    label: "Groq with a numeric guard",
    body: "A Groq draft is accepted only if every percentage it mentions appears in the normalized tables. Otherwise it is rejected.",
  },
  {
    label: "Deterministic fallback",
    body: "With no RAG endpoint and no Groq key, the assistant still answers from structured evidence. It never needs an LLM to be useful.",
  },
];

export default function AssistantPage() {
  return (
    <>
      <PageIntro
        kicker="Evidence assistant · grounded mode"
        title={
          <>
            Ask the snapshot.
            <br />
            Get the source.
          </>
        }
        body="A research assistant for the 24 PSI combustion records behind this site. It answers from normalized tables and document metadata, cites the record behind each claim, and says “not reported” when the snapshot is silent."
        meta={
          <>
            <Metric value={stats.experimentalTables} label="Tables in scope" />
            <Metric value={stats.evidencePoints} label="Evidence points" />
            <Metric value={stats.partialGravityDatasets} label="Partial-gravity datasets" accent />
          </>
        }
      />

      <section className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8 sm:py-12">
        <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[9px] uppercase tracking-[0.1em] text-faint">
          <span className="flex items-center gap-2">
            <StatusDot tone="moss" />
            Structured fallback available
          </span>
          <span>Answers cite PSI records</span>
          <span>No web access</span>
          <span>No invented values</span>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
          <AssistantChat />

          <aside className="space-y-4">
            <div className="panel overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
                <span className="flex items-center gap-2 label text-[8.5px] text-ink">
                  <ShieldCheck className="h-3 w-3 text-flame" strokeWidth={1.5} />
                  How it answers
                </span>
                <Badge tone="moss">Grounded</Badge>
              </div>
              <ol className="divide-y divide-line">
                {STEPS.map((step, index) => (
                  <li key={step.label} className="px-4 py-3.5">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-[8.5px] text-flame">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[11.5px] text-ink">{step.label}</span>
                    </div>
                    <p className="mt-1 pl-5 text-[10.5px] leading-5 text-faint">{step.body}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="border border-ice/20 bg-ice/[0.035] p-4">
              <div className="flex items-center gap-2">
                <ScanLine className="h-3.5 w-3.5 text-ice" strokeWidth={1.5} />
                <span className="label text-[8.5px] text-ice">Numeric guard</span>
              </div>
              <p className="mt-2 text-[11px] leading-5 text-muted">
                A language-model draft containing a percentage that is not in the
                normalized tables is rejected before it reaches you. The structured answer
                is returned instead, with a note explaining why.
              </p>
            </div>

            <div className="panel overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
                <span className="flex items-center gap-2 label text-[8.5px] text-ink">
                  <Database className="h-3 w-3 text-flame" strokeWidth={1.5} />
                  In scope
                </span>
                <span className="font-mono text-[8px] uppercase tracking-[0.08em] text-faint">
                  Snapshot
                </span>
              </div>
              <div className="grid grid-cols-2 gap-px bg-line">
                {[
                  { value: stats.investigations, label: "Investigations" },
                  { value: stats.experimentalTables, label: "Tables" },
                  { value: formatNumber(stats.tableRows), label: "Normalized rows" },
                  { value: stats.documentsIndexed, label: "Documents" },
                ].map((item) => (
                  <div key={item.label} className="bg-panel px-3.5 py-3">
                    <div className="font-mono text-[20px] leading-none tracking-[-0.04em] text-ink">
                      {item.value}
                    </div>
                    <div className="label mt-1.5 text-[8px]">{item.label}</div>
                  </div>
                ))}
              </div>
              <div className="border-t border-line px-4 py-3">
                <div className="flex items-center justify-between gap-2 font-mono text-[8px] uppercase tracking-[0.08em] text-faint">
                  <span className="flex items-center gap-1.5">
                    <Table2 className="h-2.5 w-2.5" strokeWidth={1.5} />
                    Raw entries indexed
                  </span>
                  <span className="text-muted">{formatNumber(stats.rawFiles)}</span>
                </div>
                <p className="mt-2 text-[10px] leading-5 text-faint">
                  Raw datasets are not ingested. Answers come from published summary
                  tables and document metadata.
                </p>
              </div>
            </div>

            <div className="panel p-4">
              <div className="label text-[8.5px] text-ink">What it will not do</div>
              <ul className="mt-2.5 space-y-2 text-[10.5px] leading-5 text-faint">
                <li>Treat microgravity data as lunar or Mars data.</li>
                <li>Treat the E-FIELD analog as a gravity measurement.</li>
                <li>Fill a missing value with an estimate or a guess.</li>
                <li>Give engineering certification or mission-safety advice.</li>
              </ul>
              <Link
                href="/methodology"
                className="mt-3 inline-flex items-center gap-1 font-mono text-[8.5px] uppercase tracking-[0.08em] text-muted transition-colors hover:text-flame"
              >
                Read the methodology
                <ArrowUpRight className="h-2.5 w-2.5" strokeWidth={1.5} />
              </Link>
            </div>
          </aside>
        </div>

        <div className="mt-6 border-t border-line pt-4 text-[10.5px] leading-5 text-faint">
          The assistant is an interface to a dated research snapshot, not a live NASA
          system. It is independent of NASA and is not a source of mission-safety
          certification.
        </div>
      </section>
    </>
  );
}
