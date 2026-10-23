"use client";

import {
  ClipboardCheck,
  History,
  MoreHorizontal,
  Play,
  ShieldCheck,
  Undo2,
} from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { canvasSubtitle, runSummary } from "@/lib/payo/data";
import { workflowToMermaid } from "@/lib/payo/authoring/mermaid";
import { evaluateReadiness } from "@/lib/payo/authoring/readiness";
import { fmtDateTime } from "@/lib/payo/format";
import { navigate } from "@/lib/payo/router";
import { usePayo, useUI } from "@/lib/payo/store";
import type { ActivityTone, StepTypeId, RunStepState } from "@/lib/payo/types";
import { ReviewContent, reviewApproveLabel } from "@/components/payo/reports";
import { InspectorPanel } from "@/components/payo/inspector";
import { TestPanel } from "@/components/payo/test-panel";
import { AdjustRail } from "@/components/payo/adjust-rail";
import { WorkflowGraph } from "@/components/payo/workflow-graph";
import { ReadinessPanel } from "@/components/payo/readiness-panel";
import { PublishDialog } from "@/components/payo/publish-dialog";
import {
  RunStatusChip,
  SampleTag,
  ScrollFade,
  WorkflowStatusChip,
  useScrollEdge,
} from "@/components/payo/ui";
import { cn } from "@/lib/utils";

const ACTIVITY_TONE: Record<ActivityTone, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-neutral-solid text-neutral-solid-foreground" },
  tested: { label: "Tested", cls: "bg-positive text-positive-foreground" },
  ready: { label: "Ready", cls: "bg-positive text-positive-foreground" },
  review: { label: "Review", cls: "bg-warn-solid text-white" },
  done: { label: "Complete", cls: "bg-positive text-positive-foreground" },
};

