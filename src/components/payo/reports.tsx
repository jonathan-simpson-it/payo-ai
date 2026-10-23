"use client";

import { Check } from "lucide-react";

import {
  BRIEFING_DATE,
  BRIEFING_ITEMS,
  BRIEFING_RELEVANCE,
  BRIEFING_SNAPSHOT_NOTES,
  GENERIC_RECORDS,
  HOLDING_LINKS,
  MARKET_SNAPSHOT,
  NAV_VALUATION_DATE,
  RISK_AS_AT,
  RISK_PORTFOLIO_TOTAL,
  bankExceptions,
  bankResults,
  navExceptions,
  navResults,
  navTotals,
  notableMoves,
  riskResults,
  type BankRowStatus,
  type BankResultRow,
  type NavResultRow,
  type RiskResultRow,
} from "@/lib/payo/data";
import { fmtHKD, fmtInt, fmtPct, fmtSignedHKD, fmtSignedPct } from "@/lib/payo/format";
import type { RunConfig, RunReview, SampleProfile } from "@/lib/payo/types";
import { SampleTag, ScrollFade, ToneChip, rowStatusTone, useScrollEdge } from "@/components/payo/ui";
import { cn } from "@/lib/utils";
import { useRef } from "react";

// ─── Shared table primitives ─────────────────────────────────────────────────

function TableShell({ children, minWidth = 620 }: { children: React.ReactNode; minWidth?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollable, atEnd } = useScrollEdge(ref);
  return (
    <div className="relative">
      <div ref={ref} className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full border-collapse text-[12.5px]" style={{ minWidth }}>
          {children}
        </table>
      </div>
      <ScrollFade show={scrollable && !atEnd} />
    </div>
  );
}

const TH =
  "px-3 py-2 text-left align-bottom text-[11.5px] font-medium leading-tight text-ink-3";
const TH_R =
  "px-3 py-2 text-right align-bottom text-[11.5px] font-medium leading-tight text-ink-3";
const TD = "px-3 py-2.5 align-top text-ink-2";
const TD_R = "whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-ink-2";

// ─── NAV tables ──────────────────────────────────────────────────────────────

