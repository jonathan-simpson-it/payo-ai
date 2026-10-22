"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { navigate, routeToHash, useRoute } from "./router";
import { usePayo } from "./store";
import { TOUR_STEPS, type TourFallback, type TourStep } from "./tour-steps";

const STORAGE_KEY = "payo.tour.v1";
const TARGET_WAIT_MS = 5000;
const TARGET_POLL_MS = 200;
const ADVANCE_DELAY_MS = 320;
const RESUME_RESET_STEP = "template-card";
const STORAGE_EVENT = "payo:tour-storage";

type TourStatus = "idle" | "active" | "complete";

interface StoredTour {
  status: TourStatus;
  stepId?: string;
  updatedAt?: string;
}

interface TargetState {
  stepId: string;
  el: HTMLElement | null;
  missing: boolean;
}

export interface TourContextValue {
  status: TourStatus;
  active: boolean;
  step: TourStep | null;
  stepIndex: number;
  stepCount: number;
  canGoBack: boolean;
  hasResume: boolean;
  completed: boolean;
  targetEl: HTMLElement | null;
  targetMissing: boolean;
  startTour: () => void;
  resumeTour: () => void;
  next: () => void;
  back: () => void;
  skipStep: () => void;
  exitTour: () => void;
  finishTour: () => void;
  goToStep: (id: string) => void;
}

function isVisible(el: Element | null): el is HTMLElement {
  if (!(el instanceof HTMLElement) || !el.isConnected) return false;
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;
  const style = window.getComputedStyle(el);
  return style.display !== "none" && style.visibility !== "hidden";
}

function findVisible(selectors: string[]): HTMLElement | null {
  for (const selector of selectors) {
    const els = document.querySelectorAll<HTMLElement>(selector);
    for (const el of els) {
      if (isVisible(el)) return el;
    }
  }
  return null;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function stepExists(id?: string): boolean {
  return !!id && TOUR_STEPS.some((step) => step.id === id);
}

function safeResumeStep(id?: string): string {
  if (!stepExists(id)) return TOUR_STEPS[0].id;
  const index = TOUR_STEPS.findIndex((step) => step.id === id);
  const resetIndex = TOUR_STEPS.findIndex((step) => step.id === RESUME_RESET_STEP);
  return TOUR_STEPS[Math.min(index, resetIndex)].id;
}

function parseStoredTour(raw: string): StoredTour | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredTour>;
    if (
      parsed.status !== "idle" &&
      parsed.status !== "active" &&
      parsed.status !== "complete"
    ) {
      return null;
    }
    return {
      status: parsed.status,
      stepId: typeof parsed.stepId === "string" ? parsed.stepId : undefined,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : undefined,
    };
  } catch {
    return null;
  }
}

function subscribeStoredTour(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(STORAGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(STORAGE_EVENT, onChange);
  };
}

