"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, CircleAlert, Play, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HOLDING_LINKS,
  RISK_PORTFOLIO_TOTAL,
  navExceptions,
  navTotals,
  notableMoves,
  riskResults,
} from "@/lib/payo/data";
import { fmtInt, fmtPct, fmtSignedHKD, fmtSignedPct } from "@/lib/payo/format";
import type { RunStepState, StepTypeId } from "@/lib/payo/types";
import { SampleTag, StepStateIcon, StepTypeIcon, ToneChip, rowStatusTone } from "@/components/payo/ui";
import { cn } from "@/lib/utils";

/**
 * Landing feature demo: one compact, interactive preview of how a Payo run
 * behaves: visible steps, a review pause with a human decision, and a test
 * panel that moves a workflow from draft to tested to ready.
 * All figures are sample data; nothing here is live.
 */

type Phase = "idle" | "running" | "awaiting" | "returned" | "done";

interface Scenario {
  id: string;
  label: string;
  title: string;
  blurb: string;
  steps: { label: string; type: StepTypeId }[];
  reviewIndex: number;
  pauseNote: string;
  approveLabel: string;
  returnLabel: string;
  testedNote: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "reconcile",
    label: "Reconcile NAV data",
    title: "NAV reconciliation",
    blurb:
      "Compare administrator and internal valuations, flag tolerance breaches, and prepare the summary for a reviewer.",
    steps: [
      { label: "Load sample valuations", type: "load" },
      { label: "Map funds", type: "map" },
      { label: "Calculate variance", type: "calculate" },
      { label: "Flag tolerance breaches", type: "check" },
      { label: "Review material variances", type: "review" },
      { label: "Create reconciliation summary", type: "report" },
    ],
    reviewIndex: 4,
    pauseNote: "Material variance detected in Ferngate Diversified (+1.35%).",
    approveLabel: "Approve summary & publish",
    returnLabel: "Return for review",
    testedNote: "Sample test complete: 2 exceptions will pause the run at review.",
  },
  {
    id: "risk",
    label: "Review position risk",
    title: "Position risk review",
    blurb:
      "Check each position against its applicable limit and route anything over or near the limit to an analyst.",
    steps: [
      { label: "Load sample positions", type: "load" },
      { label: "Calculate exposure", type: "calculate" },
      { label: "Compare with limits", type: "check" },
      { label: "Flag breaches", type: "check" },
      { label: "Analyst review", type: "review" },
      { label: "Publish risk summary", type: "report" },
    ],
    reviewIndex: 4,
    pauseNote: "Two positions sit over the 90% review threshold.",
    approveLabel: "Approve summary & publish",
    returnLabel: "Return for review",
    testedNote: "Sample test complete: 1 position over limit and 1 near limit will need review.",
  },
  {
    id: "briefing",
    label: "Draft market briefing",
    title: "Daily market movements",
    blurb:
      "Turn the morning's sample moves into an AI-assisted draft, then have an editor check it before export.",
    steps: [
      { label: "Load market snapshot", type: "load" },
      { label: "Identify notable moves", type: "check" },
      { label: "Match holdings", type: "map" },
      { label: "Draft morning briefing", type: "draft" },
      { label: "Editor review", type: "review" },
      { label: "Export briefing", type: "report" },
    ],
    reviewIndex: 4,
    pauseNote: "Three holdings-related moves are waiting for the editor.",
    approveLabel: "Approve briefing & publish",
    returnLabel: "Return for review",
    testedNote: "Sample test complete: 3 holdings-related moves go to the editor.",
  },
];

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// ─── Result previews (sample fixtures) ───────────────────────────────────────

const TH = "px-2.5 py-1.5 text-left text-[10.5px] font-medium text-ink-3";
const TH_R = cn(TH, "text-right");
const TD = "px-2.5 py-1.5 align-top text-ink-2";

