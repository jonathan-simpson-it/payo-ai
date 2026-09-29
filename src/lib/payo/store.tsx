"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  FIRST_RUN_NUMBER,
  cloneStep,
  cloneWorkflow,
  getTemplate,
  makeDefaultStep,
  seedRuns,
  seedWorkflows,
  snapshotConfig,
  sourcesFor,
  workflowFromTemplate,
} from "./data";
import { navigate } from "./router";
import type {
  Run,
  RunEngine,
  RunStepState,
  StepConfig,
  StepTypeId,
  Workflow,
} from "./types";

/** Simulated run engine tick interval in ms. */
const TICK_MS = 90;

// ─────────────────────────────────────────────────────────────────────────────
// State + actions
// ─────────────────────────────────────────────────────────────────────────────

export interface State {
  workflows: Workflow[];
  runs: Run[];
  /** Undo stacks keyed by workflow id (oldest → newest). */
  history: Record<string, Workflow[]>;
  engine: RunEngine | null;
  nextRunNumber: number;
  /** Used to coalesce rapid edits to the same field into one undo entry. */
  lastEdit?: { workflowId: string; stepId: string; key: string; at: number };
}

export type Action =
  | { type: "ENSURE_WORKFLOW"; workflow: Workflow }
  | { type: "UPDATE_STEP"; workflowId: string; stepId: string; key: string; value: string | number }
  | { type: "UPDATE_STEP_LABEL"; workflowId: string; stepId: string; label: string }
  | { type: "REORDER"; workflowId: string; from: number; to: number }
  | { type: "ADD_STEP"; workflowId: string; step: ReturnType<typeof makeDefaultStep>; index: number }
  | { type: "REMOVE_STEP"; workflowId: string; stepId: string }
  | { type: "RENAME"; workflowId: string; name: string }
  | { type: "RESET"; workflowId: string }
  | { type: "UNDO"; workflowId: string }
  | { type: "START_RUN"; run: Run; engine: RunEngine }
  | { type: "TICK" }
  | { type: "APPROVE_REVIEW" }
  | { type: "RETURN_REVIEW" }
  | { type: "END_RUN" }
  | { type: "CLEAR_ENGINE" };

function setRun(state: State, runId: string, patch: (r: Run) => Run): State {
  return { ...state, runs: state.runs.map((r) => (r.id === runId ? patch(r) : r)) };
}

/** Applies a workflow mutation, pushing an undo snapshot (unless coalescing). */
function mutateWorkflow(
  state: State,
  workflowId: string,
  fn: (wf: Workflow) => Workflow,
  opts?: { coalesceKey?: string },
): State {
  const wf = state.workflows.find((w) => w.id === workflowId);
  if (!wf) return state;

  let history = state.history[workflowId] ?? [];
  const now = Date.now();
  const last = state.lastEdit;
  const coalesce =
    opts?.coalesceKey != null &&
    last != null &&
    last.workflowId === workflowId &&
    `${last.stepId}:${last.key}` === opts.coalesceKey &&
    now - last.at < 1200;
  if (!coalesce) {
    history = [...history, cloneWorkflow(wf)].slice(-30);
  }

  const applied = fn(wf);
  const next: Workflow = {
    ...applied,
    status: wf.status === "ready" ? "draft" : applied.status,
  };
  return {
    ...state,
    workflows: state.workflows.map((w) => (w.id === workflowId ? next : w)),
    history: { ...state.history, [workflowId]: history },
    lastEdit: opts?.coalesceKey
      ? { workflowId, stepId: opts.coalesceKey.split(":")[0], key: opts.coalesceKey.split(":")[1], at: now }
      : undefined,
  };
}

function finishRun(state: State, eng: RunEngine, states: Record<string, RunStepState>): State {
  const now = new Date().toISOString();
  let ns = setRun(state, eng.runId, (r) => ({
    ...r,
    status: "completed",
    finishedAt: now,
    statusNote: undefined,
  }));
  ns = {
    ...ns,
    workflows: ns.workflows.map((w) => (w.id === eng.workflowId ? { ...w, status: "ready" } : w)),
  };
  return { ...ns, engine: { ...eng, states, progress: 1, phase: "done" } };
}

function reviewerOf(state: State, eng: RunEngine): string {
  const cur = eng.steps[eng.activeIndex];
  const wf = state.workflows.find((w) => w.id === eng.workflowId);
  return String(wf?.steps.find((s) => s.id === cur?.id)?.config.reviewer ?? "Reviewer");
}

