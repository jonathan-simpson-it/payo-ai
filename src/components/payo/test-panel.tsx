"use client";

import { Check, Eye, Play, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FindingsSection } from "@/components/payo/reports";
import { SampleTag, StepStateIcon, StepTypeIcon, WorkflowStatusChip } from "@/components/payo/ui";
import {
  navExceptions,
  notableMoves,
  riskResults,
  snapshotConfig,
} from "@/lib/payo/data";
import { usePayo } from "@/lib/payo/store";
import type { RunStepState, Workflow } from "@/lib/payo/types";
import { cn } from "@/lib/utils";

/** One-line outcome of a sample test, derived from the workflow's own settings. */
function testOutcome(wf: Workflow): string {
  const config = snapshotConfig(wf);
  switch (wf.templateId) {
    case "nav-reconciliation": {
      const ex = navExceptions(config.tolerance ?? 0.5).length;
      return ex === 0
        ? "No exceptions at the current tolerance — the run would complete without a review pause."
        : `${ex} exceptions will pause the run at “Review material variances”.`;
    }
    case "position-risk": {
      const rows = riskResults(config.reviewThreshold ?? 90);
      const over = rows.filter((r) => r.status === "Over limit").length;
      const near = rows.filter((r) => r.status === "Near limit").length;
      return `${over} over limit and ${near} near limit — those positions pause the run at “Analyst review”.`;
    }
    case "market-movements": {
      const n = notableMoves(config.notableThreshold ?? 0.75).length;
      return `${n} notable moves would go to the editor before export.`;
    }
    default:
      return "Sample data test complete.";
  }
}

export function TestPanel({ workflow, onExit }: { workflow: Workflow; onExit: () => void }) {
  const { state, startTest, markReady } = usePayo();
  const test = state.test?.workflowId === workflow.id ? state.test : null;
  const running = test?.phase === "running";
  const done = test?.phase === "done";

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-5xl px-6 py-6 md:px-10">
        {/* Mode header */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">
              <Eye className="size-3.5" aria-hidden="true" />
              Test mode
            </p>
            <h1 className="mt-1 text-[19px] font-semibold tracking-[-0.01em]">
              Test on sample data
            </h1>
          </div>
          <WorkflowStatusChip status={workflow.status} />
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <SampleTag label="Simulated test" />
            <Button
              size="sm"
              variant="outline"
              onClick={() => startTest(workflow.id)}
              disabled={running}
            >
              {done ? (
                <RotateCcw className="size-3.5" aria-hidden="true" />
              ) : (
                <Play className="size-3.5" aria-hidden="true" />
              )}
              {done || !test ? "Run test again" : "Running…"}
            </Button>
            <Button size="sm" variant="ghost" onClick={onExit}>
              Exit test
            </Button>
          </div>
        </div>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-ink-2">
          A test runs this workflow against the sample inputs and shows the steps beside the
          results. No run record is created, and nothing is published.
        </p>

        {!test ? (
          <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-line-strong bg-card/60 px-6 py-16 text-center">
            <p className="text-[13.5px] text-ink-2">
              This workflow has not been tested in this session.
            </p>
            <Button size="sm" onClick={() => startTest(workflow.id)}>
              <Play className="size-3.5" aria-hidden="true" />
              Run test on sample data
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
            {/* Step progress */}
            <section aria-label="Test steps">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                Steps
              </p>
              <ol className="mt-3 space-y-2.5">
                {test.steps.map((s, i) => {
                  const stepState: RunStepState = test.states[s.id] ?? "queued";
                  return (
                    <li key={s.id} className="flex items-center gap-2.5">
                      <span className="w-3.5 shrink-0 text-right text-[11px] tabular-nums text-ink-3">
                        {i + 1}
                      </span>
                      <StepTypeIcon type={s.type} className="size-3.5 shrink-0 text-ink-3" />
                      <span
                        className={cn(
                          "min-w-0 flex-1 truncate text-[12.5px]",
                          stepState === "queued" ? "text-ink-3" : "font-medium text-foreground",
                        )}
                      >
                        {s.label}
                      </span>
                      <StepStateIcon state={stepState} />
                    </li>
                  );
                })}
              </ol>
              <p className="mt-3 text-[11.5px] leading-snug text-ink-3">
                In a real run, the review step pauses for a person. In a test, Payo marks the gate
                and continues so the whole path can be inspected.
              </p>
            </section>

            {/* Results beside the progress */}
            <section aria-label="Test results" className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                Results preview — sample data
              </p>
              <div className="mt-3 space-y-4">
                <FindingsSection templateId={workflow.templateId} config={snapshotConfig(workflow)} />

                {done && (
                  <div className="rounded-md border border-ok/30 bg-ok-tint/50 px-4 py-3">
                    <p className="flex items-center gap-2 text-[13px] font-medium text-ok">
                      <Check className="size-4" aria-hidden="true" />
                      Test complete — {testOutcome(workflow)}
                    </p>
                  </div>
                )}
                {running && (
                  <p className="text-[12.5px] text-ink-2">
                    Running the test on sample data…
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-card px-4 py-3">
                  {workflow.status === "ready" ? (
                    <p className="text-[12.5px] text-ink-2">
                      This workflow is marked <span className="font-medium text-ok">ready to publish</span>.
                      Further edits return it to draft.
                    </p>
                  ) : (
                    <>
                      <p className="text-[12.5px] text-ink-2">
                        {workflow.status === "tested"
                          ? "Test passed — mark the workflow ready when you are satisfied with it."
                          : "Mark the workflow ready once the test looks right."}
                      </p>
                      <Button
                        size="sm"
                        className="ml-auto"
                        onClick={() => markReady(workflow.id)}
                        disabled={!done}
                      >
                        Mark ready to publish
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
