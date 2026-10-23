/** Validate and apply natural-language change proposals. Pure and atomic. */

import type { StepDef } from "../types";
import type { ProposalOperation } from "./types";
import { STEP_BLUEPRINTS, buildStep } from "./step-blueprints";

export interface ProposalValidation {
  valid: ProposalOperation[];
  rejected: string[];
}

export function validateProposal(ops: ProposalOperation[], wf: { steps: { id: string }[] }): ProposalValidation {
  const valid: ProposalOperation[] = [];
  const rejected: string[] = [];
  const ids = new Set(wf.steps.map((s) => s.id));

  for (const op of ops) {
    switch (op.op) {
      case "add": {
        if (!STEP_BLUEPRINTS[op.step.type]) {
          rejected.push(`Unsupported step type "${op.step.type}".`);
          break;
        }
        if (op.afterStepId !== null && !ids.has(op.afterStepId)) {
          rejected.push("Add referenced a step that does not exist.");
          break;
        }
        valid.push(op);
        break;
      }
      case "remove": {
        if (!ids.has(op.stepId)) rejected.push("Remove referenced a step that does not exist.");
        else valid.push(op);
        break;
      }
      case "update": {
        if (!ids.has(op.stepId)) rejected.push("Update referenced a step that does not exist.");
        else valid.push(op);
        break;
      }
      case "move": {
        if (!ids.has(op.stepId)) rejected.push("Move referenced a step that does not exist.");
        else valid.push(op);
        break;
      }
    }
  }
  return { valid, rejected };
}

/** Apply operations to the step list. Never mutates the input. */
export function applyOperations(steps: StepDef[], ops: ProposalOperation[]): StepDef[] {
  let working = steps.slice();

  for (const op of ops) {
    if (op.op === "add") {
      const step = buildStep(op.step.type, { label: op.step.label, purpose: op.step.purpose, config: op.step.config });
      const anchor = op.afterStepId ? working.findIndex((s) => s.id === op.afterStepId) : -1;
      const at = anchor === -1 ? working.length : anchor + 1;
      working = [...working.slice(0, at), step, ...working.slice(at)];
    } else if (op.op === "remove") {
      working = working.filter((s) => s.id !== op.stepId);
    } else if (op.op === "update") {
      working = working.map((s) => {
        if (s.id !== op.stepId) return s;
        const merged = { ...s.config, ...(op.patch.config ?? {}) };
        const next = buildStep(
          s.type,
          { label: op.patch.label ?? s.label, purpose: op.patch.purpose ?? s.purpose, config: merged, when: s.when },
          s.origin ?? "manual",
          s.id,
        );
        return next;
      });
    } else if (op.op === "move") {
      const from = working.findIndex((s) => s.id === op.stepId);
      if (from === -1) break;
      const moved = working[from];
      const rest = working.filter((_, i) => i !== from);
      const to = Math.max(0, Math.min(rest.length, op.toIndex));
      working = [...rest.slice(0, to), moved, ...rest.slice(to)];
    }
  }

  return working;
}

/** Human-readable label for a single operation, for the proposal card. */
export function describeOperation(op: ProposalOperation, steps: StepDef[]): string {
  const labelOf = (id: string) => steps.find((s) => s.id === id)?.label ?? "step";
  switch (op.op) {
    case "add": {
      const anchor = op.afterStepId ? ` after “${labelOf(op.afterStepId)}”` : " at the end";
      return `Add ${op.step.type === "review" ? "a review" : "a step"} “${op.step.label}”${anchor}`;
    }
    case "remove":
      return `Remove “${labelOf(op.stepId)}”`;
    case "update": {
      const fields = op.patch.config ? Object.keys(op.patch.config) : [];
      const what = op.patch.label ? `Rename “${labelOf(op.stepId)}” to “${op.patch.label}”` : `Change ${fields.map((f) => `${f}`).join(", ") || "settings"} in “${labelOf(op.stepId)}”`;
      return what;
    }
    case "move":
      return `Move “${labelOf(op.stepId)}” to position ${op.toIndex + 1}`;
  }
}

/** Before/after detail for an update operation, for the diff card. */
export function updateDiff(op: Extract<ProposalOperation, { op: "update" }>, steps: StepDef[]): string[] {
  const step = steps.find((s) => s.id === op.stepId);
  if (!step) return [];
  const lines: string[] = [];
  if (op.patch.label && op.patch.label !== step.label) lines.push(`Name: “${step.label}” → “${op.patch.label}”`);
  for (const [k, v] of Object.entries(op.patch.config ?? {})) {
    if (String(step.config[k]) !== String(v)) lines.push(`${k}: ${step.config[k] ?? "unset"} → ${v}`);
  }
  return lines;
}
