import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  Braces,
  CircleAlert,
  Database,
  FileSearch,
  Fingerprint,
  GitBranch,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  formatNumber,
  manifest,
  stats,
} from "@/lib/data";
import {
  ActionLink,
  Badge,
  DataNote,
  Metric,
  PageIntro,
  SectionHeading,
  StatusDot,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Methodology, provenance, and disclosure",
  description:
    "How the Flame in Freefall snapshot was retrieved from NASA PSI, how the tables were normalized, what the evidence classes mean, and how the AI assistant is constrained.",
};

const PIPELINE = [
  {
    step: "01",
    title: "Discover",
    detail:
      "Query the public PSI repository API for Research Area = Combustion Science. The query returned 24 investigations, all included here.",
    output: "24 records",
  },
  {
    step: "02",
    title: "Retrieve metadata",
    detail:
      "Fetch each investigation detail, file tree, and publication list from the PSI API. Raw data products are not downloaded.",
    output: "65,629 raw entries indexed",
  },
  {
    step: "03",
    title: "Parse summary tables",
    detail:
      "Download the 22 published experimental summary CSVs and parse oxygen, pressure, fuel, and test-condition columns with explicit rules.",
    output: "2,870 normalized rows",
  },
  {
    step: "04",
    title: "Normalize and validate",
    detail:
      "Map records to a shared schema. Missing values stay null, malformed values are excluded and listed, and every evidence point keeps a source table reference.",
    output: "14 evidence points",
  },
];

const NORMALIZATION_RULES = [
  {
    title: "Missing is not zero",
    detail:
      "When a table does not report a value, the field stays null. Zero is only stored when the source table literally reports zero. This is why “not reported” appears instead of a fabricated number.",
  },
  {
    title: "Initial or ambient O₂ only",
    detail:
      "Oxygen is taken from the initial or ambient test condition. Final or post-test oxygen is not mixed into the same range, because it measures a different part of the experiment.",
  },
  {
    title: "Ranges stay ranges",
    detail:
      "Values like “21.5 – 21.7” become a min/max range and are flagged approximate. A single reported value becomes a point value. Nothing is collapsed to a misleading midpoint.",
  },
  {
    title: "Malformed values are excluded, not repaired",
    detail:
      "The BRE table contains entries such as 3400% and 2100% that cannot be oxygen concentrations. They are excluded from the normalized range and recorded as a data-quality note instead of being silently corrected.",
  },
  {
    title: "Unit and header reconciliation",
    detail:
      "Oxygen columns appear as percent, mole fraction, and header text across tables. CFI-G reports mole fraction (0.12–0.85), converted to percent. FLEX pressure zeros are treated as not reported, not as vacuum.",
  },
  {
    title: "No raw data ingestion",
    detail:
      "Videos, telemetry, and images in the PSI archive are petabytes. This project indexes their metadata and uses published summary tables, documents, and selected CC0 images. It is not a mirror of the raw archive.",
  },
];

const EVIDENCE_CLASSES = [
  {
    label: "Direct",
    tone: "moss" as const,
    detail:
      "A measurement made in the gravity environment being discussed. All 12 direct points here are microgravity measurements from flight experiments.",
  },
  {
    label: "1 g comparison",
    tone: "ice" as const,
    detail:
      "A normal-gravity column reported alongside flight data. Only SAFFIRE-II provides one. It bounds gravity sensitivity for one material set; it is not a systematic matrix.",
  },
  {
    label: "Analog only",
    tone: "violet" as const,
    detail:
      "A related experiment that approximates a condition without measuring it. E-FIELD uses electric fields to mimic some buoyancy-free behavior and does not report O₂ in its summary table.",
  },
  {
    label: "Absent",
    tone: "flame" as const,
    detail:
      "No dataset in the snapshot addresses the condition. Lunar and Mars gravity are in this class. The interface says so instead of filling the gap.",
  },
];

