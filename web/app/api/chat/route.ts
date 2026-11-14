import { answerQuestion } from "@/lib/assistant";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;
const buckets = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "local";
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > MAX_REQUESTS;
}

export async function POST(request: Request) {
  if (isRateLimited(clientKey(request))) {
    return Response.json(
      { error: "Too many questions. Try again in a minute." },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const message =
    payload && typeof payload === "object" && "message" in payload
      ? (payload as { message?: unknown }).message
      : undefined;

  if (typeof message !== "string" || !message.trim()) {
    return Response.json({ error: "Ask a question first." }, { status: 400 });
  }

  if (message.length > 800) {
    return Response.json(
      { error: "Questions are limited to 800 characters." },
      { status: 400 },
    );
  }

  try {
    const answer = await answerQuestion(message.trim().replace(/\s+/g, " "));
    return Response.json(answer, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json(
      { error: "The evidence assistant could not answer that question." },
      { status: 500 },
    );
  }
}
