import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { AssistantChat } from "@/components/assistant-chat";
import { TickRule } from "@/components/ui";
import { corpusDocumentCount, corpusPassageCount } from "@/lib/rag-stats";
import { stats } from "@/lib/data";

export const metadata: Metadata = {
  title: "Evidence assistant",
  description:
    "Ask questions about the NASA PSI combustion snapshot. Document retrieval over real NASA reports, citations on every answer, and a deterministic fallback when the language model is offline.",
};

const MODES = [
  {
    label: "Structured evidence",
    body: "Normalized tables, computed findings and investigation metadata — never a generic web index.",
  },
  {
    label: "Document retrieval",
    body: `${corpusPassageCount.toLocaleString("en-US")} passages from ${corpusDocumentCount} downloaded NASA reports, ranked with BM25 and quoted verbatim with a page number.`,
  },
  {
    label: "Numeric guard",
    body: "A drafted answer is rejected if it contains a percentage that appears in neither the tables nor the cited passages.",
  },
  {
    label: "Deterministic fallback",
    body: "With no model key the assistant still answers from the tables and the report corpus. It never needs an LLM to be useful.",
  },
];

export default function AssistantPage() {
  return (
    <div className="flex h-[calc(100dvh-4.75rem)] flex-col">
      <div className="shrink-0 border-b border-line bg-canvas">
        <div className="relative mx-auto flex max-w-[760px] flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5 text-[15px] text-ink">
            <ShieldCheck className="h-4 w-4 text-flame" strokeWidth={1.5} />
            Evidence assistant
            <span className="text-faint">· grounded mode</span>
          </div>
          <div className="flex items-center gap-3 text-[13.5px] text-faint">
            <span>{stats.experimentalTables} tables</span>
            <span className="h-2.5 w-px bg-line" />
            <span>{stats.investigations} records</span>
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-1 transition-colors hover:text-flame">
                How it works
                <span className="transition-transform group-open:rotate-45">+</span>
              </summary>
              <div className="absolute right-0 top-6 z-30 w-[320px] rounded-lg border border-line bg-panel p-4 shadow-lg">
                <ol className="space-y-3">
                  {MODES.map((mode, index) => (
                    <li key={mode.label}>
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-[12.5px] text-flame">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[13.5px] text-ink">{mode.label}</span>
                      </div>
                      <p className="mt-1 pl-5 text-[13px] leading-5 text-faint">{mode.body}</p>
                    </li>
                  ))}
                </ol>
                <Link
                  href="/methodology"
                  className="mt-3 flex items-center gap-1 border-t border-line pt-3 text-[13px] text-muted transition-colors hover:text-flame"
                >
                  Read the methodology
                  <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
                </Link>
              </div>
            </details>
          </div>
        </div>
        <TickRule />
      </div>

      <AssistantChat />
    </div>
  );
}
