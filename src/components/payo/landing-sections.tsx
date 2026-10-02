"use client";

import { useState } from "react";
import { ArrowRight, ArrowUpRight, Check, ChevronRight, ExternalLink, FileText, Zap } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eyebrow, SampleTag, StepTypeIcon, ToneChip, rowStatusTone } from "@/components/payo/ui";
import {
  PLANNED_CONNECTORS,
  SAMPLE_INPUTS,
  type ConnectorGroup,
} from "@/lib/payo/connectors";
import { SME_CASHFLOW, navResults, riskResults } from "@/lib/payo/data";
import { fmtInt, fmtPct, fmtSignedPct } from "@/lib/payo/format";
import type { StepTypeId } from "@/lib/payo/types";
import { cn } from "@/lib/utils";

const SECTION_HEADING =
  "mt-4 max-w-2xl text-[30px] font-bold leading-[1.2] tracking-[-0.01em] text-foreground sm:text-[36px] xl:text-[40px]";

/* Full-viewport 16:9 band shared by every section. */
const SECTION_169 = "relative flex min-h-[100svh] flex-col justify-center overflow-hidden";

// ─── SECTION 2 — Why this exists ─────────────────────────────────────────────

/* Enterprise area trend: 2025 actual rising to the 2030 forecast, drawn as a
 * single deep-orange curve over a faded area fill with dashed gridlines.
 * Nodes and labels are HTML overlays percentage-mapped to the 320×120 viewBox. */
function GrowthTrend() {
  const curve = "M24 84 C 110 78, 190 52, 296 28";
  return (
    <div
      role="img"
      aria-label="Area chart: AI-related investment by global financial institutions, USD 78bn in 2025 rising to a forecast USD 132bn by 2030."
    >
      <div className="flex justify-end">
        <span className="rounded border border-border bg-white/[0.04] px-2 py-0.5 font-mono text-[11px] text-primary-ink">
          +$54B Growth
        </span>
      </div>
      <div className="relative mt-2 h-[120px] w-full">
        <svg
          className="absolute inset-0 size-full"
          viewBox="0 0 320 120"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="growth-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C9500A" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#C9500A" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[24, 56, 88].map((y) => (
            <line
              key={y}
              x1="8"
              y1={y}
              x2="312"
              y2={y}
              stroke="rgba(255,255,255,0.10)"
              strokeWidth="1"
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path d={`${curve} L 296 104 L 24 104 Z`} fill="url(#growth-area)" />
          <path
            d={curve}
            stroke="#C9500A"
            strokeWidth="2.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span
          className="absolute left-[7.5%] top-[70%] size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6E7681]"
          aria-hidden="true"
        />
        <span className="absolute left-[7.5%] top-[calc(70%+10px)] -translate-x-1/2 whitespace-nowrap font-mono text-[11px] tabular-nums text-ink-3">
          2025 · $78B
        </span>
        <span
          className="absolute left-[92.5%] top-[23.33%] size-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C9500A]"
          aria-hidden="true"
        />
        <span className="absolute right-0 top-[calc(23.33%-20px)] whitespace-nowrap text-right font-mono text-[11px] font-bold tabular-nums text-foreground">
          2030 · $132B
        </span>
      </div>
    </div>
  );
}

const SOLUTIONS = [
  {
    n: "01",
    title: "Visual & Traceable Graph Logic",
    body: "Watch your data flow from raw input feeds to final reports. Every transformation step displays its source, formula, and pass/fail criteria in real time.",
    tag: "100% Visible Pipelines",
  },
  {
    n: "02",
    title: "Smart Exception Triage",
    body: "Clean data passes automatically. Material differences or limit breaches are instantly flagged and routed directly to designated reviewers with full context attached.",
    tag: "Zero Manual Spreadsheets",
  },
  {
    n: "03",
    title: "Human-in-the-Loop Governance",
    body: "Payo pauses at critical decision nodes until an authorized team member approves the summary. Every decision is logged, exportable, and audit-ready.",
    tag: "Enterprise Compliance",
  },
];

