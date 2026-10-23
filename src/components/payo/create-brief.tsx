"use client";

import { ArrowRight, Check, ChevronDown, FileSpreadsheet, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { BankTable } from "@/components/payo/reports";
import { ToneChip } from "@/components/payo/ui";
import { bankResults } from "@/lib/payo/data";
import { fmtInt } from "@/lib/payo/format";
import type { WorkflowDraft } from "@/lib/payo/authoring/types";
import { usePayo } from "@/lib/payo/store";
import { cn } from "@/lib/utils";

const EXAMPLES: { label: string; brief: string }[] = [
  {
    label: "Reconcile bank transactions",
    brief:
      "I'm the finance manager at a small trading company. Every Monday I reconcile the bank statement against our ledger and open invoices for the weekly finance pack. Match each bank transaction to its ledger entry on TID, and show the ledger UID for the row that was matched. Flag any payment that has no ledger entry, and any payment where the bank amount differs from the ledger. Send the exceptions to me for review with the TID, ledger UID, both amounts, and the difference. Once I approve, create a reconciliation summary with the matched and unmatched counts, the total difference, and my reviewer notes.",
  },
  {
    label: "Review position risk",
    brief:
      "Load sample positions, calculate each position's weight of the portfolio, and flag anything over its limit for analyst review before publishing a risk summary.",
  },
  {
    label: "Draft a market briefing",
    brief:
      "Pull the morning market snapshot, identify notable moves over 0.75%, match them to holdings, draft a briefing, and route it to a research editor before export.",
  },
];

const STRONG_BRIEF = [
  "your role and cadence",
  "the source files",
  "the rule or threshold",
  "the reviewer",
  "the output you need",
];

const LIFECYCLE: [string, string][] = [
  ["Describe", "Write the process in plain English."],
  ["Review and adjust", "Check every step. Change it in plain language."],
  ["Verify and test", "Run deterministic checks, then sample data."],
  ["Publish", "Record a version. Nothing goes live."],
];

const STAGES = ["Reading your brief", "Matching finance steps", "Drafting the graph"];

const SAMPLE_FILES = [
  { href: "/samples/bank-statement.xlsx", label: "Bank statement" },
  { href: "/samples/ledger.xlsx", label: "Ledger" },
  { href: "/samples/bank-reconciliation.xlsx", label: "Reconciliation" },
];

export function CreateBrief() {
  const { createWorkflowFromDraft } = usePayo();
  const [brief, setBrief] = useState("");
  const [details, setDetails] = useState({ sources: "", reviewer: "", output: "", cadence: "" });
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (!busy) return;
    const id = window.setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 900);
    return () => window.clearInterval(id);
  }, [busy]);

  const generate = async () => {
    const trimmed = brief.trim();
    if (trimmed.length < 5 || busy) return;
    setBusy(true);
    setStage(0);
    setError(null);
    try {
      const cleanDetails = Object.fromEntries(Object.entries(details).filter(([, v]) => v.trim()));
      const res = await fetch("/api/authoring/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: trimmed, details: cleanDetails }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message || "Payo could not draft this workflow.");
        setBusy(false);
        return;
      }
      const draft = data.draft as WorkflowDraft;
      createWorkflowFromDraft(draft, trimmed);
    } catch {
      setError("The drafting service is unavailable. Try again, or start from a template.");
      setBusy(false);
    }
  };

  const rows = bankResults();
  const counts = {
    matched: rows.filter((r) => r.status === "Matched").length,
    difference: rows.filter((r) => r.status === "Difference").length,
    unmatched: rows.filter((r) => r.status === "Unmatched").length,
  };
  const ledgerRows = rows.filter((r) => r.ledgerUid).length;
  const matchedDifference = rows.reduce((sum, r) => sum + (r.difference ?? 0), 0);
  const unmatchedValue = rows
    .filter((r) => r.status === "Unmatched")
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="flex min-h-full flex-col px-4 py-4 sm:px-6 md:px-8 md:py-5">
      <div className="mx-auto flex w-full max-w-[1840px] flex-1 flex-col">
        <header>
          <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-3">
            <span className="h-px w-6 bg-line-strong" aria-hidden="true" />
            New workflow
          </p>
          <h1 className="mt-1.5 text-[28px] font-semibold leading-tight tracking-[-0.015em] sm:text-[32px]">
            Describe the work you repeat.
          </h1>
          <p className="mt-1 max-w-4xl text-[14px] leading-relaxed text-ink-2">
            Describe a process in plain English. Payo drafts a workflow you can review, adjust,
            verify, test, and publish. No drag-and-drop.
          </p>
        </header>

        <div className="mt-3 grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(380px,1fr)]">
          {/* Composer */}
          <section className="flex min-h-[360px] flex-col rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <label htmlFor="brief" className="block text-[12px] font-medium text-ink-2">
              Describe the process
            </label>
            <textarea
              id="brief"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              maxLength={4000}
              placeholder="I'm the finance manager. Every Monday I match the bank statement to the ledger on TID, flag payments with no ledger entry or a different amount, review the exceptions, then create a reconciliation summary."
              className="mt-2 min-h-[220px] w-full flex-1 resize-none rounded-md border border-input bg-background px-3 py-3 text-[14px] leading-relaxed outline-none focus:border-primary-strong"
              disabled={busy}
            />

            <button
              type="button"
              onClick={() => setDetailsOpen((v) => !v)}
              aria-expanded={detailsOpen}
              className="mt-3 flex w-fit items-center gap-1.5 text-[12.5px] font-medium text-ink-2 transition-colors hover:text-foreground"
            >
              <ChevronDown className={cn("size-4 transition-transform", detailsOpen && "rotate-180")} aria-hidden="true" />
              Add detail (optional)
            </button>
            {detailsOpen && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["sources", "Source files"],
                    ["reviewer", "Who reviews"],
                    ["output", "What to produce"],
                    ["cadence", "How often"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="block">
                    <span className="mb-1 block text-[11.5px] font-medium text-ink-3">{label}</span>
                    <Input
                      value={details[key]}
                      onChange={(e) => setDetails((d) => ({ ...d, [key]: e.target.value }))}
                      className="h-8 text-[13px]"
                    />
                  </label>
                ))}
              </div>
            )}

            <p className="mt-3 text-[11.5px] leading-relaxed text-ink-3">
              A strong brief includes {STRONG_BRIEF.join(", ")}.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
              <Button onClick={generate} disabled={busy || brief.trim().length < 5} className="gap-1.5">
                {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
                {busy ? STAGES[stage] : "Generate workflow"}
              </Button>
              <Button asChild variant="outline">
                <a href="#/workspace/templates">Start from a template</a>
              </Button>
              <span className="ml-auto hidden text-[11.5px] text-ink-3 sm:inline">
                Drafts use a model. Do not include client data.
              </span>
            </div>

            {error && (
              <p className="mt-3 rounded-md border border-warn-border bg-warn-tint px-3 py-2 text-[12.5px] leading-snug text-warn">
                {error}{" "}
                <a href="#/workspace/templates" className="font-medium underline underline-offset-2">
                  Start from a template
                </a>
              </p>
            )}
          </section>

          {/* Side rail */}
          <aside className="flex min-h-0 flex-col gap-2.5">
            <section className="rounded-xl border border-border bg-card p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                Start with an example
              </p>
              <div className="mt-2.5 grid gap-2">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    type="button"
                    disabled={busy}
                    onClick={() => setBrief(ex.brief)}
                    className="group flex items-center justify-between gap-2 rounded-md border border-border px-3 py-1.5 text-left text-[12.5px] font-medium text-ink-2 transition-colors hover:border-line-strong hover:text-foreground disabled:opacity-50"
                  >
                    {ex.label}
                    <ArrowRight className="size-3.5 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                How it works
              </p>
              <ol className="mt-2.5 grid gap-x-3 gap-y-2 sm:grid-cols-2">
                {LIFECYCLE.map(([title, body], i) => (
                  <li key={title} className="flex gap-2">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-muted text-[10.5px] font-semibold tabular-nums text-ink-2">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-medium leading-snug text-foreground">{title}</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-ink-3">{body}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <p className="mt-2.5 flex items-center gap-1.5 border-t border-border pt-2.5 text-[11.5px] font-medium text-positive">
                <Check className="size-3.5" aria-hidden="true" />
                You approve every change before it applies.
              </p>
            </section>

            <section className="flex flex-1 flex-col rounded-xl border border-border bg-card p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                Sample Excel files
              </p>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {SAMPLE_FILES.map((f) => (
                  <a
                    key={f.href}
                    href={f.href}
                    download
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11.5px] font-medium text-ink-2 transition-colors hover:border-line-strong hover:text-foreground"
                  >
                    <FileSpreadsheet className="size-3.5 text-positive" aria-hidden="true" />
                    {f.label}.xlsx
                  </a>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-ink-3">
                Matched on TID. The workbook shows each ledger UID and status.
              </p>
              <div className="mt-4 hidden border-t border-border pt-3 [@media(min-height:1000px)]:block">
                <div className="grid grid-cols-3 gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-center">
                  <div>
                    <p className="text-[15px] font-semibold tabular-nums">{rows.length}</p>
                    <p className="text-[10.5px] text-ink-3">bank rows</p>
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold tabular-nums">{ledgerRows}</p>
                    <p className="text-[10.5px] text-ink-3">ledger rows</p>
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold tabular-nums">
                      {counts.difference + counts.unmatched}
                    </p>
                    <p className="text-[10.5px] text-ink-3">exceptions</p>
                  </div>
                </div>
                <div className="mt-3 border-t border-border pt-2.5">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-3">
                    Exceptions in this sample
                  </p>
                  <ul className="mt-1.5 space-y-1.5">
                    {rows
                      .filter((r) => r.status !== "Matched")
                      .map((r) => (
                        <li key={r.id} className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="truncate text-ink-2">{r.description}</span>
                          <span className="shrink-0 font-mono text-[10px] text-ink-3">{r.tid}</span>
                          <ToneChip tone={r.status === "Difference" ? "warn" : "danger"}>
                            {r.status}
                          </ToneChip>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-auto w-full"
                onClick={() => setPreviewOpen(true)}
              >
                View reconciliation
              </Button>
            </section>
          </aside>
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[88vh] gap-0 overflow-hidden p-0 sm:max-w-6xl">
          <DialogHeader className="items-start space-y-1.5 border-b border-border px-6 py-5 text-left">
            <DialogTitle className="text-[17px] font-semibold">Sample bank reconciliation</DialogTitle>
            <DialogDescription className="text-[13px] leading-relaxed">
              Every bank row matched to a ledger row by TID. All rows are fictional sample data.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[62vh] overflow-auto px-6 py-5">
            <div className="mb-3 flex flex-wrap gap-1.5">
              <ToneChip tone="positive">{counts.matched} matched</ToneChip>
              <ToneChip tone="warn">{counts.difference} difference</ToneChip>
              <ToneChip tone="danger">{counts.unmatched} unmatched</ToneChip>
            </div>
            <div className="[&_td]:py-3 [&_th]:py-2.5">
              <BankTable rows={rows} />
            </div>
            <p className="mt-3 text-[11.5px] leading-relaxed text-ink-3">
              Matching rule: bank TID → ledger TID. Difference = bank amount − ledger amount.
              Ledger rows: {ledgerRows}. Matched difference: HK${fmtInt(matchedDifference)}.
              Unmatched value: HK${fmtInt(unmatchedValue)}.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/30 px-6 py-4">
            <p className="text-[12px] text-ink-3">Sample data only. No live bank or ledger connection.</p>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_FILES.map((f) => (
                <a
                  key={f.href}
                  href={f.href}
                  download
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[11.5px] font-medium text-ink-2 transition-colors hover:border-line-strong hover:text-foreground"
                >
                  <FileSpreadsheet className="size-3.5 text-positive" aria-hidden="true" />
                  {f.label}.xlsx
                </a>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
