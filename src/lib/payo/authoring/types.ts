/** Types for the natural-language workflow authoring layer. All output is a draft. */

import type { SampleProfile, StepConfig, StepTypeId, Workflow } from "../types";

export type AuthoringErrorCode =
  | "not_configured"
  | "rate_limited"
  | "timeout"
  | "invalid_response"
  | "provider_error"
  | "invalid_request";

export class AuthoringError extends Error {
  readonly code: AuthoringErrorCode;
  constructor(code: AuthoringErrorCode, message: string) {
    super(message);
    this.name = "AuthoringError";
    this.code = code;
  }
}

export interface BriefDetails {
  sources?: string;
  reviewer?: string;
  output?: string;
  cadence?: string;
}

export interface DraftStep {
  type: StepTypeId;
  label: string;
  purpose?: string;
  config: StepConfig;
}

export interface WorkflowDraft {
  name: string;
  category: string;
  summary: string;
  sampleProfile: SampleProfile;
  steps: DraftStep[];
  assumptions: string[];
  questions: string[];
}

export type ProposalOperation =
  | { op: "add"; afterStepId: string | null; step: DraftStep }
  | { op: "remove"; stepId: string }
  | { op: "update"; stepId: string; patch: { label?: string; purpose?: string; config?: StepConfig } }
  | { op: "move"; stepId: string; toIndex: number };

export interface ChangeProposal {
  summary: string;
  operations: ProposalOperation[];
  assumptions: string[];
  question?: { text: string; options: string[] } | null;
}

export type CheckSeverity = "block" | "warn" | "pass";
export type ReadinessSection = "Structure" | "Sources" | "Logic" | "Control" | "Clarity" | "Evidence";

export interface ReadinessItem {
  id: string;
  section: ReadinessSection;
  severity: CheckSeverity;
  label: string;
  detail: string;
  stepId?: string;
  /** A plain-English instruction that "Fix with Payo" would send. */
  fix?: string;
}

export interface ReadinessReport {
  items: ReadinessItem[];
  blockers: number;
  warnings: number;
  passed: number;
  canTest: boolean;
  canPublish: boolean;
}

/** A trimmed, safe snapshot of a workflow sent to the change endpoint. */
export interface WorkflowSnapshotForModel {
  id: string;
  name: string;
  category: string;
  sampleProfile: SampleProfile;
  steps: {
    id: string;
    type: StepTypeId;
    label: string;
    purpose: string;
    when?: "always" | "only-when-exceptions";
    config: StepConfig;
  }[];
}

export function snapshotWorkflow(wf: Workflow): WorkflowSnapshotForModel {
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
