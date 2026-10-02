"use client";

import {
  ArrowRight,
  Briefcase,
  Check,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  TriangleAlert,
  TrendingUp,
} from "lucide-react";

import { TEMPLATES } from "@/lib/payo/data";
import { SampleTag } from "@/components/payo/ui";

/**
 * "Template library" — full-viewport 16:9 band with one bespoke micro-UI
 * canvas per template category, so the three cards read as three different
 * products rather than one card repeated. All figures are sample data.
 */

const WORKSPACE_URL = "#/workspace/templates";

/* Landing card copy per template id (workspace data stays canonical). */
const CARD_COPY: Record<string, { name: string; outcome: string }> = {
  "nav-reconciliation": {
    name: "NAV & valuation reconciliation",
    outcome:
      "Automatically load custodian CSVs, map internal ledger accounts, flag discrepancies outside custom tolerance %, and generate review summaries.",
  },
  "position-risk": {
    name: "Position exposure & concentration monitor",
    outcome:
      "Monitor portfolio holdings against hard risk caps. Instantly isolate single-name or sector breaches before trading closes.",
  },
  "market-movements": {
    name: "Automated daily market briefing",
    outcome:
      "Aggregate overnight market trends against portfolio holdings, generate a structured narrative, and route to senior editors.",
  },
};

/* Category presentation per template id: badge copy + neutral label. */
const CATEGORY_STYLE: Record<
  string,
  { label: string; badge: string; glow: string }
> = {
  "nav-reconciliation": {
    label: "Operations",
    badge: "text-[#A7B0BA]",
    glow: "hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)]",
  },
  "position-risk": {
    label: "Risk & Compliance",
    badge: "text-[#A7B0BA]",
    glow: "hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)]",
  },
  "market-movements": {
    label: "Research & Reporting",
    badge: "text-[#A7B0BA]",
    glow: "hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)]",
  },
};

