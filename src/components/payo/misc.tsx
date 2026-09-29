"use client";

import { ArrowRight, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { runSummary } from "@/lib/payo/data";
import { fmtDateTime, fmtLongDate } from "@/lib/payo/format";
import { usePayo } from "@/lib/payo/store";
import { RunStatusChip, SampleTag, WorkflowStatusChip } from "@/components/payo/ui";

const SECTION_HEADING = "text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink-3";

// ─── Overview ────────────────────────────────────────────────────────────────

export function OverviewScreen() {
  const { state, lastRunFor } = usePayo();
  const recentRuns = state.runs.slice(0, 4);
  const today = fmtLongDate(new Date());

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:px-10">
      <header>
        <h1 className="text-[24px] font-semibold tracking-[-0.01em]">Overview</h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[14px] text-ink-2">
          <span suppressHydrationWarning>{today}</span>
          <span className="text-ink-3">· Sample workspace</span>
          <SampleTag />
        </p>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ink-2">
          A demo workspace showing how a finance team uses Payo. Every workflow, run and approval
          here is simulated.
        </p>
      </header>

      <div className="mt-10 grid gap-x-12 gap-y-10 lg:grid-cols-[1fr_290px]">
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="recent-runs">
            <div className="flex items-center justify-between">
              <h2 id="recent-runs" className={SECTION_HEADING}>
                Recent runs
              </h2>
              <a
                href="#/workspace/runs"
                className="text-[12.5px] font-medium text-primary transition-colors hover:text-primary-deep"
              >
                All runs
              </a>
            </div>
            <ul className="mt-4">
              {recentRuns.map((run) => (
                <li key={run.id} className="border-t border-border last:border-b">
                  <a
                    href={`#/workspace/runs/${run.id}`}
                    className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3 transition-colors hover:bg-muted/40 focus-visible:bg-muted/40"
                  >
                    <span className="text-[12.5px] font-medium tabular-nums text-primary">
                      {run.code}
                    </span>
                    <span className="text-[13.5px] font-medium">{run.workflowName}</span>
                    <RunStatusChip status={run.status} className="translate-y-[-1px]" />
                    <span className="ml-auto text-[12.5px] tabular-nums text-ink-3">
                      {fmtDateTime(run.startedAt)}
                    </span>
                    <span className="w-full text-[12.5px] text-ink-2">
                      {run.statusNote ?? runSummary(run)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="your-workflows">
            <div className="flex items-center justify-between">
              <h2 id="your-workflows" className={SECTION_HEADING}>
                Your workflows
              </h2>
              <a
                href="#/workspace/workflows"
                className="text-[12.5px] font-medium text-primary transition-colors hover:text-primary-deep"
              >
                All workflows
              </a>
            </div>
            <ul className="mt-4">
              {state.workflows.map((wf) => {
                const last = lastRunFor(wf.id);
                return (
                  <li key={wf.id} className="border-t border-border last:border-b">
                    <a
                      href={`#/workspace/workflows/${wf.id}`}
                      className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3 transition-colors hover:bg-muted/40 focus-visible:bg-muted/40"
                    >
                      <span className="text-[13.5px] font-medium">{wf.name}</span>
                      <WorkflowStatusChip status={wf.status} className="translate-y-[-1px]" />
                      <span className="text-[12.5px] text-ink-3">{wf.category}</span>
                      <span className="ml-auto text-[12.5px] text-ink-3">
                        {last ? `Last run ${last.code}` : "Not run yet"}
                      </span>
                      <span className="w-full text-[12.5px] text-ink-2">
                        {wf.steps.length} steps · runs on labelled sample data
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <aside className="space-y-5 rounded-md border border-border bg-card p-5">
          <h2 className="text-[14.5px] font-semibold">Start from a template</h2>
          <ol className="space-y-2.5">
            {[
              "Choose a finance template",
              "Adjust the workflow for your process",
              "Run it, review exceptions, share the output",
            ].map((s, i) => (
              <li key={s} className="flex gap-2.5 text-[13px] leading-snug text-ink-2">
                <span className="w-3.5 shrink-0 text-right tabular-nums text-ink-3">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
          <p className="text-[12.5px] leading-relaxed text-ink-3">
            Templates are the starting point in Payo — never a blank canvas.
          </p>
          <Button asChild size="sm" className="w-full">
            <a href="#/workspace/templates">
              Browse templates
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </a>
          </Button>
        </aside>
      </div>
    </div>
  );
}

// ─── Workflows list ──────────────────────────────────────────────────────────

export function WorkflowsList() {
  const { state, lastRunFor } = usePayo();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:px-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.01em]">Workflows</h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-2">
            The workflows in your workspace, created from templates. Open one to adjust its steps
            or run it on sample data.
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <a href="#/workspace/templates">Browse templates</a>
        </Button>
      </header>

      <div className="mt-8 overflow-hidden rounded-md border border-border bg-card">
        <div className="hidden gap-3 border-b border-border bg-muted/30 px-4 py-2.5 text-[11.5px] font-medium text-ink-3 md:grid md:grid-cols-[1.4fr_120px_90px_1.6fr_16px]">
          <span>Workflow</span>
          <span>Category</span>
          <span>Steps</span>
          <span>Last run</span>
          <span />
        </div>
        {state.workflows.map((wf) => {
          const last = lastRunFor(wf.id);
          return (
            <a
              key={wf.id}
              href={`#/workspace/workflows/${wf.id}`}
              className="grid gap-1.5 border-b border-border px-4 py-3.5 transition-colors last:border-0 hover:bg-muted/40 focus-visible:bg-muted/40 md:grid-cols-[1.4fr_120px_90px_1.6fr_16px] md:items-center md:gap-3"
            >
              <span className="flex items-center gap-2.5">
                <span className="truncate text-[13.5px] font-medium">{wf.name}</span>
                <WorkflowStatusChip status={wf.status} />
              </span>
              <span className="text-[12.5px] text-ink-2">{wf.category}</span>
              <span className="text-[12.5px] tabular-nums text-ink-2">{wf.steps.length}</span>
              <span className="flex flex-wrap items-center gap-2 text-[12.5px] text-ink-2">
                {last ? (
                  <>
                    <span className="font-medium tabular-nums text-primary">{last.code}</span>
                    <RunStatusChip status={last.status} />
                    <span className="text-ink-3">{runSummary(last)}</span>
                  </>
                ) : (
                  <span className="text-ink-3">Not run yet</span>
                )}
              </span>
              <ChevronRight className="hidden size-4 text-ink-3 md:block" aria-hidden="true" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
