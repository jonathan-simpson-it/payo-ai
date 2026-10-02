"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  FileOutput,
  TriangleAlert,
  Workflow,
} from "lucide-react";

import { Eyebrow } from "@/components/payo/ui";

/**
 * "What Payo helps teams do" — a Lume-style 3-step visual pipeline for
 * widescreen displays: three floating glass nodes wired by an animated
 * data line, each with a looping mini-UI graphic telling one story.
 * All figures are sample data; the graphics are simulated.
 */

const STEPS = [
  {
    n: "01",
    title: "Prompt in plain text or choose a template.",
    body: 'Type your business logic naturally ("Compare custodian NAV against internal valuations and flag variances over 0.5%") or start from a pre-configured template.',
  },
  {
    n: "02",
    title: "Instant visual pipeline generation.",
    body: "Payo translates your request into a clean, node-based visual workflow graph. See every input feed, formula step, and logic gate laid out visually.",
  },
  {
    n: "03",
    title: "Inspect data sources and rules line by line.",
    body: "Click into any node to verify calculations, inspect field mappings, and test edge-case tolerance thresholds using sample sandboxed data.",
  },
  {
    n: "04",
    title: "Human-in-the-loop review and one-click deploy.",
    body: "Set mandatory approval gates for exceptions. Once tested, publish your workflow with a complete, tamper-proof audit trail.",
  },
];

/** Reveal-on-scroll: flips to true the first time the section intersects. */
function useReveal() {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, shown };
}

