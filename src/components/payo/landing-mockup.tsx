"use client";

import { motion } from "framer-motion";
import { Check, ChevronRight, CircleAlert, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Composed, non-interactive preview of the Payo builder: a NAV reconciliation
 * workflow paused at its review gate. Decorative only (aria-hidden).
 */

interface MockStep {
  type: string;
  label: string;
  detail: string;
  state: "complete" | "needs-review";
}

const STEPS: MockStep[] = [
  { type: "Load data", label: "Load sample valuations", detail: "Sample administrator NAV", state: "complete" },
  { type: "Calculate", label: "Calculate variance", detail: "Difference % of administrator NAV", state: "complete" },
  { type: "Check limit", label: "Flag tolerance breaches", detail: "Tolerance ±0.50%", state: "complete" },
  { type: "Request review", label: "Review material variances", detail: "Pauses for operations reviewer", state: "needs-review" },
];

const EXCEPTIONS = [
  { fund: "Ferngate Diversified", admin: "9,864,720", internal: "9,998,300", pct: "+1.35%" },
  { fund: "Harborpoint Property", admin: "4,518,300", internal: "4,438,250", pct: "−1.77%" },
];

export function ProductMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none select-none overflow-hidden rounded-lg border border-line-strong bg-card shadow-[0_1px_2px_rgba(29,40,54,0.05),0_16px_40px_-16px_rgba(29,40,54,0.16)]"
      >
        {/* Mini top bar */}
        <div className="flex items-center gap-3 border-b border-border bg-background px-4 py-2.5">
          <span className="size-2 rounded-[2px] bg-primary" />
          <span className="text-[13px] font-semibold text-foreground">NAV reconciliation</span>
          <span className="rounded-sm bg-neutral-tint px-1.5 py-px text-[10.5px] font-medium text-ink-2">Draft</span>
          <span className="ml-auto rounded-md bg-primary px-2.5 py-1 text-[11.5px] font-medium text-primary-foreground">
            Run workflow
          </span>
        </div>

        {/* Sample-data notice */}
        <div className="flex items-center gap-2 border-b border-border bg-primary-tint/60 px-4 py-1.5">
          <span className="size-1.5 rounded-full bg-primary" />
          <span className="text-[11.5px] text-ink-2">Using sample data for this demonstration.</span>
        </div>

        {/* Workflow canvas */}
        <div className="relative overflow-hidden bg-background px-4 py-5">
          <div className="flex items-stretch gap-0">
            {STEPS.map((s, i) => (
              <div key={s.label} className="flex items-center">
                {i > 0 && (
                  <ChevronRight
                    className={cn("mx-1 size-4 shrink-0", i < STEPS.length ? "text-ink-3/60" : "")}
                    strokeWidth={1.75}
                  />
                )}
                <div
                  className={cn(
                    "w-[168px] shrink-0 rounded-md border bg-card p-3 text-left",
                    s.state === "needs-review" ? "border-warn/50" : "border-border",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-3">{s.type}</span>
                    {s.state === "complete" ? (
                      <span className="grid size-3.5 place-items-center rounded-full bg-ok-tint text-ok">
                        <Check className="size-2" strokeWidth={3.5} />
                      </span>
                    ) : (
                      <CircleAlert className="size-3.5 text-warn" />
                    )}
                  </div>
                  <p className="mt-1.5 text-[12.5px] font-medium leading-snug text-foreground">{s.label}</p>
                  <p className="mt-1 text-[11px] leading-snug text-ink-3">{s.detail}</p>
                </div>
              </div>
            ))}
            <ChevronRight className="mx-1 size-4 shrink-0 text-ink-3/60" strokeWidth={1.75} />
            <div className="flex w-[52px] shrink-0 items-center justify-center rounded-md border border-dashed border-line-strong text-ink-3">
              <Plus className="size-4" strokeWidth={1.75} />
            </div>
          </div>
          {/* Fade suggesting the flow continues */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-r from-transparent to-background" />
        </div>

        {/* Review gate */}
        <div className="border-t border-border bg-card px-4 py-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12.5px] font-semibold text-foreground">Review material variances</span>
            <span className="rounded-sm bg-warn-tint px-1.5 py-px text-[10.5px] font-medium text-warn">Needs review</span>
            <span className="ml-auto inline-flex items-center gap-1.5 rounded border border-border px-1.5 py-px text-[10.5px] font-medium text-ink-3">
              <span className="size-1 rounded-full bg-ink-3/70" />
              Sample data
            </span>
          </div>
          <div className="mt-2.5 overflow-hidden rounded-md border border-border">
            <table className="w-full text-[11.5px]">
              <tbody>
                {EXCEPTIONS.map((e, i) => (
                  <tr key={e.fund} className={i > 0 ? "border-t border-border" : ""}>
                    <td className="px-2.5 py-1.5 font-medium text-foreground">{e.fund}</td>
                    <td className="px-2.5 py-1.5 text-right tabular-nums text-ink-2">{e.admin}</td>
                    <td className="px-2.5 py-1.5 text-right tabular-nums text-ink-2">{e.internal}</td>
                    <td className="px-2.5 py-1.5 text-right font-medium tabular-nums text-danger">{e.pct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center justify-end gap-2">
            <span className="rounded-md border border-border px-2.5 py-1 text-[11.5px] font-medium text-ink-2">
              Return for review
            </span>
            <span className="rounded-md bg-primary px-2.5 py-1 text-[11.5px] font-medium text-primary-foreground">
              Approve summary
            </span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-[12px] text-ink-3">Simulated preview · Sample data</p>
    </motion.div>
  );
}
