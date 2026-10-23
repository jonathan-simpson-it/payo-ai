import { describe, expect, it } from "vitest";

import { checkOutcome, getTemplate, snapshotConfig, sourcesFor, workflowFromTemplate } from "./data";
import { reducer, type State } from "./store";
import type { Run, RunEngine, RunStepState, TestEngine, Workflow } from "./types";

function baseState(wf: Workflow): State {
  return {
    workflows: [wf],
    runs: [],
    activity: [],
    history: {},
    engine: null,
    test: null,
    nextRunNumber: 1,
  };
}

function start(wf: Workflow, state: State): State {
  const config = snapshotConfig(wf);
  const flagged = checkOutcome(wf.sampleProfile, config).flagged;
  const runId = "run-1";
  const steps = wf.steps.map((st) => {
    const conditionalReview = st.type === "review" && st.when === "only-when-exceptions";
    return {
      id: st.id,
      label: st.label,
      type: st.type,
      durationMs: st.durationMs,
      conditionalReview,
      skip: conditionalReview && flagged === 0,
    };
  });
  const states: Record<string, RunStepState> = {};
  wf.steps.forEach((st, i) => {
    states[st.id] = i === 0 ? "running" : "queued";
  });
  const run: Run = {
    id: runId,
    code: "PR-0001",
    workflowId: wf.id,
    workflowName: wf.name,
    startedAt: new Date().toISOString(),
    status: "running",
    config,
    timeline: wf.steps.map((st) => ({ stepId: st.id, label: st.label, type: st.type, state: "queued" as const })),
    sources: sourcesFor(wf),
  };
  const engine: RunEngine = {
    runId,
    workflowId: wf.id,
    steps,
    states,
    activeIndex: 0,
    progress: 0,
    phase: "running",
  };
  return reducer(state, { type: "START_RUN", run, engine });
}

function tickUntilSettled(state: State): State {
  let s = state;
  for (let i = 0; i < 500; i += 1) {
    if (!s.engine || s.engine.phase === "done" || s.engine.phase === "awaiting-review") break;
    s = reducer(s, { type: "TICK" });
  }
  return s;
}

function navWorkflow(tolerance: number): Workflow {
  const wf = workflowFromTemplate(getTemplate("nav-reconciliation")!);
  const check = wf.steps.find((s) => s.id === "flag-breaches")!;
  check.config = { ...check.config, tolerance };
  return wf;
}

describe("conditional review gate", () => {
  it("pauses at the review when the check finds exceptions", () => {
    const wf = navWorkflow(0.5);
    const s = tickUntilSettled(start(wf, baseState(wf)));
    expect(s.engine?.phase).toBe("awaiting-review");
    const review = wf.steps.find((x) => x.type === "review")!;
    expect(s.engine?.states[review.id]).toBe("needs-review");
  });

  it("skips the review and completes when nothing is flagged", () => {
    const wf = navWorkflow(2.0);
    const s = tickUntilSettled(start(wf, baseState(wf)));
    expect(s.engine?.phase).toBe("done");
    const review = wf.steps.find((x) => x.type === "review")!;
    expect(s.engine?.states[review.id]).toBe("skipped");
    const saved = s.runs.find((r) => r.id === "run-1");
    expect(saved?.status).toBe("completed");
    expect(s.workflows[0].status).toBe("ready");
    expect(s.workflows[0].testEvidence).toBeTruthy();
  });
});

describe("version history", () => {
  it("records each publish and restores a version as a draft", () => {
    const wf = navWorkflow(0.5);
    wf.testEvidence = {
      at: new Date().toISOString(),
      result: "passed",
      flaggedCount: 2,
      stepCount: wf.steps.length,
    };
    let s: State = baseState(wf);

    s = reducer(s, { type: "PUBLISH", workflowId: wf.id });
    expect(s.workflows[0].status).toBe("published");
    expect(s.workflows[0].versions).toHaveLength(1);
    expect(s.workflows[0].publishedVersion).toBe(1);
    const publishedSteps = s.workflows[0].steps.map((x) => x.id);

    // Edit, then publish a second version.
    const report = s.workflows[0].steps.find((x) => x.type === "report")!;
    s = reducer(s, { type: "REMOVE_STEP", workflowId: wf.id, stepId: report.id });
    expect(s.workflows[0].status).toBe("draft");
    expect(s.workflows[0].versions).toHaveLength(1);
    s = reducer(s, { type: "PUBLISH", workflowId: wf.id });
    expect(s.workflows[0].versions).toHaveLength(2);
    expect(s.workflows[0].publishedVersion).toBe(2);

    // Restore version 1, which is a draft again.
    s = reducer(s, { type: "RESTORE_VERSION", workflowId: wf.id, version: 1 });
    expect(s.workflows[0].status).toBe("draft");
    expect(s.workflows[0].testEvidence).toBeUndefined();
    expect(s.workflows[0].versions).toHaveLength(2);
    expect(s.workflows[0].steps.map((x) => x.id)).toEqual(publishedSteps);
  });
});

describe("test lifecycle", () => {
  it("cancels a running test when the workflow is edited", () => {
    const wf = navWorkflow(0.5);
    let s: State = baseState(wf);
    const test: TestEngine = {
      workflowId: wf.id,
      steps: wf.steps.map((st) => ({
        id: st.id,
        label: st.label,
        type: st.type,
        durationMs: st.durationMs,
      })),
      states: Object.fromEntries(wf.steps.map((st, i) => [st.id, i === 0 ? "running" : "queued"])) as Record<
        string,
        RunStepState
      >,
      activeIndex: 0,
      progress: 0,
      phase: "running",
    };
    s = reducer(s, { type: "TEST_START", test });
    expect(s.test).not.toBeNull();
    const check = wf.steps.find((x) => x.type === "check")!;
    s = reducer(s, {
      type: "UPDATE_STEP",
      workflowId: wf.id,
      stepId: check.id,
      key: "tolerance",
      value: 0.25,
    });
    expect(s.test).toBeNull();
    expect(s.workflows[0].testEvidence).toBeUndefined();
    expect(s.workflows[0].status).toBe("draft");
  });
});
