"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Clipboard,
  CornerDownLeft,
  FileText,
  Loader2,
  Send,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import type { ChatAnswer, ChatExcerpt, ChatSource } from "@/lib/assistant";
import { cn } from "@/lib/cn";
import { Badge, StatusDot } from "@/components/ui";

const SUGGESTIONS = [
  {
    title: "Is there partial-gravity data?",
    question: "Is there partial-gravity combustion data for a lunar habitat?",
  },
  {
    title: "Highest solid-material oxygen",
    question: "What is the highest oxygen concentration tested with solid materials?",
  },
  {
    title: "Compare the gravity regimes",
    question: "Compare microgravity and normal gravity.",
  },
  {
    title: "What does BASS-II report?",
    question: "What does PSI-25 report?",
  },
];

const INITIAL_MESSAGE =
  "I answer only from the normalized NASA PSI combustion snapshot behind this site, and from the text of real NASA reports. Ask about oxygen and pressure conditions, solid, liquid, and gaseous fuels, suppression and smoke coverage, the single 1 g comparison, the E-FIELD analog, or the missing partial-gravity data.";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  result?: ChatAnswer;
  error?: boolean;
}

const MODE_LABEL: Record<ChatAnswer["mode"], string> = {
  deterministic: "Structured fallback",
  groq: "Groq · grounded",
  rag: "Document RAG",
};

const MODE_TONE: Record<ChatAnswer["mode"], "moss" | "ice" | "violet"> = {
  deterministic: "moss",
  groq: "ice",
  rag: "violet",
};

const CONFIDENCE_TONE: Record<ChatAnswer["confidence"], "moss" | "flame" | "danger"> = {
  high: "moss",
  medium: "flame",
  low: "danger",
};

function SourceList({ sources }: { sources: ChatSource[] }) {
  if (!sources.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {sources.map((source) => (
        <Link
          key={`${source.kind}-${source.id}`}
          href={source.url}
          className="group inline-flex max-w-full items-center gap-1.5 rounded-full border border-line bg-panel px-2.5 py-1 text-[12.5px] text-faint transition-colors hover:border-line-strong hover:text-ink"
          title={source.title}
        >
          <span className="truncate">{source.label}</span>
          <ArrowUpRight
            className="h-2.5 w-2.5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            strokeWidth={1.5}
          />
        </Link>
      ))}
    </div>
  );
}

function ExcerptList({ excerpts }: { excerpts: ChatExcerpt[] }) {
  if (!excerpts.length) return null;
  return (
    <details className="group mt-3">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[13.5px] text-muted transition-colors hover:text-ink">
        <FileText className="h-3 w-3" strokeWidth={1.5} />
        Document excerpts · {excerpts.length}
        <span className="transition-transform group-open:rotate-45">+</span>
      </summary>
      <ul className="mt-2.5 space-y-2.5 border-l border-line pl-3">
        {excerpts.map((excerpt) => (
          <li key={excerpt.id}>
            <div className="text-[12px] text-faint">
              {excerpt.investigationId} · {excerpt.title} · p.{excerpt.page}
            </div>
            <p className="mt-1 text-[13.5px] leading-6 text-muted">{excerpt.excerpt}</p>
          </li>
        ))}
      </ul>
    </details>
  );
}

