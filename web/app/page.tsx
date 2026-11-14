import Link from "next/link";
import { CornerDownLeft, ShieldCheck } from "lucide-react";
import {
  evidencePoints,
  formatNumber,
  getInvestigation,
  insights,
  investigationById,
  phaseLabel,
  scenarios,
  stats,
} from "@/lib/data";
import { EvidenceMap } from "@/components/evidence-map";
import { InvestigationCard } from "@/components/investigation-card";
import {
  ActionLink,
  ArrowLink,
  Badge,
  DataNote,
  Metric,
  SectionHeading,
  SectionIntro,
  StatusDot,
  TickRule,
} from "@/components/ui";
import {
  ChatGlyph,
  ExplorerGlyph,
  HeroKicker,
  HeroVisual,
  MapGlyph,
  ScaleGlyph,
} from "@/components/hero-visual";
import { PHASE_COLOR } from "@/lib/tokens";

const FEATURES = [
  {
    title: "Evidence map",
    body: "Every tabulated test condition plotted by oxygen concentration and gravity environment. The lunar habitat band is shaded and the partial-gravity lane is left empty, because it is.",
    href: "/evidence",
    link: "Open the evidence map",
    glyph: MapGlyph,
  },
  {
    title: "Investigation explorer",
    body: "All 24 records filtered by gravity class, material phase and data availability, with the normalized conditions and the source table behind every number.",
    href: "/investigations",
    link: "Browse 24 records",
    glyph: ExplorerGlyph,
  },
  {
    title: "Grounded assistant",
    body: "Retrieves passages from 91 real NASA reports, quotes them verbatim with a page number, and rejects any percentage that appears in neither the tables nor the cited passages.",
    href: "/assistant",
    link: "Ask the assistant",
    glyph: ChatGlyph,
  },
  {
    title: "Methodology and limits",
    body: "Six normalization rules, four evidence classes, and an explicit list of the questions this snapshot cannot answer. Nothing on the site is hand-typed.",
    href: "/methodology",
    link: "Read the methodology",
    glyph: ScaleGlyph,
  },
];
export default function Home() {
  const mapPoints = evidencePoints.filter(
    (point) => point.o2 && point.gravity !== "partial_gravity_analog",
  );
  const phaseStats = (["solid", "liquid", "gas"] as const).map((phase) => {
    const points = mapPoints.filter((point) => point.phase === phase);
    return {
      phase,
      min: Math.min(...points.map((point) => point.o2!.min)),
      max: Math.max(...points.map((point) => point.o2!.max)),
      investigations: new Set(points.map((point) => point.investigationId)).size,
      rows: points.reduce((sum, point) => sum + point.rows, 0),
    };
  });

  const featured = ["PSI-25", "PSI-159", "PSI-22"]
    .map((id) => getInvestigation(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const scenarioEvidence = scenarios.map((scenario) => ({
    ...scenario,
    records: scenario.evidence
      .map((id) => investigationById.get(id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item)),
  }));

  return (
    <>
      {/* Hero — text left, visual right */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-[1200px] px-6 pb-16 pt-14 lg:px-10 lg:pb-20 lg:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="reveal">
              <HeroKicker />

              <h1 className="mt-5 max-w-[620px] text-balance text-[42px] font-medium leading-[1.04] tracking-[-0.035em] text-ink sm:text-[54px] lg:text-[60px]">
                Fire doesn&apos;t fall the same way twice.
              </h1>

              <p className="mt-6 max-w-[560px] text-pretty text-[17px] leading-8 text-muted">
                An evidence workbench for combustion in reduced gravity. We normalized{" "}
                <span className="text-ink">24 NASA PSI investigations</span> and{" "}
                <span className="text-ink">22 experimental tables</span>, then mapped what
                they can, and cannot, say about spacecraft, lunar, and Mars fire safety.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ActionLink href="/evidence">Explore the evidence map</ActionLink>
                <ActionLink href="/assistant" variant="secondary">
                  Ask the assistant
                </ActionLink>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-2.5 border-t border-line pt-5 text-[14px] text-faint sm:grid-cols-2">
                <span className="flex items-center gap-2">
                  <StatusDot tone="moss" />
                  PSI snapshot 14 Nov 2026
                </span>
                <span>No invented values</span>
                <span>Every number cited</span>
                <span className="text-muted">Independent project</span>
              </div>
            </div>

            <HeroVisual priority />
          </div>
        </div>

        <TickRule />
      </section>

      {/* Snapshot strip */}
      <div className="border-b border-line bg-panel">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-px bg-line lg:grid-cols-4">
          {[
            {
              value: stats.investigations,
              unit: "records",
              label: "PSI investigations",
              note: "19 flight · 4 analysis · 1 ground",
            },
            {
              value: stats.experimentalTables,
              unit: "tables",
              label: "Experimental summaries",
              note: `${formatNumber(stats.tableRows)} normalized test rows`,
            },
            {
              value: formatNumber(stats.rawFiles),
              unit: "files",
              label: "Raw data entries indexed",
              note: "Not ingested · metadata only",
            },
            {
              value: "0",
              unit: "datasets",
              label: "Direct partial-gravity data",
              note: "Moon / Mars gravity absent",
              accent: true,
            },
          ].map((item) => (
            <div key={item.label} className="bg-panel px-6 py-7">
              <Metric
                value={item.value}
                unit={item.unit}
                label={item.label}
                note={item.note}
                accent={item.accent}
              />
            </div>
          ))}
        </div>
      </div>

      {/* What it does — 2x2 hairline grid */}
      <section className="mx-auto max-w-[1200px] px-6 py-20 lg:px-10 lg:py-24">
        <SectionIntro
          kicker="The workbench"
          title="Four surfaces, one snapshot, no invented numbers."
          body="Every view on this site reads the same normalized JSON. There is no second dataset and no hand-typed figure, so two parts of the site can never disagree."
        />

        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
          {FEATURES.map((feature) => {
            const Glyph = feature.glyph;
            return (
              <article key={feature.title} className="flex flex-col bg-panel p-6 sm:p-8">
                <div className="h-32 overflow-hidden rounded border border-line bg-canvas p-2">
                  <Glyph />
                </div>
                <h3 className="mt-6 text-[19px] font-medium tracking-[-0.02em] text-ink">
                  {feature.title}
                </h3>
                <p className="mt-2.5 max-w-md text-[14px] leading-6 text-muted">
                  {feature.body}
                </p>
                <div className="mt-5">
                  <ArrowLink href={feature.href}>{feature.link}</ArrowLink>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Evidence map */}
      <section className="border-y border-line bg-panel">
        <div className="mx-auto max-w-[1200px] px-6 py-20 lg:px-10 lg:py-24">
          <SectionHeading
            index="01"
            kicker="The evidence gap"
            title="Oxygen is the variable. Gravity is the missing axis."
            body="Every tabulated test condition in the PSI combustion snapshot, plotted by oxygen concentration and gravity environment. The lunar habitat band is shaded. The partial-gravity lane is empty."
            action={<ArrowLink href="/evidence">Full evidence map</ArrowLink>}
          />

          <div className="mt-8 rounded-lg border border-line bg-canvas p-4 sm:p-6">
            <EvidenceMap points={evidencePoints} />
          </div>

          <div className="mt-4 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
            {[
              {
                metric: `${stats.o2.solidMax.toFixed(1)}%`,
                label: "Highest solid-material O₂",
                note: "BASS-II initial test condition. The lunar habitat target begins at 30%.",
                tone: "text-flame",
              },
              {
                metric: `${stats.o2.gasMax.toFixed(0)}%`,
                label: "Highest gaseous O₂",
                note: "CFI-G and Flame Design inverse flames. Fuel phase changes the flammability question.",
                tone: "text-violet",
              },
              {
                metric: "0",
                label: "Partial-gravity datasets",
                note: "No lunar- or Mars-gravity measurement exists in this snapshot.",
                tone: "text-ink",
              },
            ].map((item) => (
              <div key={item.label} className="bg-panel p-6">
                <div
                  className={`font-mono text-[28px] font-medium leading-none tracking-[-0.03em] ${item.tone}`}
                >
                  {item.metric}
                </div>
                <div className="mt-3 text-[14px] font-medium text-ink">{item.label}</div>
                <p className="mt-2 text-[14px] leading-5 text-faint">{item.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <DataNote>
              The nearest high-oxygen evidence is gaseous or droplet-based. No solid-material
              summary table in this snapshot reports a test at or above 30% O₂ — the closest
              solid ceiling is <span className="text-ink">22.2%</span>.
            </DataNote>
          </div>
        </div>
      </section>

      {/* Scenarios */}
      <section className="mx-auto max-w-[1200px] px-6 py-20 lg:px-10 lg:py-24">
        <SectionIntro
          kicker="Scenario readiness"
          title="The same data, three different confidence levels."
          body="A fire-safety decision in microgravity has direct evidence behind it. A lunar habitat decision does not. The interface says so before it shows a number."
        />

        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-line bg-line lg:grid-cols-3">
          {scenarioEvidence.map((scenario) => {
            const direct = scenario.statusKey === "direct";
            return (
              <article key={scenario.id} className="flex flex-col bg-panel p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="label text-[14px]">{scenario.gravity}</span>
                  <Badge tone={direct ? "moss" : "flame"}>
                    <StatusDot tone={direct ? "moss" : "flame"} />
                    {scenario.status}
                  </Badge>
                </div>
                <h3 className="mt-5 text-[24px] font-medium leading-7 tracking-[-0.03em] text-ink">
                  {scenario.label}
                </h3>
                <div className="mt-2 text-[15px] text-faint">Target · {scenario.target}</div>
                <p className="mt-4 text-[14px] leading-5 text-muted">{scenario.summary}</p>

                <div className="mt-auto border-t border-line pt-4">
                  <div className="label text-[14px]">Evidence base</div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {scenario.records.slice(0, 5).map((record) => (
                      <Link
                        key={record.id}
                        href={`/investigations/${record.id}`}
                        className="border border-line px-1.5 py-1 text-[15px] text-muted transition-colors hover:border-line-strong hover:text-ink"
                      >
                        {record.acronym ?? record.id}
                      </Link>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Insights */}
      <section className="border-y border-line bg-panel">
        <div className="mx-auto max-w-[1200px] px-6 py-20 lg:px-10 lg:py-24">
          <SectionHeading
            index="02"
            kicker="What the data says"
            title="Six findings the snapshot can defend."
            body="Computed from the normalized tables, not generated prose. Each finding retains its source records and DOI."
            action={<ArrowLink href="/methodology">How we computed this</ArrowLink>}
          />

          <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-3">
            {insights.slice(0, 3).map((insight) => (
              <article key={insight.id} className="flex flex-col bg-panel p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-[34px] leading-none tracking-[-0.05em] text-flame">
                      {insight.metric}
                    </span>
                    <span className="max-w-[90px] text-[15px] leading-3 text-faint">
                      {insight.unit}
                    </span>
                  </div>
                  <Badge tone={insight.severity === "critical" ? "danger" : "neutral"}>
                    {insight.kind}
                  </Badge>
                </div>
                <h3 className="mt-5 text-[16px] font-medium leading-6 tracking-[-0.01em] text-ink">
                  {insight.title}
                </h3>
                <p className="mt-2 text-[14px] leading-5 text-muted">{insight.statement}</p>
                <div className="mt-auto flex flex-wrap gap-1.5 border-t border-line pt-4">
                  {insight.sources.slice(0, 3).map((source) => (
                    <Link
                      key={source.id}
                      href={`/investigations/${source.id}`}
                      className="border border-line px-1.5 py-1 text-[15px] text-faint transition-colors hover:border-line-strong hover:text-ink"
                    >
                      {source.label}
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-4 border-y border-line">
            {insights.slice(3).map((insight) => (
              <div
                key={insight.id}
                className="grid gap-3 py-4 sm:grid-cols-[90px_1fr_auto] sm:items-center sm:gap-5"
              >
                <div className="font-mono text-[18px] tracking-[-0.03em] text-ink">
                  {insight.metric}
                  <span className="ml-1 text-[15px] text-faint">{insight.unit}</span>
                </div>
                <div>
                  <div className="text-[14px] text-ink">{insight.title}</div>
                  <p className="mt-0.5 text-[14px] leading-5 text-faint">{insight.statement}</p>
                </div>
                <Link
                  href={`/investigations/${insight.sources[0]?.id ?? "PSI-25"}`}
                  className="hidden text-[15px] text-muted hover:text-flame sm:block"
                >
                  Source →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section className="mx-auto grid max-w-[1200px] gap-12 px-6 py-20 lg:px-10 lg:py-24 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <SectionHeading
            index="03"
            kicker="Coverage"
            title="What the tables actually cover."
            body="Reported oxygen ranges by fuel phase. The dashed line is the lunar habitat threshold; no solid-material range crosses it."
          />

          <div className="mt-8 space-y-6">
            {phaseStats.map((item) => {
              const color = PHASE_COLOR[item.phase];
              return (
                <div key={item.phase}>
                  <div className="flex items-end justify-between gap-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[14px] text-ink">{phaseLabel(item.phase)}</span>
                      <span className="text-[15px] text-faint">
                        {item.investigations} investigations · {item.rows} rows
                      </span>
                    </div>
                    <span className="font-mono text-[14px] tabular text-ink">
                      {item.min.toFixed(1)}–{item.max.toFixed(1)}%
                    </span>
                  </div>
                  <div className="relative mt-2.5 h-7 border border-line bg-panel-2">
                    <div
                      className="absolute inset-y-0 border-x"
                      style={{
                        left: `${item.min}%`,
                        width: `${Math.max(item.max - item.min, 0.7)}%`,
                        backgroundColor: `${color}26`,
                        borderColor: color,
                      }}
                    />
                    <div
                      className="absolute top-0 h-full border-l border-dashed border-flame/60"
                      style={{ left: "30%" }}
                      title="Lunar habitat threshold: 30% O₂"
                    />
                    <span
                      className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full"
                      style={{ left: `calc(${item.max}% - 4px)`, backgroundColor: color }}
                    />
                  </div>
                  <div className="relative mt-1.5 h-3 text-[15px] text-faint">
                    <span className="absolute left-0">0%</span>
                    <span className="absolute -translate-x-1/2 text-flame/80" style={{ left: "30%" }}>
                      30% lunar target
                    </span>
                    <span className="absolute right-0">100%</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-7">
            <DataNote>
              Ranges combine initial/ambient O₂ conditions from summary tables. They do not
              include final-oxygen readings, which can reflect transient combustion products.
            </DataNote>
          </div>
        </div>

        <div className="lg:border-l lg:border-line lg:pl-10">
          <div className="label">Archive at a glance</div>
          <div className="mt-5 grid grid-cols-2 gap-px bg-line">
            {[
              { value: stats.flightInvestigations, label: "Flight experiments" },
              { value: stats.analysisInvestigations, label: "Modeling & analysis" },
              { value: stats.groundInvestigations, label: "Ground experiment" },
              { value: stats.documentsIndexed, label: "Reports + science docs" },
              { value: stats.publications, label: "Publications indexed" },
              { value: stats.tablesWithO2, label: "Tables reporting O₂" },
            ].map((item) => (
              <div key={item.label} className="bg-panel px-4 py-4">
                <div className="font-mono text-[24px] leading-none tracking-[-0.04em] text-ink">
                  {formatNumber(item.value)}
                </div>
                <div className="label mt-2 text-[14px]">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-3 text-[14px] leading-5 text-muted">
            <p>
              The searchable evidence layer is deliberately thin: {stats.experimentalTables}{" "}
              summary tables across {stats.investigations} investigations, backed by{" "}
              {formatNumber(stats.rawFiles)} raw file entries that are indexed but not
              ingested.
            </p>
            <p>
              Partial-gravity analog work exists (E-FIELD), but analog is not measurement — the
              interface keeps that distinction visible.
            </p>
          </div>
          <div className="mt-5">
            <ArrowLink href="/methodology">Read the methodology</ArrowLink>
          </div>
        </div>
      </section>

      {/* Featured records */}
      <section className="border-t border-line bg-panel">
        <div className="mx-auto max-w-[1200px] px-6 py-20 lg:px-10 lg:py-24">
          <SectionHeading
            index="04"
            kicker="Starting points"
            title="Three records that frame the question."
            body="One solid-fuel microgravity campaign, one high-oxygen gaseous campaign, and one partial-gravity analog that is not gravity data."
            action={<ArrowLink href="/investigations">All 24 investigations</ArrowLink>}
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {featured.map((investigation) => (
              <InvestigationCard key={investigation.id} investigation={investigation} />
            ))}
          </div>
        </div>
      </section>

      {/* Assistant CTA */}
      <section className="border-t border-line">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-6 py-20 lg:px-10 lg:py-24 lg:grid-cols-2">
          <div>
            <div className="label flex items-center gap-2.5 text-flame">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
              Evidence assistant
            </div>
            <h2 className="mt-4 max-w-xl text-balance text-[30px] font-medium leading-[1.1] tracking-[-0.03em] text-ink sm:text-[38px]">
              Ask the evidence, not the internet.
            </h2>
            <p className="mt-4 max-w-lg text-[14px] leading-6 text-muted">
              The assistant retrieves passages from real NASA reports, quotes them with a page
              number, and cites the investigation behind every claim. It says “not reported”
              when the data is silent. A deterministic fallback keeps it useful even when the
              language model is offline.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ActionLink href="/assistant">Open the assistant</ActionLink>
              <ActionLink href="/methodology" variant="secondary">
                Data & AI disclosure
              </ActionLink>
            </div>
          </div>

          <div className="panel p-1.5">
            <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
              <div className="flex items-center gap-2 text-[15px] text-faint">
                <StatusDot tone="moss" />
                Evidence assistant · grounded mode
              </div>
              <span className="text-[15px] text-faint">PSI snapshot</span>
            </div>
            <div className="space-y-3 p-4">
              <div className="ml-auto max-w-[88%] border border-line bg-panel-2 px-3 py-2 text-[14px] leading-5 text-ink">
                Is there partial-gravity combustion data for a lunar habitat?
              </div>
              <div className="max-w-[94%] border border-flame/20 bg-flame/[0.045] px-3 py-3 text-[14px] leading-5 text-muted">
                <p>
                  <span className="text-flame">No.</span> None of the 24 PSI combustion
                  investigations in this snapshot reports a direct lunar- or Mars-gravity
                  measurement. E-FIELD used electric fields as a partial-gravity analog, but it
                  is not gravity data.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="border border-line px-1.5 py-1 text-[15px] text-faint">
                    PSI-22 · analog
                  </span>
                  <span className="border border-line px-1.5 py-1 text-[15px] text-faint">
                    0 datasets
                  </span>
                  <span className="border border-line px-1.5 py-1 text-[15px] text-faint">
                    Confidence · high
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 border border-line bg-panel-2 px-3 py-2.5">
                <span className="flex-1 text-[15px] text-faint">
                  Ask about oxygen, materials, suppression…
                </span>
                <span className="flex h-6 w-6 items-center justify-center border border-line text-faint">
                  <CornerDownLeft className="h-3 w-3" strokeWidth={1.5} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Provenance strip */}
      <section className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-6 py-6 text-[15px] text-faint sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <span>Source · NASA Physical Sciences Informatics · public snapshot</span>
          <span>24 investigations · 22 tables · 0 partial-gravity datasets</span>
          <Link href="/methodology" className="text-muted hover:text-flame">
            Limitations & licensing →
          </Link>
        </div>
      </section>
    </>
  );
}