function getStoredTourSnapshot(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function getStoredTourServerSnapshot(): string {
  return "";
}

function writeStoredTour(value: StoredTour): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch {
    // Ignore storage failures; the tour still works for this session.
  }
}

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: ReactNode }) {
  const { useTemplate: openTemplate, startRun, approveReview } = usePayo();
  const route = useRoute();
  const routeKey = routeToHash(route);
  const routeRef = useRef(route);
  const storedRaw = useSyncExternalStore(
    subscribeStoredTour,
    getStoredTourSnapshot,
    getStoredTourServerSnapshot,
  );
  const stored = useMemo(() => parseStoredTour(storedRaw), [storedRaw]);

  const [status, setStatus] = useState<TourStatus>("idle");
  const [stepId, setStepId] = useState<string>(TOUR_STEPS[0].id);
  const [targetState, setTargetState] = useState<TargetState>({
    stepId: "",
    el: null,
    missing: false,
  });

  useEffect(() => {
    routeRef.current = route;
  }, [route]);

  const stepIndex = TOUR_STEPS.findIndex((step) => step.id === stepId);
  const step = stepIndex >= 0 ? TOUR_STEPS[stepIndex] : null;
  const active = status === "active" && step != null;
  const stepCount = TOUR_STEPS.length;
  const canGoBack = stepIndex > 0;
  const hasResume =
    status !== "active" && stored?.status === "active" && stepExists(stored.stepId);
  const completed = status === "complete" || stored?.status === "complete";

  const targetEl = targetState.stepId === step?.id ? targetState.el : null;
  const targetMissing = targetState.stepId === step?.id ? targetState.missing : false;

  const persist = useCallback((nextStatus: TourStatus, nextStepId?: string) => {
    writeStoredTour({
      status: nextStatus,
      stepId: nextStepId,
      updatedAt: new Date().toISOString(),
    });
  }, []);

  const startTour = useCallback(() => {
    const first = TOUR_STEPS[0];
    if (window.location.hash !== "#/") navigate("/");
    window.scrollTo({ top: 0, behavior: "auto" });
    setStepId(first.id);
    setStatus("active");
    persist("active", first.id);
  }, [persist]);

  const resumeTour = useCallback(() => {
    const resumeId = safeResumeStep(stored?.stepId);
    const resumeStep = TOUR_STEPS.find((step) => step.id === resumeId);
    if (resumeStep?.group === "Landing") {
      navigate("/");
      if (resumeId === "welcome") window.scrollTo({ top: 0, behavior: "auto" });
    } else if (resumeStep?.route) navigate(resumeStep.route);
    else if (resumeId === "template-card" || resumeId === "template-controls") {
      navigate("/workspace/templates");
    }
    setStepId(resumeId);
    setStatus("active");
    persist("active", resumeId);
  }, [persist, stored?.stepId]);

  const finishTour = useCallback(() => {
    setStatus("complete");
    persist("complete");
  }, [persist]);

  const next = useCallback(() => {
    if (!step) return;
    if (stepIndex >= TOUR_STEPS.length - 1) {
      finishTour();
      return;
    }
    setStepId(TOUR_STEPS[stepIndex + 1].id);
  }, [finishTour, step, stepIndex]);

  const back = useCallback(() => {
    if (stepIndex <= 0) return;
    setStepId(TOUR_STEPS[stepIndex - 1].id);
  }, [stepIndex]);

  const exitTour = useCallback(() => {
    if (step?.id === "finish") {
      finishTour();
      return;
    }
    persist("active", step?.id ?? stepId);
    setStatus("idle");
  }, [finishTour, persist, step?.id, stepId]);

  const goToStep = useCallback(
    (id: string) => {
      if (!stepExists(id)) return;
      setStepId(id);
      setStatus("active");
      persist("active", id);
    },
    [persist],
  );

  const runFallback = useCallback(
    (fallback?: TourFallback) => {
      if (!fallback) return;
      switch (fallback) {
        case "openTemplate":
          openTemplate("nav-reconciliation");
          break;
        case "selectFirstStep":
          window.dispatchEvent(
            new CustomEvent("payo:tour", { detail: { action: "select-first-step" } }),
          );
          break;
        case "enterTest":
          window.dispatchEvent(
            new CustomEvent("payo:tour", { detail: { action: "enter-test" } }),
          );
          break;
        case "exitTest":
          window.dispatchEvent(
            new CustomEvent("payo:tour", { detail: { action: "exit-test" } }),
          );
          break;
        case "startRun": {
          const current = routeRef.current;
          startRun(current.name === "workflow" ? current.id : "nav-reconciliation");
          break;
        }
        case "approveReview":
          approveReview();
          break;
      }
    },
    [approveReview, openTemplate, startRun],
  );

  const skipStep = useCallback(() => {
    if (!step) return;
    runFallback(step.fallback);
    next();
  }, [next, runFallback, step]);

  useEffect(() => {
    if (status !== "active" || !step) return;
    persist("active", step.id);
  }, [persist, status, step]);

  useEffect(() => {
    if (!active || step?.id !== "finish") return;
    persist("complete");
  }, [active, persist, step?.id]);

  const navigatedStepRef = useRef<string | null>(null);
  useEffect(() => {
    if (!active || !step?.route) return;
    if (navigatedStepRef.current === step.id) return;
    navigatedStepRef.current = step.id;
    if (window.location.hash !== step.route) navigate(step.route);
  }, [active, step]);

  useEffect(() => {
    if (!active || !step || !step.targets?.length) return;

    let cancelled = false;
    let lastEl: HTMLElement | null = null;
    const startedAt = Date.now();

    const tick = () => {
      if (cancelled) return;
      const el = findVisible(step.targets ?? []);
      if (el) {
        if (el !== lastEl) {
          lastEl = el;
          el.scrollIntoView({
            behavior: prefersReducedMotion() ? "auto" : "smooth",
            block: "center",
            inline: "center",
          });
        }
        setTargetState((prev) =>
          prev.stepId === step.id && prev.el === el && !prev.missing
            ? prev
            : { stepId: step.id, el, missing: false },
        );
        return;
      }
      if (Date.now() - startedAt > TARGET_WAIT_MS) {
        setTargetState((prev) =>
          prev.stepId === step.id && prev.el === null && prev.missing
            ? prev
            : { stepId: step.id, el: null, missing: true },
        );
        return;
      }
      setTargetState((prev) =>
        prev.stepId === step.id && prev.el === null && !prev.missing
          ? prev
          : { stepId: step.id, el: null, missing: false },
      );
    };

    tick();
    const interval = window.setInterval(tick, TARGET_POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [active, routeKey, step]);

  const nextRef = useRef(next);
  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  const advancedRef = useRef<string | null>(null);
  useEffect(() => {
    advancedRef.current = null;
  }, [step?.id]);

  useEffect(() => {
    if (!active || !step?.advanceOn?.length) return;
    let cancelled = false;

    const settle = () => {
      if (cancelled) return;
      advancedRef.current = step.id;
      window.setTimeout(() => {
        if (!cancelled) nextRef.current();
      }, ADVANCE_DELAY_MS);
    };

    const check = (): boolean => {
      if (advancedRef.current === step.id) return true;
      const matched = step.advanceOn?.some((condition) => {
        if (condition.type === "route") {
          return new RegExp(condition.pattern).test(window.location.hash);
        }
        return isVisible(document.querySelector(condition.selector));
      });
      if (!matched) return false;
      settle();
      return true;
    };

    if (check()) {
      return () => {
        cancelled = true;
      };
    }

    const interval = window.setInterval(() => {
      if (check()) window.clearInterval(interval);
    }, TARGET_POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [active, step]);

  const value = useMemo<TourContextValue>(
    () => ({
      status,
      active,
      step,
      stepIndex,
      stepCount,
      canGoBack,
      hasResume,
      completed,
      targetEl,
      targetMissing,
      startTour,
      resumeTour,
      next,
      back,
      skipStep,
      exitTour,
      finishTour,
      goToStep,
    }),
    [
      status,
      active,
      step,
      stepIndex,
      stepCount,
      canGoBack,
      hasResume,
      completed,
      targetEl,
      targetMissing,
      startTour,
      resumeTour,
      next,
      back,
      skipStep,
      exitTour,
      finishTour,
      goToStep,
    ],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used within TourProvider");
  return ctx;
}