function tick(state: State): State {
  const eng = state.engine;
  if (!eng || eng.phase !== "running") return state;
  const cur = eng.steps[eng.activeIndex];
  if (!cur) return { ...state, engine: null };

  const progress = eng.progress + TICK_MS / cur.durationMs;
  if (progress < 1) {
    return { ...state, engine: { ...eng, progress } };
  }

  const states: Record<string, RunStepState> = { ...eng.states };
  const durationSec = Math.round((cur.durationMs / 1000) * 10) / 10;

  if (cur.type === "review") {
    states[cur.id] = "needs-review";
    const ns = setRun(state, eng.runId, (r) => ({
      ...r,
      status: "needs-review",
      statusNote: `Paused at “${cur.label}”`,
      timeline: r.timeline.map((t) =>
        t.stepId === cur.id ? { ...t, state: "needs-review" as const } : t,
      ),
    }));
    return { ...ns, engine: { ...eng, states, progress: 1, phase: "awaiting-review" } };
  }

  states[cur.id] = "complete";
  let ns = setRun(state, eng.runId, (r) => ({
    ...r,
    timeline: r.timeline.map((t) =>
      t.stepId === cur.id ? { ...t, state: "complete" as const, durationSec } : t,
    ),
  }));

  const nextIdx = eng.activeIndex + 1;
  if (nextIdx >= eng.steps.length) {
    return finishRun(ns, eng, states);
  }
  const nextStep = eng.steps[nextIdx];
  states[nextStep.id] = "running";
  return { ...ns, engine: { ...eng, states, activeIndex: nextIdx, progress: 0 } };
}

function approveReview(state: State): State {
  const eng = state.engine;
  if (!eng || (eng.phase !== "awaiting-review" && eng.phase !== "returned")) return state;
  const cur = eng.steps[eng.activeIndex];
  if (!cur) return state;

  const by = reviewerOf(state, eng);
  const now = new Date().toISOString();
  const states: Record<string, RunStepState> = { ...eng.states, [cur.id]: "complete" };

  let ns = setRun(state, eng.runId, (r) => ({
    ...r,
    status: "running",
    statusNote: undefined,
    review: { decision: "approved" as const, at: now, by },
    timeline: r.timeline.map((t) =>
      t.stepId === cur.id
        ? { ...t, state: "complete" as const, durationSec: 0.8, note: `Approved by ${by} — simulated` }
        : t,
    ),
  }));

  const nextIdx = eng.activeIndex + 1;
  if (nextIdx >= eng.steps.length) {
    return finishRun(ns, eng, states);
  }
  const nextStep = eng.steps[nextIdx];
  states[nextStep.id] = "running";
  return { ...ns, engine: { ...eng, states, activeIndex: nextIdx, progress: 0, phase: "running" } };
}

