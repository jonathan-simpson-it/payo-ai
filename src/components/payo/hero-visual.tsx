import { Calculator, CircleAlert, FileSpreadsheet, ArrowLeftRight } from "lucide-react";

import { NAV_VALUATION_DATE, navResults } from "@/lib/payo/data";
import { fmtInt, fmtSignedPct } from "@/lib/payo/format";
import { cn } from "@/lib/utils";

/**
 * Hero visual: a layered stack of floating product windows alternating
 * white and slate panes, joined by quiet slate connectors.
 * Decorative only: every figure is sample data and nothing here is
 * interactive (the real screens live in the workspace). Fixed palette
 * so the hero reads the same in both themes.
 */

const SHOWN_FUNDS = [
  "Ashbourne Global Equity",
  "Brookfield Income",
  "Delmore Credit",
  "Ferngate Diversified",
  "Harborpoint Property",
];

/* Rounded status badges: red = exception, muted green = matched, amber = tolerance. */
const STATUS_CHIP: Record<string, string> = {
  Matched: "border border-[#4FAE7E]/25 bg-[#4FAE7E]/10 text-[#4FAE7E]",
  "Within tolerance": "border border-[#4FAE7E]/25 bg-[#4FAE7E]/10 text-[#4FAE7E]",
  Exception: "border border-[rgba(252,165,165,0.25)] bg-[rgba(220,38,38,0.12)] text-[#F87171]",
};

/** Sub-0.005% variances read as an exact match rather than "-0.00%". */
function fmtDiff(pct: number): string {
  return Math.abs(pct) < 0.005 ? "0.00%" : fmtSignedPct(pct);
}

function WindowDots({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <span className="flex items-center gap-1" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn("size-2 rounded-full", tone === "light" ? "bg-black/[0.14]" : "bg-white/[0.16]")}
        />
      ))}
    </span>
  );
}

function TranslucentWindow({
  className,
  title,
  chip,
  tone = "dark",
  children,
}: {
  className?: string;
  title: string;
  chip?: React.ReactNode;
  tone?: "dark" | "light";
  children: React.ReactNode;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute overflow-hidden rounded-xl",
        tone === "light"
          ? "border border-white bg-white shadow-[0_30px_70px_-28px_rgba(0,0,0,0.85)]"
          : "glass-deep",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center gap-1.5 border-b px-3 py-1.5",
          tone === "light" ? "border-black/[0.08] bg-black/[0.03]" : "border-white/[0.08] bg-white/[0.03]",
        )}
      >
        <WindowDots tone={tone} />
        <span
          className={cn(
            "ml-1 truncate text-[9.5px] font-medium",
            tone === "light" ? "text-black/55" : "text-ink-3",
          )}
        >
          {title}
        </span>
        {chip && <span className="ml-auto shrink-0">{chip}</span>}
      </div>
      {children}
    </div>
  );
}

function MiniChip({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "warn" | "brand";
  children: React.ReactNode;
}) {
  const tones = {
    neutral: "border-black/[0.15] bg-black/[0.05] text-black/60",
    warn: "border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]",
    brand: "border-primary/30 bg-primary/10 text-primary-ink",
  };
  const dots = {
    neutral: "bg-black/40",
    warn: "bg-[#B25E00]",
    brand: "bg-primary",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-px text-[8.5px] font-medium",
        tones[tone],
      )}
    >
      <span className={cn("size-1 rounded-full", dots[tone])} aria-hidden="true" />
      {children}
    </span>
  );
}

function FlowNode({
  icon: Icon,
  label,
  className,
  iconClassName,
}: {
  icon: typeof FileSpreadsheet;
  label: string;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span
      className={cn(
        "absolute flex items-center gap-1 rounded-md border border-black/[0.12] bg-white px-1.5 py-[3px] text-[8.5px] font-medium text-black/75",
        className,
      )}
    >
      <Icon
        className={cn("size-2.5 text-[#C24300]", iconClassName)}
        strokeWidth={2.5}
        aria-hidden="true"
      />
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );
}

