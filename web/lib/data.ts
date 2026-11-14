import investigationsData from "@/data/investigations.json";
import evidencePointsData from "@/data/evidence_points.json";
import documentsData from "@/data/documents.json";
import statsData from "@/data/stats.json";
import insightsData from "@/data/insights.json";
import scenariosData from "@/data/scenarios.json";
import manifestData from "@/data/manifest.json";
import type {
  CompactInvestigation,
  EvidencePoint,
  Insight,
  Investigation,
  Manifest,
  O2Summary,
  PsiDocument,
  Scenario,
  Stats,
} from "@/lib/types";

export const investigations = investigationsData as unknown as Investigation[];
export const evidencePoints = evidencePointsData as unknown as EvidencePoint[];
export const documents = documentsData as unknown as PsiDocument[];
export const stats = statsData as unknown as Stats;
export const insights = insightsData as unknown as Insight[];
export const scenarios = scenariosData as unknown as Scenario[];
export const manifest = manifestData as unknown as Manifest;

export const investigationById = new Map(investigations.map((item) => [item.id, item]));
export const evidenceByInvestigation = new Map<string, EvidencePoint[]>();
for (const point of evidencePoints) {
  const list = evidenceByInvestigation.get(point.investigationId) ?? [];
  list.push(point);
  evidenceByInvestigation.set(point.investigationId, list);
}

export function getInvestigation(id: string): Investigation | undefined {
  return investigationById.get(id);
}

export function getEvidence(id: string): EvidencePoint[] {
  return evidenceByInvestigation.get(id) ?? [];
}

export function getDocuments(id: string): PsiDocument[] {
  return documents.filter((doc) => doc.investigationId === id);
}

export function getScenario(id: string): Scenario | undefined {
  return scenarios.find((scenario) => scenario.id === id);
}

export function comparisonPoints(): EvidencePoint[] {
  return evidencePoints.filter(
    (point) => point.o2 !== null && point.gravity !== "partial_gravity_analog" && !point.isSummaryTable,
  );
}

export function compactInvestigations(): CompactInvestigation[] {
  return investigations.map((item) => {
    const o2Points = evidencePoints.filter(
      (point) => point.investigationId === item.id && point.o2 !== null,
    );
    const o2 = o2Points.length
      ? {
          min: Math.min(...o2Points.map((point) => point.o2!.min)),
          max: Math.max(...o2Points.map((point) => point.o2!.max)),
          median: o2Points[0].o2!.median,
          n: o2Points.reduce((sum, point) => sum + point.o2!.n, 0),
          basis: o2Points[0].o2!.basis,
          approximate: o2Points.some((point) => point.o2!.approximate),
          unit: "%",
        }
      : null;
    const searchText = [
      item.id,
      item.title,
      item.acronym,
      item.subResearchArea,
      item.hardware,
      item.summary,
      item.objective,
      ...item.tables.flatMap((table) => table.fuelValues),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return {
      id: item.id,
      title: item.title,
      acronym: item.acronym,
      kind: item.kind,
      kindLabel: item.kindLabel,
      subResearchArea: item.subResearchArea,
      gravity: item.gravity,
      analog: item.analog,
      summary: item.summary,
      objective: item.objective,
      o2,
      phases: Array.from(
        new Set(item.tables.map((table) => table.phase).filter((phase): phase is string => Boolean(phase))),
      ),
      tableCount: item.tableCount,
      publicationCount: item.publicationCount,
      rawFileCount: item.rawFileCount,
      doi: item.doi,
      image: item.image,
      searchText,
    };
  });
}

export function formatO2(
  o2: Pick<O2Summary, "min" | "max" | "approximate"> | null | undefined,
  compact = false,
): string {
  if (!o2) return "Not reported";
  const format = (value: number) =>
    Number.isInteger(value)
      ? value.toString()
      : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  const min = format(o2.min);
  const max = format(o2.max);
  if (o2.min === o2.max) {
    return `${o2.approximate ? "~" : ""}${min}%`;
  }
  if (compact) return `${min}–${max}%`;
  const approx = o2.approximate ? "~" : "";
  return `${approx}${min}–${max}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatBytes(value: number | null | undefined): string {
  if (!value) return "Not reported";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let index = 0;
  let amount = value;
  while (amount >= 1024 && index < units.length - 1) {
    amount /= 1024;
    index += 1;
  }
  return `${amount.toFixed(amount >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export function shortDate(value: string | null | undefined): string {
  if (!value) return "Not reported";
  return value;
}

export function phaseLabel(phase: string | null | undefined): string {
  switch (phase) {
    case "solid":
      return "Solid";
    case "liquid":
      return "Liquid";
    case "gas":
      return "Gas";
    case "aerosol":
      return "Aerosol";
    default:
      return "Not classified";
  }
}

export function scenarioStatusLabel(key: string): string {
  if (key === "direct") return "Direct evidence";
  if (key === "gap") return "Analogical + gap";
  return "Evidence";
}