function returnReview(state: State): State {
  const eng = state.engine;
  if (!eng || eng.phase !== "awaiting-review") return state;
  const cur = eng.steps[eng.activeIndex];
  if (!cur) return state;

  const by = reviewerOf(state, eng);
  const now = new Date().toISOString();
  const ns = setRun(state, eng.runId, (r) => ({
    ...r,
    status: "needs-review",
    statusNote: "Returned for review — run paused before the final steps",
    review: { decision: "returned" as const, at: now, by },
  }));
  return { ...ns, engine: { ...eng, phase: "returned" } };
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ENSURE_WORKFLOW": {
      if (state.workflows.some((w) => w.id === action.workflow.id)) return state;
      return { ...state, workflows: [...state.workflows, action.workflow] };
    }

    case "UPDATE_STEP": {
      return mutateWorkflow(
        state,
        action.workflowId,
        (wf) => ({
          ...wf,
          steps: wf.steps.map((s) =>
            s.id === action.stepId
              ? { ...s, config: { ...s.config, [action.key]: action.value } }
              : s,
          ),
        }),
        { coalesceKey: `${action.stepId}:${action.key}` },
      );
    }

    case "UPDATE_STEP_LABEL": {
      return mutateWorkflow(state, action.workflowId, (wf) => ({
        ...wf,
        steps: wf.steps.map((s) => (s.id === action.stepId ? { ...s, label: action.label } : s)),
      }));
    }

    case "REORDER": {
      return mutateWorkflow(state, action.workflowId, (wf) => {
        const steps = [...wf.steps];
        if (action.from < 0 || action.from >= steps.length) return wf;
        const [moved] = steps.splice(action.from, 1);
        if (!moved) return wf;
        steps.splice(Math.max(0, Math.min(steps.length, action.to)), 0, moved);
        return { ...wf, steps };
      });
    }

    case "ADD_STEP": {
      return mutateWorkflow(state, action.workflowId, (wf) => {
        const steps = [...wf.steps];
        steps.splice(Math.max(0, Math.min(steps.length, action.index)), 0, action.step);
        return { ...wf, steps };
      });
    }

    case "REMOVE_STEP": {
      return mutateWorkflow(state, action.workflowId, (wf) => ({
        ...wf,
        steps: wf.steps.filter((s) => s.id !== action.stepId),
      }));
    }

    case "RENAME": {
      return {
        ...state,
        workflows: state.workflows.map((w) =>
          w.id === action.workflowId ? { ...w, name: action.name } : w,
        ),
      };
    }

    case "RESET": {
      const wf = state.workflows.find((w) => w.id === action.workflowId);
      const template = wf ? getTemplate(wf.templateId) : undefined;
      if (!wf || !template?.steps) return state;
      return mutateWorkflow(state, action.workflowId, () => ({
        ...wf,
        name: template.name,
        steps: template.steps.map(cloneStep),
      }));
    }

    case "UNDO": {
      const stack = state.history[action.workflowId] ?? [];
      if (!stack.length) return state;
      const prev = stack[stack.length - 1];
      return {
        ...state,
        workflows: state.workflows.map((w) =>
          w.id === action.workflowId ? cloneWorkflow(prev) : w,
        ),
        history: { ...state.history, [action.workflowId]: stack.slice(0, -1) },
        lastEdit: undefined,
      };
    }

    case "START_RUN": {
      return {
        ...state,
        runs: [action.run, ...state.runs],
        engine: action.engine,
        nextRunNumber: state.nextRunNumber + 1,
      };
    }

    case "TICK":
      return tick(state);

    case "APPROVE_REVIEW":
      return approveReview(state);

    case "RETURN_REVIEW":
      return returnReview(state);

    case "END_RUN": {
      if (!state.engine) return state;
      return { ...state, engine: null };
    }

    case "CLEAR_ENGINE": {
      return { ...state, engine: null };
    }

    default:
      return state;
  }
}

