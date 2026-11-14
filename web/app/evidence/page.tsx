import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  CircleSlash,
  FlaskConical,
  Scale,
  ScanLine,
} from "lucide-react";
import {
  evidencePoints,
  formatNumber,
  getInvestigation,
  phaseLabel,
  scenarios,
  stats,
} from "@/lib/data";
import { EvidenceMap } from "@/components/evidence-map";
import { EvidenceInventory } from "@/components/evidence-inventory";
import { Badge, DataNote, Metric, PageIntro, SectionHeading, StatusDot, TickRule } from "@/components/ui";
import { PHASE_COLOR } from "@/lib/tokens";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Oxygen × gravity evidence map",
  description:
    "Every normalized combustion evidence point in the NASA PSI snapshot, plotted by reported oxygen concentration and gravity environment. Partial gravity is empty.",
};

const CLASSES = [
  {
    key: "direct",
    label: "Direct evidence",
    count: "12 points",
    detail: "10 microgravity investigations",
    tone: "moss" as const,
    icon: ScanLine,
    body: "Solid, liquid, and gaseous fuels were burned in microgravity. These are real measurements — but almost all sit at Earth-like oxygen, and none of the solid-material tests reaches the lunar habitat band.",
  },
  {
    key: "comparison",
    label: "1 g comparison",
    count: "1 point",
    detail: "SAFFIRE-II ground columns",
    tone: "ice" as const,
    icon: Scale,
    body: "SAFFIRE-II reports a normal-gravity comparison inside its flight table. It helps bound gravity sensitivity for one material set, but it is not a systematic 1 g / µg matrix.",
  },
  {
    key: "analog",
    label: "Analogical only",
    count: "1 record",
    detail: "E-FIELD · no O₂ reported",
    tone: "violet" as const,
    icon: FlaskConical,
    body: "E-FIELD uses electric fields to approximate some buoyancy-free behavior. It is scientifically useful and explicitly not a partial-gravity measurement. Its summary table does not report oxygen.",
  },
  {
    key: "gap",
    label: "Direct partial gravity",
    count: "0 datasets",
    detail: "Moon 1/6 g · Mars 0.38 g",
    tone: "flame" as const,
    icon: CircleSlash,
    body: "No combustion investigation in this PSI snapshot reports a lunar- or Mars-gravity measurement. The empty lane is the central limitation of any lunar or Mars fire-safety claim.",
  },
];

const CHANGE_CONDITIONS = [
  {
    title: "A solid-material test at ≥30% O₂",
    detail:
      "The highest solid-material test condition in the snapshot is 22.2% O₂ (BASS-II). A test above 30% would show whether the solid ceiling reflects physics or the limits of the existing campaign.",
    status: "Absent",
  },
  {
    title: "A partial-gravity solid burn",
    detail:
      "Parabolic flight, drop tower, or centrifuge data at lunar or Mars gravity would populate the empty lane. None exists in this snapshot at any oxygen concentration.",
    status: "Absent",
  },
  {
    title: "A systematic 1 g / µg matrix",
    detail:
      "Matched tests at the same oxygen, pressure, flow, and material would isolate gravity from the other variables. SAFFIRE-II reports one comparison; the archive has nothing like a full matrix.",
    status: "Partial",
  },
  {
    title: "Oxygen-reported analog runs",
    detail:
      "E-FIELD could enter the oxygen axis only if its summary table reported O₂. Even then, it would remain analog evidence, not a gravity measurement.",
    status: "Absent",
  },
];

