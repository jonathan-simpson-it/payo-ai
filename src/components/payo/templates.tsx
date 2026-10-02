"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  ArrowLeftRight,
  ArrowRight,
  BellPlus,
  Calculator,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Clock,
  FileOutput,
  FileSpreadsheet,
  LayoutGrid,
  PenLine,
  Route,
  Search,
  SearchX,
  UserCheck,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STEP_TYPE_LABELS, TEMPLATES } from "@/lib/payo/data";
import type { StepDef, StepTypeId, TemplateDef } from "@/lib/payo/types";
import { usePayo } from "@/lib/payo/store";
import { cn } from "@/lib/utils";

// ─── Shared styling ──────────────────────────────────────────────────────────

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

const CARD_LIFT = cn(
  "relative z-0 rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
  "transition-[border-color,background-color] duration-300",
  EASE,
  "hover:border-line-strong",
);

const CTA_GLOW = cn(
  "bg-primary text-primary-foreground",
  "transition-colors duration-200",
  EASE,
  "hover:bg-primary-strong",
);

// ─── Library catalogue helpers ───────────────────────────────────────────────

type ChipId =
  | "all"
  | "Operations"
  | "Risk & Compliance"
  | "Research & Reporting"
  | "Finance";

type SortId = "popularity" | "name" | "steps" | "fastest";
type ViewMode = "grid" | "pipeline";

const FILTER_CHIPS: { id: ChipId; label: string }[] = [
  { id: "all", label: "All Templates" },
  { id: "Operations", label: "Operations" },
  { id: "Risk & Compliance", label: "Risk & Compliance" },
  { id: "Research & Reporting", label: "Research & Reporting" },
  { id: "Finance", label: "Finance" },
];

const SORT_OPTIONS: { id: SortId; label: string }[] = [
  { id: "popularity", label: "Popularity" },
  { id: "name", label: "Name A to Z" },
  { id: "steps", label: "Most steps" },
  { id: "fastest", label: "Fastest run" },
];

const POPULARITY: Record<string, number> = {
  "nav-reconciliation": 5,
  "position-risk": 4,
  "monthly-close": 4,
  "market-movements": 3,
  "kyc-checklist": 2,
  "client-report": 2,
  "cashflow-update": 1,
};

function chipForCategory(category: string): ChipId {
  switch (category) {
    case "Risk":
      return "Risk & Compliance";
    case "Research":
    case "Reporting":
      return "Research & Reporting";
    case "Finance":
    case "SME finance":
      return "Finance";
    default:
      return "Operations";
  }
}

function templateSeconds(t: TemplateDef): number {
  return (t.steps ?? []).reduce((sum, s) => sum + s.durationMs, 0) / 1000;
}

function stepSeconds(s: StepDef): string {
  return `${(s.durationMs / 1000).toFixed(1)}s`;
}

function runTimeLabel(t: TemplateDef): string {
  const mins = Math.max(1, Math.round((templateSeconds(t) * 18) / 60));
  return `~${mins} min run time`;
}

const LIBRARY_STEP_ICONS: Record<StepTypeId, LucideIcon> = {
  load: FileSpreadsheet,
  map: ArrowLeftRight,
  calculate: Calculator,
  check: CircleAlert,
  draft: PenLine,
  review: ClipboardCheck,
  report: FileOutput,
};

const subscribeNoop = () => () => {};

// ─── Interactive step node with settings tooltip ─────────────────────────────

