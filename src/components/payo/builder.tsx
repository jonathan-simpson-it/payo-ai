"use client";

import { MoreHorizontal, Play, Plus, Undo2 } from "lucide-react";
import { ChevronRight, ArrowLeft, History } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
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
import { fmtDateTime } from "@/lib/payo/format";
import { navigate } from "@/lib/payo/router";
import { usePayo, useUI } from "@/lib/payo/store";
import type { ActivityTone, StepTypeId, RunStepState } from "@/lib/payo/types";
import { ReviewContent, reviewApproveLabel } from "@/components/payo/reports";
import { InspectorPanel } from "@/components/payo/inspector";
import { TestPanel } from "@/components/payo/test-panel";
import {
  STEP_TYPE_META,
  RunStatusChip,
  SampleTag,
  ScrollFade,
  StepStateIcon,
  StepTypeIcon,
  WorkflowStatusChip,
  useScrollEdge,
} from "@/components/payo/ui";
import { cn } from "@/lib/utils";

const ADDABLE_TYPES: { type: StepTypeId; description: string }[] = [
  { type: "load", description: "Bring in a sample source file" },
  { type: "map", description: "Line up fields between sources" },
  { type: "calculate", description: "Work out a value for each row" },
  { type: "check", description: "Compare against a tolerance or limit" },
  { type: "draft", description: "Prepare an AI-assisted draft" },
  { type: "review", description: "Pause for a human decision" },
  { type: "report", description: "Prepare a report from the results" },
];

const ACTIVITY_TONE: Record<ActivityTone, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-neutral-tint text-ink-2" },
  tested: { label: "Tested", cls: "bg-primary-tint text-primary-ink" },
  ready: { label: "Ready", cls: "bg-ok-tint text-ok" },
  review: { label: "Review", cls: "bg-warn-tint text-warn" },
  done: { label: "Complete", cls: "bg-ok-tint text-ok" },
};

function StepMenuItems({ onAdd }: { onAdd: (type: StepTypeId) => void }) {
  return (
    <>
      <p className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-ink-3">
        Add a step
      </p>
      {ADDABLE_TYPES.map(({ type, description }) => (
        <DropdownMenuItem key={type} onClick={() => onAdd(type)} className="gap-2.5 py-2">
          <StepTypeIcon type={type} className="size-4 shrink-0 text-ink-3" />
          <div className="min-w-0">
            <p className="text-[13px] font-medium leading-tight">{STEP_TYPE_META[type].label}</p>
            <p className="mt-0.5 text-[11.5px] leading-tight text-ink-3">{description}</p>
          </div>
        </DropdownMenuItem>
      ))}
    </>
  );
}

// ─── Step card ───────────────────────────────────────────────────────────────

