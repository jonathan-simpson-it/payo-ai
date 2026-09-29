"use client";

import { ArrowLeft, ChevronRight, FileText, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getTemplate, runSummary } from "@/lib/payo/data";
import { fmtDateTime } from "@/lib/payo/format";
import { navigate } from "@/lib/payo/router";
import { usePayo } from "@/lib/payo/store";
import type { RunStepRecord } from "@/lib/payo/types";
import { FindingsSection, ReportPreview } from "@/components/payo/reports";
import { RunStatusChip, SampleTag, StepStateIcon } from "@/components/payo/ui";
import { cn } from "@/lib/utils";

const STATE_LABEL: Record<string, string> = {
  queued: "Queued",
  running: "Running…",
  complete: "Complete",
  "needs-review": "Needs review",
};

const SECTION_HEADING =
  "text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink-3";

// ─── Runs list ───────────────────────────────────────────────────────────────

export function RunsList() {
  const { state } = usePayo();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:px-10">
      <header>
        <h1 className="text-[24px] font-semibold tracking-[-0.01em]">Runs</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-2">
          Every run of a workflow, with its steps, sample sources and findings. Runs are simulated
          and use labelled sample data.
        </p>
      </header>

      <div className="mt-8 overflow-hidden rounded-md border border-border bg-card">
        <div className="hidden gap-3 border-b border-border bg-muted/30 px-4 py-2.5 text-[11.5px] font-medium text-ink-3 md:grid md:grid-cols-[86px_1.1fr_160px_110px_1.7fr_16px]">
          <span>Run</span>
          <span>Workflow</span>
          <span>Started</span>
          <span>Status</span>
          <span>Summary</span>
          <span />
        </div>
        {state.runs.map((run) => (
          <a
            key={run.id}
            href={`#/workspace/runs/${run.id}`}
            className="grid gap-1.5 border-b border-border px-4 py-3.5 transition-colors last:border-0 hover:bg-muted/40 focus-visible:bg-muted/40 md:grid-cols-[86px_1.1fr_160px_110px_1.7fr_16px] md:items-center md:gap-3"
          >
            <span className="text-[12.5px] font-medium tabular-nums text-primary">{run.code}</span>
            <span className="truncate text-[13.5px] font-medium text-foreground">
              {run.workflowName}
            </span>
            <span className="text-[12.5px] tabular-nums text-ink-2">{fmtDateTime(run.startedAt)}</span>
            <RunStatusChip status={run.status} />
            <span className="text-[12.5px] leading-snug text-ink-2">
              {run.statusNote ?? runSummary(run)}
            </span>
            <ChevronRight className="hidden size-4 text-ink-3 md:block" aria-hidden="true" />
          </a>
        ))}
      </div>
      <p className="mt-4 text-[12px] text-ink-3">
        Step durations shown in run details are simulated for demonstration.
      </p>
    </div>
  );
}

// ─── Run detail ──────────────────────────────────────────────────────────────

function TimelineRow({
  step,
  isLast,
  progress,
}: {
  step: RunStepRecord;
  isLast: boolean;
  progress?: number;
}) {
  return (
    <li className="relative flex gap-3 pb-4 last:pb-0">
      {!isLast && (
        <span className="absolute bottom-0 left-[7.5px] top-5 w-px bg-border" aria-hidden="true" />
      )}
      <span className="relative z-10 mt-px flex size-4 shrink-0 items-center justify-center bg-card">
        <StepStateIcon state={step.state} />
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-[13.5px] font-medium leading-snug",
            step.state === "queued" ? "text-ink-3" : "text-foreground",
          )}
        >
          {step.label}
        </p>
        <p className="mt-0.5 text-[11.5px] leading-snug text-ink-3">
          {STATE_LABEL[step.state]}
          {step.state === "complete" && step.durationSec != null && ` · ${step.durationSec.toFixed(1)}s · Simulated`}
          {step.note && ` · ${step.note}`}
        </p>
        {step.state === "running" && (
          <div
            className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label={`${step.label} progress`}
            aria-valuenow={Math.round((progress ?? 0) * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-150 ease-linear"
              style={{ width: `${Math.min(100, (progress ?? 0) * 100)}%` }}
            />
          </div>
        )}
      </div>
    </li>
  );
}