export function BuilderView({ workflowId }: { workflowId: string }) {
  const {
    state,
    workflowById,
    runById,
    lastRunFor,
    startRun,
    approveReview,
    returnReview,
    endRun,
    startTest,
    addStep,
    renameWorkflow,
    resetWorkflow,
    undo,
    canUndo,
    restoreVersion,
    confirmAssumptions,
  } = usePayo();
  const { openAbout } = useUI();

  const wf = workflowById(workflowId);
  const [mode, setMode] = useState<"build" | "test">("build");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<number | null>(null);
  const [seedInstruction, setSeedInstruction] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { scrollable: canvasScrolls, atEnd: canvasAtEnd } = useScrollEdge(canvasRef);

  const engineHere = state.engine && state.engine.workflowId === workflowId ? state.engine : null;
  const enginePhase = engineHere?.phase;
  const runHere = engineHere ? runById(engineHere.runId) : undefined;
  const runActive = engineHere != null;
  const engineBusy = state.engine != null && state.engine.phase !== "done";

  const [reviewDismissed, setReviewDismissed] = useState(false);
  const [lastPhase, setLastPhase] = useState(enginePhase);
  if (enginePhase !== lastPhase) {
    setLastPhase(enginePhase);
    setReviewDismissed(false);
  }
  const reviewOpen = enginePhase === "awaiting-review" && !reviewDismissed;

  const selectedStep = wf?.steps.find((s) => s.id === selectedStepId) ?? null;
  const selectedIndex = wf?.steps.findIndex((s) => s.id === selectedStepId) ?? -1;
  const report = wf ? evaluateReadiness(wf, wf.testEvidence) : null;

  useEffect(() => {
    const onTour = (event: Event) => {
      const detail = (event as CustomEvent<{ action?: string }>).detail;
      if (!detail || !wf) return;
      switch (detail.action) {
        case "select-first-step":
          setSelectedStepId(wf.steps[0]?.id ?? null);
          break;
        case "enter-test":
          if (engineBusy) return;
          if (!state.test || state.test.workflowId !== wf.id || state.test.phase === "done") {
            startTest(wf.id);
          }
          setMode("test");
          break;
        case "exit-test":
          setMode("build");
          break;
        case "open-review":
          setReviewDismissed(false);
          break;
      }
    };
    window.addEventListener("payo:tour", onTour);
    return () => window.removeEventListener("payo:tour", onTour);
  }, [engineBusy, startTest, state.test, wf]);

  const activeStepId = engineHere?.steps[engineHere.activeIndex]?.id;
  useEffect(() => {
    if (enginePhase !== "running" || !activeStepId) return;
    const el = canvasRef.current?.querySelector(`[data-step-id="${activeStepId}"]`);
    el?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [activeStepId, enginePhase]);

  const doneRunId = enginePhase === "done" && engineHere ? engineHere.runId : null;
  useEffect(() => {
    if (!doneRunId) return;
    const t = window.setTimeout(() => navigate(`/workspace/runs/${doneRunId}`), 900);
    return () => window.clearTimeout(t);
  }, [doneRunId]);

  const handleRun = () => {
    if (!wf) return;
    setSelectedStepId(null);
    const id = startRun(wf.id);
    if (!id) toast("A run is already in progress. Finish or end it before starting another.");
  };

  const handleApprove = () => {
    approveReview();
    toast("Summary approved. Completing the remaining steps.");
  };

  const handleReturn = () => {
    returnReview();
    toast("Run paused: returned for review.");
  };

  const handleAddStep = (type: StepTypeId, index: number) => {
    if (!wf) return;
    const id = addStep(wf.id, type, index);
    if (id) setSelectedStepId(id);
  };

  const copyMermaid = async () => {
    if (!wf) return;
    try {
      await navigator.clipboard.writeText(workflowToMermaid(wf));
      toast("Mermaid diagram copied. Preview only.");
    } catch {
      toast("Could not copy the diagram.");
    }
  };

  if (!wf) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="text-[20px] font-semibold">Workflow not found</h1>
        <p className="mt-2 text-[14px] text-ink-2">This workflow does not exist in the demo workspace.</p>
        <Button asChild className="mt-6" size="sm">
          <a href="#/workspace/templates">Browse templates</a>
        </Button>
      </div>
    );
  }

  const reviewStep = engineHere ? engineHere.steps[engineHere.activeIndex] : undefined;
  const completedCount = engineHere
    ? engineHere.steps.filter((s) => engineHere.states[s.id] === "complete").length
    : 0;
  const lastRun = lastRunFor(wf.id);
  const workflowActivity = [...state.activity]
    .filter((a) => a.workflowId === wf.id)
    .sort((a, b) => b.at.localeCompare(a.at));
  const canPublish = report?.canPublish ?? false;
  const canTest = report?.canTest ?? false;
  const showPublishAsPrimary = canPublish && wf.status !== "published";
  const primaryLabel = runActive
    ? "Running…"
    : engineBusy
      ? "Run in progress…"
      : showPublishAsPrimary
        ? "Publish"
        : "Run workflow";

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Top bar */}
      <div className="shrink-0 border-b border-border bg-background">
        <div data-tour="builder-header" className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 md:px-6">
          <a href="#/workspace/workflows" className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-2 transition-colors hover:text-foreground">
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Workflows
          </a>
          <div className="hidden h-4 w-px bg-border sm:block" aria-hidden="true" />
          <input
            value={wf.name}
            onChange={(e) => renameWorkflow(wf.id, e.target.value)}
            aria-label="Workflow name"
            name="workflow-name"
            className="min-w-0 max-w-[300px] flex-1 rounded-sm border border-transparent bg-transparent px-1.5 py-0.5 text-[15px] font-semibold tracking-[-0.01em] transition-colors hover:border-line-strong focus:border-primary-strong focus:outline-none"
          />
          <WorkflowStatusChip status={wf.status} />
          {wf.publishedVersion && wf.status === "published" && (
            <span className="hidden items-center rounded-sm border border-border bg-muted px-1.5 py-0.5 text-[10.5px] font-medium tabular-nums text-ink-2 sm:inline-flex">
              v{wf.publishedVersion}
            </span>
          )}
          {wf.source === "described" && (
            <span className="hidden items-center gap-1.5 rounded-sm border border-dashed border-line-strong px-1.5 py-0.5 text-[10.5px] font-medium text-ink-3 sm:inline-flex">
              Drafted by Payo
            </span>
          )}
          {wf.publishedSnapshot && wf.status !== "published" && (
            <span className="hidden items-center rounded-sm bg-muted px-1.5 py-0.5 text-[10.5px] font-medium text-ink-2 sm:inline-flex">
              Draft changes · v{wf.publishedSnapshot.version} published
            </span>
          )}
          <div data-tour="builder-mode" className="flex shrink-0 items-center rounded-md border border-border bg-muted/50 p-0.5" role="group" aria-label="Builder mode">
            <button
              type="button"
              aria-pressed={mode === "build"}
              onClick={() => setMode("build")}
              className={cn(
                "rounded-sm px-2.5 py-1 text-[12px] font-medium transition-colors",
                mode === "build" ? "bg-card text-foreground shadow-sm" : "text-ink-2 hover:text-foreground",
              )}
            >
              Build
            </button>
            <button
              type="button"
              aria-pressed={mode === "test"}
              disabled={engineBusy || !canTest}
              title={!canTest ? "Resolve blocking checks before testing." : undefined}
              onClick={() => {
                if (!state.test || state.test.workflowId !== wf.id || state.test.phase === "done") startTest(wf.id);
                setMode("test");
              }}
              className={cn(
                "rounded-sm px-2.5 py-1 text-[12px] font-medium transition-colors",
                mode === "test" ? "bg-card text-foreground shadow-sm" : "text-ink-2 hover:text-foreground",
                (engineBusy || !canTest) && "cursor-not-allowed opacity-50",
              )}
            >
              Test
            </button>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setVerifyOpen(true)}>
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Verify
            </Button>
            <Button variant="outline" size="sm" onClick={() => setHistoryOpen(true)}>
              <History className="size-3.5" aria-hidden="true" />
              History
            </Button>
            <Button variant="outline" size="sm" onClick={() => undo(wf.id)} disabled={!canUndo(wf.id)} aria-keyshortcuts="Control+Z">
              <Undo2 className="size-3.5" aria-hidden="true" />
              Undo
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8" aria-label="More actions">
                  <MoreHorizontal className="size-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => undo(wf.id)} disabled={!canUndo(wf.id)}>
                  <Undo2 className="size-4" aria-hidden="true" />
                  Undo last change
                </DropdownMenuItem>
                <DropdownMenuItem onClick={copyMermaid}>Copy Mermaid diagram</DropdownMenuItem>
                <DropdownMenuSeparator />
                {wf.templateId && (
                  <DropdownMenuItem onClick={() => setResetOpen(true)}>Reset to template…</DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={openAbout}>About this demo</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {showPublishAsPrimary && (
              <Button
                variant="outline"
                size="sm"
                data-tour="builder-run"
                onClick={handleRun}
                disabled={engineBusy || mode === "test" || runActive}
                title={mode === "test" ? "Exit test mode to run the workflow" : "Run on sample data"}
              >
                <Play className="size-3.5" aria-hidden="true" />
                Run
              </Button>
            )}
            <Button
              size="sm"
              data-tour={showPublishAsPrimary ? undefined : "builder-run"}
              onClick={() => (showPublishAsPrimary && mode === "build" ? setPublishOpen(true) : handleRun())}
              disabled={engineBusy || mode === "test" || runActive}
              title={mode === "test" ? "Exit test mode to continue" : undefined}
            >
              <Play className="size-3.5" aria-hidden="true" />
              {primaryLabel}
            </Button>
          </div>
        </div>
        <div className="px-4 pb-2.5 md:px-6">
          <p className="text-[12.5px] text-ink-3">{canvasSubtitle(wf)}</p>
        </div>
      </div>

      {/* Run strip */}
      {engineHere && mode === "build" && (
        <div data-tour="run-strip" className="shrink-0 border-b border-border bg-muted">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 md:px-6">
            <p className="flex items-center gap-2 text-[12.5px] text-ink-2">
              <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              Using sample data for this demonstration.
            </p>
            {enginePhase === "running" && (
              <>
                <p className="text-[12.5px] text-ink-2">
                  Step {engineHere.activeIndex + 1} of {engineHere.steps.length}:{" "}
                  <span className="font-medium text-foreground">{engineHere.steps[engineHere.activeIndex]?.label}</span>
                </p>
                <div className="ml-auto flex w-44 items-center gap-2">
                  <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-ink-2 transition-[width] duration-200 ease-linear"
                      style={{ width: `${Math.min(100, ((completedCount + engineHere.progress) / engineHere.steps.length) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[11.5px] tabular-nums text-ink-3">
                    {completedCount}/{engineHere.steps.length}
                  </span>
                </div>
              </>
            )}
            {enginePhase === "awaiting-review" && (
              <>
                <p className="text-[12.5px] font-medium text-warn">Paused: {reviewStep?.label} needs your decision.</p>
                <Button size="sm" data-tour="review-open" className="ml-auto h-7" onClick={() => setReviewDismissed(false)}>
                  Open review
                </Button>
              </>
            )}
            {enginePhase === "returned" && (
              <>
                <p className="max-w-xl text-[12.5px] leading-snug text-warn">
                  Run paused, returned for review. The final steps will not run until the review is approved.
                </p>
                <div className="ml-auto flex gap-2">
                  <Button size="sm" variant="outline" className="h-7" onClick={() => { endRun(); toast("Run ended. Saved to Runs as Needs review."); }}>
                    End run
                  </Button>
                  <Button size="sm" data-tour="run-approve" className="h-7" onClick={handleApprove}>
                    Approve and continue
                  </Button>
                </div>
              </>
            )}
            {enginePhase === "done" && (
              <p className="flex items-center gap-2 text-[12.5px] text-ink-2">
                <span className="inline-flex items-center rounded-sm bg-positive px-1.5 py-0.5 text-[11px] font-medium text-positive-foreground">Complete</span>
                Run completed. Opening the result…
              </p>
            )}
          </div>
        </div>
      )}

      {/* Canvas + rail, or test workspace */}
      {mode === "test" ? (
        <TestPanel
          workflow={wf}
          onExit={() => setMode("build")}
          onInspectStep={(stepId) => {
            setMode("build");
            setSelectedStepId(stepId);
          }}
        />
      ) : (
        <div className="flex min-h-0 flex-1">
          <div ref={canvasRef} className="relative min-w-0 flex-1 overflow-x-auto overflow-y-hidden">
            <ScrollFade show={canvasScrolls && !canvasAtEnd} to="to-background" />
            <div className="flex h-full flex-col">
              <WorkflowGraph
                wf={wf}
                selectedStepId={selectedStepId}
                onSelectStep={setSelectedStepId}
                runStates={engineHere ? (engineHere.states as Record<string, RunStepState>) : undefined}
                activeStepId={activeStepId}
                progress={engineHere?.progress}
                runActive={runActive}
                onAddStep={handleAddStep}
              />
            </div>
          </div>

          {selectedStep ? (
            <InspectorPanel
              workflow={wf}
              step={selectedStep}
              index={selectedIndex}
              lastIndex={wf.steps.length - 1}
              runActive={runActive}
              runState={engineHere?.states[selectedStep.id]}
              onClose={() => setSelectedStepId(null)}
            />
          ) : (
            <>
              <div className="fixed inset-0 z-20 bg-foreground/10 lg:hidden" onClick={() => setSeedInstruction(null)} aria-hidden="true" />
              <aside className="z-30 hidden h-full w-[352px] shrink-0 border-l border-border bg-card lg:flex lg:flex-col">
                <AdjustRail
                  workflow={wf}
                  selectedStepId={selectedStepId}
                  seedInstruction={seedInstruction}
                  onSeedConsumed={() => setSeedInstruction(null)}
                  onApplied={() => {
                    /* selection is cleared after apply; keep rail */
                  }}
                />
              </aside>
              {/* Narrow screens: rail as a bottom sheet */}
              <div className="fixed inset-x-0 bottom-0 z-30 max-h-[55vh] border-t border-border bg-card lg:hidden">
                <AdjustRail
                  workflow={wf}
                  selectedStepId={selectedStepId}
                  seedInstruction={seedInstruction}
                  onSeedConsumed={() => setSeedInstruction(null)}
                  onApplied={() => {}}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Bottom status */}
      {!engineHere && mode === "build" && (
        <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-border bg-background px-4 py-2.5 md:px-6">
          {report && report.blockers > 0 && (
            <button type="button" onClick={() => setVerifyOpen(true)} className="flex items-center gap-1.5 text-[12.5px] font-medium text-danger">
              <ClipboardCheck className="size-3.5" aria-hidden="true" />
              {report.blockers} issue{report.blockers === 1 ? "" : "s"} to resolve before publishing
            </button>
          )}
          {report && report.blockers === 0 && (
            <button type="button" onClick={() => setVerifyOpen(true)} className="flex items-center gap-1.5 text-[12.5px] text-ink-2">
              <ShieldCheck className="size-3.5 text-positive" aria-hidden="true" />
              Verified{report.warnings > 0 ? ` · ${report.warnings} warning${report.warnings === 1 ? "" : "s"} to review` : ""}
            </button>
          )}
          {lastRun ? (
            <>
              <span className="hidden text-[12px] text-ink-3 md:inline">·</span>
              <span className="text-[12px] text-ink-3">Last run</span>
              <a href={`#/workspace/runs/${lastRun.id}`} className="text-[12.5px] font-medium tabular-nums text-primary-ink transition-colors hover:text-primary-deep">
                {lastRun.code}
              </a>
              <RunStatusChip status={lastRun.status} />
              <span className="text-[12.5px] text-ink-2">{lastRun.statusNote ?? runSummary(lastRun)}</span>
              <a href={`#/workspace/runs/${lastRun.id}`} className="ml-auto text-[12.5px] font-medium text-primary-ink transition-colors hover:text-primary-deep">
                View result
              </a>
            </>
          ) : (
            <span className="ml-auto text-[12.5px] text-ink-3">
              {wf.testEvidence ? "Tested. Publish when you are ready." : "Run a test on sample data before publishing."}
            </span>
          )}
        </div>
      )}

      {/* Adjust rail toggle for narrow screens handled above; readiness + publish dialogs */}
      <ReadinessPanel
        open={verifyOpen}
        onOpenChange={setVerifyOpen}
        workflow={wf}
        onFix={(text) => {
          setMode("build");
          setSelectedStepId(null);
          setSeedInstruction(text);
        }}
        onSelectStep={(stepId) => {
          setMode("build");
          setSelectedStepId(stepId);
        }}
        onRunTest={() => {
          if (!state.test || state.test.workflowId !== wf.id || state.test.phase === "done") startTest(wf.id);
          setMode("test");
        }}
        onConfirmAssumptions={() => confirmAssumptions(wf.id)}
        canTest={canTest}
      />
      <PublishDialog open={publishOpen} onOpenChange={setPublishOpen} workflow={wf} />

      {/* Review gate dialog */}
      <Dialog open={reviewOpen} onOpenChange={(v) => setReviewDismissed(!v)}>
        <DialogContent data-tour="review-dialog" className="max-h-[85vh] gap-0 overflow-hidden p-0 sm:max-w-3xl">
          <DialogHeader className="items-start space-y-1.5 border-b border-border px-6 py-5 text-left">
            <div className="flex flex-wrap items-center gap-2.5">
              <DialogTitle className="text-[17px] font-semibold">{reviewStep?.label ?? "Review"}</DialogTitle>
              <span className="inline-flex items-center gap-1.5 rounded-sm bg-warn-tint px-1.5 py-0.5 text-[11.5px] font-medium text-warn">
                <span className="size-1.5 rounded-full bg-warn" aria-hidden="true" />
                Needs review
              </span>
              <SampleTag />
            </div>
            <DialogDescription className="text-[13px] leading-relaxed">
              {runHere ? `Run ${runHere.code} · ` : ""}
              The run is paused at this step. Your decision is recorded on the run. This review is simulated.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[52vh] overflow-y-auto px-6 py-5">
            <ReviewContent profile={wf.sampleProfile} config={runHere?.config ?? {}} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/30 px-6 py-4">
            <p className="text-[12px] text-ink-3">Simulated review · Sample data</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReturn}>Return for review</Button>
              <Button onClick={handleApprove}>{reviewApproveLabel(wf.sampleProfile)}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* History */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-h-[85vh] gap-0 overflow-y-auto sm:max-w-lg">
          <DialogHeader className="items-start text-left">
            <DialogTitle className="text-[16px] font-semibold">Version history</DialogTitle>
            <DialogDescription className="text-[13px] leading-relaxed">
              Published versions and recent changes for “{wf.name}”. All activity is simulated.
            </DialogDescription>
          </DialogHeader>

          {(wf.versions?.length ?? 0) > 0 ? (
            <section className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                Published versions
              </p>
              <ul className="mt-2.5 space-y-2">
                {[...(wf.versions ?? [])]
                  .sort((a, b) => b.version - a.version)
                  .map((v) => {
                    const current = v.version === wf.publishedVersion;
                    return (
                      <li
                        key={v.version}
                        className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md border border-border px-3 py-2.5"
                      >
                        <span className="text-[13px] font-semibold tabular-nums">Version {v.version}</span>
                        {current && (
                          <span className="inline-flex items-center rounded-sm bg-positive px-1.5 py-0.5 text-[10.5px] font-medium text-positive-foreground">
                            Published
                          </span>
                        )}
                        <span className="text-[12px] tabular-nums text-ink-3">{fmtDateTime(v.publishedAt)}</span>
                        <span className="text-[12px] text-ink-2">
                          {v.steps.length} steps · {v.testEvidence ? "Tested" : "Not tested"}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-auto h-7"
                          onClick={() => setRestoreTarget(v.version)}
                        >
                          Restore
                        </Button>
                      </li>
                    );
                  })}
              </ul>
            </section>
          ) : (
            <p className="mt-4 rounded-md border border-dashed border-line-strong bg-card/60 px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-2">
              No published versions yet. Publishing records a version you can restore later.
            </p>
          )}

          {wf.brief && (
            <div className="mt-4 rounded-md border border-border bg-muted/30 px-3.5 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-3">Original brief</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-2">{wf.brief}</p>
            </div>
          )}

          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">Recent activity</p>
            <ol className="mt-1">
              {workflowActivity.map((e) => {
                const tone = ACTIVITY_TONE[e.tone];
                return (
                  <li key={e.id} className="flex items-start gap-3 border-b border-border py-2.5 last:border-0">
                    <span className={cn("mt-0.5 inline-flex shrink-0 items-center rounded-sm px-1.5 py-0.5 text-[10.5px] font-medium", tone.cls)}>{tone.label}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] leading-snug text-foreground">{e.label}</p>
                      <p className="mt-0.5 text-[11.5px] tabular-nums text-ink-3">{fmtDateTime(e.at)}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
          <p className="mt-3 text-[11.5px] leading-relaxed text-ink-3">
            Draft → Tested → Ready to publish → Published. Restoring a version creates a draft; your
            published versions stay intact.
          </p>
        </DialogContent>
      </Dialog>

      {/* Restore version confirmation */}
      <AlertDialog open={restoreTarget !== null} onOpenChange={(open) => !open && setRestoreTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore version {restoreTarget}?</AlertDialogTitle>
            <AlertDialogDescription>
              This replaces the current draft steps with version {restoreTarget}. Your published
              versions stay available, and you can undo this change.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (restoreTarget == null) return;
                restoreVersion(wf.id, restoreTarget);
                toast(`Version ${restoreTarget} restored as a draft.`);
                setRestoreTarget(null);
                setHistoryOpen(false);
                setSelectedStepId(null);
              }}
            >
              Restore version
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset confirmation */}
      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset workflow to template</AlertDialogTitle>
            <AlertDialogDescription>
              This removes your changes and restores the “{wf.name}” template steps and settings. Sample
              data will continue to be used for runs. You can undo this afterwards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetWorkflow(wf.id);
                setSelectedStepId(null);
                toast("Workflow reset to the template.");
              }}
            >
              Reset workflow
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
