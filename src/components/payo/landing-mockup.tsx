"use client";

import { Check, ChevronRight, Circle, CircleAlert } from "lucide-react";

import { NAV_FUNDS, NAV_VALUATION_DATE, navResults } from "@/lib/payo/data";
import { fmtInt, fmtSignedPct } from "@/lib/payo/format";
import type { RunStepState } from "@/lib/payo/types";
import { ToneChip, rowStatusTone } from "@/components/payo/ui";
import { PayoMark } from "@/components/payo/mark";
import { cn } from "@/lib/utils";

/**
 * Hero preview: a believable NAV reconciliation screen paused at its review
 * gate. Decorative only — every figure is sample data and nothing here is
 * interactive (the real screens live in the workspace).
 */

const STEP_RAIL: { label: string; state: RunStepState }[] = [
  { label: "Load valuations", state: "complete" },
  { label: "Map funds", state: "complete" },
  { label: "Calculate variance", state: "complete" },
  { label: "Flag breaches", state: "complete" },
  { label: "Review variances", state: "needs-review" },
  { label: "Create summary", state: "queued" },
];

const SHOWN_FUNDS = [
  "Ashbourne Global Equity",
  "Brookfield Income",
  "Delmore Credit",
  "Ferngate Diversified",
  "Harborpoint Property",
  "Elmwood Sterling Bond",
];

function StateDot({ state }: { state: RunStepState }) {
  if (state === "complete") {
    return (
      <span className="grid size-3.5 shrink-0 place-items-center rounded-full bg-ok-tint text-ok">
        <Check className="size-2" strokeWidth={3.5} />
      </span>
    );
  }
  if (state === "needs-review") {
    return <CircleAlert className="size-3.5 shrink-0 text-warn" />;
  }
  return <Circle className="size-3.5 shrink-0 text-ink-3/50" />;
}

export function ProductMockup() {
  const rows = navResults(0.5).filter((r) => SHOWN_FUNDS.includes(r.fund));
  const exceptions = rows.filter((r) => r.status === "Exception").length;

  return (
    <div className="relative min-w-0">
      <div
        role="img"
        aria-label="Simulated preview of a NAV reconciliation workflow paused for review, with two material variances highlighted."
        className="overflow-hidden rounded-lg border border-line-strong bg-card shadow-[0_1px_2px_rgba(15,23,42,0.05),0_18px_44px_-24px_rgba(15,23,42,0.25)]"
      >
        <div aria-hidden="true">
          {/* Window bar */}
          <div className="flex items-center gap-2.5 border-b border-border bg-background px-4 py-2.5">
            <PayoMark className="size-[18px]" blink={false} />
            <span className="text-[13px] font-semibold tracking-tight text-foreground">Payo AI</span>
            <span className="text-ink-3/60">/</span>
            <span className="truncate text-[13px] font-medium text-ink-2">
              NAV reconciliation
            </span>
            <span className="ml-auto hidden items-center gap-1.5 rounded border border-border bg-card px-1.5 py-px text-[10.5px] font-medium text-ink-3 sm:inline-flex">
              <span className="size-1.5 rounded-full bg-ink-3/70" />
              Sample data
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-warn-tint px-1.5 py-px text-[10.5px] font-medium text-warn">
              <span className="size-1.5 rounded-full bg-warn" />
              Needs review
            </span>
          </div>

          {/* Step rail */}
          <div className="flex items-center gap-1 overflow-hidden border-b border-border bg-background/60 px-4 py-2.5">
            {STEP_RAIL.map((s, i) => (
              <div key={s.label} className="flex min-w-0 items-center">
                {i > 0 && (
                  <ChevronRight className="mx-0.5 size-3 shrink-0 text-ink-3/40" strokeWidth={1.75} />
                )}
                <span
                  className={cn(
                    "flex min-w-0 items-center gap-1.5 rounded-sm border px-1.5 py-1",
                    s.state === "needs-review"
                      ? "border-warn/50 bg-warn-tint/50"
                      : s.state === "queued"
                        ? "border-transparent text-ink-3"
                        : "border-transparent text-ink-2",
                  )}
                >
                  <StateDot state={s.state} />
                  <span className="truncate text-[10.5px] font-medium leading-none">{s.label}</span>
                </span>
              </div>
            ))}
          </div>

          {/* Reconciliation table */}
          <div className="px-4 pt-3">
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full border-collapse text-[11.5px]">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left text-[10.5px] font-medium text-ink-3">
                    <th className="px-2.5 py-1.5 font-medium">Fund</th>
                    <th className="px-2.5 py-1.5 text-right font-medium">Administrator NAV (£)</th>
                    <th className="px-2.5 py-1.5 text-right font-medium">Internal NAV (£)</th>
                    <th className="px-2.5 py-1.5 text-right font-medium">Difference %</th>
                    <th className="px-2.5 py-1.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.fund}
                      className={cn(
                        "border-b border-border/70 last:border-0",
                        r.status === "Exception" && "bg-danger-tint/40",
                      )}
                    >
                      <td className="whitespace-nowrap px-2.5 py-1.5 font-medium text-foreground">
                        {r.fund}
                      </td>
                      <td className="whitespace-nowrap px-2.5 py-1.5 text-right tabular-nums text-ink-2">
                        {fmtInt(r.adminNav)}
                      </td>
                      <td className="whitespace-nowrap px-2.5 py-1.5 text-right tabular-nums text-ink-2">
                        {fmtInt(r.internalNav)}
                      </td>
                      <td
                        className={cn(
                          "whitespace-nowrap px-2.5 py-1.5 text-right tabular-nums",
                          r.status === "Exception" ? "font-medium text-danger" : "text-ink-2",
                        )}
                      >
                        {fmtSignedPct(r.diffPct)}
                      </td>
                      <td className="whitespace-nowrap px-2.5 py-1.5">
                        <ToneChip tone={rowStatusTone(r.status)}>{r.status}</ToneChip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[10.5px] text-ink-3">
              Valuation date {NAV_VALUATION_DATE} · tolerance ±0.50% · {exceptions} exceptions of{" "}
              {rows.length} funds shown
            </p>
          </div>

          {/* Review gate */}
          <div className="mt-3 border-t border-border bg-warn-tint/30 px-4 py-3">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <CircleAlert className="size-3.5 text-warn" />
              <p className="text-[12px] font-medium text-foreground">
                Paused for review — 2 material variances above tolerance
              </p>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] text-ink-3">
                A person checks each variance before the summary is created.
              </p>
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-ink-2">
                  Return for review
                </span>
                <span className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground">
                  Approve summary
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-[12px] text-ink-3">Simulated preview · Sample data</p>
    </div>
  );
}
