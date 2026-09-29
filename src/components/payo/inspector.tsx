"use client";

import { ChevronDown, ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePayo } from "@/lib/payo/store";
import type { FieldDef, RunStepState, StepDef, Workflow } from "@/lib/payo/types";
import { STEP_TYPE_META, StepStateIcon, StepTypeIcon } from "@/components/payo/ui";
import { cn } from "@/lib/utils";

const STATE_LABEL: Record<RunStepState, string> = {
  queued: "Queued",
  running: "Running",
  complete: "Complete",
  "needs-review": "Needs review",
};

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-[12px] font-medium text-ink-2">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11.5px] leading-snug text-ink-3">{hint}</p>}
    </div>
  );
}

function NumberField({
  value,
  onCommit,
  min,
  max,
  step,
  suffix,
}: {
  value: number;
  onCommit: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  const [text, setText] = useState(String(value));
  const [syncedValue, setSyncedValue] = useState(value);
  // Keep the local draft in step with external changes (e.g. undo) without
  // clobbering in-progress typing that still parses to the committed value.
  if (value !== syncedValue) {
    setSyncedValue(value);
    const parsed = parseFloat(text);
    if (Number.isNaN(parsed) || parsed !== value) setText(String(value));
  }

  const clamp = (n: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));

  const commit = (raw: string) => {
    const n = parseFloat(raw);
    if (!Number.isNaN(n)) onCommit(clamp(n));
  };

  const bump = (dir: 1 | -1) => {
    const base = parseFloat(text);
    const n = clamp(Math.round(((Number.isNaN(base) ? 0 : base) + dir * (step ?? 1)) * 100) / 100);
    setText(String(n));
    onCommit(n);
  };

  return (
    <div className="flex items-stretch overflow-hidden rounded-md border border-input bg-card focus-within:border-primary-strong">
      <input
        type="text"
        inputMode="decimal"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          commit(e.target.value);
        }}
        aria-label={`Value${suffix ? ` in ${suffix}` : ""}`}
        className="h-8 w-full min-w-0 border-0 bg-transparent px-2.5 text-[13px] tabular-nums outline-none"
      />
      {suffix && (
        <span className="flex shrink-0 items-center whitespace-nowrap pr-1.5 text-[11.5px] text-ink-3">
          {suffix}
        </span>
      )}
      <div className="flex shrink-0 border-l border-border">
        <button
          type="button"
          onClick={() => bump(-1)}
          aria-label="Decrease"
          className="flex w-7 items-center justify-center text-ink-3 transition-colors hover:bg-muted hover:text-foreground"
        >
          <Minus className="size-3" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => bump(1)}
          aria-label="Increase"
          className="flex w-7 items-center justify-center border-l border-border text-ink-3 transition-colors hover:bg-muted hover:text-foreground"
        >
          <Plus className="size-3" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function FieldControl({
  field,
  value,
  onCommit,
}: {
  field: FieldDef;
  value: string | number | undefined;
  onCommit: (v: string | number) => void;
}) {
  const id = `field-${field.key}`;
  switch (field.kind) {
    case "select":
      return (
        <Select value={String(value ?? "")} onValueChange={onCommit}>
          <SelectTrigger id={id} className="h-8 w-full text-[13px]">
            <SelectValue placeholder="Choose" />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-[13px]">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case "number":
      return (
        <NumberField
          value={Number(value ?? 0)}
          onCommit={onCommit}
          min={field.min}
          max={field.max}
          step={field.step}
          suffix={field.suffix}
        />
      );
    case "text":
      return (
        <Input
          id={id}
          value={String(value ?? "")}
          onChange={(e) => onCommit(e.target.value)}
          className="h-8 w-full text-[13px]"
        />
      );
    case "textarea":
      return (
        <Textarea
          id={id}
          value={String(value ?? "")}
          onChange={(e) => onCommit(e.target.value)}
          rows={3}
          className="w-full text-[13px] leading-relaxed"
        />
      );
    default:
      return (
        <p className="rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-[12.5px] leading-snug text-ink-2">
          {String(value ?? "")}
        </p>
      );
  }
}

export function InspectorPanel({
  workflow,
  step,
  index,
  lastIndex,
  runActive,
  runState,
  onClose,
}: {
  workflow: Workflow;
  step: StepDef;
  index: number;
  lastIndex: number;
  runActive: boolean;
  runState?: RunStepState;
  onClose: () => void;
}) {
  const { updateStepConfig, updateStepLabel, reorderSteps, removeStep } = usePayo();
  const [labelDraft, setLabelDraft] = useState(step.label);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const [syncedLabel, setSyncedLabel] = useState(step.label);
  if (step.label !== syncedLabel) {
    setSyncedLabel(step.label);
    setLabelDraft(step.label);
  }

  // Escape closes the inspector (unless a nested control already handled it).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const meta = STEP_TYPE_META[step.type];
  const simple = step.fields.filter((f) => !f.advanced);
  const advanced = step.fields.filter((f) => f.advanced);

  const commitLabel = () => {
    const trimmed = labelDraft.trim();
    if (trimmed && trimmed !== step.label) updateStepLabel(workflow.id, step.id, trimmed);
    else setLabelDraft(step.label);
  };

  return (
    <>
      {/* Backdrop on narrow screens */}
      <div
        className="fixed inset-0 z-20 bg-foreground/10 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="z-30 flex h-full w-[min(92vw,352px)] shrink-0 flex-col border-l border-border bg-card shadow-xl lg:w-[352px] lg:shadow-none"
        aria-label="Step inspector"
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
            <StepTypeIcon type={step.type} className="size-3.5" />
            {meta.label}
          </p>
          <Button variant="ghost" size="icon" className="size-7" onClick={onClose} aria-label="Close inspector">
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
          <p className="text-[12.5px] leading-relaxed text-ink-2">{step.purpose}</p>

          {runState && (
            <p className="flex items-center gap-2 text-[12px] text-ink-2">
              <StepStateIcon state={runState} />
              {STATE_LABEL[runState]}
              <span className="text-ink-3">· this run</span>
            </p>
          )}

          {step.type === "draft" && (
            <p className="rounded-md border border-primary-soft bg-primary-tint/60 px-3 py-2 text-[12px] leading-relaxed text-ink-2">
              This step produces an <span className="font-medium text-foreground">AI-assisted draft</span>.
              Its output is always checked by the reviewer before release.
            </p>
          )}

          <Field label="Step name" htmlFor="step-label-input" hint="Shown on the workflow canvas.">
            <Input
              id="step-label-input"
              value={labelDraft}
              onChange={(e) => setLabelDraft(e.target.value)}
              onBlur={commitLabel}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitLabel();
              }}
              className="h-8 w-full text-[13px] font-medium"
            />
          </Field>

          {simple.map((f) => (
            <Field key={f.key} label={f.label} htmlFor={`field-${f.key}`} hint={f.hint}>
              <FieldControl
                field={f}
                value={step.config[f.key]}
                onCommit={(v) => updateStepConfig(workflow.id, step.id, f.key, v)}
              />
            </Field>
          ))}

          {advanced.length > 0 && (
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger className="flex w-full items-center justify-between border-t border-border pt-3.5 text-[12.5px] font-medium text-ink-2 transition-colors hover:text-foreground">
                Advanced
                <ChevronDown
                  className={cn("size-4 text-ink-3 transition-transform duration-200", advancedOpen && "rotate-180")}
                  aria-hidden="true"
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-4 pt-4">
                  {advanced.map((f) => (
                    <Field key={f.key} label={f.label} htmlFor={`field-${f.key}`} hint={f.hint}>
                      <FieldControl
                        field={f}
                        value={step.config[f.key]}
                        onCommit={(v) => updateStepConfig(workflow.id, step.id, f.key, v)}
                      />
                    </Field>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>

        <div className="shrink-0 border-t border-border px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={index === 0 || runActive}
                onClick={() => reorderSteps(workflow.id, index, index - 1)}
              >
                <ChevronLeft className="size-3.5" aria-hidden="true" />
                Earlier
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={index === lastIndex || runActive}
                onClick={() => reorderSteps(workflow.id, index, index + 1)}
              >
                Later
                <ChevronRight className="size-3.5" aria-hidden="true" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-danger hover:text-danger"
              disabled={runActive}
              onClick={() => setConfirmRemove(true)}
            >
              Remove
            </Button>
          </div>
          <p className="mt-2.5 text-[11.5px] leading-snug text-ink-3">
            Steps can also be reordered by dragging them on the canvas.
          </p>
        </div>
      </aside>

      <AlertDialog open={confirmRemove} onOpenChange={setConfirmRemove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove “{step.label}”?</AlertDialogTitle>
            <AlertDialogDescription>
              The step is removed from this workflow. You can undo this from the toolbar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                removeStep(workflow.id, step.id);
                onClose();
              }}
            >
              Remove step
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
