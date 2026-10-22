"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ButtonHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PayoMark } from "@/components/payo/mark";
import { navigate } from "@/lib/payo/router";
import { useTour } from "@/lib/payo/tour";
import type { TourPlacement } from "@/lib/payo/tour-steps";

interface CardSize {
  width: number;
  height: number;
}

const PAD = 16;
const GAP = 14;
const subscribeClient = () => () => {};

function useElementRect(el: HTMLElement | null): DOMRect | null {
  const [measured, setMeasured] = useState<{ el: HTMLElement; rect: DOMRect } | null>(null);

  useLayoutEffect(() => {
    if (!el) return;
    const update = () => {
      if (!el.isConnected) return;
      setMeasured({ el, rect: el.getBoundingClientRect() });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [el]);

  return measured?.el === el ? measured.rect : null;
}

function useCardSize(el: HTMLElement | null): CardSize {
  const [size, setSize] = useState<CardSize>({ width: 380, height: 240 });

  useLayoutEffect(() => {
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setSize((prev) =>
        Math.abs(prev.width - rect.width) < 0.5 && Math.abs(prev.height - rect.height) < 0.5
          ? prev
          : { width: rect.width, height: rect.height },
      );
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [el]);

  return size;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function computePosition(
  rect: DOMRect | null,
  size: CardSize,
  placement: TourPlacement = "auto",
  vw: number,
  vh: number,
): { top: number; left: number; width?: number } {
  if (!rect || placement === "center") {
    return {
      top: Math.max(PAD, (vh - size.height) / 2),
      left: Math.max(PAD, (vw - size.width) / 2),
    };
  }

  if (vw < 640) {
    return {
      top: Math.max(PAD, vh - size.height - PAD),
      left: PAD,
      width: vw - PAD * 2,
    };
  }

  const space = {
    top: rect.top,
    bottom: vh - rect.bottom,
    left: rect.left,
    right: vw - rect.right,
  };
  const fits: Record<"top" | "bottom" | "left" | "right", boolean> = {
    top: space.top >= size.height + GAP + PAD,
    bottom: space.bottom >= size.height + GAP + PAD,
    left: space.left >= size.width + GAP + PAD,
    right: space.right >= size.width + GAP + PAD,
  };

  let side: "top" | "bottom" | "left" | "right" =
    placement === "auto" ? "bottom" : placement;
  if (!fits[side]) {
    side = (["bottom", "top", "right", "left"] as const).find((candidate) => fits[candidate]) ?? "bottom";
  }
  if (!fits[side]) {
    return {
      top: Math.max(PAD, (vh - size.height) / 2),
      left: Math.max(PAD, (vw - size.width) / 2),
    };
  }

  switch (side) {
    case "top":
      return {
        top: clamp(rect.top - size.height - GAP, PAD, vh - size.height - PAD),
        left: clamp(rect.left + rect.width / 2 - size.width / 2, PAD, vw - size.width - PAD),
      };
    case "left":
      return {
        top: clamp(rect.top + rect.height / 2 - size.height / 2, PAD, vh - size.height - PAD),
        left: clamp(rect.left - size.width - GAP, PAD, vw - size.width - PAD),
      };
    case "right":
      return {
        top: clamp(rect.top + rect.height / 2 - size.height / 2, PAD, vh - size.height - PAD),
        left: clamp(rect.right + GAP, PAD, vw - size.width - PAD),
      };
    default:
      return {
        top: clamp(rect.bottom + GAP, PAD, vh - size.height - PAD),
        left: clamp(rect.left + rect.width / 2 - size.width / 2, PAD, vw - size.width - PAD),
      };
  }
}

function Blocker({ style }: { style: React.CSSProperties }) {
  return <div className="fixed z-[70] bg-black/55" style={style} aria-hidden="true" />;
}

export function TourLauncher({
  className,
  children,
  resumeLabel,
  replayLabel,
  ...props
}: {
  className?: string;
  children: ReactNode;
  resumeLabel?: ReactNode;
  replayLabel?: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "children">) {
  const { active, hasResume, completed, startTour, resumeTour } = useTour();
  if (active) return null;

  return (
    <button
      type="button"
      {...props}
      className={className}
      onClick={() => {
        if (hasResume) resumeTour();
        else startTour();
      }}
    >
      {hasResume
        ? (resumeLabel ?? children)
        : completed
          ? (replayLabel ?? children)
          : children}
    </button>
  );
}

function TourLayer() {
  const tour = useTour();
  const [cardEl, setCardEl] = useState<HTMLDivElement | null>(null);
  const cardRef = useCallback((node: HTMLDivElement | null) => setCardEl(node), []);
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));

  const step = tour.step;
  const rect = useElementRect(tour.active ? tour.targetEl : null);
  const cardSize = useCardSize(cardEl);
  const reviewDialogOpen =
    step?.id === "review-gate" &&
    tour.targetEl?.getAttribute("data-tour") === "review-dialog";

  const waitingForTarget =
    tour.active &&
    !!step?.targets?.length &&
    !tour.targetEl &&
    !tour.targetMissing;
  const showCenter = !rect || tour.targetMissing;
  const position = useMemo(
    () =>
      computePosition(
        showCenter ? null : rect,
        cardSize,
        step?.placement,
        viewport.width,
        viewport.height,
      ),
    [cardSize, rect, showCenter, step?.placement, viewport],
  );

  useEffect(() => {
    const update = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!tour.active || !step || step.action) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) {
        event.preventDefault();
        tour.exitTour();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, tour]);

  useEffect(() => {
    if (!tour.active || !step || step.action) return;
    const timer = window.setTimeout(() => cardEl?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, [cardEl, step, tour.active]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!step || step.action) return;
    if (event.key !== "Tab") return;
    const focusables = cardEl?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusables || focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!tour.active || !step) return null;

  if (reviewDialogOpen) {
    return (
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[80] flex justify-center px-4">
        <div
          role="status"
          className="pointer-events-auto flex max-w-md items-center gap-2 rounded-full border border-border bg-popover px-4 py-2 text-[12.5px] text-popover-foreground shadow-xl"
        >
          <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-primary motion-reduce:animate-none" aria-hidden="true" />
          <span>Review the summary to continue the tour.</span>
          <button
            type="button"
            onClick={tour.exitTour}
            className="ml-1 shrink-0 text-[12px] font-medium text-ink-2 underline-offset-2 hover:text-foreground hover:underline"
          >
            Exit tour
          </button>
        </div>
      </div>
    );
  }

  if (waitingForTarget) return null;

  const vw = viewport.width;
  const vh = viewport.height;
  const top = rect ? clamp(rect.top, 0, vh) : 0;
  const left = rect ? clamp(rect.left, 0, vw) : 0;
  const right = rect ? clamp(rect.right, 0, vw) : 0;
  const bottom = rect ? clamp(rect.bottom, 0, vh) : 0;
  const ringTop = Math.max(0, top - 4);
  const ringLeft = Math.max(0, left - 4);
  const ringWidth = Math.max(0, right - left + 8);
  const ringHeight = Math.max(0, bottom - top + 8);

  const progress = ((tour.stepIndex + 1) / tour.stepCount) * 100;

  return (
    <div>
      {rect && !tour.targetMissing ? (
        <>
          <Blocker style={{ left: 0, top: 0, width: vw, height: top }} />
          <Blocker style={{ left: 0, top: bottom, width: vw, height: Math.max(0, vh - bottom) }} />
          <Blocker style={{ left: 0, top, width: left, height: bottom - top }} />
          <Blocker style={{ left: right, top, width: Math.max(0, vw - right), height: bottom - top }} />
          <div
            className="pointer-events-none fixed z-[71] rounded-xl border-2 border-primary shadow-[0_0_0_4px_rgba(201,80,10,0.18)]"
            style={{
              top: ringTop,
              left: ringLeft,
              width: ringWidth,
              height: ringHeight,
            }}
            aria-hidden="true"
          />
          {!step.action && (
            <div
              className="fixed z-[72] cursor-default"
              style={{
                top,
                left,
                width: right - left,
                height: bottom - top,
              }}
              aria-hidden="true"
            />
          )}
        </>
      ) : (
        <div className="fixed inset-0 z-[70] bg-black/55" aria-hidden="true" />
      )}

      <p className="sr-only" aria-live="polite">
        {step.group}. Step {tour.stepIndex + 1} of {tour.stepCount}. {step.title}.
      </p>

      <div
        ref={cardRef}
        role="dialog"
        aria-modal={step.action ? "false" : "true"}
        aria-labelledby={`tour-title-${step.id}`}
        aria-describedby={`tour-body-${step.id}`}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="fixed z-[80] w-[min(380px,calc(100vw-2rem))] rounded-2xl border border-border bg-popover p-5 text-popover-foreground shadow-[0_24px_64px_-20px_rgba(0,0,0,0.45)] outline-none"
        style={{
          top: position.top,
          left: position.left,
          width: position.width,
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <PayoMark className="size-6 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                {step.group}
              </p>
              <p className="text-[11.5px] tabular-nums text-ink-3">
                Step {tour.stepIndex + 1} of {tour.stepCount}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={tour.exitTour}
            aria-label="Exit tour"
            className="grid size-7 shrink-0 place-items-center rounded-md text-ink-3 transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out motion-reduce:transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>

        <h2 id={`tour-title-${step.id}`} className="mt-4 text-[16px] font-semibold leading-snug tracking-[-0.01em]">
          {step.title}
        </h2>
        <p id={`tour-body-${step.id}`} className="mt-1.5 text-[13px] leading-relaxed text-ink-2">
          {step.body}
        </p>

        {step.action && !tour.targetMissing && (
          <p className="mt-3 flex items-center gap-2 text-[12px] font-medium text-ink-2">
            <span className="size-1.5 animate-pulse rounded-full bg-primary motion-reduce:animate-none" aria-hidden="true" />
            Waiting for you to continue
          </p>
        )}

        {tour.targetMissing && (
          <p className="mt-3 text-[12px] leading-relaxed text-ink-3">
            This control is not on screen right now. You can skip this step or exit the tour.
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={tour.back}
            disabled={!tour.canGoBack}
            className="gap-1.5"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back
          </Button>
          {step.id === "finish" ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  tour.finishTour();
                  navigate("/workspace/templates");
                }}
              >
                Browse templates
              </Button>
              <Button size="sm" onClick={tour.startTour} className="gap-1.5">
                Replay tour
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {step.action && (
                <Button variant="ghost" size="sm" onClick={tour.skipStep}>
                  Skip step
                </Button>
              )}
              {(!step.action || tour.targetMissing) && (
                <Button size="sm" onClick={tour.next} className="gap-1.5">
                  Next
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductTour() {
  const isClient = useSyncExternalStore(subscribeClient, () => true, () => false);
  if (!isClient) return null;
  return createPortal(<TourLayer />, document.body);
}

