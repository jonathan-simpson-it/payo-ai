/** Turns untrusted model output into a safe, editable workflow. */

import type { Assumption, SampleProfile, StepConfig, StepDef, Workflow } from "../types";
import type { BriefDetails, ChangeProposal, DraftStep, ProposalOperation, WorkflowDraft } from "./types";
import { STEP_BLUEPRINTS, buildStep } from "./step-blueprints";

const PROFILES: SampleProfile[] = ["nav", "risk", "market", "bank", "generic"];
const CATEGORIES = ["Operations", "Risk", "Research", "Reporting", "Finance", "SME finance"];
const TYPES = Object.keys(STEP_BLUEPRINTS);
const MAX_STEPS = 10;

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

function coerceConfig(configIn: unknown): StepConfig {
  const out: StepConfig = {};
  const obj = (configIn ?? {}) as Record<string, unknown>;
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "number") out[k] = v;
    else if (typeof v === "string") out[k] = v.slice(0, 240);
    else if (typeof v === "boolean") out[k] = v ? "Yes" : "No";
  }
  return out;
}

function coerceDraftStep(s: unknown): DraftStep | null {
  const o = (s ?? {}) as Record<string, unknown>;
  const type = str(o.type);
  if (!TYPES.includes(type)) return null;
  return {
    type: type as DraftStep["type"],
    label: str(o.label).slice(0, 80),
    purpose: str(o.purpose).slice(0, 200) || undefined,
    config: coerceConfig(o.config),
  };
}

/** Coerce arbitrary model JSON into a validated WorkflowDraft, dropping anything unsafe. */
export function sanitizeDraft(input: unknown): { draft: WorkflowDraft; dropped: number } {
  const obj = (input ?? {}) as Record<string, unknown>;
  let dropped = 0;

  const rawSteps = Array.isArray(obj.steps) ? obj.steps : [];
  const steps: DraftStep[] = [];
  for (const s of rawSteps) {
    const step = steps.length >= MAX_STEPS ? null : coerceDraftStep(s);
    if (!step) {
      dropped += 1;
      continue;
    }
    steps.push(step);
  }

  const profile = PROFILES.includes(obj.sampleProfile as SampleProfile)
    ? (obj.sampleProfile as SampleProfile)
    : "generic";
  const category = CATEGORIES.includes(str(obj.category)) ? str(obj.category) : "Operations";

  const assumptions = Array.isArray(obj.assumptions)
    ? obj.assumptions.map((a) => str(a)).filter(Boolean).slice(0, 8)
    : [];
  const questions = Array.isArray(obj.questions)
    ? obj.questions.map((q) => str(typeof q === "string" ? q : (q as { text?: string })?.text)).filter(Boolean).slice(0, 4)
    : [];

  const draft: WorkflowDraft = {
    name: str(obj.name, "Untitled workflow").slice(0, 80),
    category,
    summary: str(obj.summary).slice(0, 220),
    sampleProfile: steps.length ? profile : "generic",
    steps,
    assumptions,
    questions,
  };
  return { draft, dropped };
}

export function draftToWorkflow(draft: WorkflowDraft, brief: string, id: string): Workflow {
  const steps: StepDef[] = draft.steps.map((s) => buildStep(s.type, { label: s.label, purpose: s.purpose, config: s.config }));
  const assumptions: Assumption[] = draft.assumptions.map((text, i) => ({
    id: `as-${i + 1}`,
    text,
    resolved: false,
  }));
  const now = new Date().toISOString();
  return {
    id,
    source: "described",
    sampleProfile: draft.sampleProfile,
    name: draft.name,
    category: draft.category,
    status: "draft",
    version: 1,
    steps,
    createdAt: now,
    brief: brief.trim().slice(0, 4000),
    assumptions,
    questions: draft.questions,
  };
}

/** Lightweight guidance text shown before a brief is even drafted. */
export function detailToText(details?: BriefDetails): string {
  if (!details) return "";
  const parts: string[] = [];
  if (details.sources) parts.push(`Sources: ${details.sources}`);
  if (details.reviewer) parts.push(`Reviewer: ${details.reviewer}`);
  if (details.output) parts.push(`Output: ${details.output}`);
  if (details.cadence) parts.push(`Cadence: ${details.cadence}`);
  return parts.join("\n");
}

/** Coerce untrusted model output into a safe ChangeProposal. */
export function sanitizeChange(input: unknown): ChangeProposal {
  const obj = (input ?? {}) as Record<string, unknown>;
  const rawOps = Array.isArray(obj.operations) ? obj.operations : [];
  const operations: ProposalOperation[] = [];

  for (const o of rawOps) {
    const op = (o ?? {}) as Record<string, unknown>;
    switch (op.op) {
      case "add": {
        const step = coerceDraftStep(op.step);
        if (step) operations.push({ op: "add", afterStepId: typeof op.afterStepId === "string" ? op.afterStepId : null, step });
        break;
      }
      case "remove":
        if (typeof op.stepId === "string") operations.push({ op: "remove", stepId: op.stepId });
        break;
      case "update": {
        if (typeof op.stepId !== "string") break;
        const patchObj = (op.patch ?? {}) as Record<string, unknown>;
        const patch: { label?: string; purpose?: string; config?: StepConfig } = {};
        if (typeof patchObj.label === "string") patch.label = patchObj.label.slice(0, 80);
        if (typeof patchObj.purpose === "string") patch.purpose = patchObj.purpose.slice(0, 200);
        const cfg = coerceConfig(patchObj.config);
        if (Object.keys(cfg).length) patch.config = cfg;
        operations.push({ op: "update", stepId: op.stepId, patch });
        break;
      }
      case "move": {
        if (typeof op.stepId === "string" && typeof op.toIndex === "number") {
          operations.push({ op: "move", stepId: op.stepId, toIndex: Math.max(0, Math.floor(op.toIndex)) });
        }
        break;
      }
    }
  }

  const assumptions = Array.isArray(obj.assumptions) ? obj.assumptions.map((a) => str(a)).filter(Boolean).slice(0, 6) : [];
  const q = obj.question as { text?: unknown; options?: unknown } | null;
  const question =
    q && typeof q.text === "string" && q.text.trim()
      ? { text: q.text.trim().slice(0, 300), options: Array.isArray(q.options) ? q.options.map((x) => str(x)).filter(Boolean).slice(0, 5) : [] }
      : null;

  return { summary: str(obj.summary).slice(0, 220), operations, assumptions, question };
}
