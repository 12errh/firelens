export interface O2Summary {
  min: number;
  max: number;
  median: number;
  n: number;
  basis: string | null;
  approximate: boolean;
  unit: string;
}

export interface PressureSummary {
  min: number;
  max: number;
  median: number;
  n: number;
  unit: string;
}

export interface ParsedRow {
  row: number;
  o2: (O2Summary & { raw?: string; column?: string; row?: number }) | null;
  pressureAtm: number | null;
  fuel: string | null;
  outcome: string | null;
}

export interface ExperimentalTable {
  id: string;
  investigationId: string;
  name: string;
  fileName: string;
  sourceTable: string;
  rowCount: number;
  columns: string[];
  phase: string | null;
  o2: O2Summary | null;
  pressure: PressureSummary | null;
  fuelValues: string[];
  malformedO2: string[];
  preview: Record<string, string>[];
  rows: ParsedRow[];
  rowsTruncated: boolean;
  description: string | null;
  version: number | null;
  downloadUrl: string;
}

export interface Publication {
  title: string;
  authors: string;
  doi: string | null;
  doiUrl: string | null;
  pubmedId: string | null;
}

export interface Contact {
  name: string;
  roles: string[];
  email: string | null;
}

export interface InvestigationImage {
  src: string;
  alt: string;
  credit: string;
}

export interface Investigation {
  id: string;
  accession: string;
  title: string;
  acronym: string | null;
  kind: "flight" | "ground" | "analysis";
  kindLabel: string;
  projectType: string | null;
  flightProgram: string | null;
  spaceProgram: string | null;
  researchArea: string | null;
  subResearchArea: string | null;
  hardware: string | null;
  hardwareLink: string | null;
  startDate: string | null;
  endDate: string | null;
  releaseDate: string | null;
  doi: string | null;
  doiUrl: string | null;
  license: string | null;
  licenseId: string | null;
  licenseUrl: string | null;
  objective: string | null;
  approach: string | null;
  hypothesis: string | null;
  impacts: string | null;
  summary: string | null;
  publications: Publication[];
  publicationCount: number;
  contacts: Contact[];
  tables: ExperimentalTable[];
  tableCount: number;
  gravity: "microgravity" | "normal_gravity";
  gravityTags: string[];
  analog: boolean;
  image: InvestigationImage | null;
  fileCounts: Record<string, number>;
  rawFileCount: number;
  reportCount: number;
  scienceDocCount: number;
  totalFileSize: number | null;
  psiUrl: string;
  apiUrl: string;
  snapshotDate: string;
}

export interface EvidencePoint {
  id: string;
  investigationId: string;
  label: string;
  shortLabel: string;
  gravity: "microgravity" | "normal_gravity" | "partial_gravity_analog";
  gravityLabel: string;
  phase: string | null;
  o2: O2Summary | null;
  pressure: PressureSummary | null;
  rows: number;
  fuel: string | null;
  sourceTable: string | null;
  analog: boolean;
  isSummaryTable: boolean;
  note?: string;
}

export interface Stats {
  snapshotDate: string;
  sourceSearch: string;
  psiSearchPage: string;
  investigations: number;
  flightInvestigations: number;
  groundInvestigations: number;
  analysisInvestigations: number;
  flightIds: string[];
  groundIds: string[];
  analysisIds: string[];
  experimentalTables: number;
  tablesWithO2: number;
  tableRows: number;
  reports: number;
  scienceDocuments: number;
  documentsIndexed: number;
  tabularDocuments: number;
  rawFiles: number;
  publications: number;
  partialGravityDatasets: number;
  partialGravityAnalogInvestigations: string[];
  byKind: { label: string; value: number }[];
  bySubarea: { label: string; value: number }[];
  byLicense: { label: string; value: number }[];
  o2: {
    overallMax: number;
    solidMax: number;
    solidMaxId: string | null;
    liquidMax: number;
    liquidMaxId: string | null;
    gasMax: number;
    gasMaxId: string | null;
    solidAt30Count: number;
    liquidAt30Count: number;
    gasAt30Count: number;
    lunarBandCount: number;
    lunarBandIds: string[];
    solidMaxRows: number;
  };
  evidencePoints: number;
}

export interface InsightSource {
  id: string;
  label: string;
  title: string;
  doi: string | null;
  url: string;
}

export interface Insight {
  id: string;
  kind: string;
  metric: string;
  unit: string;
  title: string;
  statement: string;
  detail: string;
  sources: InsightSource[];
  severity: string;
}

export interface Scenario {
  id: "spacecraft" | "lunar" | "mars";
  label: string;
  gravity: string;
  target: string;
  status: string;
  statusKey: string;
  summary: string;
  evidence: string[];
}

export interface PsiDocument {
  id: string;
  investigationId: string;
  title: string;
  fileName: string;
  category: string;
  sizeBytes: number | null;
  path: string;
}

export interface Manifest {
  name: string;
  snapshotDate: string;
  generatedAt: string;
  source: string;
  sourceSearch: string;
  psiSearchPage: string;
  license: string;
  disclaimer: string;
  counts: Record<string, number>;
  dataRules: string[];
}

export interface CompactInvestigation {
  id: string;
  title: string;
  acronym: string | null;
  kind: Investigation["kind"];
  kindLabel: string;
  subResearchArea: string | null;
  gravity: Investigation["gravity"];
  analog: boolean;
  summary: string | null;
  objective: string | null;
  o2: O2Summary | null;
  phases: string[];
  tableCount: number;
  publicationCount: number;
  rawFileCount: number;
  doi: string | null;
  image: InvestigationImage | null;
  searchText: string;
}
