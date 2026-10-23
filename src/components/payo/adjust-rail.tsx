"use client";

import { ArrowLeftRight, Loader2, Minus, PenLine, Plus, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  describeOperation,
  updateDiff,
} from "@/lib/payo/authoring/proposals";
import type { ChangeProposal, ProposalOperation } from "@/lib/payo/authoring/types";
import { usePayo } from "@/lib/payo/store";
import type { Workflow } from "@/lib/payo/types";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  "Add a check for FX exposure over 5%",
  "Remove the draft step",
  "Move the review before the report",
  "Set the tolerance to 0.25%",
];

interface LogEntry {
  id: string;
  summary: string;
  at: string;
}

export function AdjustRail({
  workflow,
  selectedStepId,
  seedInstruction,
  onSeedConsumed,
  onApplied,
}: {
  workflow: Workflow;
  selectedStepId: string | null;
  seedInstruction: string | null;
  onSeedConsumed: () => void;
  onApplied: (lastAddedLabel?: string) => void;
}) {
  const { applyProposal, undo, canUndo } = usePayo();
  const [instruction, setInstruction] = useState("");
  const [scope, setScope] = useState<"whole" | "step">("whole");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposal, setProposal] = useState<ChangeProposal | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [appliedSeed, setAppliedSeed] = useState<string | null>(null);
  const lastInstruction = useRef("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedStep = workflow.steps.find((s) => s.id === selectedStepId) ?? null;
  const effectiveScope = selectedStep ? scope : "whole";

  // Adopt a "Fix with Payo" seed during render (React's derive-state pattern).
  if (seedInstruction && seedInstruction !== appliedSeed) {
    setAppliedSeed(seedInstruction);
    setInstruction(seedInstruction);
    setError(null);
    setProposal(null);
  }

  useEffect(() => {
    if (appliedSeed) {
      textareaRef.current?.focus();
      onSeedConsumed();
    }
  }, [appliedSeed]);

  const ask = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setError(null);
    lastInstruction.current = trimmed;
    try {
      const res = await fetch("/api/authoring/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflow: snapshot(workflow),
          instruction: trimmed,
          selectedStepId: effectiveScope === "step" && selectedStep ? selectedStep.id : undefined,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message || "Payo could not make that change.");
        setProposal(null);
      } else {
        const p = data.proposal as ChangeProposal;
        if (p.question && (!p.operations || p.operations.length === 0)) {
          setProposal(p);
        } else if (p.operations && p.operations.length) {
          setProposal(p);
          setInstruction("");
        } else {
          setError(p.summary || "No change to make.");
          setProposal(null);
        }
      }
    } catch {
      setError("The change service is unavailable. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const apply = (ops: ProposalOperation[], summary: string) => {
    applyProposal(workflow.id, ops);
    const added = ops.find((o) => o.op === "add");
    setLog((l) => [{ id: `${Date.now()}`, summary, at: new Date().toISOString() }, ...l].slice(0, 6));
    setProposal(null);
    toast(added ? `Applied: ${summary}` : `Applied: ${summary}. Undo is available.`);
    onApplied(added && added.op === "add" ? added.step.label : undefined);
  };

  const answerQuestion = (option: string) => {
    const combined = `${lastInstruction.current}: ${option}`;
    setProposal(null);
    ask(combined);
  };

  return (
    <div data-tour="adjust-rail" className="flex h-full w-full flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
          <PenLine className="size-3.5 text-payo-orange" aria-hidden="true" />
          Adjust with Payo
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        {/* Scope */}
        <div className="flex items-center gap-1 rounded-md border border-border bg-muted/50 p-0.5 text-[12px]" role="group" aria-label="Adjust scope">
          <button
            type="button"
            aria-pressed={effectiveScope === "whole"}
            onClick={() => setScope("whole")}
            className={cn(
              "flex-1 rounded-sm px-2 py-1 font-medium transition-colors",
              effectiveScope === "whole" ? "bg-card text-foreground shadow-sm" : "text-ink-2 hover:text-foreground",
            )}
          >
            Whole workflow
          </button>
          <button
            type="button"
            disabled={!selectedStep}
            aria-pressed={effectiveScope === "step"}
            onClick={() => setScope("step")}
            className={cn(
              "flex-1 rounded-sm px-2 py-1 font-medium transition-colors",
              effectiveScope === "step" ? "bg-card text-foreground shadow-sm" : "text-ink-2 hover:text-foreground",
              !selectedStep && "cursor-not-allowed opacity-40",
            )}
          >
            This step
          </button>
        </div>
        {effectiveScope === "step" && selectedStep && (
          <p className="-mt-2 text-[11.5px] leading-snug text-ink-3">
            Focused on “{selectedStep.label}”.
          </p>
        )}

        {/* Composer */}
        <div className="space-y-2">
          <label htmlFor="adjust-input" className="block text-[12px] font-medium text-ink-2">
            Describe a change in plain English
          </label>
          <textarea
            id="adjust-input"
            ref={textareaRef}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") ask(instruction);
            }}
            rows={3}
            placeholder="For example: add a check that flags positions over 12% of the portfolio."
            className="w-full resize-none rounded-md border border-input bg-card px-2.5 py-2 text-[13px] leading-relaxed outline-none focus:border-primary-strong"
          />
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => ask(instruction)} disabled={busy || !instruction.trim()} className="gap-1.5">
              {busy ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <Send className="size-3.5" aria-hidden="true" />}
              {busy ? "Thinking…" : "Ask Payo"}
            </Button>
            {canUndo(workflow.id) && (
              <Button size="sm" variant="ghost" onClick={() => undo(workflow.id)}>
                Undo
              </Button>
            )}
          </div>
          {!proposal && !busy && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    setInstruction(ex);
                    ask(ex);
                  }}
                  className="rounded-full border border-border bg-card px-2.5 py-1 text-[11.5px] text-ink-2 transition-colors hover:border-line-strong hover:text-foreground"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="flex items-start gap-2 rounded-md border border-warn-border bg-warn-tint px-3 py-2 text-[12.5px] leading-snug text-warn">
            <X className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}

        {/* Proposal */}
        <div aria-live="polite">
          {proposal?.question && (!proposal.operations || proposal.operations.length === 0) && (
            <div className="rounded-md border border-border bg-card p-3">
              <p className="text-[13px] font-medium text-foreground">{proposal.question.text}</p>
              <div className="mt-2 flex flex-col gap-1.5">
                {proposal.question.options.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => answerQuestion(o)}
                    className="rounded-md border border-border px-2.5 py-1.5 text-left text-[12.5px] text-ink-2 transition-colors hover:border-primary hover:text-foreground"
                  >
                    {o}
                  </button>
                ))}
              </div>
              <Button size="sm" variant="ghost" className="mt-2" onClick={() => setProposal(null)}>
                Cancel
              </Button>
            </div>
          )}

          {proposal?.operations && proposal.operations.length > 0 && (
            <div className="rounded-md border border-primary-soft bg-primary-tint/40 p-3">
              <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-primary-ink">
                Proposed change
              </p>
              <p className="mt-1 text-[13px] leading-snug text-foreground">{proposal.summary}</p>
              <ul className="mt-2.5 space-y-1.5">
                {proposal.operations.map((op, i) => (
                  <li key={i} className="text-[12.5px] leading-snug text-ink-2">
                    <OpIcon op={op} />
                    <span>{describeOperation(op, workflow.steps)}</span>
                    {op.op === "update" &&
                      updateDiff(op, workflow.steps).map((line) => (
                        <span key={line} className="mt-0.5 block pl-5 text-[11.5px] text-ink-3">
                          {line}
                        </span>
                      ))}
                  </li>
                ))}
              </ul>
              {proposal.assumptions.length > 0 && (
                <ul className="mt-2 list-disc space-y-0.5 pl-5 text-[11.5px] text-ink-3">
                  {proposal.assumptions.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => apply(proposal.operations, proposal.summary)}>
                  Apply change
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setInstruction(lastInstruction.current);
                    setProposal(null);
                    textareaRef.current?.focus();
                  }}
                >
                  Refine
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setProposal(null)}>
                  Discard
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Change log */}
        {log.length > 0 && (
          <div className="mt-auto">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">This session</p>
            <ul className="mt-2 space-y-1.5">
              {log.map((e) => (
                <li key={e.id} className="text-[12px] leading-snug text-ink-2">
                  <span className="text-ink-3">Applied · </span>
                  {e.summary}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function OpIcon({ op }: { op: ProposalOperation }) {
  const map = {
    add: { Icon: Plus, cls: "text-positive" },
    remove: { Icon: Minus, cls: "text-danger" },
    update: { Icon: PenLine, cls: "text-primary-ink" },
    move: { Icon: ArrowLeftRight, cls: "text-ink-3" },
  } as const;
  const { Icon, cls } = map[op.op];
  return <Icon className={cn("mr-1.5 inline size-3 shrink-0 align-[-2px]", cls)} aria-hidden="true" />;
}

/** Build the safe snapshot sent to the change endpoint. */
function snapshot(wf: Workflow) {
  return {
    id: wf.id,
    name: wf.name,
    category: wf.category,
    sampleProfile: wf.sampleProfile,
    steps: wf.steps.map((s) => ({
      id: s.id,
      type: s.type,
      label: s.label,
      purpose: s.purpose,
      when: s.when,
      config: s.config,
    })),
  };
}
