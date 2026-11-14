import ragStats from "@/data/rag_stats.json";

/**
 * Corpus counts only. Kept apart from `lib/rag.ts` so a static page can show
 * how much document text is indexed without pulling the multi-megabyte
 * passage corpus into the browser bundle.
 */
export const corpusDocumentCount = ragStats.documents;
export const corpusPassageCount = ragStats.passages;
export const corpusSnapshotDate = ragStats.snapshotDate;