function StepNode({
  step,
  align = "center",
  size = "sm",
}: {
  step: StepDef;
  align?: "start" | "center" | "end";
  size?: "sm" | "md";
}) {
  const Icon = LIBRARY_STEP_ICONS[step.type];
  return (
    <div className="group/step relative">
      <button
        type="button"
        aria-label={`${STEP_TYPE_LABELS[step.type]}: ${step.label}. Shows step settings on hover.`}
        className={cn(
          "grid place-items-center rounded-full border border-line-strong/80 bg-background text-ink-2 shadow-xs outline-none",
          "transition-[border-color,background-color,color,box-shadow] duration-200",
          EASE,
          "hover:border-line-strong hover:bg-muted hover:text-foreground",
          "focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/25",
          size === "sm" ? "size-8" : "size-9",
        )}
      >
        <Icon className={size === "sm" ? "size-3.5" : "size-4"} aria-hidden="true" />
      </button>
      <div
        role="tooltip"
        className={cn(
          "pointer-events-none absolute top-full z-30 mt-2.5 w-60 rounded-xl border border-border bg-popover p-3 text-left opacity-0",
          "shadow-[0_16px_40px_-16px_rgba(0,0,0,0.3)] transition-[opacity,transform] duration-200 translate-y-1",
          EASE,
          "group-hover/step:translate-y-0 group-hover/step:opacity-100",
          "group-focus-within/step:translate-y-0 group-focus-within/step:opacity-100",
          align === "start" && "left-0",
          align === "center" && "left-1/2 -translate-x-1/2 group-hover/step:-translate-x-1/2 group-focus-within/step:-translate-x-1/2",
          align === "end" && "right-0",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1.5 text-[12px] font-semibold text-foreground">
            <Icon className="size-3.5 shrink-0 text-payo-orange" aria-hidden="true" />
            <span className="truncate">{step.label}</span>
          </span>
          <span className="shrink-0 rounded bg-neutral-tint px-1 py-0.5 text-[10px] font-medium tabular-nums text-ink-3">
            ≈{stepSeconds(step)}
          </span>
        </div>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-2">{step.purpose}</p>
        <p className="mt-2 border-t border-border pt-2 text-[11px] font-medium text-payo-orange">
          {step.summary(step.config)}
        </p>
        <p className="mt-1 text-[10.5px] text-ink-3">
          {STEP_TYPE_LABELS[step.type]} · Simulated settings
        </p>
      </div>
    </div>
  );
}

function StepConnector({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "h-px bg-line-strong/70 transition-colors duration-300 group-hover:bg-line-strong",
        className,
      )}
    />
  );
}

function GridPipeline({ steps }: { steps: StepDef[] }) {
  return (
    <ol className="mt-5 flex w-full items-center" aria-label="Workflow steps">
      {steps.map((s, i) => (
        <li key={s.id} className="flex min-w-0 flex-1 items-center last:flex-none">
          <StepNode step={s} align={i === 0 ? "start" : i === steps.length - 1 ? "end" : "center"} />
          {i < steps.length - 1 && <StepConnector className="h-px min-w-3 flex-1" />}
        </li>
      ))}
    </ol>
  );
}

function PipelineTrack({ steps }: { steps: StepDef[] }) {
  return (
    <ol className="flex min-w-max items-start" aria-label="Workflow steps">
      {steps.map((s, i) => (
        <li key={s.id} className="flex items-start">
          <div className="flex w-[104px] shrink-0 flex-col items-center gap-2 text-center">
            <StepNode step={s} align={i === 0 ? "start" : i === steps.length - 1 ? "end" : "center"} size="md" />
            <span className="text-[11.5px] font-medium leading-tight text-ink-2">{s.label}</span>
            <span className="text-[10.5px] tabular-nums text-ink-3">≈{stepSeconds(s)}</span>
          </div>
          {i < steps.length - 1 && <StepConnector className="mt-[17px] w-6 shrink-0" />}
        </li>
      ))}
    </ol>
  );
}

// ─── Badges ──────────────────────────────────────────────────────────────────

function RunTimeBadge({ template }: { template: TemplateDef }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-ink-2">
      <Zap className="size-3" fill="currentColor" aria-hidden="true" />
      {runTimeLabel(template)}
    </span>
  );
}

function HumanInTheLoopBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-neutral-tint px-1.5 py-0.5 text-[11px] font-medium text-ink-2">
      <UserCheck className="size-3" aria-hidden="true" />
      Human-in-the-loop
    </span>
  );
}

function InDevelopmentBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-warn-border bg-warn-tint px-2 py-0.5 text-[11px] font-medium text-warn">
      <Clock className="size-3" aria-hidden="true" />
      In development
    </span>
  );
}

