"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  Calculator,
  Check,
  Circle,
  CircleAlert,
  ClipboardCheck,
  FileOutput,
  FileSpreadsheet,
  Loader2,
  PenLine,
  Scale,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { STEP_TYPE_LABELS } from "@/lib/payo/data";
import type { RunStatus, RunStepState, StepTypeId, WorkflowStatus } from "@/lib/payo/types";
import { useUI } from "@/lib/payo/store";
import { PayoMark } from "@/components/payo/mark";
import { cn } from "@/lib/utils";

// ─── Scroll affordance ──────────────────────────────────────────────────────

/** Tracks whether an overflow container can scroll and whether it is at the end. */
export function useScrollEdge(ref: React.RefObject<HTMLElement | null>) {
  const [edge, setEdge] = useState({ scrollable: false, atEnd: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const scrollable = el.scrollWidth - el.clientWidth > 4;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      setEdge((prev) =>
        prev.scrollable === scrollable && prev.atEnd === atEnd ? prev : { scrollable, atEnd },
      );
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [ref]);
  return edge;
}

/** Soft fade hinting that a container scrolls further to the right. */
export function ScrollFade({ show, to = "to-card" }: { show: boolean; to?: string }) {
  if (!show) return null;
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-y-[1px] right-[1px] z-10 w-14 rounded-r-md bg-gradient-to-r from-transparent",
        to,
      )}
      aria-hidden="true"
    />
  );
}

// ─── Step types ──────────────────────────────────────────────────────────────

export const STEP_TYPE_META: Record<StepTypeId, { label: string; icon: LucideIcon }> = {
  load: { label: STEP_TYPE_LABELS.load, icon: FileSpreadsheet },
  map: { label: STEP_TYPE_LABELS.map, icon: ArrowLeftRight },
  calculate: { label: STEP_TYPE_LABELS.calculate, icon: Calculator },
  check: { label: STEP_TYPE_LABELS.check, icon: Scale },
  draft: { label: STEP_TYPE_LABELS.draft, icon: PenLine },
  review: { label: STEP_TYPE_LABELS.review, icon: ClipboardCheck },
  report: { label: STEP_TYPE_LABELS.report, icon: FileOutput },
};

export function StepTypeIcon({ type, className }: { type: StepTypeId; className?: string }) {
  const Icon = STEP_TYPE_META[type].icon;
  return <Icon className={className} aria-hidden="true" />;
}

// ─── Labels ──────────────────────────────────────────────────────────────────

export function SampleTag({
  label = "Sample data",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded border border-border bg-card px-1.5 py-px text-[12px] font-medium tracking-wide text-ink-3",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-ink-3/70" aria-hidden="true" />
      {label}
    </span>
  );
}

// ─── Status ──────────────────────────────────────────────────────────────────

const RUN_STATUS: Record<RunStatus, { label: string; dot: string; cls: string; pulse?: boolean }> = {
  draft: { label: "Draft", dot: "bg-neutral", cls: "bg-neutral-tint text-ink-2 border border-neutral-border" },
  running: { label: "Running", dot: "bg-primary", cls: "bg-primary-tint text-primary-ink border border-primary/30", pulse: true },
  "needs-review": { label: "Needs review", dot: "bg-warn", cls: "bg-warn-tint text-warn border border-warn-border" },
  completed: { label: "Completed", dot: "bg-ok", cls: "bg-ok-tint text-ok border border-ok-border" },
};

export function RunStatusChip({
  status,
  withLabel = true,
  className,
}: {
  status: RunStatus;
  withLabel?: boolean;
  className?: string;
}) {
  const s = RUN_STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-sm px-1.5 py-0.5 text-[12px] font-medium",
        s.cls,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", s.dot, s.pulse && "animate-pulse")} aria-hidden="true" />
      {withLabel && s.label}
    </span>
  );
}

