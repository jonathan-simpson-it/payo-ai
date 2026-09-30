/** Payo AI — domain types for the V0 prototype. All data is simulated. */

export type StepTypeId =
  | "load"
  | "map"
  | "calculate"
  | "check"
  | "draft"
  | "review"
  | "report";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldDef {
  key: string;
  label: string;
  kind: "select" | "number" | "text" | "textarea" | "static";
  options?: FieldOption[];
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  /** Lives behind the "Advanced" disclosure rather than in the default view. */
  advanced?: boolean;
}

export type StepConfig = Record<string, string | number>;

export interface StepDef {
  id: string;
  type: StepTypeId;
  label: string;
  purpose: string;
  fields: FieldDef[];
  config: StepConfig;
  /** Short line shown under the step name on the canvas. */
  summary: (config: StepConfig) => string;
  /** Simulated run duration in ms. */
  durationMs: number;
}

export interface TemplateDef {
  id: string;
  category: string;
  name: string;
  outcome: string;
  sampleData: boolean;
  comingSoon?: boolean;
  steps?: StepDef[];
  /** Coming-soon templates show a short step outline instead. */
  stepLabels?: string[];
  /** Key source types, shown on the landing page preview. */
  keySources?: string[];
}

export type WorkflowStatus = "draft" | "tested" | "ready";

export interface Workflow {
  id: string;
  templateId: string;
  name: string;
  category: string;
  status: WorkflowStatus;
  steps: StepDef[];
  createdAt: string;
}

export type RunStepState = "queued" | "running" | "complete" | "needs-review";

export interface RunStepRecord {
  stepId: string;
  label: string;
  type: StepTypeId;
  state: RunStepState;
  /** Simulated duration, e.g. 1.2s */
  durationSec?: number;
  note?: string;
}

export type RunStatus = "draft" | "running" | "needs-review" | "completed";

export interface RunConfig {
  /** NAV reconciliation — variance tolerance, e.g. 0.50 */
  tolerance?: number;
  /** Position risk — review threshold as % of applicable limit, e.g. 90 */
  reviewThreshold?: number;
  /** Market movements — notable move threshold in %, e.g. 0.75 */
  notableThreshold?: number;
  reportTitle?: string;
}

export interface RunReview {
  decision: "approved" | "returned";
  at: string;
  by: string;
}

export interface Run {
  id: string;
  code: string;
  workflowId: string;
  workflowName: string;
  startedAt: string;
  finishedAt?: string;
  status: RunStatus;
  statusNote?: string;
  config: RunConfig;
  timeline: RunStepRecord[];
  sources: string[];
  review?: RunReview;
}

export interface EngineStepMeta {
  id: string;
  label: string;
  type: StepTypeId;
  durationMs: number;
}

export interface RunEngine {
  runId: string;
  workflowId: string;
  steps: EngineStepMeta[];
  states: Record<string, RunStepState>;
  activeIndex: number;
  /** 0..1 progress of the active step */
  progress: number;
  phase: "running" | "awaiting-review" | "returned" | "done";
}

/** A sample-data test of a workflow; does not create a Run record. */
export interface TestEngine {
  workflowId: string;
  steps: EngineStepMeta[];
  states: Record<string, RunStepState>;
  activeIndex: number;
  /** 0..1 progress of the active step */
  progress: number;
  phase: "running" | "done";
}

export type ActivityTone = "draft" | "tested" | "ready" | "review" | "done";

export interface ActivityEvent {
  id: string;
  workflowId: string;
  at: string;
  label: string;
  tone: ActivityTone;
}