const LIMITS = [
  {
    title: "Twenty-four records, one research area",
    detail:
      "The snapshot covers PSI's Combustion Science research area only. It is not all of PSI and not all of NASA combustion research.",
  },
  {
    title: "A dated snapshot, not a live mirror",
    detail: `Retrieved ${stats.snapshotDate}. Records, tables, or DOIs may change after that date. The interface does not poll PSI at request time.`,
  },
  {
    title: "Metadata and tables, not full text",
    detail:
      "109 reports and science documents are indexed by metadata. Their full text is not embedded in this app, so document-level claims are pointers to the source, not extracted conclusions.",
  },
  {
    title: "Coverage is uneven",
    detail:
      `Only ${stats.tablesWithO2} of ${stats.experimentalTables} experimental tables report oxygen. Pressure is missing from several tables. Comparisons across phases are therefore asymmetric.`,
  },
  {
    title: "Test conditions are not flammability limits",
    detail:
      "A reported oxygen concentration is the condition of a test, not a certified lower flammability limit or a material qualification. The UI labels it as a test condition throughout.",
  },
  {
    title: "Absence is bounded by the snapshot",
    detail:
      "“No partial-gravity dataset” means none in these 24 records. It is not proof that no such experiment exists anywhere. The methodology states the scope every time the claim appears.",
  },
];

const DISCLOSURE = [
  {
    icon: Sparkles,
    title: "AI-assisted build",
    detail:
      "AI coding tools were used to scaffold the application, help write the ingestion and normalization code, and draft interface copy. Every normalized value can be traced to a published PSI summary table, and the ingestion script is included for regeneration.",
  },
  {
    icon: GitBranch,
    title: "Deterministic assistant first",
    detail:
      "The assistant answers from the normalized snapshot with rule-based intent routing. It does not require a language model. Numbers in a deterministic answer are computed from the same JSON that powers the charts and tables.",
  },
  {
    icon: ShieldCheck,
    title: "Optional RAG and Groq lanes",
    detail:
      "If a document-RAG endpoint is configured, its answer is used for interpretation and must cite sources. If a Groq key is configured, it drafts only from retrieved evidence. Both lanes are optional; neither is required for the site to answer.",
  },
  {
    icon: Braces,
    title: "Numeric guard",
    detail:
      "A language-model draft is rejected if it contains a percentage that is not present in the normalized tables. The deterministic answer is returned instead, with a note explaining why. This blocks invented oxygen or pressure figures.",
  },
  {
    icon: BookOpen,
    title: "Sources on every answer",
    detail:
      "Each assistant response carries source records, a confidence label, and its limitations. Answers distinguish “not reported” from zero and “no evidence in this snapshot” from “evidence of no effect.”",
  },
  {
    icon: Fingerprint,
    title: "Independent project",
    detail:
      "This is an independent NASA Space Apps Challenge 2026 entry. It is not affiliated with, sponsored by, or endorsed by NASA. NASA logos and insignia are not used. NASA PSI data remains subject to its own terms.",
  },
];