/** Quiet slate connector between workflow nodes. */
function Laser({
  d,
  opacity = 1,
}: {
  d: string;
  opacity?: number;
}) {
  return (
    <>
      <path d={d} stroke="rgba(100,116,139,0.22)" strokeWidth="3" opacity={opacity} fill="none" />
      <path
        d={d}
        stroke="#64748B"
        strokeWidth="1.1"
        opacity={0.9 * opacity}
        fill="none"
      />
    </>
  );
}

function WorkflowWindow() {
  return (
    <TranslucentWindow
      tone="light"
      title="Reconciliation workflow · 6 steps"
      chip={<MiniChip tone="warn">Needs review</MiniChip>}
      className="left-[-2%] top-[7%] w-[56%] -rotate-[5deg]"
    >
      <div className="relative h-[118px]">
        <svg
          className="absolute inset-0 size-full"
          viewBox="0 0 260 118"
          fill="none"
          preserveAspectRatio="none"
        >
          <Laser d="M74 24 C 92 24, 96 20, 112 20" />
          <Laser d="M40 36 C 40 50, 40 54, 40 68" opacity={0.8} />
          <Laser d="M74 78 C 100 78, 106 72, 130 72" />
          <Laser d="M192 22 C 198 38, 194 52, 178 64" opacity={0.7} />
          <circle cx="74" cy="24" r="2" fill="#FF8133" />
          <circle cx="130" cy="72" r="2" fill="#FF8133" />
        </svg>
        <FlowNode icon={FileSpreadsheet} label="Load NAV file" className="left-[3%] top-[13%]" />
        <FlowNode icon={ArrowLeftRight} label="Map funds" className="left-[3%] top-[58%]" />
        <FlowNode icon={Calculator} label="Calculate variance" className="left-[44%] top-[9%]" />
        <FlowNode
          icon={CircleAlert}
          label="Review variance"
          className="left-[52%] top-[54%]"
          iconClassName="text-[#B25E00]"
        />
      </div>
      <div className="flex items-center gap-1.5 border-t border-black/[0.08] px-3 py-1.5">
        <span
          className="size-1.5 rounded-full bg-[#4FAE7E]"
          aria-hidden="true"
        />
        <span className="text-[9px] text-black/55">4 complete · 1 needs review</span>
      </div>
    </TranslucentWindow>
  );
}

function DashboardWindow() {
  /* Daily risk bars: quiet slate with the two tallest in brand orange. */
  const bars = [
    { h: 20, c: "rgba(148,163,184,0.35)" },
    { h: 28, c: "rgba(148,163,184,0.35)" },
    { h: 16, c: "rgba(148,163,184,0.35)" },
    { h: 32, c: "rgba(148,163,184,0.45)" },
    { h: 24, c: "rgba(148,163,184,0.35)" },
    { h: 36, c: "rgba(148,163,184,0.45)" },
    { h: 46, c: "#C9500A" },
    { h: 50, c: "#FF8133" },
  ];
  return (
    <TranslucentWindow
      title="Daily risk briefing"
      chip={<MiniChipDark>Sample data</MiniChipDark>}
      className="right-[-2%] top-0 w-[46%] rotate-[4deg]"
    >
      <div className="grid grid-cols-2 gap-2 px-3 pt-2.5">
        <div>
          <p className="font-mono text-[13px] font-semibold leading-none tabular-nums text-[#F87171]">
            2
          </p>
          <p className="mt-1 text-[8.5px] text-ink-3">Exceptions</p>
        </div>
        <div>
          <p className="font-mono text-[13px] font-semibold leading-none tabular-nums text-white">
            8
          </p>
          <p className="mt-1 text-[8.5px] text-ink-3">Funds checked</p>
        </div>
      </div>
      <div className="px-3 pb-3 pt-1.5">
        <svg viewBox="0 0 200 56" className="w-full" fill="none" aria-hidden="true">
          {bars.map((b, i) => (
            <rect
              key={i}
              x={i * 24 + 6}
              y={54 - b.h}
              width={14}
              height={b.h}
              rx={2}
              fill={b.c}
            />
          ))}
          <line x1="2" y1="54.5" x2="198" y2="54.5" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        </svg>
      </div>
    </TranslucentWindow>
  );
}

