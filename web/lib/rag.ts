import corpusData from "@/data/rag_corpus.json";
import ragStats from "@/data/rag_stats.json";

/**
 * Document retrieval over the real NASA PSI report corpus.
 *
 * The corpus is a verbatim excerpt of Reports and Science Documents that were
 * downloaded from the public PSI repository and split into overlapping
 * passages that keep their page number. Retrieval is Okapi BM25 — a lexical
 * ranker that needs no model, no API key and no vector database, so it runs
 * identically on Vercel's free tier and on a laptop.
 *
 * Nothing here summarizes or rewrites a passage. What the index returns is
 * exactly what the NASA document says, which is what makes it safe to quote.
 */

export interface RagPassage {
  id: string;
  docId: string;
  investigationId: string;
  title: string;
  category: string;
  page: number;
  text: string;
}

export interface RagHit extends RagPassage {
  score: number;
}

interface CorpusFile {
  snapshotDate: string;
  source: string;
  documents: Array<{
    id: string;
    investigationId: string;
    title: string;
    fileName: string;
    category: string;
    pages: number;
    passageCount: number;
    sourceUrl: string;
  }>;
  passages: RagPassage[];
}

const corpus = corpusData as unknown as CorpusFile;

export const corpusPassageCount = ragStats.passages;
export const corpusDocumentCount = ragStats.documents;
export const corpusSnapshotDate = ragStats.snapshotDate;

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "that",
  "with",
  "from",
  "this",
  "are",
  "was",
  "were",
  "has",
  "have",
  "had",
  "not",
  "but",
  "which",
  "they",
  "their",
  "there",
  "than",
  "then",
  "these",
  "those",
  "such",
  "into",
  "over",
  "also",
  "can",
  "may",
  "will",
  "when",
  "while",
  "where",
  "been",
  "being",
  "each",
  "more",
  "most",
  "other",
  "some",
  "only",
  "very",
  "using",
  "used",
  "use",
  "between",
  "both",
  "about",
  "after",
  "before",
  "during",
  "under",
  "through",
  "same",
  "however",
  "within",
  "without",
  "would",
  "could",
  "should",
  "must",
  "shall",
  "per",
  "via",
  "etc",
  "figure",
  "table",
  "shown",
  "shows",
  "shown",
]);

function tokenize(text: string): string[] {
  const matches = text.toLowerCase().match(/[a-z0-9]+(?:[.\-][0-9]+)*/g);
  if (!matches) return [];
  const out: string[] = [];
  for (const token of matches) {
    if (token.length < 3) continue;
    if (STOP_WORDS.has(token)) continue;
    out.push(token);
  }
  return out;
}

interface Indexed {
  passage: RagPassage;
  tokens: string[];
  length: number;
}

const K1 = 1.5;
const B = 0.75;

let index: {
  docs: Indexed[];
  df: Map<string, number>;
  averageLength: number;
} | null = null;

function buildIndex() {
  if (index) return index;
  const docs: Indexed[] = [];
  const df = new Map<string, number>();
  let total = 0;

  for (const passage of corpus.passages) {
    const tokens = tokenize(`${passage.title} ${passage.text}`);
    total += tokens.length;
    for (const token of new Set(tokens)) {
      df.set(token, (df.get(token) ?? 0) + 1);
    }
    docs.push({ passage, tokens, length: tokens.length });
  }

  index = {
    docs,
    df,
    averageLength: docs.length ? total / docs.length : 1,
  };
  return index;
}

function accessionIn(query: string): string | null {
  const match = query.match(/psi[\s-]?(\d{1,3})/i);
  return match ? `PSI-${match[1]}` : null;
}

export interface RetrieveOptions {
  limit?: number;
  investigationId?: string;
  /** Minimum BM25 score a passage must reach to be returned. */
  minScore?: number;
}

/**
 * Rank corpus passages for a question. Returns the best passages with their
 * document title, page number and PSI investigation id.
 */
export function retrieve(query: string, options: RetrieveOptions = {}): RagHit[] {
  const { limit = 6, investigationId, minScore = 0.6 } = options;
  const built = buildIndex();
  const queryTokens = [...new Set(tokenize(query))];
  const accession = accessionIn(query);

  const scored: RagHit[] = [];
  const documentCount = built.docs.length;

  for (const doc of built.docs) {
    if (investigationId && doc.passage.investigationId !== investigationId) continue;

    let score = 0;
    const counts = new Map<string, number>();
    for (const token of doc.tokens) {
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }

    for (const token of queryTokens) {
      const frequency = counts.get(token);
      if (!frequency) continue;
      const df = built.df.get(token) ?? 0;
      const idf = Math.log(1 + (documentCount - df + 0.5) / (df + 0.5));
      const normalization =
        1 - B + B * (doc.length / (built.averageLength || 1));
      score += idf * ((frequency * (K1 + 1)) / (frequency + K1 * normalization));
    }

    if (score <= 0) continue;

    // A named investigation in the question is a strong signal.
    if (accession && doc.passage.investigationId === accession) score *= 2.4;
    // Prefer pages that mention the query terms in the title.
    const titleTokens = tokenize(doc.passage.title);
    if (titleTokens.some((token) => queryTokens.includes(token))) score *= 1.15;

    scored.push({ ...doc.passage, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.filter((hit) => hit.score >= minScore).slice(0, limit);
}

/** All passages of one investigation, best first. */
export function passagesForInvestigation(
  investigationId: string,
  limit = 4,
): RagHit[] {
  const built = buildIndex();
  const docs = built.docs.filter(
    (doc) => doc.passage.investigationId === investigationId,
  );
  return docs.slice(0, limit).map((doc) => ({ ...doc.passage, score: 0 }));
}

export function documentsForInvestigation(investigationId: string) {
  return corpus.documents.filter(
    (document) => document.investigationId === investigationId,
  );
}

/** Every percentage that literally appears in a piece of text. */
export function percentagesIn(text: string): number[] {
  const values: number[] = [];
  for (const match of text.matchAll(/(\d+(?:\.\d+)?)\s*%/g)) {
    values.push(Number(match[1]));
  }
  return values;
}

/** Percentages that appear across the retrieved passages of a hit set. */
export function groundedPercentages(hits: RagHit[]): Set<number> {
  const values = new Set<number>();
  for (const hit of hits) {
    for (const value of percentagesIn(hit.text)) {
      values.add(Number(value.toFixed(2)));
    }
  }
  return values;
}