export function EvidenceStrip() {
  return (
    <section
      id="evidence"
      className="relative mx-auto aspect-video h-[100svh] max-h-[1080px] max-w-full overflow-hidden"
      style={{
        backgroundColor: "#0D0F12",
        backgroundImage:
          "linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    >
      <div className="flex h-full w-full max-w-[1920px] flex-col justify-center px-6 py-14 sm:px-12 lg:px-24 lg:py-14">
        {/* Header */}
        <div>
          <Eyebrow>Why this exists</Eyebrow>
          <h2 className="mt-4 max-w-2xl text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-foreground sm:text-[32px] xl:text-[36px]">
            Bridging the AI ROI gap in financial operations.
          </h2>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ink-2">
            Finance ops cannot risk black-box outputs. Every prompt generates a fully inspectable
            node graph. Every calculation retains its underlying line-item lineage.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,38fr)_minmax(0,62fr)]">
          {/* Left: enterprise research card */}
          <div className="glass rounded-xl p-7">
            <p className="text-[56px] font-extrabold leading-none tracking-[-0.02em] text-foreground">
              71%
            </p>
            <div className="mt-4 h-1 w-full rounded-full bg-white/[0.08]">
              <div className="h-full w-[71%] rounded-full bg-primary" />
            </div>
            <p className="mt-4 max-w-[36ch] text-[14px] leading-[1.5] text-ink-2">
              of financial institutions struggle to prove value from black-box AI tools due to lack
              of auditability.
            </p>

            <div className="mt-7 border-t border-border pt-6">
              <GrowthTrend />
              <p className="mt-3 text-[12px] text-ink-3">
                AI-related investment by global financial institutions (2025 → 2030).
              </p>
            </div>

            <p className="mt-6 border-t border-border pt-4 text-xs text-ink-3">
              Source:{" "}
              <a
                href="https://www.quinlanandassociates.com/wp-content/uploads/2026/07/Quinlan-Associates-From-Pie-in-the-Sky-to-ROI.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-primary-ink transition-colors hover:text-white"
              >
                Quinlan &amp; Associates (July 2026)
                <ArrowUpRight className="size-3" aria-hidden="true" />
              </a>
            </p>
          </div>

          {/* Right: three structural solution cards */}
          <ul className="flex flex-col justify-center gap-4">
            {SOLUTIONS.map((s) => (
              <li
                key={s.n}
                className="glass glass-hover rounded-xl p-5 xl:p-6"
              >
                <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2">
                  <span className="grid size-8 shrink-0 place-items-center rounded-md bg-white/[0.06] font-mono text-[12px] font-semibold tabular-nums text-foreground">
                    {s.n}
                  </span>
                  <h3 className="text-[18px] font-bold tracking-[-0.01em] text-foreground">
                    {s.title}
                  </h3>
                  <span className="ml-auto inline-flex items-center rounded border border-border bg-white/[0.05] px-2 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-ink-2">
                    {s.tag}
                  </span>
                </div>
                <p className="mt-2.5 text-[14px] leading-[1.5] text-ink-2">{s.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 4 — Built for three roles (light) ───────────────────────────────

interface RoleDef {
  id: string;
  label: string;
  persona: { name: string; initials: string; role: string; org: string; quote: string };
  impact: string;
  title: string;
  goal: string;
  slow: string;
  prepare: string;
  templateHref: string;
  templateLabel: string;
}

const ROLES: RoleDef[] = [
  {
    id: "analyst",
    label: "Investment & risk analyst",
    persona: {
      name: "Sarah Chen",
      initials: "SC",
      role: "Senior Risk Analyst",
      org: "Horizon Asset Management",
      quote:
        "By the time I manual-paste exposures across three spreadsheets, the market context has changed.",
    },
    impact: "Cuts prep time from 3 hours to 4 minutes",
    title: "Check positions against limits before the meeting.",
    goal: "See which positions use their limit and prepare the note a reviewer needs.",
    slow: "Assembling positions, concentration caps, and historical notes across fragmented workbooks.",
    prepare:
      "An auto-generated visual graph that pulls holdings, calculates limits, and flags breaches instantly.",
    templateHref: "#/workspace/workflows/position-risk",
    templateLabel: "Open the position risk review",
  },
  {
    id: "operations",
    label: "Finance operations",
    persona: {
      name: "Marcus Webb",
      initials: "MW",
      role: "Fund Operations Lead",
      org: "Atlas Fund Services",
      quote:
        "Chasing variance notes eats the morning; the review pack is always the last thing done.",
    },
    impact: "Reduces manual reconciliation backlog by 85%",
    title: "Reconcile NAV files and resolve exceptions.",
    goal: "Compare administrator and internal valuations, fund by fund.",
    slow: "Manually matching custodian files against internal accounting system reports every morning.",
    prepare:
      "Automated line-item reconciliation with custom variance thresholds and immediate exception routing.",
    templateHref: "#/workspace/workflows/nav-reconciliation",
    templateLabel: "Open the NAV reconciliation",
  },
  {
    id: "sme",
    label: "SME & corporate finance",
    persona: {
      name: "Priya Nair",
      initials: "PN",
      role: "Owner",
      org: "Harbour Lane Trading Co.",
      quote: "I just want to know where the cash stands before Monday's orders go out.",
    },
    impact: "Eliminates repetitive manual copy-pasting",
    title: "See cash movement and prepare the update.",
    goal: "Understand this week's cash position without rebuilding it across spreadsheets.",
    slow: "Drafting recurring executive commentary and cash movement summaries under tight deadlines.",
    prepare:
      "Structured data-to-briefing graphs that pull raw transaction data and draft checked summaries for editor approval.",
    templateHref: "#/workspace/templates",
    templateLabel: "Browse finance templates",
  },
];

function MiniFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-deep edge-lit overflow-hidden rounded-xl">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/50 px-3.5 py-2">
        <span className="truncate text-[12.5px] font-medium text-foreground">{title}</span>
        <SampleTag />
      </div>
      <div className="p-3.5">{children}</div>
    </div>
  );
}

const MINI_TH = "px-2 pb-2 text-left text-[11px] font-mono uppercase tracking-wider text-ink-3";
const MINI_TD = "px-2 py-1.5 align-top text-[11.5px] text-ink-2";

/* Status pills for the position-risk table (tokens: green/red, amber for near-limit). */
const RISK_PILL: Record<string, string> = {
  "Over limit": "bg-danger-tint text-danger border border-danger-border",
  "Near limit": "bg-warn-tint text-warn border border-warn-border",
  "Within limit": "bg-ok-tint text-ok border border-ok-border",
};

function RiskStatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded px-2 py-0.5 text-[11px] font-medium",
        RISK_PILL[status],
      )}
    >
      {status}
    </span>
  );
}

