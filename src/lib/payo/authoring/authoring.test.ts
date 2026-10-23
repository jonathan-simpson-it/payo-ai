import { describe, expect, it } from "vitest";

import { checkOutcome } from "../data";
import { sanitizeDraft, draftToWorkflow } from "./normalize";
import { evaluateReadiness } from "./readiness";
import { applyOperations, describeOperation, validateProposal } from "./proposals";
import { workflowToMermaid } from "./mermaid";

const navRaw = {
  name: "NAV reconciliation",
  category: "Operations",
  summary: "Compare valuations and review material differences.",
  sampleProfile: "nav",
  steps: [
    { type: "load", label: "Load sample valuations", config: { source: "Sample administrator NAV", compare: "Sample internal valuation" } },
    { type: "check", label: "Flag tolerance breaches", config: { threshold: 0.5, basis: "Difference %" } },
    { type: "review", label: "Review material variances", config: { reviewer: "Operations reviewer" } },
    { type: "report", label: "Create reconciliation summary", config: { title: "NAV reconciliation" } },
    { type: "banana", label: "should be dropped", config: {} },
  ],
  assumptions: ["Assumed a 0.50% tolerance."],
  questions: [{ text: "Which valuation date?" }],
};

describe("sanitizeDraft", () => {
  it("drops unsupported step types and coerces questions", () => {
    const { draft, dropped } = sanitizeDraft(navRaw);
    expect(dropped).toBe(1);
    expect(draft.steps).toHaveLength(4);
    expect(draft.sampleProfile).toBe("nav");
    expect(draft.questions).toEqual(["Which valuation date?"]);
  });

  it("clamps to generic when the profile is unknown", () => {
    const { draft } = sanitizeDraft({ ...navRaw, sampleProfile: "crypto" });
    expect(draft.sampleProfile).toBe("generic");
  });
});

describe("draftToWorkflow", () => {
  it("expands steps with blueprint fields and gates the review", () => {
    const { draft } = sanitizeDraft(navRaw);
    const wf = draftToWorkflow(draft, "the brief", "wf-1");
    expect(wf.source).toBe("described");
    expect(wf.version).toBe(1);
    const review = wf.steps.find((s) => s.type === "review");
    expect(review?.when).toBe("only-when-exceptions");
    const load = wf.steps.find((s) => s.type === "load");
    expect(load?.fields.some((f) => f.key === "source")).toBe(true);
  });
});

describe("checkOutcome", () => {
  it("uses the tolerance to count NAV exceptions", () => {
    expect(checkOutcome("nav", { tolerance: 0.5 }).flagged).toBe(2);
    expect(checkOutcome("nav", { tolerance: 2.0 }).flagged).toBe(0);
  });

  it("counts unmatched and differing bank payments", () => {
    expect(checkOutcome("bank", { profile: "bank" }).flagged).toBe(3);
  });
});

describe("bank profile", () => {
  it("is preserved through draft sanitisation", () => {
    const { draft } = sanitizeDraft({ ...navRaw, sampleProfile: "bank" });
    expect(draft.sampleProfile).toBe("bank");
  });
});

describe("proposals", () => {
  const { draft } = sanitizeDraft(navRaw);
  const wf = draftToWorkflow(draft, "b", "wf-1");
  const check = wf.steps.find((s) => s.type === "check")!;

  it("rejects operations on unknown step ids", () => {
    const { valid, rejected } = validateProposal([{ op: "remove", stepId: "does-not-exist" }], wf);
    expect(valid).toHaveLength(0);
    expect(rejected.length).toBeGreaterThan(0);
  });

  it("adds a step after an anchor", () => {
    const next = applyOperations(wf.steps, [
      { op: "add", afterStepId: check.id, step: { type: "calculate", label: "Calculate variance", config: { measure: "Difference %" } } },
    ]);
    expect(next).toHaveLength(wf.steps.length + 1);
    const idx = next.findIndex((s) => s.label === "Calculate variance");
    expect(next[idx - 1].id).toBe(check.id);
  });

  it("preserves the id when updating a step", () => {
    const updated = applyOperations(wf.steps, [
      { op: "update", stepId: check.id, patch: { config: { threshold: 0.25 } } },
    ]);
    const c = updated.find((s) => s.id === check.id)!;
    expect(c.config.threshold).toBe(0.25);
  });

  it("describes operations", () => {
    expect(describeOperation({ op: "remove", stepId: check.id }, wf.steps)).toMatch(/Remove/);
  });
});

describe("evaluateReadiness", () => {
  it("blocks publishing without test evidence but allows testing", () => {
    const { draft } = sanitizeDraft(navRaw);
    const wf = draftToWorkflow(draft, "b", "wf-1");
    const r = evaluateReadiness(wf, undefined);
    expect(r.canTest).toBe(true);
    expect(r.canPublish).toBe(false);
    expect(r.items.some((i) => i.id === "no-test")).toBe(true);
  });

  it("blocks a missing output step from testing", () => {
    const wf = draftToWorkflow(
      { name: "n", category: "Operations", summary: "", sampleProfile: "generic", steps: [{ type: "load", label: "Load", config: { source: "S" } }], assumptions: [], questions: [] },
      "b",
      "wf-2",
    );
    const r = evaluateReadiness(wf, undefined);
    expect(r.canTest).toBe(false);
    expect(r.items.some((i) => i.id === "no-output")).toBe(true);
  });
});

describe("workflowToMermaid", () => {
  it("renders a conditional review branch", () => {
    const { draft } = sanitizeDraft(navRaw);
    const wf = draftToWorkflow(draft, "b", "wf-1");
    const mmd = workflowToMermaid(wf);
    expect(mmd).toContain("flowchart LR");
    expect(mmd).toContain("-- exceptions -->");
    expect(mmd).toContain("no exceptions");
  });
});