function MiniChipDark({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-border bg-white/[0.05] px-1.5 py-px text-[8.5px] font-medium text-ink-2">
      <span className="size-1 rounded-full bg-neutral" aria-hidden="true" />
      {children}
    </span>
  );
}

function RunHistoryWindow() {
  const runs = [
    { time: "09:12", name: "NAV reconciliation", dot: "bg-[#4FAE7E]" },
    { time: "08:47", name: "Risk limit checks", dot: "bg-[#4FAE7E]" },
    { time: "08:15", name: "Daily briefing", dot: "bg-[#B25E00]" },
  ];
  return (
    <TranslucentWindow
      tone="light"
      title="Run history"
      className="bottom-[7%] left-[-3%] z-10 w-[40%] -rotate-[2deg]"
    >
      <ul className="px-3 py-2">
        {runs.map((r) => (
          <li key={r.time} className="flex items-center gap-1.5 py-[3px] text-[8.5px] text-black/60">
            <span
              className={cn(
                "size-1.5 shrink-0 rounded-full",
                r.dot,

              )}
              aria-hidden="true"
            />
            <span className="font-mono tabular-nums">{r.time}</span>
            <span className="truncate">{r.name}</span>
          </li>
        ))}
      </ul>
    </TranslucentWindow>
  );
}

