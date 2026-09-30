"use client";

import { useState } from "react";
import { ArrowRight, ExternalLink, FileText } from "lucide-react";

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
  "mt-4 max-w-xl text-[28px] font-semibold leading-tight tracking-[-0.01em] md:text-[32px]";

// ─── Evidence strip ──────────────────────────────────────────────────────────

export function EvidenceStrip() {
  return (
    <section id="evidence" className="border-t border-border/70 bg-card/50">
      <div className="mx-auto max-w-6xl px-6 py-14 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-center lg:gap-14">
          <div>
            <Eyebrow>Why this exists</Eyebrow>
            <h2 className={SECTION_HEADING}>Heavy investment, hard-to-show value.</h2>
            <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-ink-2">
              Financial firms are investing heavily in AI, yet many struggle to connect that
              activity to measurable value. Payo works on the operational layer where value is
              created: visible steps, sample-backed checks, and a human review before anything is
              released.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-[24px] font-semibold tracking-[-0.01em] tabular-nums">
                USD 76bn
                <span className="mx-1.5 text-ink-3" aria-hidden="true">
                  →
                </span>
                USD 132bn
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-ink-2">
                Estimated AI-related investment by global financial institutions in 2025, forecast
                to reach USD 132bn by 2030.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-[24px] font-semibold tracking-[-0.01em] tabular-nums">71%</p>
              <p className="mt-2 text-[12px] leading-relaxed text-ink-2">
                of surveyed traditional financial institutions said they found it difficult to
                understand, capture and justify AI value (n = 101).
              </p>
            </div>
          </div>
        </div>
        <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-3">
          <span>
            Source: Quinlan &amp; Associates, From Pie in the Sky to ROI (July 2026), pp. 2 and 9.
          </span>
          <a
            href="https://www.quinlanandassociates.com/wp-content/uploads/2026/07/Quinlan-Associates-From-Pie-in-the-Sky-to-ROI.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-primary-ink transition-colors hover:text-primary-deep"
          >
            Read the report
            <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        </p>
      </div>
    </section>
  );
}

// ─── Built for three roles ───────────────────────────────────────────────────

interface RoleDef {
  id: string;
  label: string;
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
    title: "Check positions against limits before the meeting.",
    goal: "See which positions use their limit and prepare the note a reviewer needs.",
    slow: "Assembling exposures, limits and prior notes across separate spreadsheets.",
    prepare: "A reviewed risk summary with flagged positions, notes and sample sources.",
    templateHref: "#/workspace/workflows/position-risk",
    templateLabel: "Open the position risk review",
  },
  {
    id: "operations",
    label: "Finance operations",
    title: "Reconcile NAV files and resolve exceptions.",
    goal: "Compare administrator and internal valuations, fund by fund.",
    slow: "Chasing variance notes and rolling exceptions into a review pack by hand.",
    prepare: "A reconciliation summary with exceptions awaiting a named reviewer.",
    templateHref: "#/workspace/workflows/nav-reconciliation",
    templateLabel: "Open the NAV reconciliation",
  },
  {
    id: "sme",
    label: "SME owner or finance staff",
    title: "See cash movement and prepare the update.",
    goal: "Understand this week's cash position without rebuilding it across spreadsheets.",
    slow: "Pulling bank, invoice and payroll figures together for the same weekly update.",
    prepare: "A plain cashflow update and a short list of finance tasks with owners.",
    templateHref: "#/workspace/templates",
    templateLabel: "Browse finance templates",
  },
];

function MiniFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line-strong bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-background px-3.5 py-2">
        <span className="truncate text-[12.5px] font-medium">{title}</span>
        <SampleTag />
      </div>
      <div className="p-3.5">{children}</div>
    </div>
  );
}

const MINI_TH = "px-2 py-1.5 text-left text-[10.5px] font-medium text-ink-3";
const MINI_TD = "px-2 py-1.5 align-top text-[11.5px] text-ink-2";