export function RunDetail({ runId }: { runId: string }) {
  const { state, runById, workflowById, startRun } = usePayo();
  const run = runById(runId);

  if (!run) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="text-[20px] font-semibold">Run not found</h1>
        <p className="mt-2 text-[14px] text-ink-2">This run does not exist in the demo workspace.</p>
        <Button asChild className="mt-6" size="sm">
          <a href="#/workspace/runs">Back to runs</a>
        </Button>
      </div>
    );
  }

  const wf = workflowById(run.workflowId);
  const template = wf ? getTemplate(wf.templateId) : undefined;
  const engineBusy = state.engine != null && state.engine.phase !== "done";
  const liveEngine =
    state.engine?.runId === run.id && state.engine.phase !== "done" ? state.engine : null;
  const timeline: RunStepRecord[] = run.timeline.map((t) =>
    liveEngine ? { ...t, state: liveEngine.states[t.stepId] ?? t.state } : t,
  );
  const liveProgress =
    liveEngine?.phase === "running" ? liveEngine.progress : undefined;
  const pausedLabel = liveEngine?.steps[liveEngine.activeIndex]?.label;

  const handleRunAgain = () => {
    const id = startRun(run.workflowId);
    if (id) navigate(`/workspace/workflows/${run.workflowId}`);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 md:px-10">
      <a
        href="#/workspace/runs"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-2 transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Runs
      </a>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.01em]">
            {run.workflowName} — Run {run.code}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-ink-2">
            <RunStatusChip status={run.status} />
            <span className="tabular-nums">Started {fmtDateTime(run.startedAt)}</span>
            {run.finishedAt && (
              <span className="tabular-nums">· finished {fmtDateTime(run.finishedAt)}</span>
            )}
            <span className="text-ink-3">Simulated</span>
          </div>
          {run.statusNote && (
            <p className="mt-2 text-[13px] font-medium text-warn">{run.statusNote}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={`#/workspace/workflows/${run.workflowId}`}>Back to workflow</a>
          </Button>
          <Button size="sm" onClick={handleRunAgain} disabled={engineBusy}>
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Run again
          </Button>
        </div>
      </div>

      {liveEngine && liveEngine.phase === "awaiting-review" && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-warn/40 bg-warn-tint/60 px-4 py-3">
          <p className="text-[13.5px] text-ink-2">
            This run is paused at <span className="font-medium text-foreground">{pausedLabel}</span>.
            The review decision is made in the workflow.
          </p>
          <Button asChild size="sm">
            <a href={`#/workspace/workflows/${run.workflowId}`}>Open workflow</a>
          </Button>
        </div>
      )}

      <div className="mt-8 grid gap-x-10 gap-y-10 xl:grid-cols-[300px_1fr]">
        {/* Left column — steps and sources */}
        <div className="space-y-8">
          <section aria-labelledby="run-steps">
            <h2 id="run-steps" className={SECTION_HEADING}>
              Steps
            </h2>
            <ol className="mt-4">
              {timeline.map((t, i) => (
                <TimelineRow
                  key={t.stepId}
                  step={t}
                  isLast={i === timeline.length - 1}
                  progress={t.state === "running" ? liveProgress : undefined}
                />
              ))}
            </ol>
          </section>

          <section aria-labelledby="run-sources">
            <h2 id="run-sources" className={cn(SECTION_HEADING, "flex items-center gap-2")}>
              Sample sources
              <SampleTag />
            </h2>
            <ul className="mt-4 space-y-2.5">
              {run.sources.map((s) => (
                <li key={s} className="flex items-start gap-2.5 text-[13px] leading-snug text-ink-2">
                  <FileText className="mt-0.5 size-3.5 shrink-0 text-ink-3" aria-hidden="true" />
                  {s}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right column — results and report */}
        <div className="min-w-0 space-y-10">
          {run.status === "draft" ? (
            <section aria-labelledby="run-draft">
              <h2 id="run-draft" className={SECTION_HEADING}>
                Result
              </h2>
              <div className="mt-4 rounded-md border border-border bg-card px-5 py-5">
                <p className="text-[14px] font-medium">This run has not been started.</p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">
                  It was configured in the workflow but never run. Runs use labelled sample data.
                </p>
                <Button asChild size="sm" className="mt-4">
                  <a href={`#/workspace/workflows/${run.workflowId}`}>Open workflow</a>
                </Button>
              </div>
            </section>
          ) : (
            <>
              {wf && template && (
                <section aria-labelledby="run-findings">
                  <h2 id="run-findings" className={SECTION_HEADING}>
                    Results — sample data
                  </h2>
                  <div className="mt-4">
                    <FindingsSection templateId={wf.templateId} config={run.config} />
                  </div>
                </section>
              )}

              <section aria-labelledby="run-report">
                <h2 id="run-report" className={SECTION_HEADING}>
                  Final report
                </h2>
                <div className="mt-4">
                  {run.status === "completed" && template ? (
                    <ReportPreview template={template} config={run.config} review={run.review} />
                  ) : (
                    <div className="rounded-md border border-dashed border-line-strong bg-card/60 px-5 py-5">
                      <p className="text-[14px] font-medium text-ink-2">
                        The report is not available yet.
                      </p>
                      <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-3">
                        The run is paused at its review step. The report is prepared once the
                        review is approved.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