function AnalystPreview() {
  const rows = riskResults(90).slice(0, 5);
  return (
    <MiniFrame title="Position risk review (sample)">
      <div className="space-y-2.5" aria-hidden="true">
        {rows.map((r) => {
          const used = Math.min(100, (r.weight / r.limitPct) * 100);
          const hot = used >= 90;
          return (
            <div key={r.position} className="flex items-center gap-2.5">
              <span className="w-[104px] truncate text-[10.5px] text-ink-2">{r.position}</span>
              <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
                <span
                  className={cn(
                    "absolute inset-y-0 left-0 h-full rounded-full",
                    hot ? "bg-primary" : "bg-white/25",
                  )}
                  style={{ width: `${used}%` }}
                />
                <span className="absolute inset-y-[-2px] w-px bg-white/30" style={{ left: "100%" }} />
              </span>
              <span className="w-8 text-right font-mono text-xs text-ink-3">
                {fmtPct(used, 0)}
              </span>
            </div>
          );
        })}
      </div>
      <table className="mt-3 w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className={MINI_TH}>Position</th>
            <th className={cn(MINI_TH, "text-right")}>Weight</th>
            <th className={cn(MINI_TH, "text-right")}>Limit</th>
            <th className={MINI_TH}>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.position} className="border-b border-border/60 last:border-0">
              <td className={cn(MINI_TD, "font-medium text-foreground")}>{r.position}</td>
              <td className={cn(MINI_TD, "text-right font-mono text-ink-2 text-xs")}>
                {fmtPct(r.weight, 1)}
              </td>
              <td className={cn(MINI_TD, "text-right font-mono text-ink-2 text-xs")}>
                {fmtPct(r.limitPct, 0)}
              </td>
              <td className={cn(MINI_TD, "whitespace-nowrap")}>
                <RiskStatusPill status={r.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2.5 text-[11px] text-ink-3">
        Review threshold 90% of limit · source: sample positions file
      </p>
    </MiniFrame>
  );
}