function AssistantMessage({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false);
  const result = message.result;

  async function copy() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex gap-3 sm:gap-4">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-flame/25 bg-flame/[0.07]">
        <Sparkles className="h-3.5 w-3.5 text-flame" strokeWidth={1.6} />
      </div>

      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "text-[15px] leading-7",
            message.error ? "text-danger" : "text-ink",
          )}
        >
          <p className="whitespace-pre-line">{message.content}</p>

          {result ? (
            <>
              <SourceList sources={result.sources} />

              {result.excerpts?.length ? (
                <ExcerptList excerpts={result.excerpts} />
              ) : null}

              <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line pt-2.5">
                <Badge tone={MODE_TONE[result.mode]}>{MODE_LABEL[result.mode]}</Badge>
                {result.excerpts?.length ? (
                  <Badge tone="neutral">PSI corpus · {result.excerpts.length} passages</Badge>
                ) : null}
                <Badge tone={CONFIDENCE_TONE[result.confidence]}>
                  Confidence · {result.confidence}
                </Badge>
                <button
                  type="button"
                  onClick={copy}
                  className="ml-auto inline-flex items-center gap-1 text-[13.5px] text-faint transition-colors hover:text-ink"
                  aria-label="Copy answer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" strokeWidth={1.5} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Clipboard className="h-3 w-3" strokeWidth={1.5} />
                      Copy
                    </>
                  )}
                </button>
              </div>

              {result.limitations.length ? (
                <details className="group mt-2.5">
                  <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[13.5px] text-faint transition-colors hover:text-muted">
                    <ShieldAlert className="h-3 w-3" strokeWidth={1.5} />
                    Limitations · {result.limitations.length}
                    <span className="transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <ul className="mt-2 space-y-1.5 border-l border-line pl-3 text-[13.5px] leading-5 text-faint">
                    {result.limitations.map((limitation) => (
                      <li key={limitation}>{limitation}</li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "assistant", content: INITIAL_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const element = listRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages, loading]);

  async function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setError(null);
    setInput("");
    setMessages((current) => [
      ...current,
      { id: Date.now(), role: "user", content: trimmed },
    ]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "The assistant could not answer that.");
      }

      const result = (await response.json()) as ChatAnswer;
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: result.answer,
          result,
        },
      ]);
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "The assistant could not answer that.";
      setError(message);
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 2,
          role: "assistant",
          content: message,
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={listRef}
        className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-6 scroll-thin sm:px-6"
        aria-live="polite"
        aria-busy={loading}
      >
        <div className="mx-auto w-full max-w-[760px] space-y-6">
          {messages.map((message) =>
            message.role === "user" ? (
              <div key={message.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl bg-panel-2 px-4 py-2.5 text-[15px] leading-7 text-ink">
                  {message.content}
                </div>
              </div>
            ) : (
              <AssistantMessage key={message.id} message={message} />
            ),
          )}

          {loading ? (
            <div className="flex gap-3 sm:gap-4">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-flame/25 bg-flame/[0.07]">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-flame" strokeWidth={1.6} />
              </div>
              <div className="flex items-center gap-2 pt-1 text-[14px] text-faint">
                <span className="h-1 w-1 animate-pulse rounded-full bg-flame" />
                <span className="h-1 w-1 animate-pulse rounded-full bg-flame [animation-delay:120ms]" />
                <span className="h-1 w-1 animate-pulse rounded-full bg-flame [animation-delay:240ms]" />
                <span className="ml-1">retrieving PSI passages</span>
              </div>
            </div>
          ) : null}

          {messages.length === 1 && !loading ? (
            <div className="pt-2">
              <div className="text-[14px] text-faint">Try one of these</div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion.title}
                    type="button"
                    onClick={() => ask(suggestion.question)}
                    className="rounded-lg border border-line bg-panel px-3.5 py-3 text-left transition-colors hover:border-line-strong"
                  >
                    <div className="text-[14.5px] text-ink">{suggestion.title}</div>
                    <div className="mt-1 text-[13px] leading-5 text-faint">
                      {suggestion.question}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <form
        className="shrink-0 border-t border-line px-4 py-3 sm:px-6"
        onSubmit={(event) => {
          event.preventDefault();
          void ask(input);
        }}
      >
        <div className="mx-auto w-full max-w-[760px]">
          <div
            className={cn(
              "flex items-end gap-2 rounded-2xl border bg-panel px-3 py-2 transition-colors focus-within:border-flame focus-within:ring-2 focus-within:ring-flame/12",
              error ? "border-danger/30" : "border-line",
            )}
          >
            <label htmlFor="assistant-question" className="sr-only">
              Ask about the PSI evidence snapshot
            </label>
            <textarea
              ref={inputRef}
              id="assistant-question"
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void ask(input);
                }
              }}
              placeholder="Ask about oxygen, gravity, materials, suppression, or a PSI record…"
              className="max-h-40 min-h-[38px] w-full resize-none bg-transparent py-2 text-[15px] leading-6 text-ink outline-none placeholder:text-faint/80"
              maxLength={800}
              disabled={loading}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-flame/40 hover:text-flame disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Send question"
            >
              {loading ? (
                <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.5} />
              ) : (
                <Send className="h-3.5 w-3.5" strokeWidth={1.6} />
              )}
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[12.5px] text-faint">
            <span className="flex items-center gap-1.5">
              <CornerDownLeft className="h-2.5 w-2.5" strokeWidth={1.5} />
              Enter to send · Shift + Enter for a new line
            </span>
            <span className="flex items-center gap-1.5">
              <StatusDot tone="moss" />
              Grounded in PSI · not NASA advice
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
