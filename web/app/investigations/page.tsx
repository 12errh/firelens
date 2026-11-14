import type { Metadata } from "next";
import { compactInvestigations, stats } from "@/lib/data";
import { InvestigationExplorer } from "@/components/investigation-explorer";
import { Metric, PageIntro, StatusDot } from "@/components/ui";

export const metadata: Metadata = {
  title: "Investigation explorer",
  description:
    "Search and filter all 24 NASA PSI Combustion Science investigations by evidence type, fuel phase, and reported oxygen condition.",
};

export default function InvestigationsPage() {
  const records = compactInvestigations();

  return (
    <>
      <PageIntro
        kicker="Investigation explorer · 24 records"
        title={
          <>
            Read the conditions, not the headline.
          </>
        }
        body="Search titles, acronyms, objectives, hardware, and fuels. Filter by evidence type and material phase. Oxygen ranges come from experimental summary tables; if PSI does not report a value, it stays “not reported.”"
        meta={
          <>
            <Metric value={stats.flightInvestigations} label="Flight experiments" />
            <Metric value={stats.analysisInvestigations} label="Modeling & analysis" />
            <Metric value={stats.tablesWithO2} label="Tables reporting O₂" />
          </>
        }
      />

      <section className="mx-auto max-w-[1200px] px-6 py-12 lg:px-10 lg:py-16">
        <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[15px] text-faint">
          <span className="flex items-center gap-2">
            <StatusDot tone="moss" />
            Snapshot complete · 24 / 24
          </span>
          <span>2,870 normalized rows</span>
          <span>109 reports + science documents indexed</span>
        </div>
        <InvestigationExplorer records={records} />
      </section>
    </>
  );
}
