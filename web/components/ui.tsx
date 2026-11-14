import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "flame" | "ice" | "violet" | "moss" | "danger";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "border-line bg-white/[0.025] text-muted",
    flame: "border-flame/25 bg-flame/[0.08] text-flame",
    ice: "border-ice/25 bg-ice/[0.07] text-ice",
    violet: "border-violet/25 bg-violet/[0.07] text-violet",
    moss: "border-moss/25 bg-moss/[0.07] text-moss",
    danger: "border-red-400/25 bg-red-400/[0.07] text-red-300",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[2px] border px-2 py-1 font-mono text-[10px] uppercase leading-none tracking-[0.1em] whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusDot({
  tone = "moss",
  pulse = false,
}: {
  tone?: "moss" | "flame" | "muted" | "ice";
  pulse?: boolean;
}) {
  const colors: Record<string, string> = {
    moss: "bg-moss",
    flame: "bg-flame",
    muted: "bg-faint",
    ice: "bg-ice",
  };
  return (
    <span className="relative flex h-1.5 w-1.5 shrink-0">
      {pulse ? (
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-40",
            colors[tone],
          )}
        />
      ) : null}
      <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", colors[tone])} />
    </span>
  );
}

export function SectionHeading({
  index,
  kicker,
  title,
  body,
  action,
  className,
}: {
  index?: string;
  kicker: string;
  title: React.ReactNode;
  body?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div>
        <div className="label flex items-center gap-3">
          {index ? <span className="text-flame">{index}</span> : null}
          <span className="h-px w-7 bg-line-strong" />
          <span>{kicker}</span>
        </div>
        <h2 className="mt-3 max-w-3xl text-balance text-2xl font-medium tracking-[-0.025em] text-ink sm:text-[30px] sm:leading-[1.15]">
          {title}
        </h2>
        {body ? (
          <p className="mt-3 max-w-2xl text-pretty text-[13.5px] leading-6 text-muted">
            {body}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function ArrowLink({
  href,
  children,
  className,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}) {
  const classes = cn(
    "group inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink transition-colors hover:text-flame",
    className,
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes}>
        {children}
        <ArrowUpRight
          className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          strokeWidth={1.5}
        />
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
      <ChevronRight
        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
        strokeWidth={1.5}
      />
    </Link>
  );
}

export function ActionLink({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  const classes = {
    primary:
      "border-flame bg-flame text-[#1a0d06] hover:bg-[#ffa16e] hover:border-[#ffa16e]",
    secondary:
      "border-line-strong bg-white/[0.025] text-ink hover:border-white/30 hover:bg-white/[0.05]",
    ghost: "border-transparent text-muted hover:text-ink",
  };
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-[2px] border px-4 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-colors",
        classes[variant],
        className,
      )}
    >
      {children}
      <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
    </Link>
  );
}

export function DataNote({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-2.5 border-l border-flame/40 pl-3 text-[11.5px] leading-5 text-muted",
        className,
      )}
    >
      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-flame/70" />
      <p>{children}</p>
    </div>
  );
}

export function Metric({
  value,
  unit,
  label,
  note,
  accent = false,
}: {
  value: React.ReactNode;
  unit?: string;
  label: string;
  note?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            "font-mono text-[30px] leading-none tracking-[-0.05em] tabular sm:text-[34px]",
            accent ? "text-flame" : "text-ink",
          )}
        >
          {value}
        </span>
        {unit ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-faint">
            {unit}
          </span>
        ) : null}
      </div>
      <span className="label pt-1 text-[9.5px] text-muted">{label}</span>
      {note ? <span className="text-[11px] leading-4 text-faint">{note}</span> : null}
    </div>
  );
}

export function PageIntro({
  kicker,
  title,
  body,
  meta,
}: {
  kicker: string;
  title: React.ReactNode;
  body?: React.ReactNode;
  meta?: React.ReactNode;
}) {
  return (
    <header className="relative border-b border-line">
      <div className="pointer-events-none absolute inset-0 grid-field opacity-50" />
      <div className="relative mx-auto max-w-[1240px] px-5 pb-12 pt-14 sm:px-8 sm:pb-16 sm:pt-20">
        <div className="label flex items-center gap-3">
          <span className="h-1 w-1 rounded-full bg-flame" />
          {kicker}
        </div>
        <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h1 className="max-w-4xl text-balance text-[38px] font-medium leading-[1.04] tracking-[-0.04em] text-ink sm:text-[52px]">
              {title}
            </h1>
            {body ? (
              <p className="mt-5 max-w-2xl text-pretty text-[14px] leading-6 text-muted sm:text-[15px]">
                {body}
              </p>
            ) : null}
          </div>
          {meta ? <div className="flex flex-wrap gap-6 lg:justify-end">{meta}</div> : null}
        </div>
      </div>
    </header>
  );
}

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="label text-[9px]">{label}</span>
      <div className="text-[12.5px] leading-5 text-ink">{children}</div>
    </div>
  );
}
