"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Clipboard,
  CornerDownLeft,
  Loader2,
  Send,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import type { ChatAnswer, ChatSource } from "@/lib/assistant";
import { cn } from "@/lib/cn";
import { Badge, StatusDot } from "@/components/ui";

const SUGGESTIONS = [
  "Is there partial-gravity combustion data for a lunar habitat?",
  "What is the highest oxygen concentration tested with solid materials?",
  "How much suppression data exists?",
  "Compare microgravity and normal gravity.",
  "What smoke data is indexed?",
  "What does PSI-25 report?",
];

const INITIAL_MESSAGE =
  "I answer only from the normalized NASA PSI combustion snapshot behind this site. I can discuss oxygen and pressure conditions, solid, liquid, and gaseous fuels, suppression and smoke coverage, the single 1 g comparison, the E-FIELD analog, and the missing partial-gravity data.";

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
          className="group inline-flex max-w-full items-center gap-1.5 rounded-full border border-line bg-panel-2 px-2.5 py-1 text-[12.5px] text-faint transition-colors hover:border-line-strong hover:text-ink"
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
    <div className="flex max-w-[92%] flex-col items-start">
      <div className="mb-1.5 flex items-center gap-2 text-[12.5px] text-faint">
        <Sparkles className="h-2.5 w-2.5 text-flame" strokeWidth={1.5} />
        Evidence assistant
      </div>
      <div
        className={cn(
          "rounded-lg border px-4 py-3.5 text-[14.5px] leading-7",
          message.error
            ? "border-danger/25 bg-danger/[0.04] text-danger"
            : "border-line bg-panel text-muted",
        )}
      >
        <p className="whitespace-pre-line">{message.content}</p>

        {result ? (
          <>
            <SourceList sources={result.sources} />

            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line pt-2.5">
              <Badge tone={MODE_TONE[result.mode]}>{MODE_LABEL[result.mode]}</Badge>
              <Badge tone={CONFIDENCE_TONE[result.confidence]}>
                Confidence · {result.confidence}
              </Badge>
              <button
                type="button"
                onClick={copy}
                className="ml-auto inline-flex items-center gap-1 text-[14px] text-faint transition-colors hover:text-ink"
                aria-label="Copy answer"
              >
                {copied ? (
                  <>
                    <Check className="h-2.5 w-2.5" strokeWidth={1.5} />
                    Copied
                  </>
                ) : (
                  <>
                    <Clipboard className="h-2.5 w-2.5" strokeWidth={1.5} />
                    Copy
                  </>
                )}
              </button>
            </div>

            {result.limitations.length ? (
              <details className="group mt-2.5">
                <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[14px] text-faint transition-colors hover:text-muted">
                  <ShieldAlert className="h-2.5 w-2.5" strokeWidth={1.5} />
                  Limitations · {result.limitations.length}
                  <span className="transition-transform group-open:rotate-45">+</span>
                </summary>
                <ul className="mt-2 space-y-1.5 border-l border-line pl-3 text-[14px] leading-5 text-faint">
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
  );
}

export function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "assistant",
      content: INITIAL_MESSAGE,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    <div className="panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex items-center gap-2 text-[15px] text-faint">
          <StatusDot tone="moss" pulse />
          Evidence assistant · grounded mode
        </div>
        <div className="flex items-center gap-2 text-[15px] text-faint">
          <span>PSI snapshot</span>
          <span className="h-2.5 w-px bg-line" />
          <span>No web access</span>
        </div>
      </div>

      <div
        ref={listRef}
        className="max-h-[560px] min-h-[420px] space-y-5 overflow-y-auto px-4 py-5 scroll-thin sm:px-5"
        aria-live="polite"
        aria-busy={loading}
      >
        {messages.map((message) =>
          message.role === "user" ? (
            <div key={message.id} className="flex flex-col items-end">
              <div className="mb-1.5 text-[12.5px] text-faint">
                You
              </div>
              <div className="max-w-[88%] rounded-lg border border-line bg-panel-2 px-4 py-2.5 text-[14.5px] leading-7 text-ink">
                {message.content}
              </div>
            </div>
          ) : (
            <AssistantMessage key={message.id} message={message} />
          ),
        )}

        {loading ? (
          <div className="flex max-w-[92%] flex-col items-start">
            <div className="mb-1.5 flex items-center gap-2 text-[12.5px] text-faint">
              <Loader2 className="h-2.5 w-2.5 animate-spin text-flame" strokeWidth={1.5} />
              Querying structured evidence
            </div>
            <div className="rounded-lg border border-line bg-panel-2 px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="h-1 w-1 animate-pulse rounded-full bg-flame" />
                <span className="h-1 w-1 animate-pulse rounded-full bg-flame [animation-delay:120ms]" />
                <span className="h-1 w-1 animate-pulse rounded-full bg-flame [animation-delay:240ms]" />
                <span className="ml-1 text-[15px] text-faint">
                  checking tables, not the internet
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {messages.length === 1 && !loading ? (
          <div className="border-t border-line pt-4">
            <div className="text-[15px] text-faint">
              Start with a question
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => ask(suggestion)}
                  className="max-w-full rounded-full border border-line px-3 py-1.5 text-left text-[14px] leading-5 text-muted transition-colors hover:border-line-strong hover:text-ink"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <form
        className="border-t border-line p-3 sm:p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void ask(input);
        }}
      >
        <label htmlFor="assistant-question" className="sr-only">
          Ask about the PSI evidence snapshot
        </label>
        <div
          className={cn(
            "flex items-center gap-2 rounded-md border bg-panel px-3 py-2.5 transition-colors focus-within:border-flame focus-within:ring-2 focus-within:ring-flame/15",
            error ? "border-danger/30" : "border-line",
          )}
        >
          <input
            ref={inputRef}
            id="assistant-question"
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about oxygen, gravity, materials, suppression, or a PSI record…"
            className="min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-faint/80"
            maxLength={800}
            disabled={loading}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-line text-muted transition-colors hover:border-flame/40 hover:text-flame disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Send question"
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.5} />
            ) : (
              <Send className="h-3 w-3" strokeWidth={1.5} />
            )}
          </button>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[12.5px] text-faint">
          <span className="flex items-center gap-1.5">
            <CornerDownLeft className="h-2.5 w-2.5" strokeWidth={1.5} />
            Enter to send · 800 character limit
          </span>
          <span>Grounded in PSI · not NASA advice</span>
        </div>
      </form>
    </div>
  );
}