/* Node 01: a plain-English prompt with template shortcuts ready to generate. */
function DescribeGraphic() {
  return (
    <div className="pipe-graphic relative flex h-[210px] flex-col justify-between rounded-xl border border-white/10 bg-[#131C2E] p-4">
      <div className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-2">
        <p className="text-[9px] uppercase tracking-[0.08em] text-[#7C8894]">
          Describe the workflow
        </p>
        <p className="mt-1.5 text-[10.5px] leading-relaxed text-[#C7CFD8]">
          Compare custodian NAV against internal valuations and flag variances over 0.5%
          <span
            className="ml-0.5 inline-block h-3 w-[1.5px] translate-y-0.5 bg-[#FF6B00]"
            aria-hidden="true"
          />
        </p>
      </div>

      <div>
        <p className="text-[9px] uppercase tracking-[0.08em] text-[#7C8894]">
          Or choose a template
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {["Reconcile NAV", "Check limits", "Draft briefing"].map((t) => (
            <span
              key={t}
              className="inline-flex items-center rounded-full border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 text-[10px] text-[#C7CFD8]"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 rounded-lg border border-[#FF6B00]/30 bg-[#FF6B00]/[0.1] py-1.5 text-[10.5px] font-medium text-[#FFA45C]">
        <Workflow className="size-3" aria-hidden="true" />
        Generate the graph
      </div>
    </div>
  );
}

/* Node 02: the generated pipeline, wired from load through to review and report. */
function GraphGraphic() {
  const nodes = [
    "Load valuations",
    "Map fields",
    "Calculate variance",
    "Check tolerance",
    "Review & report",
  ];
  return (
    <div className="pipe-graphic relative flex h-[210px] flex-col rounded-xl border border-white/10 bg-[#131C2E] p-4">
      <p className="text-[9px] uppercase tracking-[0.08em] text-[#7C8894]">Generated pipeline</p>
      <div className="relative mt-2 flex-1">
        <span
          className="absolute bottom-2 left-[12px] top-2 w-px bg-[#FF6B00]/40"
          aria-hidden="true"
        />
        <div className="space-y-[7px]">
          {nodes.map((label, i) => {
            const last = i === nodes.length - 1;
            return (
              <div key={label} className="flex items-center gap-2">
                <span
                  className={
                    last
                      ? "z-10 grid size-[25px] shrink-0 place-items-center rounded-md border border-[#FF6B00]/50 bg-[#FF6B00]/[0.12] font-mono text-[9px] font-semibold text-[#FFA45C]"
                      : "z-10 grid size-[25px] shrink-0 place-items-center rounded-md border border-white/[0.12] bg-[#0F172A] font-mono text-[9px] font-semibold text-[#A7B0BA]"
                  }
                >
                  {i + 1}
                </span>
                <span className="truncate rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[10px] text-[#C7CFD8]">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* Node 02: exposure dial sweeps to 85%, past the 80% limit marker, warning pops. */
function RiskGraphic() {
  return (
    <div className="pipe-graphic relative flex h-[210px] flex-col justify-between border-b border-slate-800 p-4">
      <div className="flex items-center gap-4">
        <div className="relative grid size-[112px] shrink-0 place-items-center" aria-hidden="true">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90" fill="none">
            <circle cx="60" cy="60" r={34} stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
            <circle
              cx="60"
              cy="60"
              r={34}
              stroke="#FF6B00"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray="213.6 213.6"
              className="dial-arc"
            />
            {/* limit marker at 80% */}
            <line
              x1="68.3"
              y1="34.3"
              x2="72.7"
              y2="21"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute font-mono text-[18px] font-bold tabular-nums text-white">
            85%
          </span>
        </div>

        <div className="min-w-0 flex-1 space-y-2.5">
          <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Exposure vs limit · 80% cap
          </p>
          <div className="relative h-1.5 rounded-full bg-white/[0.06]">
            <span className="block h-full w-[85%] rounded-full bg-[#FF6B00]" />
            <span
              className="absolute -top-1 h-3.5 w-px bg-white/40"
              style={{ left: "80%" }}
              aria-hidden="true"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-[10px] font-mono tracking-wider text-slate-400">Single name</span>
            <span className="h-1.5 flex-1 rounded-full bg-white/[0.06]">
              <span className="block h-full w-[62%] rounded-full bg-[#94A3B8]/60" />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-[10px] font-mono tracking-wider text-slate-400">Sector</span>
            <span className="h-1.5 flex-1 rounded-full bg-white/[0.06]">
              <span className="block h-full w-[48%] rounded-full bg-[#94A3B8]/40" />
            </span>
          </div>
        </div>
      </div>

      <div className="grid h-8 place-items-center">
        <span className="warn-pill absolute inline-flex items-center gap-1.5 rounded-full border border-[rgba(253,230,138,0.25)] bg-[rgba(217,119,6,0.15)] px-3 py-1 text-[11px] font-medium text-[#FBBF24]">
          <TriangleAlert className="size-3 text-[#FF6B00]" aria-hidden="true" />
          Limit exceeded
        </span>
      </div>
    </div>
  );
}

/* Node 03: sparkline drafts a briefing; editor approval, then export. */
function BriefingGraphic() {
  return (
    <div className="pipe-graphic relative flex h-[210px] flex-col justify-between border-b border-slate-800 p-4">
      <svg viewBox="0 0 260 56" className="h-[56px] w-full" fill="none" aria-hidden="true">
        <line
          x1="4"
          y1="50"
          x2="256"
          y2="50"
          className="stroke-slate-700"
          strokeWidth="1"
          strokeDasharray="2 2"
        />
        <path
          d="M4 44 L 34 38 L 62 41 L 92 30 L 120 33 L 150 22 L 178 26 L 208 12 L 256 6"
          stroke="#FF6B00"
          strokeWidth="1.6"
          strokeLinecap="round"
          className="spark-draw"
        />
        <circle cx="256" cy="6" r="3" fill="#FF6B00" />
      </svg>

      <div className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium text-[#F8FAFC]">Morning briefing — draft</p>
          <span className="text-[9px] text-[#7C8894]">auto-filed</span>
        </div>
        <div className="mt-1.5 space-y-1" aria-hidden="true">
          <span className="block h-1.5 w-[86%] rounded-full bg-white/[0.09]" />
          <span className="block h-1.5 w-[64%] rounded-full bg-white/[0.07]" />
        </div>
      </div>

      <div className="relative grid h-8 place-items-center">
        <span className="approve-pill absolute inline-flex items-center gap-1.5 rounded-full bg-[#4FAE7E]/[0.14] px-3 py-1 text-[11px] font-medium text-[#4FAE7E]">
          <Check className="size-3" strokeWidth={3} aria-hidden="true" />
          Approved by editor
        </span>
        <span className="export-pill absolute inline-flex items-center gap-1.5 rounded-full border border-white/[0.14] bg-white/[0.05] px-3 py-1 text-[11px] font-medium text-[#C7CFD8]">
          <FileOutput className="size-3" aria-hidden="true" />
          Export briefing
        </span>
      </div>
    </div>
  );
}

const GRAPHICS = [DescribeGraphic, GraphGraphic, RiskGraphic, BriefingGraphic];

export function HelpsPipeline() {
  const { ref, shown } = useReveal();

  return (
    <section
      id="what-payo-does"
      ref={ref}
      className="pipe-canvas relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-[#0B0F17]"
    >
      {/* 32px grid texture + ambient orange bloom, bottom-centre */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            maskImage: "radial-gradient(ellipse 75% 70% at 50% 45%, black 30%, transparent 78%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 75% 70% at 50% 45%, black 30%, transparent 78%)",
          }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-[1720px] px-6 py-16 sm:px-10 lg:px-20 lg:py-20">
        {/* Header */}
        <div
          className={`transition-all duration-700 ${
            shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <Eyebrow>The Payo pipeline</Eyebrow>
          <h2 className="mt-5 max-w-3xl text-[30px] font-bold leading-[1.2] tracking-[-0.01em] text-white sm:text-[36px] xl:text-[42px]">
            From plain text to production-grade workflow.
          </h2>
        </div>

        {/* Pipeline canvas */}
        <div className="relative mt-12 xl:mt-16">
          {/* Background connecting line with flowing data packets */}
          <svg
            aria-hidden="true"
            className="absolute inset-x-0 top-[36%] hidden h-[140px] w-full lg:block"
            viewBox="0 0 1600 140"
            fill="none"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="pipe-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FF6B00" />
                <stop offset="100%" stopColor="#FF6B00" />
              </linearGradient>
            </defs>
            <path
              id="pipe-path"
              d="M40 70 C 240 26, 400 116, 800 70 C 1200 24, 1360 114, 1560 70"
              stroke="url(#pipe-grad)"
              strokeWidth="1.4"
              opacity="0.35"
            />
            <path
              d="M40 70 C 240 26, 400 116, 800 70 C 1200 24, 1360 114, 1560 70"
              stroke="url(#pipe-grad)"
              strokeWidth="2"
              className="pipe-pulse"
            />
            <circle r="3.5" fill="#FF6B00">
              <animateMotion
                dur="7s"
                repeatCount="indefinite"
                path="M40 70 C 240 26, 400 116, 800 70 C 1200 24, 1360 114, 1560 70"
              />
            </circle>
            <circle r="2.5" fill="#94A3B8">
              <animateMotion
                dur="7s"
                begin="3.2s"
                repeatCount="indefinite"
                path="M40 70 C 240 26, 400 116, 800 70 C 1200 24, 1360 114, 1560 70"
              />
            </circle>
          </svg>

          <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {STEPS.map((s, i) => {
              const Graphic = GRAPHICS[i];
              return (
                <div
                  key={s.n}
                  className={`group/card glass rounded-2xl p-6 transition-all duration-700 hover:border-[#FF6B00]/30 xl:p-7 ${
                    shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                  }`}
                  style={{ transitionDelay: shown ? `${200 + i * 160}ms` : "0ms" }}
                >
                  <div className="transition-transform duration-300 group-hover/card:scale-[1.03]">
                    <Graphic />
                  </div>

                  <div className="mt-6 flex items-start gap-3">
                    <span className="mt-0.5 inline-flex items-center rounded-md border border-[#FF6B00]/20 bg-[#FF6B00]/10 px-2 py-0.5 font-mono text-xs font-bold tabular-nums text-[#FF6B00]">
                      {s.n}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold leading-snug text-white">
                        {s.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">
                        {s.body}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-8 flex items-center justify-between gap-4 text-[11.5px] text-[#6B7480]">
          <span>Simulated graphics · sample data. Nothing here is live.</span>
          <a
            href="#/workspace/templates"
            className="inline-flex items-center gap-1.5 font-medium text-[#FF8A4C] transition-colors hover:text-[#FFA45C]"
          >
            See the workflows
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>
        </p>
      </div>
    </section>
  );
}
