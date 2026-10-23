"use client";

import { ChevronRight, Plus } from "lucide-react";
import { Fragment } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { STEP_TYPE_LABELS } from "@/lib/payo/data";
import type { RunStepState, StepDef, StepTypeId, Workflow } from "@/lib/payo/types";
import { STEP_TYPE_META, StepStateIcon, StepTypeIcon } from "@/components/payo/ui";
import { cn } from "@/lib/utils";

export const ADDABLE_TYPES: { type: StepTypeId; description: string }[] = [
  { type: "load", description: "Bring in a sample source file" },
  { type: "map", description: "Match rows between two sources" },
  { type: "calculate", description: "Work out a value for each row" },
  { type: "check", description: "Compare against a tolerance or limit" },
  { type: "draft", description: "Prepare an AI-assisted draft" },
  { type: "review", description: "Pause for a human decision" },
  { type: "report", description: "Prepare a report from the results" },
];

function StepMenuItems({ onAdd }: { onAdd: (type: StepTypeId) => void }) {
  return (
    <>
      <p className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-ink-3">
        Add a step
      </p>
      {ADDABLE_TYPES.map(({ type, description }) => (
        <DropdownMenuItem
          key={type}
          aria-label={`${STEP_TYPE_LABELS[type]}. ${description}`}
          onClick={() => onAdd(type)}
          className="gap-2.5 py-2"
        >
          <StepTypeIcon type={type} className="size-4 shrink-0 text-ink-3" />
          <div className="min-w-0">
            <p className="text-[13px] font-medium leading-tight">{STEP_TYPE_LABELS[type]}</p>
            <p className="mt-0.5 text-[11.5px] leading-tight text-ink-3">{description}</p>
          </div>
        </DropdownMenuItem>
      ))}
    </>
  );
}

function StepCard({
  step,
  index,
  selected,
  state,
  progress,
  onSelect,
}: {
  step: StepDef;
  index: number;
  selected: boolean;
  state?: RunStepState;
  progress?: number;
  onSelect: () => void;
}) {
  const meta = STEP_TYPE_META[step.type];
  return (
    <div
      data-step-id={step.id}
      data-tour="step-card"
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${meta.label}: ${step.label}. ${step.summary(step.config)}`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "relative flex w-[224px] shrink-0 cursor-pointer select-none flex-col rounded-md border bg-card p-3.5 text-left transition-[border-color,background-color] duration-150",
        "hover:border-line-strong",
        selected && "border-primary bg-muted/60",
        !selected && state === "needs-review" && "border-warn/60",
        !selected && state === "running" && "border-primary/70",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-3">
          <span className="tabular-nums">{index + 1}</span>
          <StepTypeIcon type={step.type} className="size-3.5" />
          {meta.label}
        </span>
        {state && <StepStateIcon state={state} />}
      </div>
      <p className="mt-2 text-[13.5px] font-medium leading-snug text-foreground">{step.label}</p>
      <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-ink-3">{step.summary(step.config)}</p>
      {step.type === "review" && step.when === "only-when-exceptions" && (
        <span className="mt-2 inline-flex w-fit items-center rounded-sm border border-dashed border-line-strong px-1.5 py-0.5 text-[10.5px] font-medium text-ink-3">
          Conditional
        </span>
      )}
      {state === "running" && (
        <div
          className="mt-2.5 h-[3px] overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label={`${step.label} progress`}
          aria-valuenow={Math.round((progress ?? 0) * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-ink-2 transition-[width] duration-150 ease-linear"
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
      className={cn("mx-1.5 size-4 shrink-0", done ? "text-positive" : "text-ink-3/50")}
      strokeWidth={2}
      aria-hidden="true"
    />
  );
}

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

function AddStepControl({ disabled, onAdd }: { disabled: boolean; onAdd: (type: StepTypeId) => void }) {
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

export function WorkflowGraph({
  wf,
  selectedStepId,
  onSelectStep,
  runStates,
  activeStepId,
  progress,
  runActive,
  onAddStep,
}: {
  wf: Workflow;
  selectedStepId: string | null;
  onSelectStep: (id: string | null) => void;
  runStates?: Record<string, RunStepState>;
  activeStepId?: string;
  progress?: number;
  runActive: boolean;
  onAddStep: (type: StepTypeId, index: number) => void;
}) {
  if (wf.steps.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-[14px] text-ink-2">
          This workflow has no steps yet. Describe a change, or add the first step.
        </p>
        <AddStepControl disabled={runActive} onAdd={(t) => onAddStep(t, 0)} />
      </div>
    );
  }

  return (
    <div data-tour="builder-canvas" className="flex h-full min-w-max flex-col justify-center gap-4 px-6 py-8 md:px-10">
      <div className="flex items-center">
        {wf.steps.map((step, i) => {
          const st = runStates?.[step.id];
          const prevComplete = i > 0 && runStates?.[wf.steps[i - 1].id] === "complete";
          return (
            <Fragment key={step.id}>
              {i > 0 && (
                <div className="group/join relative mx-1 flex h-10 w-6 shrink-0 items-center justify-center">
                  <Connector done={!!prevComplete} />
                  <InlineAddStep
                    disabled={runActive}
                    label={`Insert a step before “${step.label}”`}
                    onAdd={(type) => onAddStep(type, i)}
                  />
                </div>
              )}
              <StepCard
                step={step}
                index={i}
                selected={selectedStepId === step.id}
                state={runStates ? (st ?? "queued") : undefined}
                progress={activeStepId === step.id ? progress : undefined}
                onSelect={() => onSelectStep(selectedStepId === step.id ? null : step.id)}
              />
            </Fragment>
          );
        })}
        <div className="ml-1.5 flex items-center">
          <Connector done={false} />
          <AddStepControl disabled={runActive} onAdd={(t) => onAddStep(t, wf.steps.length)} />
        </div>
      </div>
      {wf.steps.some((s) => s.type === "review" && s.when === "only-when-exceptions") && (
        <p className="text-[12px] leading-snug text-ink-3">
          Conditional reviews run only when the check before them finds exceptions. When nothing is
          flagged, the review is skipped and the run continues to the output.
        </p>
      )}
    </div>
  );
}