function ReconciliationWindow() {
  const rows = navResults(0.5).filter((r) => SHOWN_FUNDS.includes(r.fund));
  const exceptions = rows.filter((r) => r.status === "Exception").length;

  return (
    <div className="showcase-aura absolute inset-x-[2%] bottom-0 z-20 overflow-hidden rounded-xl">
      {/* Window bar */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] px-3.5 py-2.5">
        <WindowDots />
        <span className="ml-1.5 text-[12px] font-semibold tracking-tight text-white">Payo AI</span>
        <span className="text-white/20">/</span>
        <span className="truncate text-[12px] text-ink-3">NAV Reconciliation</span>
        <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded border border-white/[0.12] px-1.5 py-px text-[10px] font-medium text-ink-3">
          <span className="size-1.5 rounded-full bg-white/[0.35]" aria-hidden="true" />
          Sample data
        </span>
        <span className="hidden shrink-0 items-center gap-1.5 rounded border border-amber-500/20 bg-amber-500/10 px-1.5 py-px text-[10px] font-medium text-amber-400 sm:inline-flex">
          <span className="size-1.5 rounded-full bg-amber-400" aria-hidden="true" />
          Needs review
        </span>
      </div>

      {/* Screen header */}
      <div className="flex items-center justify-between gap-3 px-3.5 pb-2 pt-3">
        <p className="text-[13px] font-semibold tracking-tight text-white">NAV Reconciliation</p>
        <p className="truncate font-mono text-[10.5px] tabular-nums text-[#6B7480]">
          Valuation {NAV_VALUATION_DATE} · Tolerance ±0.50%
        </p>
      </div>

      {/* Reconciliation table */}
      <div className="mx-3.5 mb-3 overflow-x-auto rounded-lg border border-white/[0.08]">
        <table className="w-full min-w-[430px] border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.04] text-left text-[9.5px] text-ink-3">
              <th className="whitespace-nowrap px-1.5 py-1.5 font-medium">Fund</th>
              <th className="px-1.5 py-1.5 text-right font-medium">
                Administrator NAV
                <span className="block font-normal text-[#525A64]">(HK$)</span>
              </th>
              <th className="px-1.5 py-1.5 text-right font-medium">
                Internal NAV
                <span className="block font-normal text-[#525A64]">(HK$)</span>
              </th>
              <th className="whitespace-nowrap px-1.5 py-1.5 text-right font-medium">
                Difference %
              </th>
              <th className="whitespace-nowrap px-1.5 py-1.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.fund}
                className={cn(
                  "border-b border-white/[0.05] last:border-0",
                  r.status === "Exception" && "bg-[#EF4444]/[0.08]",
                )}
              >
                <td className="whitespace-nowrap px-1.5 py-[7px] font-medium text-[#E9EEF3]">
                  {r.fund}
                </td>
                <td className="whitespace-nowrap px-1.5 py-[7px] text-right font-mono tabular-nums text-[#A7B0BA]">
                  {fmtInt(r.adminNav)}
                </td>
                <td className="whitespace-nowrap px-1.5 py-[7px] text-right font-mono tabular-nums text-[#A7B0BA]">
                  {fmtInt(r.internalNav)}
                </td>
                <td
                  className={cn(
                    "whitespace-nowrap px-1.5 py-[7px] text-right font-mono tabular-nums",
                    r.status === "Exception"
                      ? "font-medium text-[#F87171]"
                      : "text-[#A7B0BA]",
                  )}
                >
                  {fmtDiff(r.diffPct)}
                </td>
                <td className="whitespace-nowrap px-1.5 py-[7px]">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md px-2 py-0.5 font-mono text-xs",
                      STATUS_CHIP[r.status],
                    )}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary chart: variance per fund, coloured by status */}
      <div className="px-3.5 pb-3">
        <p className="text-[9.5px] font-medium text-[#6B7480]">Difference by fund</p>
        <div className="mt-1.5 flex h-[34px] w-full max-w-[300px] items-end justify-between gap-1.5 border-b border-white/[0.1] pb-px">
          {rows.map((r) => (
            <span
              key={r.fund}
              className="w-9 shrink-0 rounded-t-[2px]"
              style={{
                height: `${Math.max(2, Math.round((Math.abs(r.diffPct) / 1.8) * 32))}px`,
                backgroundColor:
                  r.status === "Exception"
                    ? "#EF4444"
                    : r.status === "Within tolerance"
                      ? "#FBBF24"
                      : "#4FAE7E",
                opacity: r.status === "Exception" ? 0.85 : 0.55,
              }}
            />
          ))}
        </div>
      </div>

      {/* Review footer */}
      <div className="flex items-center justify-between gap-3 border-t border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5">
        <p className="flex items-center gap-1.5 text-[10.5px] text-ink-3">
          <CircleAlert className="size-3 shrink-0 text-[#D97706]" aria-hidden="true" />
          {exceptions} exceptions routed for human review
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="rounded-md border border-white/[0.12] bg-white/[0.04] px-2 py-1 text-[10px] font-medium text-ink-2">
            Return for review
          </span>
          <span className="rounded-md bg-white px-2 py-1 text-[10px] font-medium text-black">
            Approve summary
          </span>
        </div>
      </div>
    </div>
  );
}

export function HeroVisual() {
  return (
    <div className="min-w-0">
      <div
        role="img"
        aria-label="Simulated preview of the Payo AI workspace: a NAV reconciliation table in front of layered workflow and briefing windows, using sample data."
        className="relative mx-auto h-[440px] w-full max-w-[640px] select-none sm:h-[470px] lg:h-[500px] lg:max-w-none xl:h-[540px]"
      >
        {/* Studio backdrop: faint dot grid and quiet volumetric light blooms */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
            maskImage: "radial-gradient(ellipse 72% 68% at 52% 42%, black 28%, transparent 74%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 72% 68% at 52% 42%, black 28%, transparent 74%)",
          }}
        />

        <WorkflowWindow />
        <DashboardWindow />
        <RunHistoryWindow />
        <ReconciliationWindow />
      </div>
      <p className="mt-3 text-center text-[12px] text-[#6B7480]">Simulated preview. Sample data.</p>
    </div>
  );
}