function NavTable({ rows, full }: { rows: NavResultRow[]; full?: boolean }) {
  return (
    <TableShell minWidth={full ? 740 : 640}>
      <thead>
        <tr className="border-b border-border">
          <th className={TH}>Fund</th>
          <th className={TH_R}>Administrator NAV (HK$)</th>
          <th className={TH_R}>Internal NAV (HK$)</th>
          <th className={TH_R}>Difference (HK$)</th>
          <th className={TH_R}>Difference %</th>
          {full && <th className={TH}>Status</th>}
          <th className={TH}>Note</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.fund} className="border-b border-border/70 last:border-0">
            <td
              className={cn(
                "px-3 py-2.5 font-medium text-foreground",
                !full && "whitespace-nowrap",
              )}
            >
              {r.fund}
            </td>
            <td className={TD_R}>{fmtInt(r.adminNav)}</td>
            <td className={TD_R}>{fmtInt(r.internalNav)}</td>
            <td className={cn(TD_R, r.status === "Exception" && "font-medium text-danger")}>
              {fmtSignedHKD(r.difference)}
            </td>
            <td className={cn(TD_R, r.status === "Exception" && "font-medium text-danger")}>
              {fmtSignedPct(r.diffPct)}
            </td>
            {full && (
              <td className="whitespace-nowrap px-3 py-2.5">
                <ToneChip tone={rowStatusTone(r.status)}>{r.status}</ToneChip>
              </td>
            )}
            <td className={cn(TD, "max-w-[190px] text-[12px] leading-snug")}>{r.note}</td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

// ─── Risk tables ─────────────────────────────────────────────────────────────

function RiskTable({ rows }: { rows: RiskResultRow[] }) {
  return (
    <TableShell minWidth={760}>
      <thead>
        <tr className="border-b border-border">
          <th className={TH}>Position</th>
          <th className={TH}>Asset type</th>
          <th className={TH_R}>Market value (HK$)</th>
          <th className={TH_R}>Portfolio weight</th>
          <th className={TH_R}>Applicable limit</th>
          <th className={TH}>Status</th>
          <th className={TH}>Reviewer note</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.position} className="border-b border-border/70 last:border-0">
            <td className="whitespace-nowrap px-3 py-2.5 font-medium text-foreground">{r.position}</td>
            <td className={cn(TD, "whitespace-nowrap text-[12px]")}>{r.assetType}</td>
            <td className={TD_R}>{fmtInt(r.marketValue)}</td>
            <td className={cn(TD_R, r.status !== "Within limit" && "font-medium")}>
              {fmtPct(r.weight, 1)}
            </td>
            <td className={TD_R}>{fmtPct(r.limitPct, 0)}</td>
            <td className="whitespace-nowrap px-3 py-2.5">
              <ToneChip tone={rowStatusTone(r.status)}>{r.status}</ToneChip>
            </td>
            <td className={cn(TD, "max-w-[200px] text-[12px] leading-snug")}>{r.reviewerNote}</td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

// ─── Bank reconciliation tables ──────────────────────────────────────────────

function bankTone(status: BankRowStatus) {
  if (status === "Matched") return "positive";
  if (status === "Difference") return "warn";
  return "danger";
}

export function BankTable({ rows }: { rows: BankResultRow[] }) {
  return (
    <TableShell minWidth={1020}>
      <thead>
        <tr className="border-b border-border">
          <th className={TH}>TID</th>
          <th className={TH}>Ledger UID</th>
          <th className={TH}>Date</th>
          <th className={TH}>Description</th>
          <th className={TH_R}>Bank (HK$)</th>
          <th className={TH_R}>Ledger (HK$)</th>
          <th className={TH_R}>Difference</th>
          <th className={TH}>Status</th>
          <th className={TH}>Note</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id} className="border-b border-border/70 last:border-0">
            <td className={cn(TD, "whitespace-nowrap font-mono text-[11.5px]")}>{r.tid}</td>
            <td className={cn(TD, "whitespace-nowrap font-mono text-[11.5px]")}>
              {r.ledgerUid ?? "—"}
            </td>
            <td className={cn(TD, "whitespace-nowrap text-[12px]")}>{r.date}</td>
            <td className={cn(TD, "min-w-[190px]")}>
              <span className="font-medium text-foreground">{r.description}</span>
              <span className="mt-0.5 block font-mono text-[11px] text-ink-3">{r.reference}</span>
            </td>
            <td className={TD_R}>{fmtInt(r.amount)}</td>
            <td className={TD_R}>{r.ledgerAmount == null ? "—" : fmtInt(r.ledgerAmount)}</td>
            <td className={cn(TD_R, r.status !== "Matched" && "font-medium text-danger")}>
              {r.difference == null ? "—" : fmtSignedHKD(r.difference)}
            </td>
            <td className="whitespace-nowrap px-3 py-2.5">
              <ToneChip tone={bankTone(r.status)}>{r.status}</ToneChip>
            </td>
            <td className={cn(TD, "max-w-[220px] text-[12px] leading-snug")}>{r.note}</td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

// ─── Market tables ───────────────────────────────────────────────────────────

function changeLabel(group: string, changePct: number): string {
  if (group === "Rates") {
    const bp = Math.round(changePct * 100);
    return `${bp > 0 ? "+" : bp < 0 ? "−" : ""}${Math.abs(bp)}bp`;
  }
  return fmtSignedPct(changePct, 1);
}

function MarketSnapshotTable() {
  return (
    <TableShell minWidth={420}>
      <thead>
        <tr className="border-b border-border">
          <th className={TH}>Instrument</th>
          <th className={TH}>Group</th>
          <th className={TH_R}>Level</th>
          <th className={TH_R}>Change</th>
        </tr>
      </thead>
      <tbody>
        {MARKET_SNAPSHOT.map((m) => (
          <tr key={m.instrument} className="border-b border-border/70 last:border-0">
            <td className="whitespace-nowrap px-3 py-2 font-medium text-foreground">{m.instrument}</td>
            <td className={cn(TD, "text-[12px]")}>{m.group}</td>
            <td className={TD_R}>{m.level}</td>
            <td
              className={cn(
                TD_R,
                Math.abs(m.changePct) >= 0.75 && "font-medium",
                m.changePct < -0.75 && "text-danger",
              )}
            >
              {changeLabel(m.group, m.changePct)}
            </td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

function HoldingLinksTable() {
  return (
    <TableShell minWidth={660}>
      <thead>
        <tr className="border-b border-border">
          <th className={TH}>Holding</th>
          <th className={TH}>Exposure</th>
          <th className={TH}>Related move</th>
          <th className={TH_R}>Est. impact</th>
          <th className={TH}>Note</th>
        </tr>
      </thead>
      <tbody>
        {HOLDING_LINKS.map((h) => (
          <tr key={h.holding} className="border-b border-border/70 last:border-0">
            <td className="whitespace-nowrap px-3 py-2.5 font-medium text-foreground">{h.holding}</td>
            <td className={cn(TD, "text-[12px]")}>{h.exposure}</td>
            <td className={cn(TD, "whitespace-nowrap text-[12px]")}>{h.move}</td>
            <td className={cn(TD_R, "font-medium")}>{fmtSignedHKD(h.estImpact)}</td>
            <td className={cn(TD, "max-w-[200px] text-[12px] leading-snug")}>{h.note}</td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

// ─── Generic sample tables (described workflows) ─────────────────────────────

function genericThreshold(config: RunConfig): number {
  return Number(config.notableThreshold ?? config.tolerance ?? 1);
}

type GenericStatus = "Within range" | "Flagged";

function genericRows(config: RunConfig): { label: string; value: number; status: GenericStatus; note: string }[] {
  const t = genericThreshold(config);
  return GENERIC_RECORDS.map((r) => ({
    label: r.label,
    value: r.value,
    status: (r.value > t ? "Flagged" : "Within range") as GenericStatus,
    note: r.note,
  }));
}

function genericTone(status: GenericStatus) {
  return status === "Flagged" ? "danger" : "neutral";
}

function GenericTableInner({ rows, onlyFlagged }: { rows: ReturnType<typeof genericRows>; onlyFlagged?: boolean }) {
  return (
    <TableShell minWidth={440}>
      <thead>
        <tr className="border-b border-border">
          <th className={TH}>Item</th>
          <th className={TH_R}>Value</th>
          <th className={TH}>Status</th>
          <th className={TH}>Note</th>
        </tr>
      </thead>
      <tbody>
        {(onlyFlagged ? rows.filter((r) => r.status === "Flagged") : rows).map((r) => (
          <tr key={r.label} className="border-b border-border/70 last:border-0">
            <td className="whitespace-nowrap px-3 py-2.5 font-medium text-foreground">{r.label}</td>
            <td className={cn(TD_R, r.status === "Flagged" && "font-medium text-danger")}>{r.value.toFixed(2)}</td>
            <td className="whitespace-nowrap px-3 py-2.5">
              <ToneChip tone={genericTone(r.status)}>{r.status}</ToneChip>
            </td>
            <td className={cn(TD, "max-w-[200px] text-[12px] leading-snug")}>{r.note}</td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

// ─── Review gate content ─────────────────────────────────────────────────────

export function reviewApproveLabel(profile: SampleProfile): string {
  return profile === "market" ? "Approve briefing" : "Approve summary";
}

export function ReviewContent({ profile, config }: { profile: SampleProfile; config: RunConfig }) {
  if (profile === "nav") {
    const tol = config.tolerance ?? 0.5;
    const ex = navExceptions(tol);
    return (
      <div className="space-y-4">
        <p className="text-[13.5px] leading-relaxed text-ink-2">
          {ex.length === 0 ? (
            <>No funds breach the ±{tol.toFixed(2)}% tolerance. Confirm the summary can be completed.</>
          ) : (
            <>
              {ex.length} material variance{ex.length === 1 ? "" : "s"} need review before the
              reconciliation summary can be completed. Tolerance ±{tol.toFixed(2)}%.
            </>
          )}
        </p>
        {ex.length > 0 && <NavTable rows={ex} />}
      </div>
    );
  }

  if (profile === "risk") {
    const threshold = config.reviewThreshold ?? 90;
    const rows = riskResults(threshold);
    const flagged = rows.filter((r) => r.status !== "Within limit");
    const over = rows.filter((r) => r.status === "Over limit").length;
    const near = rows.filter((r) => r.status === "Near limit").length;
    return (
      <div className="space-y-4">
        <p className="text-[13.5px] leading-relaxed text-ink-2">
          {over} position{over === 1 ? " is" : "s are"} over the applicable limit
          {near > 0 && <> and {near} {near === 1 ? "is" : "are"} using at least {threshold}% of it</>}
          . Confirm each note before the risk summary is published.
        </p>
        <RiskTable rows={flagged} />
      </div>
    );
  }

  if (profile === "market") {
    return (
      <div className="space-y-4">
        <p className="text-[13.5px] leading-relaxed text-ink-2">
          These holdings-related moves need an editor check before the briefing is exported.
          Estimated impacts are simulated.
        </p>
        <HoldingLinksTable />
      </div>
    );
  }

  if (profile === "bank") {
    const ex = bankExceptions();
    return (
      <div className="space-y-4">
        <p className="text-[13.5px] leading-relaxed text-ink-2">
          {ex.length} payment{ex.length === 1 ? "" : "s"} need review before the reconciliation
          summary can be completed. Unmatched items have no ledger entry; differences are shown
          against the bank amount.
        </p>
        {ex.length > 0 && <BankTable rows={ex} />}
      </div>
    );
  }

  const rows = genericRows(config);
  const flagged = rows.filter((r) => r.status === "Flagged");
  return (
    <div className="space-y-4">
      <p className="text-[13.5px] leading-relaxed text-ink-2">
        {flagged.length === 0 ? (
          <>No items are outside the {genericThreshold(config).toFixed(2)}% range. Confirm the output can be completed.</>
        ) : (
          <>
            {flagged.length} item{flagged.length === 1 ? "" : "s"} are outside the{" "}
            {genericThreshold(config).toFixed(2)}% range and need review before the output is released.
          </>
        )}
      </p>
      {flagged.length > 0 && <GenericTableInner rows={rows} onlyFlagged />}
    </div>
  );
}

// ─── Findings (run detail) ───────────────────────────────────────────────────

export function FindingsSection({ profile, config }: { profile: SampleProfile; config: RunConfig }) {
  if (profile === "nav") {
    const tol = config.tolerance ?? 0.5;
    const t = navTotals(tol);
    return (
      <div className="space-y-3">
        <p className="text-[13px] text-ink-2">
          {t.fundCount} funds checked · {t.matched} matched · {t.within} within tolerance ·{" "}
          <span className="font-medium text-danger">{t.exceptions} exceptions</span> · Tolerance
          ±{tol.toFixed(2)}%
        </p>
        <NavTable rows={navResults(tol)} full />
      </div>
    );
  }

  if (profile === "risk") {
    const threshold = config.reviewThreshold ?? 90;
    const rows = riskResults(threshold);
    const over = rows.filter((r) => r.status === "Over limit").length;
    const near = rows.filter((r) => r.status === "Near limit").length;
    return (
      <div className="space-y-3">
        <p className="text-[13px] text-ink-2">
          {rows.length} positions checked · <span className="font-medium text-danger">{over} over limit</span> ·{" "}
          {near} near limit · Review threshold {threshold}% of applicable limit
        </p>
        <RiskTable rows={rows} />
      </div>
    );
  }

  if (profile === "market") {
    const threshold = config.notableThreshold ?? 0.75;
    const notable = notableMoves(threshold);
    return (
      <div className="space-y-5">
        <div className="space-y-3">
          <p className="text-[13px] text-ink-2">
            {notable.length} notable moves at the ±{threshold.toFixed(2)}% threshold, of{" "}
            {MARKET_SNAPSHOT.length} instruments in the snapshot.
          </p>
          <div className="grid gap-4 xl:grid-cols-2">
            <MarketSnapshotTable />
            <div className="space-y-3">
              <p className="text-[11.5px] font-medium uppercase tracking-[0.1em] text-ink-3">
                Holdings-related movements
              </p>
              <HoldingLinksTable />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (profile === "bank") {
    const rows = bankResults();
    const ex = rows.filter((r) => r.status !== "Matched").length;
    const matched = rows.length - ex;
    return (
      <div className="space-y-3">
        <p className="text-[13px] text-ink-2">
          {rows.length} payments checked · {matched} matched ·{" "}
          <span className="font-medium text-danger">{ex} need review</span> · Source:{" "}
          {config.sourceName ?? "sample bank statement"}
        </p>
        <BankTable rows={rows} />
      </div>
    );
  }

  const rows = genericRows(config);
  const flagged = rows.filter((r) => r.status === "Flagged").length;
  return (
    <div className="space-y-3">
      <p className="text-[13px] text-ink-2">
        {rows.length} sample rows checked ·{" "}
        <span className="font-medium text-danger">{flagged} flagged</span> · Threshold{" "}
        {genericThreshold(config).toFixed(2)}%
        {config.sourceName ? ` · Source: ${config.sourceName}` : ""}
      </p>
      <GenericTableInner rows={rows} />
    </div>
  );
}

// ─── Report previews ─────────────────────────────────────────────────────────

function ReportFrame({
  title,
  meta,
  children,
  footer,
}: {
  title: string;
  meta: string;
  children: React.ReactNode;
  footer: string;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h3 className="text-[15.5px] font-semibold leading-snug">{title}</h3>
          <p className="mt-1 text-[12px] text-ink-3">{meta}</p>
        </div>
        <SampleTag label="Preview · Sample output" />
      </div>
      <div className="space-y-5 px-5 py-5">{children}</div>
      <p className="border-t border-border bg-muted/30 px-5 py-2.5 text-[12px] leading-relaxed text-ink-3">
        {footer}
      </p>
    </div>
  );
}

function ApprovalLine({ review, fallbackBy }: { review?: RunReview; fallbackBy: string }) {
  const by = review?.decision === "approved" ? review.by : fallbackBy;
  return (
    <p className="flex items-center gap-2 border-t border-border pt-4 text-[13px] font-medium text-foreground">
      <span className="grid size-4 shrink-0 place-items-center rounded-full bg-positive text-positive-foreground">
        <Check className="size-2.5" strokeWidth={3} aria-hidden="true" />
      </span>
      Approved by {by} (simulated decision)
    </p>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "danger" }) {
  return (
    <div>
      <dt className="text-[11.5px] leading-snug text-ink-3">{label}</dt>
      <dd className={cn("mt-1 text-[15px] font-semibold tabular-nums", tone === "danger" && "text-danger")}>
        {value}
      </dd>
    </div>
  );
}

export function ReportPreview({
  profile,
  name,
  config,
  review,
}: {
  profile: SampleProfile;
  name: string;
  config: RunConfig;
  review?: RunReview;
}) {
  if (profile === "nav") {
    const tol = config.tolerance ?? 0.5;
    const t = navTotals(tol);
    const ex = navExceptions(tol);
    return (
      <ReportFrame
        title={String(config.reportTitle ?? name)}
        meta={`Valuation date ${NAV_VALUATION_DATE} · 8 funds · Tolerance ±${tol.toFixed(2)}% · Sample data`}
        footer="Preview only. Not an official report. Prepared from sample data for demonstration."
      >
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          <Stat label="Total administrator NAV" value={fmtHKD(t.adminTotal)} />
          <Stat label="Total internal NAV" value={fmtHKD(t.internalTotal)} />
          <Stat label="Net difference" value={fmtSignedHKD(t.difference)} tone={t.exceptions > 0 ? "danger" : undefined} />
          <Stat label="Difference %" value={fmtSignedPct(t.diffPct)} tone={t.exceptions > 0 ? "danger" : undefined} />
        </dl>
        <p className="text-[13px] text-ink-2">
          {t.matched} matched · {t.within} within tolerance ·{" "}
          <span className="font-medium text-danger">{t.exceptions} exceptions</span>
        </p>
        {ex.length > 0 ? (
          <NavTable rows={ex} />
        ) : (
          <p className="rounded-md border border-border bg-muted/30 px-4 py-3 text-[13px] text-ink-2">
            No exceptions: all funds are within the ±{tol.toFixed(2)}% tolerance.
          </p>
        )}
        <ApprovalLine review={review} fallbackBy="Operations reviewer" />
      </ReportFrame>
    );
  }

  if (profile === "risk") {
    const threshold = config.reviewThreshold ?? 90;
    const rows = riskResults(threshold);
    const flagged = rows.filter((r) => r.status !== "Within limit");
    const over = rows.filter((r) => r.status === "Over limit").length;
    const near = rows.filter((r) => r.status === "Near limit").length;
    return (
      <ReportFrame
        title={String(config.reportTitle ?? name)}
        meta={`As at ${RISK_AS_AT} · Review threshold ${threshold}% of applicable limit · Sample data`}
        footer="Preview only. Not an official report. Prepared from sample data for demonstration."
      >
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          <Stat label="Portfolio total" value={fmtHKD(RISK_PORTFOLIO_TOTAL)} />
          <Stat label="Positions checked" value={String(rows.length)} />
          <Stat label="Over limit" value={String(over)} tone="danger" />
          <Stat label="Near limit" value={String(near)} />
        </dl>
        {flagged.length > 0 ? (
          <RiskTable rows={flagged} />
        ) : (
          <p className="rounded-md border border-border bg-muted/30 px-4 py-3 text-[13px] text-ink-2">
            No positions are over their applicable limit at the {threshold}% review threshold.
          </p>
        )}
        <ApprovalLine review={review} fallbackBy="Risk analyst" />
      </ReportFrame>
    );
  }

  if (profile === "market") {
    return (
      <ReportFrame
        title={String(config.reportTitle ?? name)}
        meta={`${BRIEFING_DATE} · 07:45 snapshot · Sample data`}
        footer="AI-assisted draft prepared from sample data. Preview only. Not investment advice."
      >
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center rounded-sm bg-primary-tint px-2 py-0.5 text-[11.5px] font-semibold text-primary-ink">
            AI-assisted draft
          </span>
          <span className="text-[12px] text-ink-3">Generated from the sample snapshot. Check before use.</span>
        </div>
        <section className="space-y-3">
          <h4 className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-ink-3">
            Market snapshot
          </h4>
          <MarketSnapshotTable />
          <ul className="space-y-1.5">
            {BRIEFING_SNAPSHOT_NOTES.map((n) => (
              <li key={n} className="text-[13px] leading-relaxed text-ink-2">
                {n}
              </li>
            ))}
          </ul>
        </section>
        <section className="space-y-2.5">
          <h4 className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-ink-3">
            Portfolio relevance
          </h4>
          <ul className="space-y-1.5">
            {BRIEFING_RELEVANCE.map((n) => (
              <li key={n} className="flex gap-2.5 text-[13px] leading-relaxed text-ink-2">
                <span className="mt-[7px] size-1 shrink-0 rounded-full bg-primary/60" aria-hidden="true" />
                {n}
              </li>
            ))}
          </ul>
        </section>
        <section className="space-y-2.5">
          <h4 className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-ink-3">
            Items to review
          </h4>
          <ol className="space-y-1.5">
            {BRIEFING_ITEMS.map((n, i) => (
              <li key={n} className="flex gap-2.5 text-[13px] leading-relaxed text-ink-2">
                <span className="w-3.5 shrink-0 text-right tabular-nums text-ink-3">{i + 1}</span>
                {n}
              </li>
            ))}
          </ol>
        </section>
        <ApprovalLine review={review} fallbackBy="Research editor" />
      </ReportFrame>
    );
  }

  if (profile === "bank") {
    const rows = bankResults();
    const exRows = rows.filter((r) => r.status !== "Matched");
    const matched = rows.length - exRows.length;
    const net = rows.reduce((sum, r) => sum + (r.difference ?? 0), 0);
    return (
      <ReportFrame
        title={String(config.reportTitle ?? name)}
        meta={`As at 29 September 2026 · ${rows.length} payments · Sample data`}
        footer="Preview only. Not an official report. Prepared from sample data for demonstration."
      >
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          <Stat label="Payments checked" value={String(rows.length)} />
          <Stat label="Matched" value={String(matched)} />
          <Stat label="Need review" value={String(exRows.length)} tone={exRows.length ? "danger" : undefined} />
          <Stat label="Net difference" value={fmtSignedHKD(net)} tone={net !== 0 ? "danger" : undefined} />
        </dl>
        {exRows.length > 0 ? (
          <BankTable rows={exRows} />
        ) : (
          <p className="rounded-md border border-border bg-muted/30 px-4 py-3 text-[13px] text-ink-2">
            No unmatched payments: every bank transaction has a matching ledger entry.
          </p>
        )}
        <ApprovalLine review={review} fallbackBy={config.reviewer ?? "Finance manager"} />
      </ReportFrame>
    );
  }

  const rows = genericRows(config);
  const flagged = rows.filter((r) => r.status === "Flagged").length;
  return (
    <ReportFrame
      title={String(config.reportTitle ?? name)}
      meta={`Prepared from ${config.sourceName ?? "sample data"} · ${rows.length} rows · Threshold ${genericThreshold(config).toFixed(2)}% · Sample data`}
      footer="Preview only. Prepared from labelled sample data for demonstration."
    >
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        <Stat label="Rows checked" value={String(rows.length)} />
        <Stat label="Flagged" value={String(flagged)} tone={flagged > 0 ? "danger" : undefined} />
        <Stat label="Threshold" value={`${genericThreshold(config).toFixed(2)}%`} />
      </dl>
      {flagged > 0 ? (
        <GenericTableInner rows={rows} onlyFlagged />
      ) : (
        <p className="rounded-md border border-border bg-muted/30 px-4 py-3 text-[13px] text-ink-2">
          No items are outside the {genericThreshold(config).toFixed(2)}% range.
        </p>
      )}
      <ApprovalLine review={review} fallbackBy={config.reviewer ?? "Reviewer"} />
    </ReportFrame>
  );
}