function initialState(): State {
  return {
    workflows: seedWorkflows(),
    runs: seedRuns(),
    history: {},
    engine: null,
    nextRunNumber: FIRST_RUN_NUMBER,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Payo store context
// ─────────────────────────────────────────────────────────────────────────────

export interface PayoContextValue {
  state: State;
  useTemplate: (templateId: string) => void;
  startRun: (workflowId: string) => string | null;
  approveReview: () => void;
  returnReview: () => void;
  endRun: () => void;
  addStep: (workflowId: string, type: StepTypeId) => string | null;
  removeStep: (workflowId: string, stepId: string) => void;
  reorderSteps: (workflowId: string, from: number, to: number) => void;
  updateStepConfig: (workflowId: string, stepId: string, key: string, value: string | number) => void;
  updateStepLabel: (workflowId: string, stepId: string, label: string) => void;
  renameWorkflow: (workflowId: string, name: string) => void;
  resetWorkflow: (workflowId: string) => void;
  undo: (workflowId: string) => void;
  canUndo: (workflowId: string) => boolean;
  workflowById: (id: string) => Workflow | undefined;
  runById: (id: string) => Run | undefined;
  lastRunFor: (workflowId: string) => Run | undefined;
}

const PayoContext = createContext<PayoContextValue | null>(null);

export function PayoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  // Drive the simulated run engine while a run is in progress.
  const enginePhase = state.engine?.phase;
  useEffect(() => {
    if (enginePhase !== "running") return;
    const t = window.setInterval(() => dispatch({ type: "TICK" }), TICK_MS);
    return () => window.clearInterval(t);
  }, [enginePhase]);

  // Retire the engine a while after completion; the run record remains.
  useEffect(() => {
    if (enginePhase !== "done") return;
    const t = window.setTimeout(() => dispatch({ type: "CLEAR_ENGINE" }), 8000);
    return () => window.clearTimeout(t);
  }, [enginePhase]);

  const useTemplate = useCallback((templateId: string) => {
    const s = stateRef.current;
    const t = getTemplate(templateId);
    if (!t || t.comingSoon || !t.steps) return;
    const existing = s.workflows.find((w) => w.templateId === templateId);
    if (existing) {
      navigate(`/workspace/workflows/${existing.id}`);
      return;
    }
    const wf = workflowFromTemplate(t);
    dispatch({ type: "ENSURE_WORKFLOW", workflow: wf });
    navigate(`/workspace/workflows/${wf.id}`);
  }, []);

  const startRun = useCallback((workflowId: string): string | null => {
    const s = stateRef.current;
    // A finished engine can be replaced; only a live run blocks a new one.
    if (s.engine && s.engine.phase !== "done") return null;
    const wf = s.workflows.find((w) => w.id === workflowId);
    if (!wf || wf.steps.length === 0) return null;

    const num = s.nextRunNumber;
    const runId = `run-${num}`;
    const run: Run = {
      id: runId,
      code: `PR-${String(num).padStart(4, "0")}`,
      workflowId: wf.id,
      workflowName: wf.name,
      startedAt: new Date().toISOString(),
      status: "running",
      config: snapshotConfig(wf),
      timeline: wf.steps.map((st) => ({
        stepId: st.id,
        label: st.label,
        type: st.type,
        state: "queued" as const,
      })),
      sources: sourcesFor(wf.templateId),
    };
    const states: Record<string, RunStepState> = {};
    wf.steps.forEach((st, i) => {
      states[st.id] = i === 0 ? "running" : "queued";
    });
    const engine: RunEngine = {
      runId,
      workflowId: wf.id,
      steps: wf.steps.map((st) => ({
        id: st.id,
        label: st.label,
        type: st.type,
        durationMs: st.durationMs,
      })),
      states,
      activeIndex: 0,
      progress: 0,
      phase: "running",
    };
    dispatch({ type: "START_RUN", run, engine });
    return runId;
  }, []);

  const addStep = useCallback((workflowId: string, type: StepTypeId): string | null => {
    const s = stateRef.current;
    const wf = s.workflows.find((w) => w.id === workflowId);
    if (!wf) return null;
    const step = makeDefaultStep(type);
    dispatch({ type: "ADD_STEP", workflowId, step, index: wf.steps.length });
    return step.id;
  }, []);

  const value = useMemo<PayoContextValue>(
    () => ({
      state,
      useTemplate,
      startRun,
      approveReview: () => dispatch({ type: "APPROVE_REVIEW" }),
      returnReview: () => dispatch({ type: "RETURN_REVIEW" }),
      endRun: () => dispatch({ type: "END_RUN" }),
      addStep,
      removeStep: (workflowId, stepId) => dispatch({ type: "REMOVE_STEP", workflowId, stepId }),
      reorderSteps: (workflowId, from, to) => dispatch({ type: "REORDER", workflowId, from, to }),
      updateStepConfig: (workflowId, stepId, key, val) =>
        dispatch({ type: "UPDATE_STEP", workflowId, stepId, key, value: val }),
      updateStepLabel: (workflowId, stepId, label) =>
        dispatch({ type: "UPDATE_STEP_LABEL", workflowId, stepId, label }),
      renameWorkflow: (workflowId, name) => dispatch({ type: "RENAME", workflowId, name }),
      resetWorkflow: (workflowId) => dispatch({ type: "RESET", workflowId }),
      undo: (workflowId) => dispatch({ type: "UNDO", workflowId }),
      canUndo: (workflowId) => (state.history[workflowId]?.length ?? 0) > 0,
      workflowById: (id) => state.workflows.find((w) => w.id === id),
      runById: (id) => state.runs.find((r) => r.id === id),
      lastRunFor: (workflowId) => {
        const rs = state.runs.filter((r) => r.workflowId === workflowId);
        return rs.find((r) => r.status !== "draft") ?? rs[0];
      },
    }),
    [state, useTemplate, startRun, addStep],
  );

  return <PayoContext.Provider value={value}>{children}</PayoContext.Provider>;
}

export function usePayo(): PayoContextValue {
  const ctx = useContext(PayoContext);
  if (!ctx) throw new Error("usePayo must be used within PayoProvider");
  return ctx;
}

// ─────────────────────────────────────────────────────────────────────────────
// Lightweight UI context (About this demo dialog)
// ─────────────────────────────────────────────────────────────────────────────

interface UIContextValue {
  aboutOpen: boolean;
  openAbout: () => void;
  setAboutOpen: (v: boolean) => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [aboutOpen, setAboutOpen] = useState(false);
  const value = useMemo<UIContextValue>(
    () => ({ aboutOpen, openAbout: () => setAboutOpen(true), setAboutOpen }),
    [aboutOpen],
  );
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
}
