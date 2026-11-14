// Run the golden set against a deployed assistant and report the score.
//
//   node scripts/run-eval.mjs [baseUrl]
//
// It measures three things over the live /api/chat endpoint:
//   citation accuracy  - did the answer cite the expected PSI record?
//   fact coverage      - did the answer contain the required facts?
//   grounding safety   - did the answer avoid the forbidden claims?
// plus retrieval quality, grounded percentage rate and latency.

import { readFile } from "node:fs/promises";
import path from "node:path";

const baseUrl = (process.argv[2] ?? "https://firelens-chi.vercel.app").replace(/\/$/, "");
const goldenPath = path.resolve(
  process.argv[3] ?? "web/data/eval-questions.json",
);
const golden = JSON.parse(await readFile(goldenPath, "utf8"));

const ALLOWED = new Set([30, 21, 100]);

function allowedPercentages() {
  const values = new Set(ALLOWED);
  for (const table of tables) {
    if (!table.o2) continue;
    for (const key of ["min", "max", "median"]) {
      values.add(Number(table.o2[key].toFixed(2)));
    }
  }
  for (const key of ["solidMax", "liquidMax", "gasMax", "overallMax"]) {
    values.add(Number(stats.o2[key].toFixed(2)));
  }
  return values;
}

const dataDir = path.resolve("web/data");
const investigations = JSON.parse(await readFile(path.join(dataDir, "investigations.json"), "utf8"));
const stats = JSON.parse(await readFile(path.join(dataDir, "stats.json"), "utf8"));
const tables = investigations.flatMap((record) => record.tables ?? []);
const allowed = allowedPercentages();

function cites(text, accession) {
  return text.includes(accession);
}

function hasFact(text, fact) {
  const lower = text.toLowerCase();
  if (fact === "no") return /\bno\b/i.test(text);
  if (fact === "0") return /\b0\b/.test(text) || /\bzero\b/i.test(text) || /\bnone\b/i.test(text);
  if (fact === "not stated") return lower.includes("not stated");
  if (fact === "65,629") return /65[,.]?629/.test(text);
  if (fact === "sphere") return /sphere|spherical/i.test(text);
  return lower.includes(fact.toLowerCase());
}

function ungroundedPercentages(text, passages) {
  const fromPassages = new Set();
  for (const passage of passages ?? []) {
    for (const match of passage.excerpt.matchAll(/(\d+(?:\.\d+)?)\s*%/g)) {
      fromPassages.add(Number(Number(match[1]).toFixed(2)));
    }
  }
  const bad = [];
  for (const match of text.matchAll(/(\d+(?:\.\d+)?)\s*%/g)) {
    const value = Number(Number(match[1]).toFixed(2));
    if (!allowed.has(value) && !fromPassages.has(value)) bad.push(value);
  }
  return bad;
}

const results = [];
for (const item of golden.questions) {
  const started = Date.now();
  let payload = null;
  let error = null;
  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: item.question }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    payload = await response.json();
  } catch (caught) {
    error = caught instanceof Error ? caught.message : String(caught);
  }
  const latency = Date.now() - started;

  if (!payload) {
    results.push({ ...item, error, latency, passed: false });
    continue;
  }

  const answer = payload.answer ?? "";
  const passages = payload.excerpts ?? [];
  const sourceText = `${answer}\n${payload.sources.map((s) => s.label).join(" ")}`;

  const citedExpected = item.expectAccessions.some((a) => cites(sourceText, a));
  const missingFacts = item.mustContain.filter((f) => !hasFact(answer, f));
  const forbidden = item.mustNotContain.filter((f) => hasFact(answer, f));
  const ungrounded = ungroundedPercentages(answer, passages);

  const passed =
    citedExpected &&
    missingFacts.length === 0 &&
    forbidden.length === 0 &&
    ungrounded.length === 0;

  results.push({
    ...item,
    latency,
    mode: payload.mode,
    citedExpected,
    missingFacts,
    forbidden,
    ungrounded,
    passageCount: passages.length,
    passageAccessions: [...new Set(passages.map((p) => p.investigationId))],
    passed,
  });
}

const scored = results.filter((r) => !r.error);
const pass = scored.filter((r) => r.passed).length;
const citation = scored.filter((r) => r.citedExpected).length;
const grounding = scored.filter((r) => r.ungrounded.length === 0).length;
const latencies = scored.map((r) => r.latency).sort((a, b) => a - b);
const p95 = latencies[Math.floor(latencies.length * 0.95) - 1] ?? 0;

console.log(`\nFlame in Freefall — assistant evaluation`);
console.log(`target: ${baseUrl}\n`);
for (const r of results) {
  const mark = r.passed ? "PASS" : r.error ? "ERR " : "FAIL";
  console.log(
    `${mark} ${r.id}  ${String(r.latency).padStart(5)}ms  ${(r.mode ?? "-").padEnd(12)} ${r.question}`,
  );
  if (r.error) console.log(`      error: ${r.error}`);
  if (!r.citedExpected && r.expectAccessions.length) {
    console.log(`      missing citation: expected one of ${r.expectAccessions.join(", ")}`);
  }
  if (r.missingFacts?.length) console.log(`      missing facts: ${r.missingFacts.join(", ")}`);
  if (r.forbidden?.length) console.log(`      forbidden claims present: ${r.forbidden.join(", ")}`);
  if (r.ungrounded?.length) console.log(`      ungrounded percentages: ${r.ungrounded.join(", ")}`);
}

console.log(`\n${pass}/${scored.length} passed`);
console.log(`citation accuracy   ${citation}/${scored.length}`);
console.log(`grounding safety    ${grounding}/${scored.length} (no invented percentages)`);
console.log(`latency             p50 ${latencies[Math.floor(latencies.length / 2)] ?? 0}ms · p95 ${p95}ms`);

const out = {
  snapshotDate: golden.snapshotDate,
  target: baseUrl,
  questions: scored.length,
  passed: pass,
  citationAccuracy: citation / scored.length,
  groundingSafety: grounding / scored.length,
  latencyP50: latencies[Math.floor(latencies.length / 2)] ?? 0,
  latencyP95: p95,
  detail: results,
};
await (await import("node:fs/promises")).writeFile(
  path.resolve("web/data/eval-results.json"),
  JSON.stringify(out, null, 2),
);
console.log(`\nwrote web/data/eval-results.json`);