// ─── Cards: available now ────────────────────────────────────────────────────

function TemplateCardGrid({
  template,
  onUse,
}: {
  template: TemplateDef;
  onUse: (id: string) => void;
}) {
  const steps = template.steps ?? [];
  const hasReview = steps.some((s) => s.type === "review");
  return (
    <article className={cn(CARD_LIFT, "flex flex-col p-5")}>
      <div className="flex items-start justify-between gap-3">
        <p className="pt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-3">
          {template.category}
        </p>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
          {hasReview && <HumanInTheLoopBadge />}
          <RunTimeBadge template={template} />
        </div>
      </div>
      <h3 className="mt-2 text-[17px] font-semibold leading-snug tracking-[-0.01em] text-foreground">
        {template.name}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-[1.65] text-ink-2">
        {template.outcome}
      </p>
      <div className="mt-2 flex-1" aria-hidden="true" />
      <GridPipeline steps={steps} />
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
        <span className="text-[12px] text-ink-3">
          {steps.length} steps · Editable workflow
        </span>
        <Button size="sm" className={CTA_GLOW} onClick={() => onUse(template.id)}>
          Use template
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
}

function TemplateCardPipeline({
  template,
  onUse,
}: {
  template: TemplateDef;
  onUse: (id: string) => void;
}) {
  const steps = template.steps ?? [];
  const hasReview = steps.some((s) => s.type === "review");
  return (
    <article className={cn(CARD_LIFT, "overflow-hidden")}>
      <div className="grid gap-0 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="flex flex-col gap-3 p-5 lg:border-r lg:border-border">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-3">
              {template.category}
            </p>
            {hasReview && <HumanInTheLoopBadge />}
            <RunTimeBadge template={template} />
          </div>
          <h3 className="text-[17px] font-semibold leading-snug tracking-[-0.01em] text-foreground">
            {template.name}
          </h3>
          <p className="line-clamp-2 text-[13px] leading-[1.65] text-ink-2">
            {template.outcome}
          </p>
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
            <span className="text-[12px] text-ink-3">{steps.length} steps · Editable</span>
            <Button size="sm" className={CTA_GLOW} onClick={() => onUse(template.id)}>
              Use template
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">
              Workflow pipeline
            </p>
            <p className="hidden text-[11px] text-ink-3 sm:block">
              Hover a step to inspect its settings
            </p>
          </div>
          <div className="mt-4 overflow-x-auto pb-1">
            <PipelineTrack steps={steps} />
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Cards: in development ───────────────────────────────────────────────────

function FrostedCard({ children }: { children: React.ReactNode }) {
  return (
    <article className={CARD_LIFT}>
      <div className="relative flex flex-col p-5">{children}</div>
    </article>
  );
}

function NotifyButton({ templateId, name }: { templateId: string; name: string }) {
  const [on, setOn] = useState(false);
  const toggle = () => {
    setOn((prev) => {
      const next = !prev;
      if (next) {
        toast.success(`Noted. You will be alerted when "${name}" is ready (simulated).`);
      } else {
        toast(`Removed "${name}" from your notify list (simulated).`);
      }
      return next;
    });
  };
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={toggle}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-[12.5px] font-medium",
        "transition-[border-color,background-color,color,box-shadow] duration-200",
        EASE,
        on
          ? "border-line-strong bg-muted text-foreground"
          : "border-line-strong bg-transparent text-ink-2 hover:border-foreground/30 hover:text-foreground",
      )}
    >
      {on ? (
        <Check className="size-3.5" aria-hidden="true" />
      ) : (
        <BellPlus className="size-3.5 text-ink-3" aria-hidden="true" />
      )}
      {on ? "On the list" : "Notify when ready"}
    </button>
  );
}

