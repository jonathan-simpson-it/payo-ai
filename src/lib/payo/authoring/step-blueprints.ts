/**
 * Step blueprints: the canonical field schema, defaults and summary for each
 * step type. The authoring layer only ever emits {type,label,config}; these
 * expand into full, editable StepDef objects so the inspector always works.
 */

import type { FieldDef, StepConfig, StepDef, StepTypeId } from "../types";
import { STEP_TYPE_LABELS } from "../data";

const opts = (...labels: string[]): FieldOptionLite[] => labels.map((l) => ({ value: l, label: l }));
type FieldOptionLite = { value: string; label: string };

export interface StepBlueprint {
  type: StepTypeId;
  purpose: string;
  durationMs: number;
  fields: FieldDef[];
  defaults: StepConfig;
  summary: (c: StepConfig) => string;
}

export const STEP_BLUEPRINTS: Record<StepTypeId, StepBlueprint> = {
  load: {
    type: "load",
    purpose: "Brings in a sample data set for this step.",
    durationMs: 1100,
    fields: [
      { key: "source", label: "Source file", kind: "text" },
      { key: "compare", label: "Compare against", kind: "text" },
    ],
    defaults: { source: "Sample dataset", compare: "" },
    summary: (c) => String(c.source || "Sample dataset"),
  },
  map: {
    type: "map",
    purpose: "Lines up fields between two sample data sets so they can be compared.",
    durationMs: 1000,
    fields: [
      { key: "matchOn", label: "Match on", kind: "select", options: opts("Name", "Code", "Fund name", "Instrument", "Region", "Payment reference", "TID", "UID") },
      { key: "unmatched", label: "Unmatched items", kind: "select", options: opts("Flag for review", "Exclude from run") },
    ],
    defaults: { matchOn: "Name", unmatched: "Flag for review" },
    summary: (c) => `Matched on ${c.matchOn}`,
  },
  calculate: {
    type: "calculate",
    purpose: "Works out a value for each row from the loaded data.",
    durationMs: 1100,
    fields: [
      { key: "measure", label: "Measure", kind: "select", options: opts("Difference %", "Total", "Exposure %", "Net movement", "Bank amount minus ledger", "Absolute difference") },
    ],
    defaults: { measure: "Difference %" },
    summary: (c) => String(c.measure),
  },
  check: {
    type: "check",
    purpose: "Checks each row against a limit or threshold you set.",
    durationMs: 1000,
    fields: [
      { key: "threshold", label: "Threshold", kind: "number", suffix: "%", min: 0, max: 100, step: 0.05 },
      { key: "basis", label: "Apply to", kind: "select", options: opts("Difference %", "Absolute value", "Weight of total", "Unmatched items") },
    ],
    defaults: { threshold: 0.5, basis: "Difference %" },
    summary: (c) =>
      c.basis === "Unmatched items" ? "Flags unmatched items" : `Threshold ${Number(c.threshold ?? 0).toFixed(2)}%`,
  },
  draft: {
    type: "draft",
    purpose: "Prepares an AI-assisted draft from the checked results.",
    durationMs: 1400,
    fields: [
      { key: "focus", label: "Focus", kind: "select", options: opts("Summary of inputs", "Detailed notes") },
      { key: "tone", label: "Tone", kind: "select", options: opts("Concise and factual", "Detailed") },
    ],
    defaults: { focus: "Summary of inputs", tone: "Concise and factual" },
    summary: () => "AI-assisted draft",
  },
  review: {
    type: "review",
    purpose: "Stops the run so a person can check the results before anything is released.",
    durationMs: 800,
    fields: [
      { key: "reviewer", label: "Reviewer", kind: "text" },
      { key: "decision", label: "Decision required", kind: "static" },
      { key: "instructions", label: "Instructions to reviewer", kind: "textarea" },
    ],
    defaults: {
      reviewer: "Reviewer",
      decision: "Approve summary or return for review",
      instructions: "Check the flagged items before the output is released.",
    },
    summary: (c) => `Pauses for ${c.reviewer || "Reviewer"}`,
  },
  report: {
    type: "report",
    purpose: "Prepares a reviewable output from the run results.",
    durationMs: 1300,
    fields: [
      { key: "title", label: "Report title", kind: "text" },
      { key: "contents", label: "Contents", kind: "select", options: opts("Exceptions and totals", "All rows", "Exceptions only") },
    ],
    defaults: { title: "New report", contents: "Exceptions and totals" },
    summary: (c) => String(c.title || "New report"),
  },
};

let seq = 0;
function genId(type: StepTypeId): string {
  seq += 1;
  return `${type}-${Date.now().toString(36)}-${seq.toString(36)}`;
}

function clampConfig(type: StepTypeId, config: StepConfig): StepConfig {
  const bp = STEP_BLUEPRINTS[type];
  const out: StepConfig = {};
  for (const field of bp.fields) {
    const raw = config[field.key];
    if (field.kind === "number") {
      const n = Number(raw ?? bp.defaults[field.key]);
      const min = field.min ?? -Infinity;
      const max = field.max ?? Infinity;
      out[field.key] = Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : Number(bp.defaults[field.key] ?? 0);
    } else if (field.kind === "static") {
      out[field.key] = String(raw ?? bp.defaults[field.key] ?? "");
    } else {
      const val = raw ?? bp.defaults[field.key] ?? "";
      if (field.kind === "select" && field.options && field.options.length) {
        const allowed = field.options.map((o) => o.value);
        out[field.key] = allowed.includes(String(val)) ? val : bp.defaults[field.key];
      } else {
        out[field.key] = val;
      }
    }
  }
  return out;
}

/** Expand a model-produced step into a full, editable StepDef. */
export function buildStep(
  type: StepTypeId,
  overrides: { label?: string; purpose?: string; config?: StepConfig; when?: "always" | "only-when-exceptions" },
  origin: StepDef["origin"] = "generated",
  id?: string,
): StepDef {
  const bp = STEP_BLUEPRINTS[type];
  const config = clampConfig(type, overrides.config ?? {});
  const step: StepDef = {
    id: id ?? genId(type),
    type,
    label: (overrides.label || STEP_TYPE_LABELS[type]).slice(0, 80),
    purpose: overrides.purpose || bp.purpose,
    fields: bp.fields,
    config,
    summary: bp.summary,
    durationMs: bp.durationMs,
    origin,
  };
  if (type === "review") step.when = overrides.when ?? "only-when-exceptions";
  return step;
}
