/** Payo AI: domain types for the V0 prototype. All data is simulated. */

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
  /** Review steps only: pause always, or only when the linked check finds exceptions. */
  when?: "always" | "only-when-exceptions";
  /** Where the step came from, used for badges and read-only hints. */
  origin?: "template" | "generated" | "manual";
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

export type WorkflowStatus = "draft" | "tested" | "ready" | "published";
export type WorkflowSource = "template" | "described";
export type SampleProfile = "nav" | "risk" | "market" | "bank" | "generic";

export interface Assumption {
  id: string;
  text: string;
  stepIndex?: number;
  resolved: boolean;
}

export interface TestEvidence {
  at: string;
  result: "passed";
  flaggedCount: number;
  stepCount: number;
}

export interface PublishedSnapshot {
  version: number;
  publishedAt: string;
  name: string;
  category: string;
  sampleProfile: SampleProfile;
  steps: StepDef[];
  config: RunConfig;
  testEvidence?: TestEvidence;
}

export interface Workflow {
  id: string;
  templateId?: string;
  source: WorkflowSource;
  sampleProfile: SampleProfile;
  name: string;
  category: string;
  status: WorkflowStatus;
  version: number;
  steps: StepDef[];
  createdAt: string;
  /** Original plain-English brief for described workflows. */
  brief?: string;
  assumptions?: Assumption[];
  questions?: string[];
  testEvidence?: TestEvidence;
  publishedAt?: string;
  publishedVersion?: number;
  publishedSnapshot?: PublishedSnapshot;
  /** Every published snapshot, oldest first. Restorable as a new draft. */
  versions?: PublishedSnapshot[];
}

export type RunStepState = "queued" | "running" | "complete" | "needs-review" | "skipped";

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
  /** NAV reconciliation: variance tolerance, e.g. 0.50 */
  tolerance?: number;
  /** Position risk: review threshold as % of applicable limit, e.g. 90 */
  reviewThreshold?: number;
  /** Market movements: notable move threshold in %, e.g. 0.75 */
  notableThreshold?: number;
  reportTitle?: string;
  /** Which sample behaviour a run or workflow follows. */
  profile?: SampleProfile;
  /** Generic profile fields, used when the workflow was described, not a template. */
  sourceName?: string;
  rowCount?: number;
  flaggedCount?: number;
  matchKey?: string;
  calcLabel?: string;
  checkLabel?: string;
  checkUnit?: "%" | "HK$";
  reviewer?: string;
  hasReview?: boolean;
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
  /** True when this is a review gated on the preceding check's exceptions. */
  conditionalReview?: boolean;
  /** Precomputed at run start: auto-skip because the check found no exceptions. */
  skip?: boolean;
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
