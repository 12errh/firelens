import {
  evidencePoints,
  formatO2,
  insights,
  investigations,
  investigationById,
  phaseLabel,
  scenarios,
  stats,
} from "@/lib/data";
import type { Investigation } from "@/lib/types";

export type AnswerMode = "rag" | "groq" | "deterministic";
export type Confidence = "high" | "medium" | "low";

export interface ChatSource {
  id: string;
  label: string;
  title: string;
  kind: "investigation" | "document" | "methodology" | "evidence";
  url: string;
  doi?: string | null;
}

export interface ChatAnswer {
  answer: string;
  sources: ChatSource[];
  confidence: Confidence;
  limitations: string[];
  mode: AnswerMode;
}

export interface ChatRequest {
  message: string;
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";

function sourceFor(id: string): ChatSource | null {
  const record = investigationById.get(id);
  if (!record) return null;
  return {
    id: record.id,
    label: record.acronym ?? record.id,
    title: record.title,
    kind: "investigation",
    url: `/investigations/${record.id}`,
    doi: record.doi,
  };
}

function sourcesFor(ids: string[]): ChatSource[] {
  const seen = new Set<string>();
  const sources: ChatSource[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    const source = sourceFor(id);
    if (source) {
      sources.push(source);
      seen.add(id);
    }
  }
  return sources;
}

const METHODOLOGY_SOURCE: ChatSource = {
  id: "methodology",
  label: "Methodology",
  title: "Sources, normalization rules, limitations, and disclosures",
  kind: "methodology",
  url: "/methodology",
};

const EVIDENCE_SOURCE: ChatSource = {
  id: "evidence",
  label: "Evidence map",
  title: "Oxygen × gravity evidence map and point inventory",
  kind: "evidence",
  url: "/evidence",
};

function o2For(record: Investigation): string {
  const withO2 = record.tables.filter((table) => table.o2);
  if (!withO2.length) return "not reported in its summary table";
  const min = Math.min(...withO2.map((table) => table.o2!.min));
  const max = Math.max(...withO2.map((table) => table.o2!.max));
  const approximate = withO2.some((table) => table.o2!.approximate);
  return `${formatO2({ min, max, approximate })}`;
}

function pressureFor(record: Investigation): string {
  const withPressure = record.tables.filter((table) => table.pressure);
  if (!withPressure.length) return "not reported in its summary table";
  const min = Math.min(...withPressure.map((table) => table.pressure!.min));
  const max = Math.max(...withPressure.map((table) => table.pressure!.max));
  return `${min}–${max} atm`;
}

function rowsFor(phase: "solid" | "liquid" | "gas"): number {
  return evidencePoints
    .filter((point) => point.gravity === "microgravity" && point.phase === phase)
    .reduce((sum, point) => sum + point.rows, 0);
}


function recordAnswer(record: Investigation): ChatAnswer {
  const limitations = [
    "Table values are reported test conditions, not general flammability limits.",
  ];
  if (record.analog) {
    limitations.push(
      "This record is a partial-gravity analog. Electric fields substitute for buoyancy; it is not a lunar- or Mars-gravity measurement.",
    );
  }
  if (!record.tables.some((table) => table.o2)) {
    limitations.push("No oxygen concentration is reported in this record's summary table.");
  }
  if (!record.licenseId) {
    limitations.push(
      "PSI does not state a license for this record; do not reuse it as CC0 without checking the source.",
    );
  }

  const lines = [
    `${record.id} — ${record.title}${record.acronym ? ` (${record.acronym})` : ""}.`,
    "",
    `Type: ${record.kindLabel}${record.projectType ? ` (${record.projectType})` : ""}. Gravity: ${
      record.gravity === "microgravity" ? "microgravity" : "normal gravity"
    }. Subarea: ${record.subResearchArea ?? "not classified"}.`,
    `O₂: ${o2For(record)}. Pressure: ${pressureFor(record)}. Tables: ${record.tableCount}. Publications: ${record.publicationCount}.`,
  ];

  if (record.summary) {
    lines.push("", record.summary);
  }

  if (record.tables.length) {
    lines.push("", "Normalized tables:");
    for (const table of record.tables.slice(0, 5)) {
      lines.push(
        `- ${table.name}: ${phaseLabel(table.phase)}, ${table.rowCount} rows, O₂ ${formatO2(table.o2)}.`,
      );
    }
  } else {
    lines.push("", "No experimental summary table is published for this record in the snapshot.");
  }

  return {
    answer: lines.join("\n"),
    sources: sourcesFor([record.id]),
    confidence: record.tables.length ? "high" : "medium",
    limitations,
    mode: "deterministic",
  };
}

function partialGravityAnswer(includeSolid: boolean): ChatAnswer {
  const solid = stats.o2.solidMax.toFixed(1);
  const lines = [
    "No. None of the 24 Combustion Science investigations in this PSI snapshot reports a direct lunar- or Mars-gravity combustion measurement.",
    "",
    "The partial-gravity lane is empty. The only partial-gravity-related record is E-FIELD (PSI-22), which used electric fields as an analog for buoyancy-free behavior. It is not a gravity measurement, and its summary table does not report O₂.",
  ];

  if (includeSolid) {
    lines.push(
      "",
      `There is a second gap for a lunar cabin: the highest solid-material O₂ condition in the snapshot is ${solid}% (BASS-II), below the ≥30% lunar habitat band. The tests at or above 30% O₂ are gaseous or droplet experiments.`,
    );
  } else {
    lines.push(
      "",
      `A lunar-habitat claim also has to clear the oxygen gap: the highest solid-material condition is ${solid}% O₂ (BASS-II), and no solid-material table reaches 30%.`,
    );
  }

  lines.push(
    "",
    "Microgravity results cannot be linearly extrapolated to 1/6 g or 0.38 g. The archive does not contain the data needed to bound that extrapolation.",
  );

  return {
    answer: lines.join("\n"),
    sources: sourcesFor(["PSI-22", "PSI-25", "PSI-99"]),
    confidence: "high",
    limitations: [
      "No direct partial-gravity combustion dataset exists in this snapshot.",
      "E-FIELD is an analog, not a partial-gravity measurement.",
      "Absence of evidence in this snapshot is not proof that no such experiment exists anywhere.",
    ],
    mode: "deterministic",
  };
}

function solidAnswer(): ChatAnswer {
  const solidRows = rowsFor("solid");
  const solid = stats.o2.solidMax.toFixed(1);
  return {
    answer: [
      "Solid-material evidence is direct but narrow.",
      "",
      `${solidRows} microgravity test rows are normalized for solid materials across BASS-II and the SAFFIRE series. Reported oxygen stays near Earth-like levels: BASS-II 13.6–22.2%, SAFFIRE-I 21.5–21.7%, SAFFIRE-II 21.5–22.1%. SAFFIRE-III's summary table does not report O₂.`,
      "",
      `No solid-material table reaches 30% O₂. The highest is ${solid}%, so the archive can speak to ignition and flame growth near 21% O₂ — not to a 30% lunar cabin.`,
    ].join("\n"),
    sources: sourcesFor(["PSI-25", "PSI-98", "PSI-99", "PSI-100", "PSI-26"]),
    confidence: "high",
    limitations: [
      "Solid tests are microgravity only; no lunar- or Mars-gravity solid dataset exists in the snapshot.",
      "Oxygen values are test conditions, not a material flammability limit.",
      "SAFFIRE-III's summary table does not report oxygen, so it cannot be placed on the O₂ axis.",
    ],
    mode: "deterministic",
  };
}

function liquidAnswer(): ChatAnswer {
  return {
    answer: [
      "Liquid and droplet evidence is the densest part of the snapshot.",
      "",
      "FLEX (PSI-69) reports 274 rows spanning 12–34% O₂ and 0.69–3.05 atm, including CO₂ and helium dilution. FLEX-2 (PSI-68) adds 8 rows at 17–30% O₂, and CFI (PSI-39) reports 87 rows at 17–21% O₂.",
      "",
      "That supports droplet extinction and suppression research. It does not answer how a solid fabric, cable, or wall panel burns at the same oxygen level.",
    ].join("\n"),
    sources: sourcesFor(["PSI-69", "PSI-68", "PSI-39", "PSI-142", "PSI-117"]),
    confidence: "high",
    limitations: [
      "Droplet results are not transferable to solid materials without material-specific testing.",
      "FLEX-2 reports only 8 normalized rows.",
      "Oxygen ranges combine initial/ambient test conditions from summary tables.",
    ],
    mode: "deterministic",
  };
}

function gasAnswer(): ChatAnswer {
  return {
    answer: [
      "Gaseous-fuel experiments reach the highest oxygen concentrations in the snapshot.",
      "",
      "Flame Design (PSI-10) spans 19.8–40% O₂ in normal flames and 21.2–85% in inverse flames. CFI-G (PSI-159) spans 12–85% inverse and 17.97–39.97% normal. BRE (PSI-20) covers 21–40%, and s-Flame (PSI-23) reaches ~30%.",
      "",
      `Eight table points reach at least 30% O₂ — all gaseous or droplet experiments. None answers how a solid material burns in a 30% O₂ cabin.`,
    ].join("\n"),
    sources: sourcesFor(["PSI-10", "PSI-159", "PSI-20", "PSI-23"]),
    confidence: "high",
    limitations: [
      "Fuel phase changes the flammability question; gas results are not a substitute for solid-material tests.",
      "High-oxygen inverse flames are not representative of a cabin air mixture.",
      "Oxygen values are reported test conditions, not design limits.",
    ],
    mode: "deterministic",
  };
}

function spacecraftAnswer(): ChatAnswer {
  return {
    answer: [
      "The spacecraft-cabin scenario is the best supported, but not evenly.",
      "",
      "Direct microgravity tests exist for solids (BASS-II, SAFFIRE), liquids (FLEX, CFI), and gases (Flame Design, CFI-G). Most solid tests sit near 21% O₂; BASS-II spans 13.6–22.2%, and SAFFIRE-II spans 21.5–22.1%.",
      "",
      "Smoke and aerosol records are also indexed — SAME, SAME-R, SLICE, SPICE, and DAFT — but their summary tables generally do not report O₂. The evidence supports fire-safety research at Earth-like oxygen, not a validated spacecraft design envelope.",
    ].join("\n"),
    sources: sourcesFor(["PSI-25", "PSI-99", "PSI-69", "PSI-102", "PSI-107"]),
    confidence: "medium",
    limitations: [
      "No single investigation provides a complete design envelope across materials, oxygen, pressure, and flow.",
      "Several smoke/aerosol tables do not report oxygen.",
      "The snapshot is a research archive, not a certification dataset.",
    ],
    mode: "deterministic",
  };
}

function normalGravityAnswer(): ChatAnswer {
  return {
    answer: [
      "Only one matched normal-gravity comparison is normalized: SAFFIRE-II (PSI-99) reports both microgravity and 1 g columns over 21.5–22.1% O₂.",
      "",
      "That is a useful bound for one material set, not a general gravity-scaling law. BASS-II's stated hypothesis asks whether microgravity burns as well or better than 1 g under otherwise identical conditions; answering that requires matched tests, and the snapshot does not provide a systematic 1 g / µg matrix.",
    ].join("\n"),
    sources: sourcesFor(["PSI-99", "PSI-25", "PSI-22"]),
    confidence: "medium",
    limitations: [
      "The 1 g comparison comes from columns inside one flight table, not an independent ground campaign.",
      "Only one material set is compared in this snapshot.",
      "E-FIELD is an analog, not a 1 g / µg comparison.",
    ],
    mode: "deterministic",
  };
}

function pressureAnswer(): ChatAnswer {
  return {
    answer: [
      "Pressure coverage is sparse and uneven.",
      "",
      "The widest reported ranges are in gaseous experiments: Flame Design (PSI-10) 0.43–3.02 atm and CFI-G (PSI-159) 0.49–3.27 atm. FLEX (PSI-69) reports 0.69–3.05 atm for droplets.",
      "",
      "Several key solid tables — BASS-II, SAFFIRE-I/II, BRE, and s-Flame — do not report pressure in their summary tables. Pressure cannot be treated as a complete design axis in this snapshot.",
    ].join("\n"),
    sources: sourcesFor(["PSI-10", "PSI-159", "PSI-69", "PSI-25"]),
    confidence: "high",
    limitations: [
      "Missing pressure values are not zero; they are not reported.",
      "Ranges combine different facilities and test configurations.",
      "Pressure is not reported for the main solid-material campaigns.",
    ],
    mode: "deterministic",
  };
}

function smokeAnswer(): ChatAnswer {
  return {
    answer: [
      "The snapshot indexes smoke and aerosol records, but the normalized evidence layer is thin for them.",
      "",
      "SAME (PSI-102), SAME-R (PSI-101), SLICE (PSI-106), SPICE (PSI-107), and DAFT/DAFT-2 (PSI-47) have summary tables, but none of those tables reports O₂. The two modeling records — PSI-115 and PSI-117 — have no experimental table.",
      "",
      "Smoke behavior is therefore represented mainly by document metadata and publication records, not by oxygen-indexed measurements in this snapshot.",
    ].join("\n"),
    sources: sourcesFor([
      "PSI-102",
      "PSI-101",
      "PSI-106",
      "PSI-107",
      "PSI-47",
      "PSI-115",
      "PSI-117",
    ]),
    confidence: "high",
    limitations: [
      "None of the smoke/aerosol summary tables reports oxygen concentration.",
      "Reports and science documents are indexed as metadata, not full-text ingested.",
      "Document presence does not mean the underlying raw data were normalized here.",
    ],
    mode: "deterministic",
  };
}

function suppressionAnswer(): ChatAnswer {
  return {
    answer: [
      "Suppression evidence is concentrated in liquid-droplet experiments.",
      "",
      "FLEX (PSI-69) maps droplet extinction across oxygen, CO₂, and helium mixtures — 274 normalized rows. PSI-117 analyzes FLEX data, and PSI-142 uses FLEX data in a ground investigation.",
      "",
      "The normalized summary tables do not contain a solid-material suppression-agent test matrix. BASS-II's title includes suppression, but its published summary table reports burning conditions, not suppression tests.",
    ].join("\n"),
    sources: sourcesFor(["PSI-69", "PSI-117", "PSI-142", "PSI-25"]),
    confidence: "medium",
    limitations: [
      "Suppression results for droplets do not transfer automatically to solids.",
      "The snapshot does not contain a normalized solid-suppression test matrix.",
      "BASS-II's table is a burning-condition dataset, not a suppression-agent dataset.",
    ],
    mode: "deterministic",
  };
}

function methodAnswer(): ChatAnswer {
  return {
    answer: [
      `This is a static NASA PSI snapshot retrieved on ${stats.snapshotDate}. It contains ${stats.investigations} Combustion Science investigations, ${stats.experimentalTables} experimental summary tables, ${stats.tableRows.toLocaleString("en-US")} normalized rows, ${stats.documentsIndexed} reports/science documents, and ${stats.rawFiles.toLocaleString("en-US")} raw file entries indexed but not ingested.`,
      "",
      "All values come from published PSI summary tables. Missing values stay null; malformed oxygen strings are excluded rather than corrected. The raw datasets — petabytes of experiment files — were not downloaded.",
      "",
      "23 of 24 records are CC0 1.0. PSI-10 does not state a license, so it is not presented as CC0.",
    ].join("\n"),
    sources: [METHODOLOGY_SOURCE, EVIDENCE_SOURCE, ...sourcesFor(["PSI-10"])],
    confidence: "high",
    limitations: [
      "This is a dated snapshot, not a live PSI mirror.",
      "Document metadata is indexed, but full text was not ingested.",
      "The normalization layer is deliberately thin relative to the raw archive.",
    ],
    mode: "deterministic",
  };
}

function publicationAnswer(): ChatAnswer {
  return {
    answer: [
      `The snapshot indexes ${stats.publications} publications across the 24 investigations, plus ${stats.documentsIndexed} reports and science documents.`,
      "",
      "DOIs and bibliographic metadata are linked from each investigation page. The publications are not ingested into the numeric evidence layer; they provide interpretation and experimental context.",
      "",
      "The archive also contains 65,629 raw file entries. Those are indexed as metadata only — not downloaded, parsed, or treated as evidence points.",
    ].join("\n"),
    sources: [METHODOLOGY_SOURCE, EVIDENCE_SOURCE],
    confidence: "high",
    limitations: [
      "Publication counts are metadata counts, not a measure of evidence quality.",
      "Full text was not retrieved for this snapshot.",
      "Raw data entries are not normalized evidence.",
    ],
    mode: "deterministic",
  };
}

function scenarioAnswer(): ChatAnswer {
  return {
    answer: [
      "The same archive supports three scenarios at different confidence levels.",
      "",
      ...scenarios.map(
        (scenario) =>
          `- ${scenario.label} (${scenario.gravity}, target ${scenario.target}): ${scenario.status}. ${scenario.summary}`,
      ),
      "",
      "Only the spacecraft-cabin scenario has direct microgravity evidence. Lunar and Mars are classified as analogical plus gap because no direct partial-gravity combustion measurement exists in this snapshot.",
    ].join("\n"),
    sources: [EVIDENCE_SOURCE, ...sourcesFor(["PSI-25", "PSI-22", "PSI-99"])],
    confidence: "high",
    limitations: [
      "Scenario statuses reflect the evidence available in this snapshot, not a mission risk assessment.",
      "No partial-gravity combustion dataset exists here.",
      "The spacecraft status does not imply a validated design envelope.",
    ],
    mode: "deterministic",
  };
}

function scopeAnswer(): ChatAnswer {
  return {
    answer: [
      "I answer only from the normalized NASA PSI combustion snapshot behind this site.",
      "",
      "I can discuss the 24 investigations, 22 experimental summary tables, reported oxygen and pressure conditions, solid/liquid/gas evidence, the single 1 g comparison, the E-FIELD analog, smoke and suppression coverage, publications metadata, and the partial-gravity gap.",
      "",
      "I will not invent values, extrapolate to lunar or Mars gravity as if it were measured, or answer from general knowledge. If the snapshot is silent, the answer is “not reported.”",
    ].join("\n"),
    sources: [METHODOLOGY_SOURCE, EVIDENCE_SOURCE],
    confidence: "high",
    limitations: [
      "The assistant is limited to this snapshot and does not browse the web.",
      "It does not provide engineering certification or mission-safety advice.",
    ],
    mode: "deterministic",
  };
}

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "is",
  "are",
  "was",
  "were",
  "do",
  "does",
  "did",
  "what",
  "which",
  "who",
  "how",
  "why",
  "when",
  "where",
  "can",
  "could",
  "would",
  "should",
  "about",
  "for",
  "from",
  "with",
  "and",
  "or",
  "of",
  "in",
  "on",
  "to",
  "at",
  "by",
  "there",
  "any",
  "data",
  "tell",
  "me",
  "show",
  "have",
  "has",
  "this",
  "that",
  "these",
  "those",
  "it",
  "its",
  "as",
  "if",
  "i",
  "we",
  "you",
]);

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s.-]/g, " ")
    .split(/\s+/)
    .map((token) => token.replace(/^-+|-+$/g, ""))
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function searchRecords(question: string): Investigation[] {
  const queryTokens = tokens(question);
  const accession = question.match(/psi[\s-]?(\d{1,3})/i);
  const direct = accession ? investigationById.get(`PSI-${accession[1]}`) : null;
  if (!queryTokens.length) return direct ? [direct] : [];

  const scored = investigations.map((record) => {
    const title = `${record.title} ${record.acronym ?? ""}`.toLowerCase();
    const meta = `${record.subResearchArea ?? ""} ${record.hardware ?? ""}`.toLowerCase();
    const narrative = `${record.summary ?? ""} ${record.objective ?? ""}`.toLowerCase();
    const fuels = record.tables
      .flatMap((table) => [table.name, ...table.fuelValues])
      .join(" ")
      .toLowerCase();

    let score = 0;
    for (const token of queryTokens) {
      if (title.includes(token)) score += 5;
      if (meta.includes(token)) score += 2;
      if (fuels.includes(token)) score += 2;
      if (narrative.includes(token)) score += 1;
    }
    return { record, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item) => item.record)
    .filter((record) => record.id !== direct?.id)
    .slice(0, direct ? 4 : 5)
    .concat(direct ? [direct] : []);
}

function fallbackAnswer(question: string): ChatAnswer {
  const matches = searchRecords(question);
  if (!matches.length) {
    return {
      answer: [
        "I can't answer that from this snapshot.",
        "",
        "I only answer from the 24 NASA PSI Combustion Science investigations indexed here. Try asking about oxygen concentration, lunar or Mars gravity, solid/liquid/gas fuels, suppression, smoke, pressure, a PSI accession such as PSI-25, or a scenario.",
      ].join("\n"),
      sources: [EVIDENCE_SOURCE, METHODOLOGY_SOURCE],
      confidence: "low",
      limitations: [
        "The question did not match the normalized evidence layer.",
        "The assistant does not browse the web or use general knowledge.",
      ],
      mode: "deterministic",
    };
  }

  return {
    answer: [
      "The snapshot does not have a direct answer for that wording, but these are the closest records:",
      "",
      ...matches.map(
        (record) =>
          `- ${record.id}${record.acronym ? ` (${record.acronym})` : ""}: ${record.title}. O₂ ${o2For(record)}; ${record.tableCount} table(s), ${record.publicationCount} publications.`,
      ),
      "",
      "Open a record to inspect its normalized tables and provenance. For a specific number, ask about oxygen, pressure, gravity, phase, suppression, or smoke.",
    ].join("\n"),
    sources: sourcesFor(matches.map((record) => record.id)),
    confidence: "low",
    limitations: [
      "These are keyword matches, not a verified answer to the question as asked.",
      "The snapshot may not contain the specific evidence you are looking for.",
    ],
    mode: "deterministic",
  };
}

export function answerFromEvidence(question: string): ChatAnswer {
  const q = question.toLowerCase();
  const normalized = q.replace(/\s+/g, " ").trim();

  // Exact accession.
  const idMatch = normalized.match(/psi[\s-]?(\d{1,3})/i);
  if (idMatch) {
    const record = investigationById.get(`PSI-${idMatch[1]}`);
    if (record) return recordAnswer(record);
  }

  // Acronym, longest first so FLEX-2 wins over FLEX and BASS-II over BASS.
  const acronyms = investigations
    .filter((record) => record.acronym)
    .map((record) => ({ record, acronym: record.acronym!.toLowerCase() }))
    .sort((a, b) => b.acronym.length - a.acronym.length);
  for (const { record, acronym } of acronyms) {
    if (normalized.includes(acronym)) return recordAnswer(record);
  }

  const mentionsPartialGravity =
    /(partial|lunar|moon|mars|habitat|1\s*\/\s*6|0\.38|one[-\s]?sixth)/.test(
      normalized,
    );
  if (mentionsPartialGravity) {
    return partialGravityAnswer(/(solid|material|fabric|cable|pmma)/.test(normalized));
  }

  if (/(scenario|spacecraft.*lunar|readiness|three)/.test(normalized)) {
    return scenarioAnswer();
  }

  if (/(suppress|extinguish|firefight|inert|helium|co2|carbon dioxide)/.test(normalized)) {
    return suppressionAnswer();
  }

  if (/(smoke|aerosol|particle|detect|sensor)/.test(normalized)) {
    return smokeAnswer();
  }

  if (/(solid|material|fabric|cable|pmma|flammab)/.test(normalized)) {
    return solidAnswer();
  }

  if (/(liquid|droplet|flex|methanol|heptane|dodecane|extinction)/.test(normalized)) {
    return liquidAnswer();
  }

  if (/(gas|gaseous|methane|ethylene|ethane|inverse|soot|cool flame)/.test(normalized)) {
    return gasAnswer();
  }

  if (/(normal gravity|1\s*g\b|one[-\s]?g|microgravity.*normal|compare.*gravity)/.test(normalized)) {
    return normalGravityAnswer();
  }

  if (/(pressure|atm|psi|bar\b)/.test(normalized)) {
    return pressureAnswer();
  }

  if (/(publication|paper|doi|journal|literature)/.test(normalized)) {
    return publicationAnswer();
  }

  if (/(method|source|snapshot|api|license|raw data|ingest|provenance)/.test(normalized)) {
    return methodAnswer();
  }

  if (/(spacecraft|cabin|iss|station|21%|fire safety)/.test(normalized)) {
    return spacecraftAnswer();
  }

  if (/(oxygen|o2|o₂|30%|high oxygen)/.test(normalized)) {
    if (/(solid|material)/.test(normalized)) return solidAnswer();
    if (/(gas|gaseous)/.test(normalized)) return gasAnswer();
    if (/(liquid|droplet)/.test(normalized)) return liquidAnswer();
    return {
      answer: [
        `Oxygen coverage spans 12% to 85% across the normalized tables, but it is uneven by phase. The highest solid-material condition is ${stats.o2.solidMax.toFixed(1)}% (BASS-II); liquids reach ${stats.o2.liquidMax.toFixed(1)}% (FLEX); gases reach ${stats.o2.gasMax.toFixed(1)}% (Flame Design and CFI-G).`,
        "",
        `Eight table points reach at least 30% O₂, all gaseous or droplet experiments. None is a solid material.`,
        "",
        "For a specific phase or record, ask about solids, liquids, gases, or a PSI accession.",
      ].join("\n"),
      sources: sourcesFor([
        "PSI-25",
        "PSI-69",
        "PSI-10",
        "PSI-159",
        "PSI-68",
      ]),
      confidence: "high",
      limitations: [
        "Oxygen ranges combine initial/ambient test conditions from summary tables.",
        "No solid-material table reaches the 30% lunar band.",
        "Reported test conditions are not flammability limits.",
      ],
      mode: "deterministic",
    };
  }

  if (/(limit|can't|cannot|scope|what.*answer|not.*know)/.test(normalized)) {
    return scopeAnswer();
  }

  return fallbackAnswer(question);
}

function allowedPercentages(): Set<number> {
  const values = new Set<number>([30, 21, 100]);
  for (const record of investigations) {
    for (const table of record.tables) {
      if (!table.o2) continue;
      values.add(Number(table.o2.min.toFixed(2)));
      values.add(Number(table.o2.max.toFixed(2)));
      values.add(Number(table.o2.median.toFixed(2)));
    }
  }
  values.add(stats.o2.overallMax);
  values.add(stats.o2.solidMax);
  values.add(stats.o2.liquidMax);
  values.add(stats.o2.gasMax);
  return values;
}

const ALLOWED_PERCENTAGES = allowedPercentages();

function hasGroundedPercentages(answer: string): boolean {
  const matches = answer.matchAll(/(\d+(?:\.\d+)?)\s*%/g);
  for (const match of matches) {
    const value = Number(match[1]);
    if (!ALLOWED_PERCENTAGES.has(Number(value.toFixed(2)))) return false;
  }
  return true;
}

function contextFor(question: string): string {
  const matches = searchRecords(question);
  const lines = [
    `SNAPSHOT: ${stats.investigations} NASA PSI Combustion Science investigations, ${stats.experimentalTables} experimental summary tables, ${stats.tableRows} normalized rows, ${stats.documentsIndexed} reports/science documents, ${stats.rawFiles} raw file entries indexed but not ingested. Snapshot date ${stats.snapshotDate}.`,
    `KEY FACTS: ${stats.partialGravityDatasets} direct partial-gravity datasets. Highest solid-material O₂ ${stats.o2.solidMax}% (BASS-II). Highest liquid O₂ ${stats.o2.liquidMax}% (FLEX). Highest gas O₂ ${stats.o2.gasMax}% (Flame Design and CFI-G). ${stats.o2.lunarBandCount} table points at or above 30% O₂, all gaseous or droplet. E-FIELD (PSI-22) is an electric-field analog, not a gravity measurement; its table does not report O₂.`,
    "SCENARIOS: " +
      scenarios
        .map(
          (scenario) =>
            `${scenario.label} (${scenario.gravity}, ${scenario.target}) = ${scenario.status}: ${scenario.summary}`,
        )
        .join(" | "),
  ];

  if (matches.length) {
    lines.push("RELEVANT RECORDS:");
    for (const record of matches) {
      lines.push(
        `- ${record.id} ${record.acronym ?? ""}: ${record.title}. ${record.kindLabel}, ${
          record.gravity === "microgravity" ? "microgravity" : "normal gravity"
        }, subarea ${record.subResearchArea ?? "unclassified"}. O₂ ${o2For(record)}; pressure ${pressureFor(record)}; ${record.tableCount} tables; ${record.publicationCount} publications. Summary: ${(
          record.summary ?? ""
        ).slice(0, 360)}`,
      );
    }
  }

  lines.push(
    "RELEVANT COMPUTED FINDINGS:",
    ...insights.map((insight) => `- ${insight.title}: ${insight.statement}`),
  );

  return lines.join("\n");
}

const SYSTEM_PROMPT = `You are the evidence assistant for "Flame in Freefall", an independent NASA Space Apps project built on a public NASA PSI Combustion Science snapshot.

NON-NEGOTIABLE RULES:
- Use ONLY the EVIDENCE CONTEXT provided. Do not use general knowledge or the open web.
- Never invent a number, dataset, material, investigation, or citation.
- Preserve the distinction between direct microgravity measurement, a 1 g comparison, an analog (E-FIELD), and absent partial-gravity data.
- Every quantitative claim must be traceable to a PSI investigation. Mention PSI IDs.
- If the context does not answer the question, say "The snapshot does not report that" and explain the closest available evidence.
- Do not describe microgravity results as lunar or Mars measurements. Do not linearly extrapolate.
- The project is independent and not endorsed by NASA.

STYLE:
- Plain text, no markdown headings or tables.
- At most 170 words. Short paragraphs or hyphen bullets.
- End with one sentence naming the main limitation.
- Be direct. If the answer is "no", start with "No."`;

async function callGroq(question: string): Promise<ChatAnswer | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;
  const context = contextFor(question);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.15,
        max_tokens: 480,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `EVIDENCE CONTEXT:\n${context}\n\nQUESTION: ${question}`,
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) return null;
    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const draft = payload.choices?.[0]?.message?.content?.trim();
    if (!draft) return null;

    const baseline = answerFromEvidence(question);
    if (!hasGroundedPercentages(draft)) {
      return {
        ...baseline,
        limitations: [
          ...baseline.limitations,
          "A language-model draft was rejected by the numeric grounding check because it contained a percentage not present in the normalized tables.",
        ],
      };
    }

    return {
      ...baseline,
      answer: draft,
      mode: "groq",
      limitations: [
        ...baseline.limitations,
        "Drafted by a language model from retrieved context; verify the cited PSI tables.",
      ],
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function callRag(question: string): Promise<ChatAnswer | null> {
  const url = process.env.RAG_API_URL;
  if (!url) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.RAG_API_KEY
          ? { Authorization: `Bearer ${process.env.RAG_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({ question, query: question }),
      signal: controller.signal,
    });

    if (!response.ok) return null;
    const payload = (await response.json()) as {
      answer?: unknown;
      sources?: unknown;
      confidence?: unknown;
      limitations?: unknown;
    };
    if (typeof payload.answer !== "string" || !payload.answer.trim()) return null;

    const sources: ChatSource[] = Array.isArray(payload.sources)
      ? payload.sources.slice(0, 8).flatMap((source, index): ChatSource[] => {
          if (typeof source === "string") {
            return [
              {
                id: `rag-${index}`,
                label: "Retrieved source",
                title: source,
                kind: "document" as const,
                url: "/methodology",
              },
            ];
          }
          if (source && typeof source === "object") {
            const item = source as Record<string, unknown>;
            const recordId = typeof item.id === "string" ? item.id : null;
            if (recordId && investigationById.has(recordId)) {
              const hit = sourceFor(recordId);
              return hit ? [hit] : [];
            }
            return [
              {
                id: typeof item.id === "string" ? item.id : `rag-${index}`,
                label:
                  typeof item.label === "string"
                    ? item.label
                    : typeof item.title === "string"
                      ? item.title.slice(0, 48)
                      : "Retrieved source",
                title:
                  typeof item.title === "string"
                    ? item.title
                    : "Retrieved document",
                kind: "document" as const,
                url: typeof item.url === "string" ? item.url : "/methodology",
                doi: typeof item.doi === "string" ? item.doi : null,
              },
            ];
          }
          return [];
        })
      : [];

    const baseline = answerFromEvidence(question);
    return {
      answer: payload.answer.trim(),
      sources: sources.length ? sources : baseline.sources,
      confidence:
        payload.confidence === "high" ||
        payload.confidence === "medium" ||
        payload.confidence === "low"
          ? payload.confidence
          : baseline.confidence,
      limitations: [
        ...(Array.isArray(payload.limitations)
          ? payload.limitations.filter(
              (item): item is string => typeof item === "string",
            )
          : baseline.limitations),
        "Answer supplied by the document RAG pipeline; verify the cited sources.",
      ],
      mode: "rag",
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function answerQuestion(question: string): Promise<ChatAnswer> {
  const rag = await callRag(question);
  if (rag) return rag;

  const deterministic = answerFromEvidence(question);
  if (/psi[\s-]?\d{1,3}/i.test(question)) return deterministic;

  const groq = await callGroq(question);
  return groq ?? deterministic;
}