export default function MethodologyPage() {
  return (
    <>
      <PageIntro
        kicker="Methodology · snapshot and disclosure"
        title="Show the source. State the limit."
        body="A combustion evidence tool is only as good as its provenance. This page documents what was retrieved, how tables were normalized, how evidence was classified, what the snapshot cannot answer, and where AI is used."
        meta={
          <>
            <Metric value={formatNumber(stats.rawFiles)} label="Raw file entries indexed" />
            <Metric value={formatNumber(stats.tableRows)} label="Normalized table rows" />
            <Metric value={stats.partialGravityDatasets} label="Partial-gravity datasets" accent />
          </>
        }
      />

      {/* Provenance */}
      <section className="mx-auto max-w-[1200px] px-6 py-20 lg:px-10 lg:py-24">
        <SectionHeading
          index="01"
          kicker="Provenance"
          title="One public source, retrieved once."
          body="All records come from NASA's Physical Sciences Informatics system. The snapshot is dated so a reader can tell when it was taken and what it does and does not include."
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <div className="panel p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-flame" strokeWidth={1.5} />
                <span className="label text-[14px] text-ink">Source system</span>
              </div>
              <Badge tone="moss">
                <StatusDot tone="moss" />
                Public API
              </Badge>
            </div>
            <h3 className="mt-5 text-[22px] font-medium tracking-[-0.03em] text-ink">
              NASA Physical Sciences Informatics
            </h3>
            <p className="mt-2 max-w-xl text-[14px] leading-6 text-muted">
              Combustion Science research area, queried through the public PSI
              repository API. The interface does not call PSI at request time; it
              serves the normalized snapshot shipped with the build.
            </p>

            <dl className="mt-6 grid gap-x-6 gap-y-4 border-t border-line pt-5 sm:grid-cols-2">
              {[
                ["Snapshot date", stats.snapshotDate],
                ["Investigations", `${stats.investigations}`],
                ["Flight / ground / analysis", `${stats.flightInvestigations} / ${stats.groundInvestigations} / ${stats.analysisInvestigations}`],
                ["Experimental tables", `${stats.experimentalTables} (${stats.tablesWithO2} report O₂)`],
                ["Documents indexed", `${stats.documentsIndexed}`],
                ["Publications listed", `${stats.publications}`],
                ["Raw file entries", formatNumber(stats.rawFiles)],
                ["Evidence points", `${stats.evidencePoints}`],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="label text-[14px] text-faint">{label}</dt>
                  <dd className="mt-1 font-mono text-[14px] text-ink">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
              <a
                href={stats.psiSearchPage}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 border border-line px-2.5 py-1.5 text-[15px] text-muted transition-colors hover:border-line-strong hover:text-ink"
              >
                Open PSI search
                <FileSearch className="h-3 w-3" strokeWidth={1.5} />
              </a>
              <span className="text-[15px] text-faint">
                No API key required · Public records
              </span>
            </div>
          </div>

          <div className="panel flex flex-col p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-ice" strokeWidth={1.5} />
              <span className="label text-[14px] text-ink">Counts at a glance</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5">
              {[
                { value: "24", label: "Investigations" },
                { value: "22", label: "Summary tables" },
                { value: formatNumber(stats.tableRows), label: "Rows normalized" },
                { value: "109", label: "Documents indexed" },
                { value: formatNumber(stats.publications), label: "Publications" },
                { value: "0", label: "Partial-gravity sets" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="font-mono text-[24px] leading-none tracking-[-0.04em] text-ink">
                    {item.value}
                  </div>
                  <div className="label mt-2 text-[14px] text-faint">{item.label}</div>
                </div>
              ))}
            </div>
            <p className="mt-auto border-t border-line pt-4 text-[14px] leading-5 text-faint">
              Counts are generated from the same JSON files used by the dashboard,
              explorer, and assistant. Nothing on this page is hand-typed.
            </p>
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section className="border-y border-line bg-panel">
        <div className="mx-auto max-w-[1200px] px-6 py-20 lg:px-10 lg:py-24">
          <SectionHeading
            index="02"
            kicker="Pipeline"
            title="Discover, retrieve, parse, normalize."
            body="The pipeline is deliberately thin. It indexes what PSI publishes and preserves the source table for every value. It does not train on the corpus or infer missing measurements."
          />

          <div className="mt-8 grid gap-px border border-line bg-line md:grid-cols-4">
            {PIPELINE.map((item) => (
              <div key={item.step} className="bg-canvas p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[14px] text-flame">{item.step}</span>
                  <span className="text-[15px] text-faint">
                    {item.output}
                  </span>
                </div>
                <h3 className="mt-4 text-[15px] text-ink">{item.title}</h3>
                <p className="mt-2 text-[14px] leading-5 text-muted">{item.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <DataNote>
              The ingestion script is committed at{" "}
              <code className="font-mono text-[14px] text-ink">
                ingest/build_dataset.py
              </code>{" "}
              and regenerates every JSON file in{" "}
              <code className="font-mono text-[14px] text-ink">web/data/</code>.
            </DataNote>
            <DataNote>
              The manifest records the retrieval date, source endpoint, counts, and
              normalization rules with the generated dataset.
            </DataNote>
          </div>
        </div>
      </section>

      {/* Normalization */}
      <section className="mx-auto max-w-[1200px] px-6 py-20 lg:px-10 lg:py-24">
        <SectionHeading
          index="03"
          kicker="Normalization rules"
          title="Six rules that keep the numbers honest."
          body="Every rule exists because a source table broke an assumption. The goal is to make the failure visible, not to smooth it away."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {NORMALIZATION_RULES.map((rule, index) => (
            <article key={rule.title} className="panel flex flex-col p-5">
              <span className="font-mono text-[14px] text-flame">
                R{String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-[14.5px] leading-5 text-ink">{rule.title}</h3>
              <p className="mt-2 text-[14px] leading-5 text-muted">{rule.detail}</p>
            </article>
          ))}
        </div>

        <div className="mt-6">
          <DataNote>
            {manifest.dataRules.length} machine-readable rules ship with the dataset in{" "}
            <code className="font-mono text-[14px] text-ink">manifest.json</code>. The
            rules above summarize them; the manifest is the canonical list.
          </DataNote>
        </div>
      </section>

      {/* Evidence classes */}
      <section className="border-y border-line bg-panel">
        <div className="mx-auto max-w-[1200px] px-6 py-20 lg:px-10 lg:py-24">
          <SectionHeading
            index="04"
            kicker="Evidence classification"
            title="Four classes. No promotion between them."
            body="A comparison is not a measurement, an analog is not a dataset, and a missing dataset is not a null result. The evidence map uses these classes literally."
          />

          <div className="mt-8 border-t border-line">
            {EVIDENCE_CLASSES.map((item) => (
              <div
                key={item.label}
                className="grid gap-2 border-b border-line py-4 sm:grid-cols-[160px_1fr] sm:items-start sm:gap-6"
              >
                <Badge tone={item.tone} className="w-fit">
                  {item.label}
                </Badge>
                <p className="max-w-3xl text-[14px] leading-5 text-muted">{item.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 max-w-3xl">
            <DataNote>
              The lunar habitat band starts at 30% O₂. Eight table points reach it, all
              gaseous or droplet experiments. No solid-material table does. This is a
              property of the snapshot, not a UI threshold chosen for effect.
            </DataNote>
          </div>
        </div>
      </section>

      {/* Limits */}
      <section className="mx-auto max-w-[1200px] px-6 py-20 lg:px-10 lg:py-24">
        <SectionHeading
          index="05"
          kicker="Known limits"
          title="What this snapshot cannot answer."
          body="These are not edge cases. They are the boundaries that determine whether a claim should be made at all."
        />

        <div className="mt-8 border-t border-line">
          {LIMITS.map((limit, index) => (
            <div
              key={limit.title}
              className="grid gap-2 border-b border-line py-4 sm:grid-cols-[48px_240px_1fr] sm:items-start sm:gap-6"
            >
              <span className="font-mono text-[14px] text-faint">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-[14px] leading-5 text-ink">{limit.title}</h3>
              <p className="text-[14px] leading-5 text-muted">{limit.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="panel border-flame/25 p-5">
            <div className="flex items-center gap-2">
              <CircleAlert className="h-4 w-4 text-flame" strokeWidth={1.5} />
              <span className="label text-[14px] text-flame">Central limitation</span>
            </div>
            <p className="mt-3 text-[14px] leading-6 text-muted">
              The archive cannot directly predict lunar or Mars fire behavior. It
              contains microgravity measurements and one normal-gravity comparison. The
              1/6 g and 0.38 g regimes are not measured. Any extrapolation is an
              inference that the snapshot cannot validate.
            </p>
          </div>
          <div className="panel p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-moss" strokeWidth={1.5} />
              <span className="label text-[14px] text-ink">Why still useful</span>
            </div>
            <p className="mt-3 text-[14px] leading-6 text-muted">
              The snapshot is strong on what it does contain: microgravity solid,
              liquid, and gaseous combustion, suppression behavior, and oxygen
              conditions. It can support spacecraft-cabin reasoning and it can identify
              the exact experiments a lunar program would still need.
            </p>
          </div>
        </div>
      </section>

      {/* Licensing */}
      <section className="border-y border-line bg-panel">
        <div className="mx-auto max-w-[1200px] px-6 py-20 lg:px-10 lg:py-24">
          <SectionHeading
            index="06"
            kicker="Licensing and attribution"
            title="NASA data has its own terms."
            body="Inclusion in this interface does not change the license of the underlying record. Attribution and license status travel with every investigation."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="panel p-5 md:col-span-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="moss">23 of 24 · CC0 1.0</Badge>
                <Badge tone="neutral">1 · Not stated</Badge>
              </div>
              <p className="mt-4 text-[14px] leading-6 text-muted">
                Nearly all Combustion Science records in this snapshot are published
                under CC0 1.0. PSI-10 (ACME Flame Design) does not return a license in
                its detail payload; it is shown as “license not stated” and should be
                verified before redistribution. The interface links each record back to
                its PSI page and DOI.
              </p>
              <p className="mt-3 text-[14px] leading-6 text-muted">
                Selected images are CC0 assets downloaded from PSI record galleries.
                NASA logos, insignia, and the NASA identifier are not used.
              </p>
            </div>
            <div className="panel flex flex-col p-5">
              <span className="label text-[14px] text-faint">Required statement</span>
              <p className="mt-3 text-[14px] leading-6 text-ink">
                Independent project for NASA Space Apps Challenge 2026. Not affiliated
                with, sponsored by, or endorsed by NASA.
              </p>
              <div className="mt-auto border-t border-line pt-4">
                <Link
                  href="/investigations/PSI-10"
                  className="text-[15px] text-muted transition-colors hover:text-flame"
                >
                  Inspect PSI-10 license →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclosure */}
      <section className="mx-auto max-w-[1200px] px-6 py-20 lg:px-10 lg:py-24">
        <SectionHeading
          index="07"
          kicker="AI and SI disclosure"
          title="Where AI is used, and where it stops."
          body="Space Apps requires disclosure of AI and significant support. This is the full account for this project."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {DISCLOSURE.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="panel p-5">
                <span className="flex h-7 w-7 items-center justify-center border border-line bg-panel-2 text-flame">
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                </span>
                <h3 className="mt-4 text-[14px] text-ink">{item.title}</h3>
                <p className="mt-2 text-[14px] leading-5 text-muted">{item.detail}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-6">
          <DataNote>
            The assistant is an interface to a dated research snapshot. It is not a NASA
            system, not a mission-safety certification tool, and not a substitute for a
            qualified fire-safety review.
          </DataNote>
        </div>
      </section>

      {/* Reproduce */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-[1200px] px-6 py-12 lg:px-10 sm:py-14">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="label text-[14px] text-flame">Regenerate the snapshot</div>
              <h2 className="mt-3 text-[24px] font-medium tracking-[-0.03em] text-ink">
                Every number is rebuildable.
              </h2>
              <p className="mt-2 max-w-xl text-[14px] leading-5 text-muted">
                Run the Python ingestion script, then rebuild the Next.js app. The
                generated JSON is the single source of truth for the UI and assistant.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ActionLink href="/evidence" variant="primary">
                Open the evidence map
              </ActionLink>
              <ActionLink href="/assistant" variant="secondary">
                Ask the assistant
              </ActionLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