function OperationsPreview() {
  const rows = navResults(0.5).slice(3, 7);
  return (
    <MiniFrame title="NAV reconciliation (sample)">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className={MINI_TH}>Fund</th>
            <th className={cn(MINI_TH, "text-right")}>Difference %</th>
            <th className={MINI_TH}>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.fund} className="border-b border-border/60 last:border-0">
              <td className={cn(MINI_TD, "font-medium text-foreground")}>{r.fund}</td>
              <td
                className={cn(
                  MINI_TD,
                  "text-right font-mono tabular-nums",
                  r.status === "Exception" && "font-medium text-danger",
                )}
              >
                {fmtSignedPct(r.diffPct)}
              </td>
              <td className={cn(MINI_TD, "whitespace-nowrap")}>
                <ToneChip tone={rowStatusTone(r.status)}>{r.status}</ToneChip>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-ink-3">
        <span
          className="inline-flex size-1.5 rounded-full bg-[#F59E0B]"
          aria-hidden="true"
        />
        2 exceptions paused for the Operations reviewer
      </p>
    </MiniFrame>
  );
}

function hkd(n: number): string {
  const sign = n < 0 ? "−" : n > 0 ? "+" : "";
  return `${sign}HK$${fmtInt(Math.abs(n))}`;
}

function SmePreview() {
  return (
    <MiniFrame title="Cashflow update (week of 28 Sep)">
      <dl className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-3 text-[12px]">
          <dt className="text-ink-2">Opening balance</dt>
          <dd className="font-mono tabular-nums text-foreground">HK${fmtInt(SME_CASHFLOW.opening)}</dd>
        </div>
        {SME_CASHFLOW.lines.map((l) => (
          <div key={l.label} className="flex items-baseline justify-between gap-3 text-[12px]">
            <dt className="text-ink-2">
              {l.label}
              <span className="ml-1.5 text-[10.5px] text-ink-3">{l.note}</span>
            </dt>
            <dd
              className={cn(
                "font-mono tabular-nums",
                l.amount < 0 ? "text-ink-3" : "text-ok",
              )}
            >
              {hkd(l.amount)}
            </dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-3 border-t border-border pt-1.5 text-[12.5px]">
          <dt className="font-medium text-foreground">Closing balance</dt>
          <dd className="font-mono font-medium tabular-nums text-foreground">
            HK${fmtInt(SME_CASHFLOW.closing)}
          </dd>
        </div>
      </dl>
      <ul className="mt-3 space-y-1.5 border-t border-border pt-2.5">
        {SME_CASHFLOW.tasks.map((t) => (
          <li key={t.label} className="flex items-center justify-between gap-3 text-[11.5px]">
            <span className="text-ink-2">{t.label}</span>
            <ToneChip tone={t.status === "Needs review" ? "warn" : "ok"}>{t.status}</ToneChip>
          </li>
        ))}
      </ul>
      <p className="mt-2.5 text-[11px] text-ink-3">
        Simulated cashflow · sample bank and invoice data
      </p>
    </MiniFrame>
  );
}

const ROLE_PREVIEWS: Record<string, () => React.ReactElement> = {
  analyst: AnalystPreview,
  operations: OperationsPreview,
  sme: SmePreview,
};

function PersonaBadge({
  persona,
}: {
  persona: RoleDef["persona"];
}) {
  return (
    <div className="flex items-center gap-3.5">
      <span
        aria-hidden="true"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white/[0.06] font-mono font-semibold text-ink-2 text-xs"
      >
        {persona.initials}
      </span>
      <div className="min-w-0">
        <p className="text-[14.5px] font-semibold text-foreground">{persona.name}</p>
        <p className="truncate text-[12px] text-ink-3">
          {persona.role} · {persona.org}
        </p>
      </div>
    </div>
  );
}

function RolePanel({ role }: { role: RoleDef }) {
  const Preview = ROLE_PREVIEWS[role.id];
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,45fr)_minmax(0,55fr)] lg:gap-12">
      {/* Persona & needs */}
      <div>
        <PersonaBadge persona={role.persona} />
        <blockquote className="mt-4 border-l-2 border-primary/60 pl-4 text-sm font-normal italic leading-relaxed text-ink-2">
          "{role.persona.quote}"
        </blockquote>

        <div className="mt-5 grid gap-3">
          <div className="rounded-r-lg border-l-2 border-danger/70 bg-white/[0.03] p-3 text-xs">
            <p className="mb-1 font-mono font-semibold uppercase tracking-wider text-danger text-[11px]">
              Friction
            </p>
            <p className="text-ink-2">{role.slow}</p>
          </div>
          <div className="rounded-r-lg border-l-2 border-ok/70 bg-white/[0.03] p-3 text-xs">
            <p className="mb-1 font-mono font-semibold uppercase tracking-wider text-ok text-[11px]">
              What Payo delivers
            </p>
            <p className="text-ink-2">{role.prepare}</p>
          </div>
        </div>

        <p className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-xs font-medium text-primary-ink">
          <Zap className="size-3.5" aria-hidden="true" />
          Efficiency gain: {role.impact}
        </p>

        <a
          href={role.templateHref}
          className="mt-5 flex items-center gap-1.5 text-[13px] font-medium text-primary-ink transition-colors hover:text-white"
        >
          {role.templateLabel}
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </a>
        <p className="mt-3 text-[10.5px] text-ink-3">Simulated persona, for illustration.</p>
      </div>

      {/* Live UI canvas */}
      <div>{Preview ? <Preview /> : null}</div>
    </div>
  );
}