function ComingSoonCardGrid({ template }: { template: TemplateDef }) {
  const labels = template.stepLabels ?? [];
  return (
    <FrostedCard>
      <div className="flex items-start justify-between gap-3">
        <p className="pt-0.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-primary-ink">
          {template.category}
        </p>
        <InDevelopmentBadge />
      </div>
      <h3 className="mt-2 text-lg font-bold leading-snug tracking-[-0.01em] text-foreground">
        {template.name}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-2">
        {template.outcome}
      </p>
      <ol className="mt-4 flex flex-wrap items-center gap-1.5" aria-label="Planned steps">
        {labels.map((l, i) => (
          <li key={l} className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/60 px-2.5 py-1 font-mono text-xs text-ink-2">
                  <span className="font-semibold text-primary-ink">{i + 1}.</span>
              {l}
            </span>
            {i < labels.length - 1 && (
              <ChevronRight className="size-3 shrink-0 text-ink-3/60" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
        <span className="text-[12px] text-ink-3">{labels.length} steps · Planned workflow</span>
        <NotifyButton templateId={template.id} name={template.name} />
      </div>
    </FrostedCard>
  );
}

function ComingSoonCardPipeline({ template }: { template: TemplateDef }) {
  const labels = template.stepLabels ?? [];
  return (
    <FrostedCard>
      <div className="grid gap-0 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="flex flex-col gap-3 p-5 lg:p-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-primary-ink">
              {template.category}
            </p>
            <InDevelopmentBadge />
          </div>
          <h3 className="text-lg font-bold leading-snug tracking-[-0.01em] text-foreground">
            {template.name}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-ink-2">
            {template.outcome}
          </p>
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
            <span className="text-[12px] text-ink-3">{labels.length} steps · Planned</span>
            <NotifyButton templateId={template.id} name={template.name} />
          </div>
        </div>
        <div className="mt-4 lg:mt-0 lg:border-l lg:border-border/70 lg:p-5">
          <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-3">
            Planned pipeline
          </p>
          <ol className="mt-4 flex min-w-max items-center overflow-x-auto pb-1" aria-label="Planned steps">
            {labels.map((l, i) => (
              <li key={l} className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-border bg-muted/60 px-2.5 py-1 font-mono text-xs text-ink-2">
              <span className="font-semibold text-primary-ink">{i + 1}.</span>
                  {l}
                </span>
                {i < labels.length - 1 && (
                  <ChevronRight className="size-3.5 shrink-0 text-ink-3/60" aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </FrostedCard>
  );
}

// ─── Library control bar ─────────────────────────────────────────────────────

function LibraryControls({
  query,
  onQuery,
  searchRef,
  chip,
  onChip,
  counts,
  sort,
  onSort,
  view,
  onView,
  kbdLabel,
}: {
  query: string;
  onQuery: (v: string) => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
  chip: ChipId;
  onChip: (c: ChipId) => void;
  counts: Record<ChipId, number>;
  sort: SortId;
  onSort: (s: SortId) => void;
  view: ViewMode;
  onView: (v: ViewMode) => void;
  kbdLabel: string;
}) {
  return (
    <div className="mt-6 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="group relative min-w-[210px] flex-1 sm:max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3 transition-colors duration-200 group-focus-within:text-foreground"
            aria-hidden="true"
          />
          <input
            ref={searchRef}
            type="text"
            role="searchbox"
            aria-label="Search finance templates"
            placeholder="Search finance templates..."
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                onQuery("");
                e.currentTarget.blur();
              }
            }}
            className={cn(
              "h-9 w-full rounded-xl border border-border bg-card pl-9 pr-9 text-[13.5px] text-foreground outline-none",
              "placeholder:text-ink-3 sm:pr-14",
              "transition-[border-color,box-shadow] duration-200",
              EASE,
              "hover:border-line-strong",
              "focus:border-primary/60 focus:shadow-[0_0_0_3px_rgba(201,80,10,0.13)]",
            )}
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => onQuery("")}
              className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-ink-3 transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          ) : (
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden h-5 -translate-y-1/2 items-center rounded border border-border bg-background px-1.5 font-mono text-[10.5px] text-ink-3 sm:inline-flex">
              {kbdLabel}
            </kbd>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          <Select value={sort} onValueChange={(v) => onSort(v as SortId)}>
            <SelectTrigger
              size="sm"
              aria-label="Sort templates"
              className="h-9 w-[172px] rounded-xl border-border bg-card text-[12.5px] shadow-xs transition-[border-color,box-shadow] duration-200 hover:border-line-strong focus-visible:border-payo-orange/60 focus-visible:ring-payo-orange/25"
            >
              <span className="hidden text-ink-3 sm:inline">Sort by:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.id} value={o.id} className="text-[13px]">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div
            role="group"
            aria-label="Library view"
            className="flex h-9 items-center rounded-xl border border-border bg-card p-0.5 shadow-xs"
          >
            <button
              type="button"
              aria-pressed={view === "grid"}
              aria-label="Grid view"
              onClick={() => onView("grid")}
              className={cn(
                "grid size-8 place-items-center rounded-lg transition-[background-color,color] duration-200",
                EASE,
                view === "grid"
                  ? "bg-muted text-foreground"
                  : "text-ink-3 hover:text-foreground",
              )}
            >
              <LayoutGrid className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-pressed={view === "pipeline"}
              aria-label="Pipeline view"
              onClick={() => onView("pipeline")}
              className={cn(
                "grid size-8 place-items-center rounded-lg transition-[background-color,color] duration-200",
                EASE,
                view === "pipeline"
                  ? "bg-muted text-foreground"
                  : "text-ink-3 hover:text-foreground",
              )}
            >
              <Route className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5" role="group" aria-label="Filter by category">
        {FILTER_CHIPS.map((f) => {
          const active = chip === f.id;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChip(f.id)}
              className={cn(
                "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[12.5px] font-medium",
                "transition-[border-color,background-color,color,box-shadow] duration-200",
                EASE,
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-ink-2 hover:border-line-strong hover:text-foreground",
              )}
            >
              {f.label}
              <span className={cn("text-[11px] tabular-nums", active ? "text-background/70" : "text-ink-3")}>
                {counts[f.id]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

function SectionHeader({ id, title, shown, total }: { id: string; title: string; shown: number; total: number }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 id={id} className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">
        {title}
      </h2>
      <span className="text-[11.5px] tabular-nums text-ink-3">
        {shown === total ? `${total} template${total === 1 ? "" : "s"}` : `${shown} of ${total}`}
      </span>
    </div>
  );
}

function EmptyState({ query, onReset }: { query: string; onReset: () => void }) {
  return (
    <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-line-strong bg-card/50 px-6 py-14 text-center">
      <div className="grid size-11 place-items-center rounded-full bg-neutral-tint">
        <SearchX className="size-5 text-ink-3" aria-hidden="true" />
      </div>
      <p className="mt-4 text-[14.5px] font-medium">
        {query ? `No templates match "${query}"` : "No templates match these filters"}
      </p>
      <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-ink-2">
        Try a different search term, or clear the filters to see the full library.
      </p>
      <Button variant="outline" size="sm" className="mt-5" onClick={onReset}>
        Clear search and filters
      </Button>
    </div>
  );
}

export function TemplateLibrary() {
  const { useTemplate } = usePayo();
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState<ChipId>("all");
  const [sort, setSort] = useState<SortId>("popularity");
  const [view, setView] = useState<ViewMode>("grid");
  const searchRef = useRef<HTMLInputElement>(null);
  const kbdLabel = useSyncExternalStore(
    subscribeNoop,
    () => (/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘K" : "Ctrl K"),
    () => "⌘K",
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const counts = useMemo(() => {
    const c = { all: TEMPLATES.length } as Record<ChipId, number>;
    for (const t of TEMPLATES) {
      const k = chipForCategory(t.category);
      c[k] = (c[k] ?? 0) + 1;
    }
    return c;
  }, []);

  const sorter = useMemo<(a: TemplateDef, b: TemplateDef) => number>(() => {
    switch (sort) {
      case "name":
        return (a, b) => a.name.localeCompare(b.name);
      case "steps":
        return (a, b) =>
          (b.steps?.length ?? b.stepLabels?.length ?? 0) -
          (a.steps?.length ?? a.stepLabels?.length ?? 0);
      case "fastest":
        return (a, b) => templateSeconds(a) - templateSeconds(b);
      default:
        return (a, b) => (POPULARITY[b.id] ?? 0) - (POPULARITY[a.id] ?? 0);
    }
  }, [sort]);

  const { available, comingSoon, totalAvailable, totalComingSoon } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = (t: TemplateDef) => {
      if (chip !== "all" && chipForCategory(t.category) !== chip) return false;
      if (!q) return true;
      const hay = [
        t.name,
        t.category,
        t.outcome,
        ...(t.steps?.map((s) => `${s.label} ${s.purpose}`) ?? []),
        ...(t.stepLabels ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return q.split(/\s+/).every((term) => hay.includes(term));
    };
    const a = TEMPLATES.filter((t) => !t.comingSoon && matches(t)).sort(sorter);
    const c = TEMPLATES.filter((t) => t.comingSoon && matches(t)).sort(sorter);
    return {
      available: a,
      comingSoon: c,
      totalAvailable: TEMPLATES.filter((t) => !t.comingSoon).length,
      totalComingSoon: TEMPLATES.filter((t) => t.comingSoon).length,
    };
  }, [chip, query, sorter]);

  const reset = () => {
    setQuery("");
    setChip("all");
    searchRef.current?.focus();
  };

  const nothingFound = available.length === 0 && comingSoon.length === 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-10 md:py-10">
      <header>
        <h1 className="text-[26px] font-semibold tracking-[-0.015em]">Template library</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-2">
          Curated finance workflows, ready to adjust and run. Each template opens as an editable
          workflow and runs on labelled sample data. Hover a step in a card to see its settings.
        </p>
      </header>

      <LibraryControls
        query={query}
        onQuery={setQuery}
        searchRef={searchRef}
        chip={chip}
        onChip={setChip}
        counts={counts}
        sort={sort}
        onSort={setSort}
        view={view}
        onView={setView}
        kbdLabel={kbdLabel}
      />

      {nothingFound ? (
        <EmptyState query={query.trim()} onReset={reset} />
      ) : (
        <>
          {available.length > 0 && (
            <section aria-labelledby="available-templates" className="mt-8">
              <SectionHeader
                id="available-templates"
                title="Available now"
                shown={available.length}
                total={totalAvailable}
              />
              {view === "grid" ? (
                <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(min(420px,100%),1fr))] gap-6">
                  {available.map((t) => (
                    <TemplateCardGrid key={t.id} template={t} onUse={useTemplate} />
                  ))}
                </div>
              ) : (
                <div className="mt-4 flex flex-col gap-5">
                  {available.map((t) => (
                    <TemplateCardPipeline key={t.id} template={t} onUse={useTemplate} />
                  ))}
                </div>
              )}
            </section>
          )}

          {comingSoon.length > 0 && (
            <section
              aria-labelledby="upcoming-templates"
              className="mt-10 rounded-2xl border border-border/70 bg-secondary/40 p-5 sm:p-6"
            >
              <SectionHeader
                id="upcoming-templates"
                title="In development"
                shown={comingSoon.length}
                total={totalComingSoon}
              />
              {view === "grid" ? (
                <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(min(340px,100%),1fr))] gap-6">
                  {comingSoon.map((t) => (
                    <ComingSoonCardGrid key={t.id} template={t} />
                  ))}
                </div>
              ) : (
                <div className="mt-4 flex flex-col gap-5">
                  {comingSoon.map((t) => (
                    <ComingSoonCardPipeline key={t.id} template={t} />
                  ))}
                </div>
              )}
              <p className="mt-4 text-[12.5px] leading-relaxed text-ink-3">
                These templates preview the planned library. They are not runnable in this demo,
                and every figure in the workspace is simulated.
              </p>
            </section>
          )}
        </>
      )}
    </div>
  );
}