function SourceChip({
  icon: Icon,
  name,
}: {
  icon: typeof FileText;
  name: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 text-[11px] text-[#C7CFD8]">
      <Icon className="size-3 text-[#8B939B]" aria-hidden="true" />
      <span className="font-mono">{name}</span>
    </span>
  );
}

/* Card 1 canvas: fund reconciliation spreadsheet with status badges. */
function NavCanvas() {
  return (
    <div className="flex h-[216px] flex-col justify-between rounded-xl border border-white/10 bg-[#111827] p-3.5">
      <div className="overflow-hidden rounded-lg border border-white/[0.07]">
        <div className="grid grid-cols-[1fr_auto_auto] gap-2 border-b border-white/[0.07] bg-white/[0.04] px-2.5 py-1.5 text-[9px] uppercase tracking-[0.08em] text-[#7C8894]">
          <span>Fund</span>
          <span className="text-right">Diff</span>
          <span className="text-right">Status</span>
        </div>
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-b border-white/[0.05] px-2.5 py-2 text-[11px]">
          <span className="font-medium text-[#E9EEF3]">Ashbourne Equity</span>
          <span className="text-right font-mono tabular-nums text-[#A7B0BA]">0.00%</span>
          <span className="inline-flex justify-end">
            <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(79,174,126,0.25)] bg-[rgba(79,174,126,0.12)] px-2 py-0.5 text-[9.5px] font-medium text-[#4FAE7E]">
              <Check className="size-2.5" strokeWidth={3} aria-hidden="true" />
              Matched
            </span>
          </span>
        </div>
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 bg-[#EF4444]/[0.06] px-2.5 py-2 text-[11px]">
          <span className="font-medium text-[#E9EEF3]">Harborpoint</span>
          <span className="text-right font-mono tabular-nums text-[#F87171]">−1.77%</span>
          <span className="inline-flex justify-end">
            <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(252,165,165,0.25)] bg-[rgba(220,38,38,0.12)] px-2 py-0.5 text-[9.5px] font-medium text-[#F87171]">
              Exception
            </span>
          </span>
        </div>
      </div>

      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300">
          <span className="size-1.5 rounded-full bg-red-300" aria-hidden="true" />
          2 exceptions routed to human review
        </span>
      </div>
    </div>
  );
}

/* Card 2 canvas: concentration dial at 85%, breach pill, position ticker. */
function RiskCanvas() {
  const R = 30;
  const C = 2 * Math.PI * R;
  return (
    <div className="flex h-[216px] flex-col justify-between rounded-xl border border-white/10 bg-[#111827] p-3.5">
      <div className="flex items-center gap-4">
        <div className="relative grid size-[76px] shrink-0 place-items-center" aria-hidden="true">
          <svg viewBox="0 0 76 76" className="size-[76px] -rotate-90" fill="none">
            <circle cx="38" cy="38" r={R} stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            <circle
              cx="38"
              cy="38"
              r={R}
              stroke="#F59E0B"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(C * 85) / 100} ${C}`}
            />
          </svg>
          <span className="absolute font-mono text-[15px] font-semibold tabular-nums text-[#F8FAFC]">
            85%
          </span>
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="text-[9px] uppercase tracking-[0.08em] text-[#7C8894]">
              Concentration threshold
            </p>
            <div className="relative mt-1 h-1.5 rounded-full bg-white/[0.08]">
              <span className="absolute inset-y-0 left-0 w-[85%] rounded-full bg-[#EF4444]" />
              <span
                className="absolute -top-0.5 h-2.5 w-px bg-white/40"
                style={{ left: "75%" }}
                aria-hidden="true"
              />
            </div>
          </div>
          <p className="truncate font-mono text-[10.5px] tabular-nums text-[#94A3B8]">
            Max Position: <span className="text-[#F87171]">$12.4M</span> / $10.0M Limit
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300">
          <TriangleAlert className="size-3" aria-hidden="true" />
          Concentration limit breach
        </span>
      </div>
    </div>
  );
}

/* Card 3 canvas: market sparkline feeding an approved briefing draft. */
function ResearchCanvas() {
  return (
    <div className="flex h-[216px] flex-col justify-between rounded-xl border border-white/10 bg-[#111827] p-3.5">
      <svg viewBox="0 0 300 60" className="h-[60px] w-full" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="tpl-spark" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FF6B00" />
            <stop offset="100%" stopColor="#FF6B00" />
          </linearGradient>
          <linearGradient id="blue-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[15, 30, 45].map((y) => (
          <line key={y} x1="2" y1={y} x2="298" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}
        <path
          d="M4 48 L 40 42 L 76 45 L 112 34 L 148 37 L 184 24 L 220 28 L 256 12 L 296 8 L 296 56 L 4 56 Z"
          fill="url(#blue-gradient)"
        />
        <path
          d="M4 48 L 40 42 L 76 45 L 112 34 L 148 37 L 184 24 L 220 28 L 256 12 L 296 8"
          stroke="#FF6B00"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="296" cy="8" r="2.5" fill="#FF6B00" />
      </svg>

      <div className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5">
        <div className="flex items-center justify-between">
          <p className="text-[10.5px] font-medium text-[#F8FAFC]">Morning briefing (ready)</p>
          <span className="text-[9px] text-[#7C8894]">06:45</span>
        </div>
        <div className="mt-1.5 space-y-1" aria-hidden="true">
          <span className="block h-1.5 w-[88%] rounded-full bg-white/[0.09]" />
          <span className="block h-1.5 w-[70%] rounded-full bg-white/[0.07]" />
          <span className="block h-1.5 w-[52%] rounded-full bg-white/[0.05]" />
        </div>
      </div>

      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4FAE7E]/[0.14] px-3 py-1 text-[10.5px] font-medium text-[#4FAE7E]">
          <Check className="size-3" strokeWidth={3} aria-hidden="true" />
          Briefing approved by editor
        </span>
      </div>
    </div>
  );
}

const CANVAS: Record<string, () => React.ReactElement> = {
  "nav-reconciliation": NavCanvas,
  "position-risk": RiskCanvas,
  "market-movements": ResearchCanvas,
};

/* Key-source file chips per template, as they appear in the canvas story. */
const SOURCE_CHIPS: Record<string, { icon: typeof FileText; name: string }[]> = {
  "nav-reconciliation": [
    { icon: FileText, name: "Admin_NAV.csv" },
    { icon: FileSpreadsheet, name: "Internal_Val.xlsx" },
  ],
  "position-risk": [
    { icon: FolderOpen, name: "Positions_Feed" },
    { icon: FileText, name: "Limit_Policy.pdf" },
  ],
  "market-movements": [
    { icon: TrendingUp, name: "Market_Snapshot" },
    { icon: Briefcase, name: "Holdings_Context" },
  ],
};

export function TemplateLibrarySection() {
  const available = TEMPLATES.filter((t) => !t.comingSoon);

  return (
    <section
      id="templates"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-[#030712]"
    >
      {/* Radial slate base + subtle gridlines */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, #0B0F17 0%, #030712 100%)",
          }}
        />
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

      <div className="relative mx-auto w-full max-w-[1720px] px-6 py-16 sm:px-12 lg:px-24 lg:py-20">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.15em] text-[#FF8A4C]">
              <span className="h-px w-6 bg-[#FF6B00]" aria-hidden="true" />
              Pre-built flows
            </p>
            <h2 className="mt-4 max-w-2xl text-[28px] font-bold leading-[1.2] tracking-[-0.01em] text-white sm:text-[34px] xl:text-[40px]">
              Start from a battle-tested template.
            </h2>
          </div>
          <a
            href={WORKSPACE_URL}
            className="group inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#FF6B00] transition-colors hover:text-[#FF8A4C]"
          >
            View all templates
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </a>
        </div>

        {/* Three bespoke template cards */}
        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {available.map((t) => {
            const style = CATEGORY_STYLE[t.id];
            const card = CARD_COPY[t.id];
            const Canvas = CANVAS[t.id];
            const chips = SOURCE_CHIPS[t.id];
            return (
              <div
                key={t.id}
                className={`group/tpl relative flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 xl:p-7 ${style?.glow ?? ""}`}
              >
                <div>
                  <p
                    className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${style?.badge ?? "text-[#A7B0BA]"}`}
                  >
                    {style?.label ?? t.category}
                  </p>

                  <div className="mt-4">{Canvas ? <Canvas /> : null}</div>

                  <h3 className="mt-5 text-[17px] font-semibold leading-snug text-white">
                    {card?.name ?? t.name}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-[#CBD5E1]">
                    {card?.outcome ?? t.outcome}
                  </p>

                  <div className="mt-4">
                    <p className="text-[11px] font-medium text-[#94A3B8]">Key sources:</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {chips
                        ? chips.map((c) => <SourceChip key={c.name} icon={c.icon} name={c.name} />)
                        : t.keySources?.map((k) => (
                            <SourceChip key={k} icon={FileText} name={k} />
                          ))}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
                    <SampleTag />
                    <a
                      href={`#/workspace/workflows/${t.id}`}
                      className="group/cta inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#FF6B00] transition-colors hover:text-[#FF8A4C]"
                    >
                      Customize template
                      <ArrowRight
                        className="size-3.5 transition-transform duration-200 group-hover/cta:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