export default function EvidencePage() {
  const uniqueMicrogravity = new Set(
    evidencePoints
      .filter((point) => point.gravity === "microgravity")
      .map((point) => point.investigationId),
  ).size;

  return (
    <>
      <PageIntro
        kicker="Evidence map · 14 normalized points"
        title={
          <>
            Every test has an oxygen number. Almost none has the right gravity.
          </>
        }
        body="This map plots every experimental summary table in the PSI combustion snapshot by reported oxygen concentration and gravity environment. Ranges are test conditions, not flammability limits. The partial-gravity lane is empty."
        meta={
          <>
            <Metric value={stats.partialGravityDatasets} label="Partial-gravity datasets" accent />
            <Metric value={`${stats.o2.solidMax.toFixed(1)}%`} label="Highest solid-material O₂" />
            <Metric value={stats.o2.lunarBandCount} label="Points at or above 30% O₂" />
          </>
        }
      />

      <section className="mx-auto max-w-[1200px] px-6 py-12 lg:px-10 lg:py-16">
        <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[15px] text-faint">
          <span className="flex items-center gap-2">
            <StatusDot tone="flame" />
            Partial-gravity lane · 0
          </span>
          <span>{uniqueMicrogravity} microgravity investigations represented</span>
          <span>13 plotted + 1 analog</span>
          <span>Initial / ambient O₂ only</span>
        </div>

        <div className="panel p-4 sm:p-6">
          <EvidenceMap points={evidencePoints} />
        </div>

        <div className="mt-4 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
          {[
            {
              metric: `${stats.o2.lunarBandCount}`,
              label: "Table points at or above 30% O₂",
              note: "All are gaseous or droplet experiments. None is a solid material.",
              tone: "text-violet",
            },
            {
              metric: `${stats.o2.solidMax.toFixed(1)}%`,
              label: "Highest solid-material oxygen",
              note: "BASS-II initial condition. The lunar habitat target starts at 30%.",
              tone: "text-flame",
            },
            {
              metric: "0",
              label: "Lunar- or Mars-gravity measurements",
              note: "The gap is in the archive, not only in this interface.",
              tone: "text-ink",
            },
          ].map((item, index) => (
            <div
              key={item.label}
              className="bg-panel p-6"
            >
              <div className={`font-mono text-[26px] leading-none tracking-[-0.04em] ${item.tone}`}>
                {item.metric}
              </div>
              <div className="mt-3 text-[14px] font-medium text-ink">{item.label}</div>
              <p className="mt-2 text-[14px] leading-5 text-faint">{item.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <DataNote>
            The map deliberately separates what was measured from what was inferred.
            E-FIELD appears only as an analog; it is not plotted in the partial-gravity
            lane.
          </DataNote>
        </div>
      </section>

      {/* Evidence classes */}
      <section className="border-b border-line bg-panel">
        <TickRule />
        <div className="mx-auto max-w-[1200px] px-6 py-20 lg:px-10 lg:py-24">
          <SectionHeading
            index="01"
            kicker="Evidence classes"
            title="Four kinds of support. Only one is a measurement."
            body="A source can be direct evidence, a normal-gravity comparison, an analog, or simply absent. Collapsing those categories is how an unsupported claim gets made."
          />

          <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-2 xl:grid-cols-4">
            {CLASSES.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.key}
                  className={cn(
                    "flex flex-col bg-panel p-5",
                    item.key === "gap" ? "bg-flame/[0.02]" : "",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center border",
                        item.tone === "moss"
                          ? "border-moss/25 bg-moss/[0.06] text-moss"
                          : item.tone === "ice"
                            ? "border-ice/25 bg-ice/[0.06] text-ice"
                            : item.tone === "violet"
                              ? "border-violet/25 bg-violet/[0.06] text-violet"
                              : "border-flame/30 bg-flame/[0.07] text-flame",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </span>
                    <Badge tone={item.tone}>{item.label}</Badge>
                  </div>
                  <div className="mt-5">
                    <div
                      className={cn(
                        "font-mono text-[28px] leading-none tracking-[-0.04em]",
                        item.tone === "moss"
                          ? "text-moss"
                          : item.tone === "ice"
                            ? "text-ice"
                            : item.tone === "violet"
                              ? "text-violet"
                              : "text-flame",
                      )}
                    >
                      {item.count}
                    </div>
                    <div className="mt-1.5 text-[15px] text-faint">
                      {item.detail}
                    </div>
                  </div>
                  <p className="mt-4 text-[14px] leading-5 text-muted">{item.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Inventory */}
      <section id="inventory" className="mx-auto max-w-[1200px] scroll-mt-24 px-6 py-20 lg:px-10 lg:py-24">
        <SectionHeading
          index="02"
          kicker="Point inventory"
          title="Fourteen points. Every one traceable."
          body="Filter by material phase and gravity class, sort by oxygen or row count, and open the underlying investigation. The pressure and oxygen values are computed from the published summary tables."
          action={
            <Link
              href="/investigations"
              className="text-[15px] text-muted transition-colors hover:text-ink"
            >
              Browse all 24 records →
            </Link>
          }
        />

        <div className="mt-8">
          <EvidenceInventory points={evidencePoints} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(["solid", "liquid", "gas"] as const).map((phase) => (
            <span
              key={phase}
              className="inline-flex items-center gap-1.5 border border-line px-2 py-1 text-[15px] text-faint"
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: PHASE_COLOR[phase] }}
              />
              {phaseLabel(phase)}
            </span>
          ))}
          <span className="text-[15px] text-faint">
            {formatNumber(stats.tableRows)} normalized rows · 22 experimental tables
          </span>
        </div>
      </section>

      {/* What would change the answer */}
      <section className="border-b border-line bg-panel">
        <TickRule />
        <div className="mx-auto max-w-[1200px] px-6 py-20 lg:px-10 lg:py-24">
          <SectionHeading
            index="03"
            kicker="Falsifiability"
            title="What would change the answer."
            body="A limitation is only useful if it names the evidence that could resolve it. These are the missing observations that would move a claim from analogy to measurement."
          />

          <div className="mt-8 border-t border-line">
            {CHANGE_CONDITIONS.map((condition, index) => (
              <div
                key={condition.title}
                className="grid gap-3 border-b border-line py-5 sm:grid-cols-[48px_1fr_150px] sm:items-start sm:gap-6"
              >
                <span className="font-mono text-[14px] text-flame">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-[14px] text-ink">{condition.title}</h3>
                  <p className="mt-1.5 max-w-3xl text-[14px] leading-5 text-muted">
                    {condition.detail}
                  </p>
                </div>
                <div className="sm:text-right">
                  <Badge tone={condition.status === "Partial" ? "ice" : "flame"}>
                    {condition.status} in snapshot
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <DataNote>
              “Would change the answer” is a statement about this snapshot, not a claim
              that such experiments do not exist anywhere. It means they are not in the 24
              PSI combustion investigations indexed here.
            </DataNote>
          </div>
        </div>
      </section>

      {/* Scenarios */}
      <section className="mx-auto max-w-[1200px] px-6 py-20 lg:px-10 lg:py-24">
        <SectionHeading
          index="04"
          kicker="Scenario readiness"
          title="Read the status before the number."
          body="The same archive supports a spacecraft-cabin question differently than a lunar-habitat question. Each scenario carries its own evidence class."
        />

        <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-line lg:grid-cols-3">
          {scenarios.map((scenario) => {
            const direct = scenario.statusKey === "direct";
            return (
              <article
                key={scenario.id}
                id={scenario.id}
                className={cn(
                  "scroll-mt-24 bg-panel p-5",
                  direct ? "" : "bg-flame/[0.02]",
                )}
              >
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
                <div className="mt-2 text-[15px] text-faint">
                  Target · {scenario.target}
                </div>
                <p className="mt-4 text-[14px] leading-5 text-muted">{scenario.summary}</p>
                <div className="mt-5 flex flex-wrap gap-1.5 border-t border-line pt-4">
                  {scenario.evidence.slice(0, 5).map((id) => {
                    const record = getInvestigation(id);
                    return (
                      <Link
                        key={id}
                        href={`/investigations/${id}`}
                        className="border border-line px-1.5 py-1 text-[15px] text-muted transition-colors hover:border-line-strong hover:text-ink"
                      >
                        {record?.acronym ?? id}
                      </Link>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <p className="max-w-2xl text-[14px] leading-5 text-faint">
            Lunar and Mars statuses are classified as analogical plus gap because no
            direct partial-gravity combustion measurement exists in this snapshot. That is
            a property of the evidence, not a UI hedge.
          </p>
          <Link
            href="/methodology"
            className="inline-flex items-center gap-1 text-[15px] text-muted transition-colors hover:text-flame"
          >
            Read the methodology
            <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
          </Link>
        </div>
      </section>
    </>
  );
}
