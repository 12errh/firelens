import Link from "next/link";
import { ArrowUpRight, ChevronRight, MoveHorizontal } from "lucide-react";
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
    neutral: "border-line bg-panel-2 text-muted",
    flame: "border-flame/25 bg-flame/[0.07] text-flame",
    ice: "border-ice/25 bg-ice/[0.07] text-ice",
    violet: "border-violet/25 bg-violet/[0.07] text-violet",
    moss: "border-moss/25 bg-moss/[0.08] text-moss",
    danger: "border-danger/25 bg-danger/[0.06] text-danger",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[14px] leading-none whitespace-nowrap",
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
    <span className="relative flex h-2 w-2 shrink-0">
      {pulse ? (
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-30",
            colors[tone],
          )}
        />
      ) : null}
      <span className={cn("relative inline-flex h-2 w-2 rounded-full", colors[tone])} />
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
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="max-w-3xl">
        <div className="text-[14px] text-faint">
          {index ? <span className="sr-only">{index}. </span> : null}
          {kicker}
        </div>
        <h2 className="mt-2 text-balance text-[28px] font-medium leading-[1.2] tracking-[-0.025em] text-ink sm:text-[32px]">
          {title}
        </h2>
        {body ? (
          <p className="mt-3 max-w-2xl text-pretty text-[16px] leading-7 text-muted">
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
    "group inline-flex items-center gap-1.5 text-[14px] font-medium text-ink transition-colors hover:text-flame",
    className,
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes}>
        {children}
        <ArrowUpRight
          className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          strokeWidth={1.6}
        />
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
      <ChevronRight
        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
        strokeWidth={1.6}
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
      "border-flame bg-flame text-white hover:bg-flame-deep hover:border-flame-deep",
    secondary:
      "border-line-strong bg-panel text-ink hover:border-ink hover:bg-panel-2",
    ghost: "border-transparent text-muted hover:text-ink",
  };
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded border px-6 text-[14.5px] font-medium transition-colors",
        classes[variant],
        className,
      )}
    >
      {children}
      <ArrowUpRight className="h-4 w-4" strokeWidth={1.7} />
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
        "rounded border border-line bg-panel px-4 py-3 text-[14px] leading-6 text-muted",
        className,
      )}
    >
      {children}
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
    <div className="flex min-w-0 flex-col">
      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            "font-mono text-[34px] font-medium leading-none tracking-[-0.03em] tabular",
            accent ? "text-flame" : "text-ink",
          )}
        >
          {value}
        </span>
        {unit ? (
          <span className="text-[14px] text-faint">{unit}</span>
        ) : null}
      </div>
      <span className="mt-3 text-[14px] font-medium text-ink">{label}</span>
      {note ? <span className="mt-1 text-[14px] leading-5 text-faint">{note}</span> : null}
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
    <header className="border-b border-line bg-canvas">
      <div className="mx-auto max-w-[1200px] px-6 pb-12 pt-12 lg:px-10 lg:pb-14 lg:pt-16">
        <div className="text-[13px] text-faint">{kicker}</div>
        <h1 className="mt-3 max-w-[880px] text-balance text-[34px] font-medium leading-[1.12] tracking-[-0.03em] text-ink sm:text-[44px]">
          {title}
        </h1>
        {body ? (
          <p className="mt-5 max-w-[680px] text-pretty text-[16.5px] leading-7 text-muted">
            {body}
          </p>
        ) : null}
        {meta ? (
          <div className="mt-9 flex flex-wrap gap-x-12 gap-y-6 border-t border-line pt-7">
            {meta}
          </div>
        ) : null}
      </div>
    </header>
  );
}

export function TickRule({
  className,
  up = false,
}: {
  className?: string;
  up?: boolean;
}) {
  return (
    <div
      className={cn(up ? "tick-rule-up" : "tick-rule", className)}
      aria-hidden="true"
    />
  );
}

/**
 * A centred band heading. Used between the long sections so the page reads as
 * a sequence of bands rather than a run of headings.
 */
export function SectionIntro({
  kicker,
  title,
  body,
  className,
}: {
  kicker: string;
  title: React.ReactNode;
  body?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("text-center", className)}>
      <div className="text-[14px] text-faint">{kicker}</div>
      <h2 className="mx-auto mt-3 max-w-3xl text-balance text-[30px] font-medium leading-[1.14] tracking-[-0.03em] text-ink sm:text-[40px]">
        {title}
      </h2>
      {body ? (
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-[16px] leading-7 text-muted">
          {body}
        </p>
      ) : null}
    </div>
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
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-[14px] text-faint">{label}</span>
      <div className="text-[14px] leading-6 text-ink">{children}</div>
    </div>
  );
}

/**
 * Mobile-only affordance for horizontally scrollable regions. Hidden from
 * `sm` up, where the content fits without scrolling.
 */
export function ScrollHint({
  children = "Scroll sideways to see everything",
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-[12.5px] text-faint sm:hidden",
        className,
      )}
    >
      <MoveHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} />
      {children}
    </div>
  );
}
