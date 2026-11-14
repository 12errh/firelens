import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Database, ScanLine, ShieldCheck, Table2 } from "lucide-react";
import { formatNumber, stats } from "@/lib/data";
import { corpusDocumentCount, corpusPassageCount } from "@/lib/rag-stats";
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
    label: "Document retrieval, always on",
    body: "Every question is ranked against 2,583 page-stamped passages from 91 downloaded NASA reports. The matching passages are quoted verbatim with their page number.",
  },
  {
    label: "Model, strictly grounded",
    body: "A Groq draft may only use the retrieved context. If the research team's own RAG endpoint is configured, its cited answer is preferred.",
  },
  {
    label: "Deterministic fallback",
    body: "With no model key, the assistant still answers from structured evidence and the document corpus. It never needs an LLM to be useful.",
  },
];

export default function AssistantPage() {
  return (
    <>
      <PageIntro
        kicker="Evidence assistant · grounded mode"
        title="Ask the snapshot. Get the source."
        body="A research assistant for the 24 PSI combustion records behind this site. It answers from normalized tables and from the text of real NASA reports, quotes the passage and page behind each claim, and says “not reported” when the snapshot is silent."
        meta={
          <>
            <Metric value={stats.experimentalTables} label="Tables in scope" />
            <Metric value={stats.evidencePoints} label="Evidence points" />
            <Metric value={stats.partialGravityDatasets} label="Partial-gravity datasets" accent />
          </>
        }
      />

      <section className="mx-auto max-w-[1200px] px-6 py-12 lg:px-10 lg:py-16">
        <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[15px] text-faint">
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
                <span className="flex items-center gap-2 label text-[14px] text-ink">
                  <ShieldCheck className="h-3 w-3 text-flame" strokeWidth={1.5} />
                  How it answers
                </span>
                <Badge tone="moss">Grounded</Badge>
              </div>
              <ol className="divide-y divide-line">
                {STEPS.map((step, index) => (
                  <li key={step.label} className="px-4 py-3.5">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-[14px] text-flame">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[14px] text-ink">{step.label}</span>
                    </div>
                    <p className="mt-1 pl-5 text-[14px] leading-5 text-faint">{step.body}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="border border-ice/20 bg-ice/[0.035] p-4">
              <div className="flex items-center gap-2">
                <ScanLine className="h-3.5 w-3.5 text-ice" strokeWidth={1.5} />
                <span className="label text-[14px] text-ice">Numeric guard</span>
              </div>
              <p className="mt-2 text-[14px] leading-5 text-muted">
                A language-model draft is rejected before it reaches you if it contains a
                percentage that appears in neither the normalized tables nor the retrieved
                passages. The structured answer is returned instead, with a note explaining
                why.
              </p>
            </div>

            <div className="panel overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
                <span className="flex items-center gap-2 label text-[14px] text-ink">
                  <Database className="h-3 w-3 text-flame" strokeWidth={1.5} />
                  In scope
                </span>
                <span className="text-[15px] text-faint">
                  Snapshot
                </span>
              </div>
              <div className="grid grid-cols-2 gap-px bg-line">
                {[
                  { value: stats.investigations, label: "Investigations" },
                  { value: stats.experimentalTables, label: "Tables" },
                  { value: formatNumber(stats.tableRows), label: "Normalized rows" },
                  { value: corpusDocumentCount, label: "Documents downloaded" },
                ].map((item) => (
                  <div key={item.label} className="bg-panel px-3.5 py-3">
                    <div className="font-mono text-[20px] leading-none tracking-[-0.04em] text-ink">
                      {item.value}
                    </div>
                    <div className="label mt-1.5 text-[14px]">{item.label}</div>
                  </div>
                ))}
              </div>
              <div className="border-t border-line px-4 py-3">
                <div className="flex items-center justify-between gap-2 text-[15px] text-faint">
                  <span className="flex items-center gap-1.5">
                    <Table2 className="h-2.5 w-2.5" strokeWidth={1.5} />
                    Raw entries indexed
                  </span>
                  <span className="text-muted">{formatNumber(stats.rawFiles)}</span>
                </div>
                <p className="mt-2 text-[14px] leading-5 text-faint">
                  Raw datasets are not ingested. Answers come from published summary
                  tables and from downloaded report text, quoted verbatim with a page
                  number.
                </p>
              </div>
            </div>

            <div className="panel p-4">
              <div className="label text-[14px] text-ink">What it will not do</div>
              <ul className="mt-2.5 space-y-2 text-[14px] leading-5 text-faint">
                <li>Treat microgravity data as lunar or Mars data.</li>
                <li>Treat the E-FIELD analog as a gravity measurement.</li>
                <li>Fill a missing value with an estimate or a guess.</li>
                <li>Give engineering certification or mission-safety advice.</li>
              </ul>
              <Link
                href="/methodology"
                className="mt-3 inline-flex items-center gap-1 text-[15px] text-muted transition-colors hover:text-flame"
              >
                Read the methodology
                <ArrowUpRight className="h-2.5 w-2.5" strokeWidth={1.5} />
              </Link>
            </div>
          </aside>
        </div>

        <div className="mt-6 border-t border-line pt-4 text-[14px] leading-5 text-faint">
          The assistant is an interface to a dated research snapshot, not a live NASA
          system. It is independent of NASA and is not a source of mission-safety
          certification.
        </div>
      </section>
    </>
  );
}