const WORKFLOW_STATUS: Record<WorkflowStatus, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-neutral-tint text-ink-2 border border-neutral-border" },
  tested: { label: "Tested", cls: "bg-primary-tint text-primary-ink border border-primary/30" },
  ready: { label: "Ready to publish", cls: "bg-ok-tint text-ok border border-ok-border" },
};

export function WorkflowStatusChip({
  status,
  className,
}: {
  status: WorkflowStatus;
  className?: string;
}) {
  const s = WORKFLOW_STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center whitespace-nowrap rounded-sm px-1.5 py-0.5 text-[12px] font-medium",
        s.cls,
        className,
      )}
    >
      {s.label}
    </span>
  );
}

export type Tone = "danger" | "warn" | "ok" | "neutral";

export function ToneChip({
  tone,
  variant = "soft",
  children,
}: {
  tone: Tone;
  variant?: "soft" | "solid";
  children: React.ReactNode;
}) {
  const tones: Record<Tone, string> = {
    danger: "bg-danger-tint text-danger border border-danger-border",
    warn: "bg-warn-tint text-warn border border-warn-border",
    ok: "bg-ok-tint text-ok border border-ok-border",
    neutral: "bg-neutral-tint text-ink-2 border border-neutral-border",
  };
  const solids: Record<Tone, string> = {
    ...tones,
    danger: "bg-danger-solid text-white",
    warn: "bg-warn-solid text-white",
    ok: "bg-ok-solid text-white",
  };
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[12px] font-medium", variant === "solid" ? solids[tone] : tones[tone])}>
      {children}
    </span>
  );
}

export function rowStatusTone(status: string): Tone {
  if (status === "Exception" || status === "Over limit") return "danger";
  if (status === "Near limit") return "warn";
  if (status === "Matched") return "ok";
  return "neutral";
}

/** Icon-only state of a workflow step during a run. */
export function StepStateIcon({ state, className }: { state: RunStepState; className?: string }) {
  switch (state) {
    case "running":
      return <Loader2 className={cn("size-3.5 animate-spin text-primary-strong", className)} aria-hidden="true" />;
    case "complete":
      return (
        <span
          className={cn(
            "grid size-4 place-items-center rounded-full bg-ok-tint text-ok transition-opacity duration-200",
            className,
          )}
          aria-hidden="true"
        >
          <Check className="size-2.5" strokeWidth={3} />
        </span>
      );
    case "needs-review":
      return <CircleAlert className={cn("size-4 text-warn", className)} aria-hidden="true" />;
    default:
      return <Circle className={cn("size-3.5 text-ink-3/50", className)} aria-hidden="true" />;
  }
}

// ─── Layout bits ─────────────────────────────────────────────────────────────

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-primary-ink",
        className,
      )}
    >
      <span className="h-px w-6 bg-line-strong" aria-hidden="true" />
      {children}
    </p>
  );
}

// ─── About this demo ─────────────────────────────────────────────────────────

export function AboutDemoDialog() {
  const { aboutOpen, setAboutOpen } = useUI();
  return (
    <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
      <DialogContent className="max-w-md gap-0">
        <DialogHeader className="items-start text-left">
          <DialogTitle className="flex items-center gap-2.5 text-base">
            <PayoMark className="size-7" />
            About this demo
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed text-ink-2">
            Payo AI is a V0 product prototype. The workflows, sample data, connections, approvals
            and outputs in this demo are simulated for demonstration purposes.
          </DialogDescription>
        </DialogHeader>
        <ul className="mt-4 list-disc space-y-1.5 pl-5 text-[13px] leading-relaxed text-ink-2">
          <li>Every dataset is fictional and labelled <span className="font-medium text-foreground">Sample data</span>.</li>
          <li>Runs play back a simulated sequence with pre-prepared sample results.</li>
          <li>Review decisions are simulated and do not represent a real approval.</li>
          <li>Nothing here is investment advice, a trade instruction, or an official report.</li>
        </ul>
        <p className="mt-4 text-[13px] leading-relaxed text-ink-2">
          This prototype does not connect to live data sources or external services.
        </p>
      </DialogContent>
    </Dialog>
  );
}
