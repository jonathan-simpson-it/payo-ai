"use client";

import { Check, Eye, Play, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FindingsSection } from "@/components/payo/reports";
import { SampleTag, StepStateIcon, StepTypeIcon, WorkflowStatusChip } from "@/components/payo/ui";
import { checkOutcome, snapshotConfig } from "@/lib/payo/data";
import { usePayo } from "@/lib/payo/store";
import type { RunStepState, Workflow } from "@/lib/payo/types";
import { cn } from "@/lib/utils";

/** One-line outcome of a sample test, derived from the workflow's own settings. */
function testOutcome(wf: Workflow): string {
  const config = snapshotConfig(wf);
  const review = wf.steps.find((s) => s.type === "review");
  const { flagged } = checkOutcome(wf.sampleProfile, config);
  if (!review) {
    return "No review step. The run would complete without pausing for a person.";
  }
  if (flagged === 0 && review.when === "only-when-exceptions") {
    return `Nothing is outside the set limits. The review step would be skipped at the current settings.`;
  }
  if (flagged === 0) {
    return `Nothing is outside the set limits. The review step still pauses for a person.`;
  }
  return `${flagged} item${flagged === 1 ? "" : "s"} would pause the run at “${review.label}”.`;
}

export function TestPanel({
  workflow,
  onExit,
  onInspectStep,
}: {
  workflow: Workflow;
  onExit: () => void;
  onInspectStep: (stepId: string) => void;
}) {
  const { state, startTest } = usePayo();
  const test = state.test?.workflowId === workflow.id ? state.test : null;
  const running = test?.phase === "running";
  const done = test?.phase === "done";

  return (
    <div data-tour="test-panel" className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 py-6 md:px-10">
        {/* Mode header */}
        <div data-tour="test-header" className="flex flex-wrap items-center gap-x-3 gap-y-2">
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
            <Button size="sm" variant="ghost" data-tour="exit-test" onClick={onExit}>
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
            <section aria-label="Test steps" className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                Steps
              </p>
              <ol className="mt-3 space-y-2.5">
                {test.steps.map((s, i) => {
                  const stepState: RunStepState = test.states[s.id] ?? "queued";
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        aria-label={`Inspect ${s.label}. ${stepState.replace("-", " ")}.`}
                        title="Inspect in the builder"
                        onClick={() => onInspectStep(s.id)}
                        className="flex w-full items-center gap-2.5 rounded-md px-1 py-1 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
                      >
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
                      </button>
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
                Results preview: sample data
              </p>
              <div className="mt-3 space-y-4">
                <FindingsSection profile={workflow.sampleProfile} config={snapshotConfig(workflow)} />

                {done && (
                  <div className="rounded-md border border-positive-border bg-positive px-4 py-3 text-positive-foreground">
                    <p className="flex items-center gap-2 text-[13px] font-medium">
                      <Check className="size-4" aria-hidden="true" />
                      Test complete. {testOutcome(workflow)}
                    </p>
                  </div>
                )}
                {running && (
                  <p className="text-[12.5px] text-ink-2">
                    Running the test on sample data…
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-card px-4 py-3">
                  {workflow.status === "ready" || workflow.status === "published" ? (
                    <p className="text-[12.5px] text-ink-2">
                      This workflow is{" "}
                      <span className="inline-flex items-center rounded-sm bg-positive px-1.5 py-0.5 text-[12px] font-medium text-positive-foreground">
                        {workflow.status === "published" ? "published" : "ready to publish"}
                      </span>
                      . Further edits return it to draft.
                    </p>
                  ) : (
                    <>
                      <p className="text-[12.5px] text-ink-2">
                        {done
                          ? "Test passed. Exit test to check readiness and publish from the workflow header."
                          : "Run the test to preview this workflow on labelled sample data."}
                      </p>
                      <Button size="sm" className="ml-auto" onClick={onExit} disabled={!done}>
                        Exit test
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