export function RolesSection() {
  return (
    <section id="roles" className={cn(SECTION_169, "band-alt band-rule")}>
      <div className="mx-auto w-full max-w-[1720px] px-6 py-16 sm:px-12 lg:px-24 lg:py-20">
        <Eyebrow>Built for your entire finance team</Eyebrow>
        <h2 className={SECTION_HEADING}>One visual language. Three core personas.</h2>

        <Tabs defaultValue="analyst" className="mt-8">
          <TabsList
            className="h-auto w-full flex-wrap justify-start gap-1.5 bg-transparent p-0 sm:w-fit sm:self-start"
            aria-label="Choose a role"
          >
            {ROLES.map((r) => (
              <TabsTrigger
                key={r.id}
                value={r.id}
                className="flex-none rounded-lg border border-transparent bg-white/[0.04] px-4 py-2 text-[13px] font-medium text-ink-2 transition-colors hover:bg-white/[0.07] hover:text-white data-[state=active]:border-white/[0.18] data-[state=active]:bg-white/[0.10] data-[state=active]:font-medium data-[state=active]:text-white data-[state=active]:hover:bg-white/[0.10] data-[state=active]:hover:text-white"
              >
                {r.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {ROLES.map((r) => (
            <TabsContent key={r.id} value={r.id} className="mt-8 outline-none">
              <RolePanel role={r} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}

// ─── SECTION 5 — Connections ─────────────────────────────────────────────────

const RAIL: { type: StepTypeId; label: string }[] = [
  { type: "load", label: "Load data" },
  { type: "map", label: "Map fields" },
  { type: "calculate", label: "Calculate" },
  { type: "check", label: "Check limit" },
  { type: "review", label: "Review" },
  { type: "report", label: "Report" },
];

function SourceIcon({ source }: { source: ConnectorGroup["sources"][number] }) {
  if (source.icon) {
    return (
      <img
        src={`/icons/${source.icon}`}
        alt=""
        className="size-[16px] object-contain"
        loading="lazy"
      />
    );
  }
  const initials = source.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return <span className="text-[9px] font-semibold text-ink-2">{initials}</span>;
}

export function ConnectorsSection() {
  const [selectedId, setSelectedId] = useState(PLANNED_CONNECTORS[0].id);
  const selected =
    PLANNED_CONNECTORS.find((c) => c.id === selectedId) ?? PLANNED_CONNECTORS[0];

  return (
    <section id="connections" className={cn(SECTION_169, "band-alt band-rule")}>
      <div className="mx-auto w-full max-w-[1720px] px-6 py-16 sm:px-12 lg:px-24 lg:py-20">
        <Eyebrow>Connections</Eyebrow>
        <h2 className={cn(SECTION_HEADING, "text-white")}>The sources behind every step.</h2>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ink-2">
          Payo is designed to read the files and feeds finance teams already use. This prototype
          runs on the sample files below, nothing else is connected.
        </p>

        {/* Workflow rail */}
        <div className="mt-8 flex flex-wrap items-center gap-1.5" aria-hidden="true">
          {RAIL.map((step, i) => {
            const active = selected.feeds.includes(step.type);
            return (
              <div key={step.type} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="size-3.5 text-ink-3" />}
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11.5px] font-medium transition-colors",
                    active
                      ? "border-primary/40 bg-primary/10 text-primary-ink"
                      : "border-border bg-white/[0.04] text-ink-3",
                  )}
                >
                  <StepTypeIcon type={step.type} className="size-3.5" />
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Connector grid */}
        <div className="mt-5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {PLANNED_CONNECTORS.map((c) => {
            const active = c.id === selected.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                aria-pressed={active}
                aria-controls="connector-inspector"
                className={cn(
                  "glass glass-hover group flex flex-col rounded-xl p-4 text-left transition-all duration-300",
                  active && "!border-white/[0.22]",
                )}
              >
                <div className="relative h-7 w-[104px]">
                  {c.sources.slice(0, 4).map((s, i) => (
                    <span
                      key={s.name}
                      style={
                        {
                          "--i": i,
                          zIndex: i,
                        } as React.CSSProperties
                      }
                      className="absolute left-0 top-0 grid size-7 place-items-center overflow-hidden rounded-md border border-white/[0.14] bg-[#F4F6F8] shadow-sm transition-transform duration-300 ease-out group-hover:translate-x-[calc(var(--i)*21px)] group-focus-visible:translate-x-[calc(var(--i)*21px)]"
                    >
                      <SourceIcon source={s} />
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-[13px] font-medium leading-snug text-white">{c.name}</p>
                <p className="mt-1 text-[11.5px] leading-snug text-ink-3">{c.functionLabel}</p>
              </button>
            );
          })}
        </div>

        {/* Inspector */}
        <div
          id="connector-inspector"
          className="glass mt-4 grid gap-5 rounded-xl p-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
        >
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[14.5px] font-semibold text-white">{selected.name}</h3>
              <span className="inline-flex items-center rounded-full border border-white/[0.12] bg-white/[0.05] px-1.5 py-0.5 text-[10.5px] font-medium text-ink-3">
                Demo only · not connected
              </span>
            </div>
            <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-ink-2">
              {selected.description}
            </p>
            <p className="mt-3 text-[11.5px] text-ink-3">
              Illustrative method: {selected.method}. No external service is called in this
              prototype.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                Sources
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {selected.sources.map((s) => (
                  <li
                    key={s.name}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/[0.05] px-2 py-1 text-[11.5px] text-ink-2"
                  >
                    <span className="grid size-4 place-items-center overflow-hidden">
                      <SourceIcon source={s} />
                    </span>
                    {s.name}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                Would feed
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {selected.feeds.map((f) => (
                  <li
                    key={f}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-[11.5px] font-medium text-primary-ink"
                  >
                    <StepTypeIcon type={f} className="size-3.5" />
                    {RAIL.find((r) => r.type === f)?.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Available now */}
        <div className="mt-4 rounded-xl border border-dashed border-white/[0.16] bg-white/[0.02] px-4 py-3.5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-3">
              Available now
            </span>
            {SAMPLE_INPUTS.map((s) => (
              <span
                key={s.name}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] px-2 py-1 text-[11.5px] text-ink-2"
              >
                <FileText className="size-3.5 text-ink-3" aria-hidden="true" />
                {s.name}
                <span className="text-ink-3">· {s.detail}</span>
              </span>
            ))}
          </div>
          <p className="mt-2 text-[11.5px] text-ink-3">
            No live connections are configured. This prototype uses sample inputs.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 8 — Trust & licensing ───────────────────────────────────────────

const CONTROL_POINTS = [
  {
    title: "Step-by-step node visibility",
    body: "Every data transformation is visually rendered before execution. What you see in the graph is exactly what runs.",
  },
  {
    title: "Mandatory approval gates",
    body: "Configure strict criteria where execution must pause for a human sign-off. No automated actions occur silently.",
  },
  {
    title: "Complete lineage & source tracking",
    body: "Every output cell references its exact source file, timestamp, and mathematical formula for painless internal audit reviews.",
  },
];

export function TrustSection() {
  return (
    <section id="trust" className={cn(SECTION_169, "band-alt band-rule")}>
      <div className="mx-auto w-full max-w-[1720px] px-6 py-16 sm:px-12 lg:px-24 lg:py-20">
        <Eyebrow>Enterprise control &amp; governance</Eyebrow>
        <h2 className={SECTION_HEADING}>Designed for regulated standards. Built for zero risk.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {CONTROL_POINTS.map((c) => (
            <div key={c.title} className="glass glass-hover rounded-xl p-5">
              <span
                className=                "grid size-8 place-items-center rounded-lg border border-ok-border bg-ok-tint text-ok"
                aria-hidden="true"
              >
                <Check className="size-4" strokeWidth={2.5} />
              </span>
              <h3 className="mt-3.5 text-[14.5px] font-semibold leading-snug text-foreground">
                {c.title}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">{c.body}</p>
            </div>
          ))}
        </div>

        <div className="glass mt-6 rounded-xl p-6">
          <h3 className="text-[14.5px] font-semibold text-foreground">About licensed firms</h3>
          <p className="mt-3 max-w-3xl text-[13.5px] leading-relaxed text-ink-2">
            Some Hong Kong financial firms need a licence from the Securities and Futures
            Commission (SFC) to carry out particular regulated activities. For example, Type 9
            covers asset management. Payo is designed for the operational work used by finance
            teams, including teams at licensed firms. Payo is not an SFC-licensed firm and this
            prototype does not provide compliance determinations.
          </p>
          <a
            href="https://www.sfc.hk/en/Regulatory-functions/Intermediaries/Licensing/Do-you-need-a-licence-or-registration"
            target="_blank"
            rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary-ink transition-colors hover:text-white"
          >
            How SFC licensing works
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
          <p className="mt-4 border-t border-border pt-3 text-[11.5px] leading-relaxed text-ink-3">
            General information only. This prototype is a design demonstration and does not provide
            legal or regulatory advice.
          </p>
        </div>
      </div>
    </section>
  );
}