function ReconcileResult() {
  const exceptions = navExceptions(0.5);
  const totals = navTotals(0.5);
  return (
    <div className="space-y-3">
      <p className="text-[12.5px] text-ink-2">
        {totals.fundCount} funds checked ·{" "}
        <span className="font-medium text-danger">{totals.exceptions} exceptions</span> · tolerance
        ±0.50%
      </p>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full border-collapse text-[11.5px]">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className={TH}>Fund</th>
              <th className={TH_R}>Internal NAV (HK$)</th>
              <th className={TH_R}>Difference %</th>
              <th className={TH}>Status</th>
            </tr>
          </thead>
          <tbody>
            {exceptions.map((r) => (
              <tr key={r.fund} className="border-b border-border/70 bg-danger-tint/30 last:border-0">
                <td className={cn(TD, "font-medium text-foreground")}>{r.fund}</td>
                <td className={cn(TD, "text-right tabular-nums")}>{fmtInt(r.internalNav)}</td>
                <td className={cn(TD, "text-right font-medium tabular-nums text-danger")}>
                  {fmtSignedPct(r.diffPct)}
                </td>
                <td className={cn(TD, "whitespace-nowrap")}>
                  <ToneChip tone="danger">Exception</ToneChip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-ink-3">
        Source: sample administrator NAV and internal valuation, 29 Sep 2026.
      </p>
    </div>
  );
}

function RiskResult() {
  const flagged = riskResults(90).filter((r) => r.status !== "Within limit");
  return (
    <div className="space-y-3">
      <p className="text-[12.5px] text-ink-2">
        Portfolio {fmtSignedHKD(RISK_PORTFOLIO_TOTAL).replace("+", "")} ·{" "}
        {flagged.length} positions flagged at the 90% review threshold
      </p>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full border-collapse text-[11.5px]">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className={TH}>Position</th>
              <th className={TH_R}>Weight</th>
              <th className={TH_R}>Limit</th>
              <th className={TH}>Status</th>
            </tr>
          </thead>
          <tbody>
            {flagged.map((r) => (
              <tr key={r.position} className="border-b border-border/70 last:border-0">
                <td className={cn(TD, "font-medium text-foreground")}>{r.position}</td>
                <td className={cn(TD, "text-right tabular-nums")}>{fmtPct(r.weight, 1)}</td>
                <td className={cn(TD, "text-right tabular-nums")}>{fmtPct(r.limitPct, 0)}</td>
                <td className={cn(TD, "whitespace-nowrap")}>
                  <ToneChip tone={rowStatusTone(r.status)}>{r.status}</ToneChip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-ink-3">Source: sample positions file and limit policy.</p>
    </div>
  );
}

function BriefingResult() {
  const moves = notableMoves(0.75).slice(0, 3);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-sm bg-primary-tint px-1.5 py-0.5 text-[11px] font-semibold text-primary-ink">
          AI-assisted draft
        </span>
        <span className="text-[11.5px] text-ink-3">Checked by an editor before export</span>
      </div>
      <ul className="space-y-1.5">
        {moves.map((m) => (
          <li
            key={m.instrument}
            className="flex items-baseline justify-between gap-3 border-b border-border/70 pb-1.5 text-[12px] last:border-0"
          >
            <span className="font-medium text-foreground">{m.instrument}</span>
            <span className="tabular-nums text-ink-2">{m.level}</span>
            <span
              className={cn(
                "tabular-nums",
                m.changePct < 0 ? "font-medium text-danger" : "text-ok",
              )}
            >
              {fmtSignedPct(m.changePct, 1)}
            </span>
          </li>
        ))}
      </ul>
      <div className="space-y-1.5 border-t border-border pt-2.5">
        {HOLDING_LINKS.slice(0, 2).map((h) => (
          <p key={h.holding} className="text-[11.5px] leading-snug text-ink-2">
            <span className="font-medium text-foreground">{h.holding}</span>: {h.move},{" "}
            <span className="tabular-nums">{fmtSignedHKD(h.estImpact)}</span> estimated effect
          </p>
        ))}
      </div>
      <p className="text-[11px] text-ink-3">
        Source: sample market snapshot, 30 Sep 2026, 07:45.
      </p>
    </div>
  );
}

const RESULTS: Record<string, () => React.ReactElement> = {
  reconcile: ReconcileResult,
  risk: RiskResult,
  briefing: BriefingResult,
};

// ─── Demo ────────────────────────────────────────────────────────────────────

export function FeatureDemo() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];
  const [states, setStates] = useState<RunStepState[]>(
    Array(SCENARIOS[0].steps.length).fill("queued") as RunStepState[],
  );
  const [phase, setPhase] = useState<Phase>("idle");
  const [ready, setReady] = useState(false);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const start = useCallback(
    (s: Scenario) => {
      clearTimers();
      setReady(false);
      if (prefersReducedMotion()) {
        setStates(
          s.steps.map((_, i) =>
            i < s.reviewIndex ? "complete" : i === s.reviewIndex ? "needs-review" : "queued",
          ) as RunStepState[],
        );
        setPhase("awaiting");
        return;
      }
      setStates(Array(s.steps.length).fill("queued") as RunStepState[]);
      setPhase("running");
      let i = 0;
      const step = () => {
        if (i >= s.reviewIndex) {
          setStates((prev) =>
            prev.map((v, idx) => (idx === s.reviewIndex ? "needs-review" : v)),
          );
          setPhase("awaiting");
          return;
        }
        setStates((prev) => prev.map((v, idx) => (idx === i ? "running" : v)));
        timers.current.push(
          window.setTimeout(() => {
            setStates((prev) => prev.map((v, idx) => (idx === i ? "complete" : v)));
            i += 1;
            timers.current.push(window.setTimeout(step, 160));
          }, 480),
        );
      };
      step();
    },
    [clearTimers],
  );

  const changeScenario = (id: string) => {
    const next = SCENARIOS.find((s) => s.id === id);
    if (!next) return;
    setScenarioId(id);
    start(next);
  };

  const approve = () => {
    clearTimers();
    setStates((prev) => prev.map((v, idx) => (idx === scenario.reviewIndex ? "complete" : v)));
    const remaining = scenario.steps.length - scenario.reviewIndex - 1;
    if (remaining === 0 || prefersReducedMotion()) {
      setStates(scenario.steps.map(() => "complete") as RunStepState[]);
      setPhase("done");
      return;
    }
    setPhase("running");
    let i = scenario.reviewIndex + 1;
    const step = () => {
      if (i >= scenario.steps.length) {
        setPhase("done");
        return;
      }
      setStates((prev) => prev.map((v, idx) => (idx === i ? "running" : v)));
      timers.current.push(
        window.setTimeout(() => {
          setStates((prev) => prev.map((v, idx) => (idx === i ? "complete" : v)));
          i += 1;
          timers.current.push(window.setTimeout(step, 160));
        }, 420),
      );
    };
    step();
  };

  const returnForReview = () => {
    clearTimers();
    setPhase("returned");
  };

  const tested = phase === "awaiting" || phase === "returned" || phase === "done";
  const Result = RESULTS[scenario.id];

  const statusChip = (label: string, active: boolean) => (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-1.5 py-0.5 font-mono text-xs text-slate-500",
        active &&
          "rounded border border-slate-200 bg-slate-100 px-2 py-0.5 font-semibold text-slate-900",
      )}
    >
      {label}
    </span>
  );

  return (
    <section
      id="product"
      className="section-light relative overflow-hidden"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      {/* 24px grid overlay, clamped to 1.5% opacity to sit behind the card frame */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.02) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          opacity: 0.015,
        }}
      />

      {/*
       * Strict 16:9 stage at lg+ (1920×1080 at design size): fixed height,
       * capped at 1080px, space-between so header / workspace / footer pin to
       * the frame. Below lg it relaxes to a normal flowing section.
       */}
      <div className="relative mx-auto flex w-full max-w-full flex-col gap-10 px-6 py-14 md:px-12 lg:h-[100svh] lg:max-h-[1080px] lg:aspect-[16/9] lg:gap-0 lg:justify-between lg:overflow-hidden lg:px-24 lg:py-12">
        {/* Section header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#0F172A]">
              <span
                aria-hidden="true"
                className="h-[3px] w-7 rounded-full bg-[#FF6B00] shadow-[0_0_8px_rgba(255,107,0,0.5)]"
              />
              Interactive sandbox
            </p>
            <h2 className="mt-4 text-[30px] font-bold leading-tight tracking-[-0.01em] text-[#0F172A] md:text-[32px]">
              Watch a promoted workflow execute step-by-step.
            </h2>
            <p className="mt-3 max-w-[720px] text-[14px] leading-relaxed text-[#475569]">
              Select a workflow below to test the pipeline: watch inputs process, inspect exception
              pauses, and approve the output.
            </p>
          </div>
          <SampleTag label="Simulated preview · Sample data" />
        </div>

        {/* Workflow selector + simulation card */}
        <div className="mx-auto w-full max-w-[1200px]">
          <Tabs value={scenario.id} onValueChange={changeScenario}>
            <TabsList className="flex h-auto w-full items-center gap-1 rounded-xl border border-slate-200/60 bg-slate-100/80 p-1.5">
              {SCENARIOS.map((s) => (
                <TabsTrigger
                  key={s.id}
                  value={s.id}
                  className="flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-slate-600 hover:data-[state=inactive]:bg-slate-200/50 hover:data-[state=inactive]:text-slate-900"
                >
                  {s.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            {/* Demo header */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-[#E2E8F0] pb-3.5">
              <div className="min-w-0">
                <p className="text-[14.5px] font-semibold tracking-[-0.01em] text-[#0F172A]">
                  {scenario.title}
                </p>
                <p className="mt-0.5 max-w-2xl text-[12px] leading-snug text-[#475569]">
                  {scenario.blurb}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <SampleTag />
                <Button
                  className="h-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 font-mono text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200/70"
                  onClick={() => start(scenario)}
                  disabled={phase === "running"}
                >
                  <RotateCcw className="size-3.5" aria-hidden="true" />
                  Run again
                </Button>
              </div>
            </div>

            {phase === "idle" ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                <p className="text-[13.5px] text-[#475569]">
                  This runs the selected workflow on labelled sample data.
                </p>
                <Button
                  size="sm"
                  onClick={() => start(scenario)}
                  className="bg-[#FF6B00] text-white shadow-[0_4px_16px_rgba(255,107,0,0.35)] hover:bg-[#FF7A1A]"
                >
                  <Play className="size-3.5" aria-hidden="true" />
                  Run on sample data
                </Button>
              </div>
            ) : (
              <div className="grid gap-5 py-4 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
                {/* Step timeline */}
                <div className="min-w-0 md:border-r md:border-[#E2E8F0] md:pr-5">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
                    Steps
                  </p>
                  <ol className="mt-3 space-y-2.5">
                    {scenario.steps.map((s, i) => {
                      const state = states[i] ?? "queued";
                      return (
                        <li key={s.label} className="flex items-center gap-2.5">
                          <span className="w-3.5 shrink-0 text-right text-[11px] tabular-nums text-[#64748B]">
                            {i + 1}
                          </span>
                          <StepTypeIcon type={s.type} className="size-3.5 shrink-0 text-[#64748B]" />
                          <span
                            className={cn(
                              "min-w-0 flex-1 truncate text-[12.5px]",
                              state === "queued"
                                ? "text-[#94A3B8]"
                                : "font-medium text-[#0F172A]",
                            )}
                          >
                            {s.label}
                          </span>
                          <StepStateIcon state={state} />
                        </li>
                      );
                    })}
                  </ol>
                </div>

                {/* Results + decision */}
                <div className="min-w-0">
                  {phase === "running" && states.indexOf("running") < scenario.reviewIndex ? (
                    <div className="flex h-full min-h-[176px] flex-col items-center justify-center gap-2 text-center">
                      <p className="text-[12.5px] text-[#475569]">
                        Running step {Math.max(states.indexOf("running") + 1, 1)} of{" "}
                        {scenario.steps.length}…
                      </p>
                      <p className="text-[11.5px] text-[#64748B]">
                        Results appear here as the sample run reaches the review gate.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Result ? <Result /> : null}
                      {phase === "awaiting" && (
                        <div className="my-4 rounded-xl border border-amber-200/80 bg-amber-50/70 p-4">
                          <p className="mb-3 flex items-center gap-2 text-xs font-medium text-amber-900">
                            <CircleAlert className="size-3.5 text-[#E14E00]" aria-hidden="true" />
                            Paused for human review: {scenario.pauseNote}
                          </p>
                          <p className="mt-1 text-[11.5px] text-[#475569]">
                            Approving completes the run; returning pauses the workflow for further
                            inspection.
                          </p>
                          <div className="mt-2.5 flex flex-wrap gap-2">
                            <Button
                              className="h-auto inline-flex items-center gap-1 rounded-lg bg-[#FF6B00] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors has-[>svg]:px-4 hover:bg-[#E56000]"
                              onClick={approve}
                            >
                              {scenario.approveLabel}
                              <ArrowRight className="size-3.5" aria-hidden="true" />
                            </Button>
                            <Button
                              className="ml-2 h-auto inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-xs transition-colors hover:bg-slate-50"
                              onClick={returnForReview}
                            >
                              {scenario.returnLabel}
                            </Button>
                          </div>
                        </div>
                      )}
                      {phase === "returned" && (
                        <div className="rounded-xl border border-[#FF6B00]/25 bg-[#FFF0E6] px-3.5 py-3 text-[12.5px] text-[#475569]">
                          Returned for review. The run stays paused and the final step does not run
                          until a person approves.{" "}
                          <button
                            type="button"
                            onClick={() => start(scenario)}
                            className="font-medium text-[#C24300] underline-offset-2 hover:underline"
                          >
                            Run again
                          </button>
                        </div>
                      )}
                      {phase === "done" && (
                        <p className="rounded-xl border border-ok/30 bg-ok-tint px-3.5 py-2.5 text-[12.5px] font-medium text-ok">
                          Run complete. Reviewed and finalised in this simulation.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Test before publishing */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[#E2E8F0] pt-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
                Status
              </p>
              <div className="flex items-center gap-1.5">
                {statusChip("Draft", phase === "idle")}
                <span className="text-[#94A3B8]" aria-hidden="true">
                  →
                </span>
                {statusChip(
                  phase === "running" ? "Testing" : "Tested",
                  phase === "running" || tested,
                )}
                <span className="text-[#94A3B8]" aria-hidden="true">
                  →
                </span>
                {statusChip("Ready to publish", ready)}
              </div>
              <p className="text-[11.5px] text-[#475569]">
                {phase === "idle" && "Runs on sample data before anything is marked ready."}
                {phase === "running" && "Running the workflow on sample data…"}
                {tested && !ready && scenario.testedNote}
                {ready && "Deployed to production (simulated publish state)."}
              </p>
              {tested && !ready && (
                <Button
                  className="ml-auto h-auto rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
                  onClick={() => setReady(true)}
                >
                  Deploy to production
                </Button>
              )}
            </div>

            <p className="sr-only" aria-live="polite">
              {phase === "idle" && "Demo ready. Press run to start the sample workflow."}
              {phase === "running" && "Sample run in progress."}
              {phase === "awaiting" && "Sample run paused at review, awaiting a simulated decision."}
              {phase === "returned" && "Sample run returned for review."}
              {phase === "done" && "Sample run complete."}
            </p>
          </div>
        </div>

        {/* Footer explanation grid */}
        <div className="grid gap-3 text-[13px] leading-[1.4] text-[#64748B] sm:grid-cols-3">
          <p>
            <span className="font-semibold text-[#0F172A]">1. Start from a template.</span> Input,
            calculation, check, review and output arrive as an ordered workflow.
          </p>
          <p>
            <span className="font-semibold text-[#0F172A]">2. Watch every step.</span> The timeline
            moves from queued to complete, with the key setting shown beside it.
          </p>
          <p>
            <span className="font-semibold text-[#0F172A]">3. Test, then publish.</span> A sample
            test shows the outcome before a workflow is marked ready.
          </p>
        </div>
      </div>
    </section>
  );
}