function AnalystPreview() {
  const rows = riskResults(90).slice(0, 5);
  return (
    <MiniFrame title="Position risk review (sample)">
      <table className="w-full border-collapse">
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
            <tr key={r.position} className="border-b border-border/70 last:border-0">
              <td className={cn(MINI_TD, "font-medium text-foreground")}>{r.position}</td>
              <td className={cn(MINI_TD, "text-right tabular-nums")}>{fmtPct(r.weight, 1)}</td>
              <td className={cn(MINI_TD, "text-right tabular-nums")}>{fmtPct(r.limitPct, 0)}</td>
              <td className={cn(MINI_TD, "whitespace-nowrap")}>
                <ToneChip tone={rowStatusTone(r.status)}>{r.status}</ToneChip>
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
            <tr key={r.fund} className="border-b border-border/70 last:border-0">
              <td className={cn(MINI_TD, "font-medium text-foreground")}>{r.fund}</td>
              <td
                className={cn(
                  MINI_TD,
                  "text-right tabular-nums",
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
        <span className="inline-flex size-1.5 rounded-full bg-warn" aria-hidden="true" />
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
          <dd className="tabular-nums text-foreground">HK${fmtInt(SME_CASHFLOW.opening)}</dd>
        </div>
        {SME_CASHFLOW.lines.map((l) => (
          <div key={l.label} className="flex items-baseline justify-between gap-3 text-[12px]">
            <dt className="text-ink-2">
              {l.label}
              <span className="ml-1.5 text-[10.5px] text-ink-3">{l.note}</span>
            </dt>
            <dd className={cn("tabular-nums", l.amount < 0 ? "text-ink-2" : "text-ok")}>
              {hkd(l.amount)}
            </dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-3 border-t border-border pt-1.5 text-[12.5px]">
          <dt className="font-medium text-foreground">Closing balance</dt>
          <dd className="font-medium tabular-nums text-foreground">
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

function RolePanel({ role }: { role: RoleDef }) {
  const Preview = ROLE_PREVIEWS[role.id];
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10">
      <div>
        <h3 className="text-[18px] font-semibold leading-snug tracking-[-0.01em]">{role.title}</h3>
        <dl className="mt-4 space-y-3.5">
          {[
            { label: "Goal", value: role.goal },
            { label: "What slows them down", value: role.slow },
            { label: "What Payo helps prepare", value: role.prepare },
          ].map((row) => (
            <div key={row.label} className="border-l-2 border-primary/40 pl-3.5">
              <dt className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                {row.label}
              </dt>
              <dd className="mt-1 text-[13.5px] leading-relaxed text-ink-2">{row.value}</dd>
            </div>
          ))}
        </dl>
        <a
          href={role.templateHref}
          className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary-ink transition-colors hover:text-primary-deep"
        >
          {role.templateLabel}
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </a>
      </div>
      <div>{Preview ? <Preview /> : null}</div>
    </div>
  );
}

export function RolesSection() {
  return (
    <section id="roles" className="border-t border-border/70">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <Eyebrow>Built for three roles</Eyebrow>
        <h2 className={SECTION_HEADING}>One workflow language, three working lives.</h2>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ink-2">
          Payo serves finance professionals and small businesses without making either feel like
          they joined the wrong product. Select a role to see the same pattern in its own words.
        </p>

        <Tabs defaultValue="analyst" className="mt-8">
          <TabsList
            className="h-auto w-full flex-wrap justify-start gap-1 rounded-lg border border-border bg-muted/50 p-1 sm:w-auto"
            aria-label="Choose a role"
          >
            {ROLES.map((r) => (
              <TabsTrigger
                key={r.id}
                value={r.id}
                className="rounded-md px-3.5 py-2 text-[13px] data-[state=active]:border data-[state=active]:border-line-strong data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                {r.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {ROLES.map((r) => (
            <TabsContent key={r.id} value={r.id} className="mt-6 outline-none">
              <RolePanel role={r} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}

// ─── Planned connections ─────────────────────────────────────────────────────

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
    <section id="connections" className="border-t border-border/70 bg-card/50">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <Eyebrow>Planned connections</Eyebrow>
        <h2 className={SECTION_HEADING}>The sources behind every step.</h2>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ink-2">
          Payo is designed to read the files and feeds finance teams already use. Everything below
          is a planned connection for future releases. Nothing here is connected in this
          prototype.
        </p>

        {/* Workflow rail */}
        <div
          className="mt-8 flex flex-wrap items-center gap-1.5"
          aria-hidden="true"
        >
          {RAIL.map((step, i) => {
            const active = selected.feeds.includes(step.type);
            return (
              <div key={step.type} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-ink-3/40">→</span>}
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11.5px] font-medium transition-colors",
                    active
                      ? "border-primary-soft bg-primary-tint text-primary-ink"
                      : "border-border bg-card text-ink-3",
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
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                  "group flex flex-col rounded-lg border bg-card p-4 text-left transition-colors",
                  active ? "border-primary" : "border-border hover:border-line-strong",
                )}
              >
                <div className="flex items-start justify-between gap-2">
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
                        className="absolute left-0 top-0 grid size-7 place-items-center overflow-hidden rounded-md border border-border bg-white shadow-sm transition-transform duration-300 ease-out group-hover:translate-x-[calc(var(--i)*21px)] group-focus-visible:translate-x-[calc(var(--i)*21px)]"
                      >
                        <SourceIcon source={s} />
                      </span>
                    ))}
                  </div>
                  <span className="inline-flex shrink-0 items-center rounded-sm bg-neutral-tint px-1.5 py-0.5 text-[10.5px] font-medium text-ink-2">
                    Planned
                  </span>
                </div>
                <p className="mt-3 text-[13px] font-medium leading-snug">{c.name}</p>
                <p className="mt-1 text-[11.5px] leading-snug text-ink-2">{c.functionLabel}</p>
              </button>
            );
          })}
        </div>

        {/* Inspector */}
        <div
          id="connector-inspector"
          className="mt-4 grid gap-5 rounded-lg border border-border bg-card p-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
        >
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[14.5px] font-semibold">{selected.name}</h3>
              <span className="inline-flex items-center rounded-sm bg-neutral-tint px-1.5 py-0.5 text-[10.5px] font-medium text-ink-2">
                Planned, not connected
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
                    className="inline-flex items-center gap-1.5 rounded border border-border bg-background px-2 py-1 text-[11.5px] text-ink-2"
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
                    className="inline-flex items-center gap-1.5 rounded border border-primary-soft bg-primary-tint px-2 py-1 text-[11.5px] font-medium text-primary-ink"
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
        <div className="mt-4 rounded-md border border-dashed border-line-strong bg-card/60 px-4 py-3.5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-3">
              Available now
            </span>
            {SAMPLE_INPUTS.map((s) => (
              <span
                key={s.name}
                className="inline-flex items-center gap-1.5 rounded border border-border bg-card px-2 py-1 text-[11.5px] text-ink-2"
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

// ─── Trust & licensing ───────────────────────────────────────────────────────

const CONTROL_POINTS = [
  {
    title: "Every workflow has visible steps",
    body: "Load, calculate, check, review, report. All visible before and during every run.",
  },
  {
    title: "Review before release",
    body: "Material items pause for a person. Nothing is finalised until someone approves it.",
  },
  {
    title: "Source before output",
    body: "Results carry their sample source and threshold, so each figure can be traced.",
  },
];

export function TrustSection() {
  return (
    <section id="trust" className="border-t border-border/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div>
          <Eyebrow>Control by design</Eyebrow>
          <h2 className={SECTION_HEADING}>Nothing leaves without a review.</h2>
          <ul className="mt-6 space-y-4">
            {CONTROL_POINTS.map((c) => (
              <li key={c.title}>
                <h3 className="border-l-2 border-primary/50 pl-3.5 text-[14.5px] font-semibold leading-snug">
                  {c.title}
                </h3>
                <p className="mt-1.5 pl-3.5 text-[13px] leading-relaxed text-ink-2">{c.body}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-[14.5px] font-semibold">About licensed firms</h3>
          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">
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
            className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary-ink transition-colors hover:text-primary-deep"
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
