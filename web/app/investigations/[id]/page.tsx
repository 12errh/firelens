import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Database,
  Fingerprint,
  FlaskConical,
  Layers,
  Mail,
  ShieldAlert,
} from "lucide-react";
import type { Investigation, Scenario } from "@/lib/types";
import {
  formatBytes,
  formatNumber,
  formatO2,
  getEvidence,
  getInvestigation,
  investigationById,
  investigations,
  phaseLabel,
  scenarios,
} from "@/lib/data";
import { TablePreview } from "@/components/table-preview";
import { InvestigationCard } from "@/components/investigation-card";
import { Badge, DataNote, Field, SectionHeading } from "@/components/ui";
import { PHASE_COLOR } from "@/lib/tokens";
import { cn } from "@/lib/cn";


const PHASE_TONE: Record<string, "flame" | "ice" | "violet" | "neutral"> = {
  solid: "flame",
  liquid: "ice",
  gas: "violet",
  aerosol: "neutral",
};

export function generateStaticParams() {
  return investigations.map((investigation) => ({ id: investigation.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const investigation = getInvestigation(id);
  if (!investigation) return { title: "Investigation not found" };

  const label = investigation.acronym ?? investigation.title;
  return {
    title: `${label} (${investigation.id})`,
    description:
      investigation.summary ??
      `NASA PSI combustion investigation ${investigation.id}: ${investigation.title}.`,
  };
}

function o2Envelope(investigation: Investigation) {
  const tables = investigation.tables.filter((table) => table.o2);
  if (!tables.length) return null;
  const min = Math.min(...tables.map((table) => table.o2!.min));
  const max = Math.max(...tables.map((table) => table.o2!.max));
  return {
    min,
    max,
    approximate: tables.some((table) => table.o2!.approximate),
    unit: "%",
    n: tables.reduce((sum, table) => sum + table.o2!.n, 0),
  };
}

function pressureEnvelope(investigation: Investigation) {
  const tables = investigation.tables.filter((table) => table.pressure);
  if (!tables.length) return null;
  return {
    min: Math.min(...tables.map((table) => table.pressure!.min)),
    max: Math.max(...tables.map((table) => table.pressure!.max)),
  };
}

function numericAccession(value: string) {
  return Number(value.replace(/\D/g, "")) || 0;
}

function relatedInvestigations(investigation: Investigation) {
  const sharedPhases = new Set(
    investigation.tables.map((table) => table.phase).filter(Boolean),
  );

  return investigations
    .filter((candidate) => candidate.id !== investigation.id)
    .map((candidate) => {
      let score = 0;
      if (
        investigation.subResearchArea &&
        candidate.subResearchArea === investigation.subResearchArea
      ) {
        score += 3;
      }
      if (candidate.kind === investigation.kind) score += 1;
      if (candidate.gravity === investigation.gravity) score += 0.5;
      if (candidate.tables.some((table) => sharedPhases.has(table.phase))) score += 1.5;
      return { candidate, score };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        numericAccession(a.candidate.id) - numericAccession(b.candidate.id),
    )
    .slice(0, 3)
    .map((item) => item.candidate);
}

function displayDate(value: string | null | undefined) {
  return value && value.trim().length ? value : "Not reported";
}

function ScenarioBadge({ scenario }: { scenario: Scenario }) {
  const direct = scenario.statusKey === "direct";
  return (
    <Link
      href={`/evidence#${scenario.id}`}
      className={cn(
        "group flex items-center justify-between gap-3 border px-3 py-2.5 transition-colors",
        direct
          ? "border-moss/25 bg-moss/[0.04] hover:border-moss/45"
          : "border-flame/20 bg-flame/[0.035] hover:border-flame/40",
      )}
    >
      <div>
        <div className="text-[14px] text-ink">{scenario.label}</div>
        <div className="mt-0.5 text-[15px] text-faint">
          {scenario.gravity} · {scenario.target}
        </div>
      </div>
      <span
        className={cn(
          "shrink-0 text-[14px]",
          direct ? "text-moss" : "text-flame",
        )}
      >
        {scenario.status}
      </span>
    </Link>
  );
}

export default async function InvestigationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const investigation = getInvestigation(id);
  if (!investigation) notFound();

  const evidence = getEvidence(investigation.id);
  const o2 = o2Envelope(investigation);
  const pressure = pressureEnvelope(investigation);
  const linkedScenarios = scenarios.filter((scenario) =>
    scenario.evidence.includes(investigation.id),
  );
  const related = relatedInvestigations(investigation);
  const ordered = [...investigations].sort(
    (a, b) => numericAccession(a.id) - numericAccession(b.id),
  );
  const index = ordered.findIndex((item) => item.id === investigation.id);
  const previous = index > 0 ? ordered[index - 1] : null;
  const next = index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : null;

  const briefs = [
    { label: "Objective", value: investigation.objective },
    { label: "Approach", value: investigation.approach },
    { label: "Hypothesis", value: investigation.hypothesis },
    { label: "Impacts", value: investigation.impacts },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value?.trim()));

  const visiblePublications = investigation.publications.slice(0, 6);
  const remainingPublications = investigation.publications.slice(6);
  const fileEntries = Object.entries(investigation.fileCounts).sort(
    (a, b) => b[1] - a[1],
  );
  const hasO2 = Boolean(o2);

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-line">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-3 lg:px-10">
          <Link
            href="/investigations"
            className="inline-flex items-center gap-2 text-[15px] text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-3 w-3" strokeWidth={1.5} />
            All investigations
          </Link>
          <span className="text-[15px] text-faint">
            {investigation.id} · {investigation.kindLabel}
          </span>
        </div>
      </div>

      {/* Hero */}
      <header className="relative border-b border-line">
        <div className="pointer-events-none absolute inset-0 grid-field opacity-40" />
        <div className="relative mx-auto max-w-[1200px] px-6 pb-10 pt-10 lg:px-10 sm:pb-12 sm:pt-14">
          <div className="grid gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:gap-14">
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge tone="neutral">{investigation.kindLabel}</Badge>
                {investigation.tables.map((table) =>
                  table.phase ? (
                    <Badge key={`${table.id}-phase`} tone={PHASE_TONE[table.phase] ?? "neutral"}>
                      {phaseLabel(table.phase)}
                    </Badge>
                  ) : null,
                )}
                <Badge tone={investigation.gravity === "microgravity" ? "ice" : "neutral"}>
                  {investigation.gravity === "microgravity" ? "Microgravity" : "Normal gravity"}
                </Badge>
                {investigation.analog ? <Badge tone="violet">Analog</Badge> : null}
              </div>

              <div className="mt-6 text-[15px] text-faint">
                {investigation.id}
                {investigation.subResearchArea ? ` · ${investigation.subResearchArea}` : ""}
              </div>

              <h1
                className={cn(
                  "mt-3 max-w-[760px] text-balance font-medium leading-[1.02] tracking-[-0.04em] text-ink",
                  investigation.title.length > 70
                    ? "text-[32px] sm:text-[42px]"
                    : "text-[36px] sm:text-[50px]",
                )}
              >
                {investigation.acronym ?? investigation.title}
              </h1>

              {investigation.acronym ? (
                <p className="mt-3 max-w-[680px] text-[16px] leading-6 text-muted sm:text-[18px]">
                  {investigation.title}
                </p>
              ) : null}

              <p className="mt-5 max-w-[640px] text-pretty text-[14px] leading-6 text-muted">
                {investigation.summary ??
                  "No plain-language summary is published for this record in the PSI snapshot. The research brief below is reproduced from the source metadata."}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
                <div className="bg-panel px-4 py-3.5">
                  <div className="label text-[14px]">O₂ range</div>
                  <div className="mt-1.5 font-mono text-[16px] tabular text-ink">
                    {formatO2(o2)}
                  </div>
                  <div className="mt-1 text-[15px] text-faint">
                    {hasO2 ? `initial · n=${o2?.n}` : "not reported"}
                  </div>
                </div>
                <div className="bg-panel px-4 py-3.5">
                  <div className="label text-[14px]">Pressure</div>
                  <div className="mt-1.5 font-mono text-[16px] tabular text-ink">
                    {pressure
                      ? `${pressure.min.toFixed(2)}–${pressure.max.toFixed(2)}`
                      : "—"}
                  </div>
                  <div className="mt-1 text-[15px] text-faint">
                    {pressure ? "atm" : "not reported"}
                  </div>
                </div>
                <div className="bg-panel px-4 py-3.5">
                  <div className="label text-[14px]">Tables</div>
                  <div className="mt-1.5 font-mono text-[16px] tabular text-ink">
                    {investigation.tableCount}
                  </div>
                  <div className="mt-1 text-[15px] text-faint">
                    {formatNumber(
                      investigation.tables.reduce((sum, table) => sum + table.rowCount, 0),
                    )}{" "}
                    rows
                  </div>
                </div>
                <div className="bg-panel px-4 py-3.5">
                  <div className="label text-[14px]">Publications</div>
                  <div className="mt-1.5 font-mono text-[16px] tabular text-ink">
                    {investigation.publicationCount}
                  </div>
                  <div className="mt-1 text-[15px] text-faint">
                    Metadata records
                  </div>
                </div>
              </div>
            </div>

            {/* Oxygen envelope */}
            <div className="panel self-start overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="label text-[14px] text-ink">Oxygen envelope</span>
                  <span className="text-[15px] text-faint">
                    tabulated
                  </span>
                </div>
                <span className="text-[15px] text-faint">
                  {investigation.tables.length}{" "}
                  {investigation.tables.length === 1 ? "table" : "tables"}
                </span>
              </div>

              <div className="space-y-5 p-4 sm:p-5">
                {investigation.tables.length ? (
                  investigation.tables.map((table) => {
                    const color = PHASE_COLOR[table.phase ?? "aerosol"] ?? PHASE_COLOR.aerosol;
                    return (
                      <div key={table.id}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-[14px] text-ink" title={table.name}>
                              {table.name}
                            </div>
                            <div className="mt-0.5 text-[15px] text-faint">
                              {phaseLabel(table.phase)} · {table.rowCount} rows
                            </div>
                          </div>
                          <span className="shrink-0 font-mono text-[14px] tabular text-ink">
                            {formatO2(table.o2)}
                          </span>
                        </div>
                        <div className="relative mt-2.5 h-2 bg-panel-2">
                          <div
                            className="absolute top-0 z-10 h-full border-l border-dashed border-flame/80"
                            style={{ left: "30%" }}
                            title="Lunar habitat threshold: 30% O₂"
                          />
                          {table.o2 ? (
                            <div
                              className="absolute inset-y-0 border-x"
                              style={{
                                left: `${table.o2.min}%`,
                                width: `${Math.max(table.o2.max - table.o2.min, 0.8)}%`,
                                backgroundColor: `color-mix(in srgb, ${color} 26%, transparent)`,
                                borderColor: color,
                              }}
                            />
                          ) : (
                            <div className="absolute inset-y-0 left-0 right-0 bg-[repeating-linear-gradient(135deg,transparent,transparent_4px,rgba(24,24,20,0.05)_4px,rgba(24,24,20,0.05)_8px)]" />
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center border border-dashed border-line px-4 py-10 text-center">
                    <FlaskConical className="h-5 w-5 text-faint" strokeWidth={1.25} />
                    <p className="mt-3 text-[14px] text-ink">No summary table published</p>
                    <p className="mt-1 max-w-[240px] text-[14px] leading-5 text-faint">
                      This is a modeling or analysis record without a normalized
                      experimental table in the snapshot.
                    </p>
                  </div>
                )}

                <div className="flex justify-between border-t border-line pt-2.5 text-[15px] text-faint">
                  <span>0%</span>
                  <span className="text-flame/80">30% lunar target</span>
                  <span>100%</span>
                </div>

                <p className="text-[14px] leading-5 text-faint">
                  Ranges reflect initial or ambient oxygen conditions. Final-oxygen readings
                  are excluded because they can reflect transient combustion products.
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-12 lg:px-10 lg:py-16 lg:grid-cols-[minmax(0,1fr)_330px] lg:gap-12">
        <div className="min-w-0">
          {investigation.image ? (
            <figure className="mb-10 overflow-hidden border border-line bg-panel">
              <div className="relative aspect-[16/7] bg-black">
                <Image
                  src={investigation.image.src}
                  alt={investigation.image.alt}
                  width={1600}
                  height={700}
                  className="h-full w-full object-cover opacity-90"
                  sizes="(max-width: 1024px) 100vw, 840px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              </div>
              <figcaption className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-[15px] text-faint">
                <span>{investigation.image.credit}</span>
                <span>{investigation.id} · representative image</span>
              </figcaption>
            </figure>
          ) : null}

          {/* Research brief */}
          <section aria-labelledby="brief-heading">
            <SectionHeading
              index="01"
              kicker="Research brief"
              title={<span id="brief-heading">What the investigators set out to test.</span>}
              body="Reproduced from PSI metadata. Formatting and capitalization are preserved; no claims have been added."
            />

            {briefs.length ? (
              <div className="mt-7 space-y-7">
                {briefs.map((brief) => (
                  <div key={brief.label} className="border-t border-line pt-4">
                    <h3 className="label text-[14px] text-ink">{brief.label}</h3>
                    <p className="mt-2.5 max-w-[72ch] whitespace-pre-line text-[14px] leading-6 text-muted">
                      {brief.value}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="panel mt-7 px-6 py-8 text-[14px] leading-5 text-muted">
                No narrative research brief is published for this record in the PSI
                snapshot.
              </div>
            )}
          </section>

          {/* Tables */}
          <section id="tables" aria-labelledby="tables-heading" className="mt-12 scroll-mt-24">
            <SectionHeading
              index="02"
              kicker={`Experimental tables · ${investigation.tableCount}`}
              title={<span id="tables-heading">The source tables behind the numbers.</span>}
              body="Preview the reported conditions directly. Column names, units, blank cells, ranges, and malformed values are preserved from the published CSV."
            />
            <div className="mt-7">
              <TablePreview tables={investigation.tables} />
            </div>
            {investigation.tables.some((table) => table.malformedO2.length) ? (
              <div className="mt-3">
                <DataNote>
                  Malformed oxygen strings were excluded from normalized ranges and are
                  listed above. They were not silently corrected.
                </DataNote>
              </div>
            ) : null}
          </section>

          {/* Publications */}
          <section
            id="publications"
            aria-labelledby="publications-heading"
            className="mt-12 scroll-mt-24"
          >
            <SectionHeading
              index="03"
              kicker={`Publications · ${investigation.publicationCount}`}
              title={
                <span id="publications-heading">Peer-reviewed context, linked by DOI.</span>
              }
              body="Bibliographic metadata from PSI. These publications are not ingested into the evidence layer; they provide interpretation and experimental context."
            />

            {investigation.publications.length ? (
              <div className="mt-7 border-t border-line">
                {visiblePublications.map((publication, publicationIndex) => (
                  <article
                    key={`${publication.doi ?? publication.title}-${publicationIndex}`}
                    className="grid gap-2 border-b border-line py-4 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-6"
                  >
                    <div>
                      <h3 className="text-[14px] leading-5 text-ink">{publication.title}</h3>
                      {publication.authors ? (
                        <p className="mt-1 text-[14px] leading-5 text-faint">
                          {publication.authors}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {publication.doiUrl ? (
                        <a
                          href={publication.doiUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 border border-line px-2 py-1.5 text-[15px] text-faint transition-colors hover:border-line-strong hover:text-ink"
                        >
                          DOI
                          <ArrowUpRight className="h-2.5 w-2.5" strokeWidth={1.5} />
                        </a>
                      ) : publication.pubmedId ? (
                        <a
                          href={`https://pubmed.ncbi.nlm.nih.gov/${publication.pubmedId}/`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 border border-line px-2 py-1.5 text-[15px] text-faint transition-colors hover:border-line-strong hover:text-ink"
                        >
                          PubMed
                          <ArrowUpRight className="h-2.5 w-2.5" strokeWidth={1.5} />
                        </a>
                      ) : (
                        <span className="text-[15px] text-faint">
                          No link
                        </span>
                      )}
                    </div>
                  </article>
                ))}

                {remainingPublications.length ? (
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-[15px] text-muted transition-colors hover:text-ink">
                      <span>Show {remainingPublications.length} more publications</span>
                      <span className="text-faint transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <div className="border-t border-line">
                      {remainingPublications.map((publication, publicationIndex) => (
                        <article
                          key={`${publication.doi ?? publication.title}-extra-${publicationIndex}`}
                          className="grid gap-2 border-b border-line py-4 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-6"
                        >
                          <div>
                            <h3 className="text-[14px] leading-5 text-ink">
                              {publication.title}
                            </h3>
                            {publication.authors ? (
                              <p className="mt-1 text-[14px] leading-5 text-faint">
                                {publication.authors}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {publication.doiUrl ? (
                              <a
                                href={publication.doiUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 border border-line px-2 py-1.5 text-[15px] text-faint transition-colors hover:border-line-strong hover:text-ink"
                              >
                                DOI
                                <ArrowUpRight className="h-2.5 w-2.5" strokeWidth={1.5} />
                              </a>
                            ) : publication.pubmedId ? (
                              <a
                                href={`https://pubmed.ncbi.nlm.nih.gov/${publication.pubmedId}/`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 border border-line px-2 py-1.5 text-[15px] text-faint transition-colors hover:border-line-strong hover:text-ink"
                              >
                                PubMed
                                <ArrowUpRight className="h-2.5 w-2.5" strokeWidth={1.5} />
                              </a>
                            ) : (
                              <span className="text-[15px] text-faint">
                                No link
                              </span>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  </details>
                ) : null}
              </div>
            ) : (
              <div className="panel mt-7 px-6 py-8 text-[14px] leading-5 text-muted">
                No publications are indexed for this record in the snapshot.
              </div>
            )}
          </section>

          {/* Reading caveats */}
          <section className="mt-12 border-t border-line pt-6">
            <div className="flex gap-3">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-flame" strokeWidth={1.5} />
              <div>
                <h2 className="label text-[14px] text-ink">Read with care</h2>
                <ul className="mt-2.5 space-y-2 text-[14px] leading-5 text-muted">
                  {hasO2 ? (
                    <li>
                      Reported oxygen values are table conditions, not a general
                      flammability limit for the material or fuel.
                    </li>
                  ) : null}
                  {investigation.analog ? (
                    <li className="text-violet/90">
                      This record is classified as a partial-gravity analog. Electric fields
                      substitute for buoyancy; this is not a lunar- or Mars-gravity
                      measurement.
                    </li>
                  ) : null}
                  {!hasO2 ? (
                    <li>
                      This record reports no oxygen concentration in its summary table.
                      Absence of a value is shown as “not reported,” never as zero.
                    </li>
                  ) : null}
                  {!investigation.licenseId ? (
                    <li>
                      PSI does not state a license for this record. Do not reuse its
                      material as CC0 without checking the source.
                    </li>
                  ) : null}
                  <li>
                    Every value shown here is traceable to the PSI snapshot and the linked
                    source CSV. Missing values remain missing.
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-[86px] lg:self-start">
          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <span className="flex items-center gap-2 label text-[14px] text-ink">
                <Fingerprint className="h-3 w-3 text-flame" strokeWidth={1.5} />
                Record profile
              </span>
              <span className="text-[15px] text-faint">
                PSI
              </span>
            </div>
            <div className="grid gap-4 p-4">
              <Field label="Accession">{investigation.id}</Field>
              <Field label="Type">
                {investigation.kindLabel}
                {investigation.projectType ? (
                  <span className="block text-[14px] text-faint">
                    {investigation.projectType}
                  </span>
                ) : null}
              </Field>
              <Field label="Gravity environment">
                {investigation.gravity === "microgravity"
                  ? "Microgravity"
                  : "Normal gravity"}
                {investigation.analog ? (
                  <span className="block text-[14px] text-violet">
                    Partial-gravity analog
                  </span>
                ) : null}
              </Field>
              {investigation.subResearchArea ? (
                <Field label="Subarea">{investigation.subResearchArea}</Field>
              ) : null}
              {investigation.hardware ? (
                <Field label="Hardware">
                  {investigation.hardwareLink ? (
                    <a
                      href={investigation.hardwareLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-ice transition-colors hover:text-ink"
                    >
                      {investigation.hardware}
                      <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
                    </a>
                  ) : (
                    investigation.hardware
                  )}
                </Field>
              ) : null}
              <Field label="Flight program">
                {displayDate(investigation.flightProgram)}
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Start">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3 w-3 text-faint" strokeWidth={1.5} />
                    {displayDate(investigation.startDate)}
                  </span>
                </Field>
                <Field label="End">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3 w-3 text-faint" strokeWidth={1.5} />
                    {displayDate(investigation.endDate)}
                  </span>
                </Field>
              </div>
              <Field label="Released">
                {displayDate(investigation.releaseDate)}
              </Field>
              <Field label="DOI">
                {investigation.doiUrl ? (
                  <a
                    href={investigation.doiUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 break-all font-mono text-[14px] text-ice transition-colors hover:text-ink"
                  >
                    {investigation.doi}
                    <ArrowUpRight className="h-3 w-3 shrink-0" strokeWidth={1.5} />
                  </a>
                ) : (
                  "Not reported"
                )}
              </Field>
              <Field label="License">
                {investigation.licenseId ? (
                  <a
                    href={investigation.licenseUrl ?? undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-ice transition-colors hover:text-ink"
                  >
                    {investigation.licenseId}
                    <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
                  </a>
                ) : (
                  <span className="text-amber-200/80">Not stated in PSI</span>
                )}
              </Field>
            </div>
          </div>

          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <span className="flex items-center gap-2 label text-[14px] text-ink">
                <Layers className="h-3 w-3 text-flame" strokeWidth={1.5} />
                Evidence points
              </span>
              <span className="text-[15px] text-faint">
                {evidence.length}
              </span>
            </div>
            <div className="divide-y divide-line">
              {evidence.length ? (
                evidence.map((point) => (
                  <a
                    key={point.id}
                    href="#tables"
                    className="flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-panel-2"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-[14px] text-ink" title={point.label}>
                        {point.label}
                      </div>
                      <div className="mt-0.5 text-[15px] text-faint">
                        {point.phase ? phaseLabel(point.phase) : "Unclassified"} ·{" "}
                        {point.rows} rows
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-[14px] tabular text-muted">
                      {formatO2(point.o2)}
                    </span>
                  </a>
                ))
              ) : (
                <p className="px-4 py-4 text-[14px] leading-5 text-faint">
                  No normalized evidence point for this record.
                </p>
              )}
            </div>
          </div>

          <div className="panel overflow-hidden">
            <div className="border-b border-line px-4 py-3">
              <span className="label text-[14px] text-ink">Scenario relevance</span>
            </div>
            <div className="grid gap-1.5 p-3">
              {linkedScenarios.length ? (
                linkedScenarios.map((scenario) => (
                  <ScenarioBadge key={scenario.id} scenario={scenario} />
                ))
              ) : (
                <p className="px-1 py-2 text-[14px] leading-5 text-faint">
                  Not used as a primary scenario record in this snapshot.
                </p>
              )}
            </div>
          </div>

          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <span className="flex items-center gap-2 label text-[14px] text-ink">
                <Database className="h-3 w-3 text-flame" strokeWidth={1.5} />
                Archive
              </span>
              <span className="text-[15px] text-faint">
                {formatBytes(investigation.totalFileSize)}
              </span>
            </div>
            <div className="divide-y divide-line">
              {fileEntries.map(([label, count]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 px-4 py-2"
                >
                  <span className="text-[14px] text-muted">{label}</span>
                  <span className="font-mono text-[14px] tabular text-ink">
                    {formatNumber(count)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-line px-4 py-3">
              <p className="text-[14px] leading-5 text-faint">
                {formatNumber(investigation.rawFileCount)} raw file entries are indexed as
                metadata. The underlying datasets were not ingested.
              </p>
            </div>
          </div>

          <div className="panel overflow-hidden">
            <div className="border-b border-line px-4 py-3">
              <span className="label text-[14px] text-ink">Source</span>
            </div>
            <div className="grid gap-2 p-4">
              <a
                href={investigation.psiUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 border border-line px-3 py-2 text-[15px] text-muted transition-colors hover:border-line-strong hover:text-ink"
              >
                PSI record
                <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
              </a>
              <a
                href={investigation.apiUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 border border-line px-3 py-2 text-[15px] text-muted transition-colors hover:border-line-strong hover:text-ink"
              >
                PSI metadata API
                <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
              </a>
              <p className="mt-1 text-[15px] text-faint">
                Snapshot · {investigation.snapshotDate}
              </p>
            </div>
          </div>

          {investigation.contacts.length ? (
            <div className="panel overflow-hidden">
              <div className="border-b border-line px-4 py-3">
                <span className="label text-[14px] text-ink">Contacts</span>
              </div>
              <div className="divide-y divide-line">
                {investigation.contacts.map((contact) => (
                  <div key={contact.name} className="px-4 py-3">
                    <div className="text-[14px] text-ink">{contact.name}</div>
                    <div className="mt-0.5 text-[15px] text-faint">
                      {contact.roles.join(" · ")}
                    </div>
                    {contact.email ? (
                      <a
                        href={`mailto:${contact.email}`}
                        className="mt-1.5 inline-flex items-center gap-1 break-all font-mono text-[14px] text-ice transition-colors hover:text-ink"
                      >
                        <Mail className="h-2.5 w-2.5 shrink-0" strokeWidth={1.5} />
                        {contact.email}
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>

      {/* Related */}
      {related.length ? (
        <section className="border-t border-line bg-panel/30">
          <div className="mx-auto max-w-[1200px] px-6 py-12 lg:px-10 sm:py-16">
            <SectionHeading
              kicker="Related records"
              title="Closest context in the snapshot."
              body="Selected by shared research subarea, fuel phase, gravity environment, and evidence type. Similarity is a reading aid, not a scientific claim."
              action={
                <Link
                  href="/investigations"
                  className="text-[15px] text-muted transition-colors hover:text-ink"
                >
                  All investigations →
                </Link>
              }
            />
            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {related.map((item) => (
                <InvestigationCard key={item.id} investigation={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Prev / next */}
      <nav
        aria-label="Investigation navigation"
        className="border-t border-line"
      >
        <div className="mx-auto grid max-w-[1200px] gap-px bg-line sm:grid-cols-2">
          {previous ? (
            <Link
              href={`/investigations/${previous.id}`}
              className="group bg-canvas px-6 py-5 transition-colors hover:bg-panel lg:px-10"
            >
              <span className="text-[15px] text-faint">
                ← Previous
              </span>
              <span className="mt-1.5 flex items-baseline gap-2 text-[14px] text-ink">
                {previous.acronym ?? previous.title}
                <span className="text-[15px] text-faint">
                  {previous.id}
                </span>
              </span>
            </Link>
          ) : (
            <div className="hidden bg-canvas sm:block" />
          )}
          {next ? (
            <Link
              href={`/investigations/${next.id}`}
              className="group bg-canvas px-6 py-5 text-right transition-colors hover:bg-panel lg:px-10"
            >
              <span className="text-[15px] text-faint">
                Next →
              </span>
              <span className="mt-1.5 flex items-baseline justify-end gap-2 text-[14px] text-ink">
                {next.acronym ?? next.title}
                <span className="text-[15px] text-faint">
                  {next.id}
                </span>
              </span>
            </Link>
          ) : (
            <div className="hidden bg-canvas sm:block" />
          )}
        </div>
      </nav>
    </>
  );
}