function StepCard({
  stepId,
  type,
  label,
  detail,
  index,
  selected,
  state,
  progress,
  dragDisabled,
  dragging,
  showDropIndicator,
  onSelect,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: {
  stepId: string;
  type: StepTypeId;
  label: string;
  detail: string;
  index: number;
  selected: boolean;
  state?: RunStepState;
  progress?: number;
  dragDisabled: boolean;
  dragging: boolean;
  showDropIndicator: boolean;
  onSelect: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  const meta = STEP_TYPE_META[type];
  return (
    <div
      data-step-id={stepId}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${meta.label}: ${label}. ${detail}`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      draggable={!dragDisabled}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        "relative flex w-[224px] shrink-0 cursor-pointer select-none flex-col rounded-md border bg-card p-3.5 text-left transition-[border-color,background-color,opacity] duration-150",
        "hover:border-line-strong",
        !dragDisabled && "cursor-grab active:cursor-grabbing",
        selected && "border-primary bg-primary-tint/50",
        !selected && state === "needs-review" && "border-warn/60",
        !selected && state === "running" && "border-primary/70",
        dragging && "opacity-40",
      )}
    >
      {showDropIndicator && (
        <span
          className="absolute -left-[5px] bottom-2 top-2 w-[2px] rounded-full bg-primary"
          aria-hidden="true"
        />
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-3">
          <span className="tabular-nums">{index + 1}</span>
          <StepTypeIcon type={type} className="size-3.5" />
          {meta.label}
        </span>
        {state && <StepStateIcon state={state} />}
      </div>
      <p className="mt-2 text-[13.5px] font-medium leading-snug text-foreground">{label}</p>
      <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-ink-3">{detail}</p>
      {state === "running" && (
        <div
          className="mt-2.5 h-[3px] overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label={`${label} progress`}
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
  );
}

function Connector({ done }: { done: boolean }) {
  return (
    <ChevronRight
      className={cn("mx-1.5 size-4 shrink-0", done ? "text-ok" : "text-ink-3/50")}
      strokeWidth={2}
      aria-hidden="true"
    />
  );
}

// ─── Builder ─────────────────────────────────────────────────────────────────

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
    reorderSteps,
    renameWorkflow,
    resetWorkflow,
    undo,
    canUndo,
  } = usePayo();
  const { openAbout } = useUI();

  const wf = workflowById(workflowId);
  const [mode, setMode] = useState<"build" | "test">("build");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { scrollable: canvasScrolls, atEnd: canvasAtEnd } = useScrollEdge(canvasRef);

  const engineHere = state.engine && state.engine.workflowId === workflowId ? state.engine : null;
  const enginePhase = engineHere?.phase;
  const runHere = engineHere ? runById(engineHere.runId) : undefined;
  const runActive = engineHere != null;
  // A finished engine no longer blocks starting another run.
  const engineBusy = state.engine != null && state.engine.phase !== "done";

  // The review dialog is open while the run waits at its review gate, unless
  // the reviewer has dismissed it (it can be reopened from the run strip).
  const [reviewDismissed, setReviewDismissed] = useState(false);
  const [lastPhase, setLastPhase] = useState(enginePhase);
  if (enginePhase !== lastPhase) {
    setLastPhase(enginePhase);
    setReviewDismissed(false);
  }
  const reviewOpen = enginePhase === "awaiting-review" && !reviewDismissed;

  const selectedStep = wf?.steps.find((s) => s.id === selectedStepId) ?? null;
  const selectedIndex = wf?.steps.findIndex((s) => s.id === selectedStepId) ?? -1;

  // Keep the active step in view while the run progresses
  const activeStepId = engineHere?.steps[engineHere.activeIndex]?.id;
  useEffect(() => {
    if (enginePhase !== "running" || !activeStepId) return;
    const el = canvasRef.current?.querySelector(`[data-step-id="${activeStepId}"]`);
    el?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [activeStepId, enginePhase]);

  // When the run completes, open the result
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

  // DnD handlers
  const onDragStart = (i: number) => (e: React.DragEvent) => {
    setDragIndex(i);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(i));
  };
  const onDragOver = (i: number) => (e: React.DragEvent) => {
    if (dragIndex === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (overIndex !== i) setOverIndex(i);
  };
  const onDrop = (i: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== i && wf) reorderSteps(wf.id, dragIndex, i);
    setDragIndex(null);
    setOverIndex(null);
  };
  const onDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  if (!wf) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="text-[20px] font-semibold">Workflow not found</h1>
        <p className="mt-2 text-[14px] text-ink-2">
          This workflow does not exist in the demo workspace.
        </p>
        <Button asChild className="mt-6" size="sm">
          <a href="#/workspace/templates">Browse templates</a>
        </Button>
      </div>
    );
  }

  const reviewStep = engineHere ? engineHere.steps[engineHere.activeIndex] : undefined;
  const reviewerLabel = runHere ? reviewStep?.label : undefined;
  const completedCount = engineHere
    ? engineHere.steps.filter((s) => engineHere.states[s.id] === "complete").length
    : 0;
  const lastRun = lastRunFor(wf.id);
  const workflowActivity = [...state.activity]
    .filter((a) => a.workflowId === wf.id)
    .sort((a, b) => b.at.localeCompare(a.at));

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Top bar */}
      <div className="shrink-0 border-b border-border bg-background">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 md:px-6">
          <a
            href="#/workspace/workflows"
            className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-2 transition-colors hover:text-foreground"
          >
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
          <div
            className="flex shrink-0 items-center rounded-md border border-border bg-muted/50 p-0.5"
            role="group"
            aria-label="Builder mode"
          >
            <button
              type="button"
              aria-pressed={mode === "build"}
              onClick={() => setMode("build")}
              className={cn(
                "rounded-sm px-2.5 py-1 text-[12px] font-medium transition-colors",
                mode === "build"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-ink-2 hover:text-foreground",
              )}
            >
              Build
            </button>
            <button
              type="button"
              aria-pressed={mode === "test"}
              disabled={engineBusy}
              onClick={() => {
                if (!state.test || state.test.workflowId !== wf.id || state.test.phase === "done") {
                  startTest(wf.id);
                }
                setMode("test");
              }}
              className={cn(
                "rounded-sm px-2.5 py-1 text-[12px] font-medium transition-colors",
                mode === "test"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-ink-2 hover:text-foreground",
                engineBusy && "cursor-not-allowed opacity-50",
              )}
            >
              Test
            </button>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setHistoryOpen(true)}>
              <History className="size-3.5" aria-hidden="true" />
              History
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => undo(wf.id)}
              disabled={!canUndo(wf.id)}
              aria-keyshortcuts="Control+Z"
            >
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
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setResetOpen(true)}>Reset to template…</DropdownMenuItem>
                <DropdownMenuItem onClick={openAbout}>About this demo</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              onClick={handleRun}
              disabled={engineBusy || mode === "test"}
              title={mode === "test" ? "Exit test mode to run the workflow" : undefined}
            >
              <Play className="size-3.5" aria-hidden="true" />
              {runActive ? "Running…" : engineBusy ? "Run in progress…" : "Run workflow"}
            </Button>
          </div>
        </div>
        <div className="px-4 pb-2.5 md:px-6">
          <p className="text-[12.5px] text-ink-3">{canvasSubtitle(wf)}</p>
        </div>
      </div>

      {/* Run strip */}
      {engineHere && mode === "build" && (
        <div className="shrink-0 border-b border-border bg-primary-tint/50">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 md:px-6">
            <p className="flex items-center gap-2 text-[12.5px] text-ink-2">
              <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              Using sample data for this demonstration.
            </p>

            {enginePhase === "running" && (
              <>
                <p className="text-[12.5px] text-ink-2">
                  Step {engineHere.activeIndex + 1} of {engineHere.steps.length}:{" "}
                  <span className="font-medium text-foreground">
                    {engineHere.steps[engineHere.activeIndex]?.label}
                  </span>
                </p>
                <div className="ml-auto flex w-44 items-center gap-2">
                  <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-primary/15">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-200 ease-linear"
                      style={{
                        width: `${Math.min(100, ((completedCount + engineHere.progress) / engineHere.steps.length) * 100)}%`,
                      }}
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
                <p className="text-[12.5px] font-medium text-warn">
                  Paused: {reviewStep?.label} needs your decision.
                </p>
                <Button size="sm" className="ml-auto h-7" onClick={() => setReviewDismissed(false)}>
                  Open review
                </Button>
              </>
            )}

            {enginePhase === "returned" && (
              <>
                <p className="max-w-xl text-[12.5px] leading-snug text-warn">
                  Run paused, returned for review. The final steps will not run until the review is
                  approved.
                </p>
                <div className="ml-auto flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7"
                    onClick={() => {
                      endRun();
                      toast("Run ended. Saved to Runs as Needs review.");
                    }}
                  >
                    End run
                  </Button>
                  <Button size="sm" className="h-7" onClick={handleApprove}>
                    Approve and continue
                  </Button>
                </div>
              </>
            )}

            {enginePhase === "done" && (
              <p className="text-[12.5px] font-medium text-ok">
                Run completed. Opening the result…
              </p>
            )}
          </div>
        </div>
      )}

      {/* Canvas + inspector, or the test workspace */}
      {mode === "test" ? (
        <TestPanel workflow={wf} onExit={() => setMode("build")} />
      ) : (
      <div className="flex min-h-0 flex-1">
        <div ref={canvasRef} className="relative min-w-0 flex-1 overflow-x-auto overflow-y-hidden">
          <ScrollFade show={canvasScrolls && !canvasAtEnd} to="to-background" />
          {wf.steps.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-[14px] text-ink-2">
                This workflow has no steps yet. Add the first step to begin.
              </p>
              <AddStepControl
                disabled={runActive}
                onAdd={(type) => {
                  const id = addStep(wf.id, type);
                  if (id) setSelectedStepId(id);
                }}
              />
            </div>
          ) : (
            <div className="flex h-full min-w-max items-center px-6 py-8 md:px-10">
              {wf.steps.map((step, i) => {
                const st = engineHere?.states[step.id];
                const prevComplete =
                  i > 0 && engineHere?.states[wf.steps[i - 1].id] === "complete";
                return (
                  <Fragment key={step.id}>
                    {i > 0 && (
                      <div className="group/join relative mx-1 flex h-10 w-6 shrink-0 items-center justify-center">
                        <Connector done={!!prevComplete} />
                        <InlineAddStep
                          disabled={runActive}
                          label={`Insert a step before “${step.label}”`}
                          onAdd={(type) => {
                            const id = addStep(wf.id, type, i);
                            if (id) setSelectedStepId(id);
                          }}
                        />
                      </div>
                    )}
                    <StepCard
                      stepId={step.id}
                      type={step.type}
                      label={step.label}
                      detail={step.summary(step.config)}
                      index={i}
                      selected={selectedStepId === step.id}
                      state={engineHere ? (st ?? "queued") : undefined}
                      progress={engineHere?.activeIndex === i ? engineHere.progress : undefined}
                      dragDisabled={runActive}
                      dragging={dragIndex === i}
                      showDropIndicator={overIndex === i && dragIndex !== null && dragIndex !== i}
                      onSelect={() =>
                        setSelectedStepId((cur) => (cur === step.id ? null : step.id))
                      }
                      onDragStart={onDragStart(i)}
                      onDragEnd={onDragEnd}
                      onDragOver={onDragOver(i)}
                      onDrop={onDrop(i)}
                    />
                  </Fragment>
                );
              })}
              <div className="ml-1.5 flex items-center">
                <Connector done={false} />
                <AddStepControl
                  disabled={runActive}
                  onAdd={(type) => {
                    const id = addStep(wf.id, type);
                    if (id) setSelectedStepId(id);
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {selectedStep && (
          <InspectorPanel
            workflow={wf}
            step={selectedStep}
            index={selectedIndex}
            lastIndex={wf.steps.length - 1}
            runActive={runActive}
            runState={engineHere?.states[selectedStep.id]}
            onClose={() => setSelectedStepId(null)}
          />
        )}
      </div>
      )}

      {/* Bottom summary */}
      {!engineHere && mode === "build" && (
        <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-border bg-background px-4 py-2.5 md:px-6">
          {lastRun ? (
            <>
              <span className="text-[12px] text-ink-3">Last run</span>
              <a
                href={`#/workspace/runs/${lastRun.id}`}
                className="text-[12.5px] font-medium tabular-nums text-primary-ink transition-colors hover:text-primary-deep"
              >
                {lastRun.code}
              </a>
              <span className="text-[12.5px] tabular-nums text-ink-2">
                {fmtDateTime(lastRun.startedAt)}
              </span>
              <RunStatusChip status={lastRun.status} />
              <span className="text-[12.5px] text-ink-2">
                {lastRun.statusNote ?? runSummary(lastRun)}
              </span>
              <a
                href={`#/workspace/runs/${lastRun.id}`}
                className="ml-auto text-[12.5px] font-medium text-primary-ink transition-colors hover:text-primary-deep"
              >
                View result
              </a>
            </>
          ) : (
            <span className="text-[12.5px] text-ink-3">
              No runs yet. This workflow has not been run. Runs use labelled sample data.
            </span>
          )}
        </div>
      )}

      {/* Review gate dialog */}
      <Dialog open={reviewOpen} onOpenChange={(v) => setReviewDismissed(!v)}>
        <DialogContent className="max-h-[85vh] gap-0 overflow-hidden p-0 sm:max-w-3xl">
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
              {reviewerLabel ? `The run is paused at this step. ` : ""}
              Your decision is recorded on the run. This review is simulated.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[52vh] overflow-y-auto px-6 py-5">
            {runHere && wf && <ReviewContent templateId={wf.templateId} config={runHere.config} />}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/30 px-6 py-4">
            <p className="text-[12px] text-ink-3">Simulated review · Sample data</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReturn}>
                Return for review
              </Button>
              <Button onClick={handleApprove}>{wf ? reviewApproveLabel(wf.templateId) : "Approve"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* History */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-lg gap-0">
          <DialogHeader className="items-start text-left">
            <DialogTitle className="text-[16px] font-semibold">Workflow history</DialogTitle>
            <DialogDescription className="text-[13px] leading-relaxed">
              How “{wf.name}” reached its current state. Every entry below is simulated.
            </DialogDescription>
          </DialogHeader>
          <ol className="mt-4 max-h-[50vh] overflow-y-auto">
            {workflowActivity.map((e) => {
              const tone = ACTIVITY_TONE[e.tone];
              return (
                <li key={e.id} className="flex items-start gap-3 border-b border-border py-2.5 last:border-0">
                  <span
                    className={cn(
                      "mt-0.5 inline-flex shrink-0 items-center rounded-sm px-1.5 py-0.5 text-[10.5px] font-medium",
                      tone.cls,
                    )}
                  >
                    {tone.label}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] leading-snug text-foreground">{e.label}</p>
                    <p className="mt-0.5 text-[11.5px] tabular-nums text-ink-3">
                      {fmtDateTime(e.at)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="mt-3 text-[11.5px] leading-relaxed text-ink-3">
            Draft → Tested → Ready to publish. Edits return a workflow to draft.
          </p>
        </DialogContent>
      </Dialog>

      {/* Reset confirmation */}
      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset workflow to template</AlertDialogTitle>
            <AlertDialogDescription>
              This removes your changes and restores the “
              {wf.name}” template steps and settings. Sample data will continue to be used for
              runs. You can undo this afterwards.
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

function AddStepControl({
  disabled,
  onAdd,
}: {
  disabled: boolean;
  onAdd: (type: StepTypeId) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="h-auto gap-1.5 border-dashed py-3.5 text-[13px] font-medium text-ink-2 hover:border-primary hover:text-primary-ink"
          aria-label="Add a step"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Add step
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <StepMenuItems onAdd={onAdd} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Small plus between two steps: inserts at that point in the flow. */
function InlineAddStep({
  disabled,
  label,
  onAdd,
}: {
  disabled: boolean;
  label: string;
  onAdd: (type: StepTypeId) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={label}
          className="absolute inset-0 m-auto grid size-5 place-items-center rounded-full border border-dashed border-line-strong bg-card text-ink-3 opacity-0 transition-[opacity,color,border-color] duration-150 hover:border-primary hover:text-primary-ink focus-visible:opacity-100 group-hover/join:opacity-100 disabled:hidden"
        >
          <Plus className="size-3" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-64">
        <StepMenuItems onAdd={onAdd} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
