"use client";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TEMPLATES } from "@/lib/payo/data";
import { useUI } from "@/lib/payo/store";
import { Eyebrow, SampleTag } from "@/components/payo/ui";
import { ProductMockup } from "@/components/payo/landing-mockup";

const WORKSPACE_URL = "#/workspace/templates";

const HELPS = [
  {
    title: "Reconcile NAV data and investigate exceptions.",
    body: "Compare administrator and internal valuations fund by fund, and route material differences to a person before anything is signed off.",
  },
  {
    title: "Review position risk against limits.",
    body: "Check exposures and concentration against the limits that apply, and see exactly which positions need a second look.",
  },
  {
    title: "Turn the day's market moves into a checked briefing.",
    body: "Match the morning's moves to your holdings, draft a concise brief, and have an editor approve it before it goes out.",
  },
];

const HOW = [
  {
    title: "Choose a finance template.",
    body: "Start from a reconciliation, risk review or daily briefing — never a blank canvas.",
  },
  {
    title: "Adjust the workflow for your process.",
    body: "Set the source files, tolerances and review points that match how your team already works.",
  },
  {
    title: "Run it, review exceptions, and share the output.",
    body: "Watch each step complete, pause where a person is needed, and inspect the result before it leaves the building.",
  },
];

const CONTROL = [
  {
    title: "Every workflow has visible steps",
    body: "See what each run will do — load, calculate, check, review, report — before and while it happens.",
  },
  {
    title: "Review before release",
    body: "Material items pause for a human decision. Nothing is finalised until someone approves it.",
  },
  {
    title: "Inspect each run",
    body: "Every run keeps its steps, sample sources and findings available to inspect afterwards.",
  },
];

export function LandingPage() {
  const { openAbout } = useUI();
  const available = TEMPLATES.filter((t) => !t.comingSoon);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-6">
          <a href="#/" className="flex items-center gap-2.5" aria-label="Payo AI home">
            <span className="size-2.5 rounded-[3px] bg-primary" aria-hidden="true" />
            <span className="text-[15px] font-semibold tracking-tight">Payo AI</span>
          </a>
          <nav className="ml-auto hidden items-center gap-6 md:flex" aria-label="Landing sections">
            <a className="text-[13.5px] text-ink-2 transition-colors hover:text-foreground" href="#what-payo-does">
              What Payo does
            </a>
            <a className="text-[13.5px] text-ink-2 transition-colors hover:text-foreground" href="#how-it-works">
              How it works
            </a>
            <a className="text-[13.5px] text-ink-2 transition-colors hover:text-foreground" href="#templates">
              Templates
            </a>
            <a className="text-[13.5px] text-ink-2 transition-colors hover:text-foreground" href="#control">
              Control
            </a>
          </nav>
          <Button asChild className="ml-auto h-8 px-3.5 text-[13px] md:ml-0">
            <a href={WORKSPACE_URL}>Explore the workspace</a>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 md:pt-24">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow className="justify-center">Payo AI</Eyebrow>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.02em] md:text-[52px]">
            Finance workflows, made clear.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[16.5px] leading-relaxed text-ink-2">
            Build repeatable reconciliations, risk checks and daily market briefings in a visual
            workspace your team can inspect.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="px-5">
              <a href={WORKSPACE_URL}>
                Explore the workspace
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-5">
              <a href="#templates">View templates</a>
            </Button>
          </div>
        </div>
        <div className="mx-auto mt-14 max-w-3xl">
          <ProductMockup />
        </div>
      </section>

      {/* What Payo helps teams do */}
      <section id="what-payo-does" className="border-t border-border/70">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <Eyebrow>What Payo helps teams do</Eyebrow>
          <h2 className="mt-4 max-w-xl text-[28px] font-semibold leading-tight tracking-[-0.01em] md:text-[32px]">
            The repeatable work of a finance team, made visible.
          </h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {HELPS.map((h, i) => (
              <div key={h.title} className="border-t-2 border-primary/25 pt-5">
                <span className="text-[12px] font-semibold tabular-nums text-ink-3">0{i + 1}</span>
                <h3 className="mt-2 text-[15.5px] font-semibold leading-snug">{h.title}</h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-ink-2">{h.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border/70 bg-card/50">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.01em] md:text-[32px]">
            From template to checked output in three moves.
          </h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {HOW.map((h, i) => (
              <div key={h.title} className="flex gap-4">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md border border-primary-soft bg-primary-tint text-[14px] font-semibold text-primary tabular-nums">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-[15.5px] font-semibold leading-snug">{h.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{h.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates preview */}
      <section id="templates" className="border-t border-border/70">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Template preview</Eyebrow>
              <h2 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.01em] md:text-[32px]">
                Start from a template, not a blank canvas.
              </h2>
            </div>
            <Button asChild variant="ghost" className="text-[13.5px] text-primary">
              <a href={WORKSPACE_URL}>
                View all templates
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </Button>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {available.map((t) => (
              <div
                key={t.id}
                className="flex flex-col rounded-md border border-border bg-card p-5 transition-colors hover:border-line-strong"
              >
                <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                  {t.category}
                </p>
                <h3 className="mt-2 text-[16px] font-semibold">{t.name}</h3>
                <p className="mt-2 min-h-10 text-[13.5px] leading-relaxed text-ink-2">{t.outcome}</p>
                <p className="mt-3 text-[12.5px] leading-relaxed text-ink-3">
                  <span className="font-medium text-ink-2">Key sources: </span>
                  {t.keySources?.join(" · ")}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3.5">
                  <SampleTag />
                  <a
                    href={`#/workspace/workflows/${t.id}`}
                    className="inline-flex items-center gap-1 text-[13px] font-medium text-primary transition-colors hover:text-primary-deep"
                  >
                    Open in workspace
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Control by design */}
      <section id="control" className="border-t border-border/70 bg-card/50">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <Eyebrow>Control by design</Eyebrow>
          <h2 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.01em] md:text-[32px]">
            You can always see what happened, and why.
          </h2>
          <div className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-3">
            {CONTROL.map((c) => (
              <div key={c.title}>
                <h3 className="border-l-2 border-primary/60 pl-4 text-[15.5px] font-semibold leading-snug">
                  {c.title}
                </h3>
                <p className="mt-2.5 pl-4 text-[14px] leading-relaxed text-ink-2">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/70">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center md:py-24">
          <h2 className="mx-auto max-w-xl text-[28px] font-semibold leading-tight tracking-[-0.01em] md:text-[32px]">
            See it in the demo workspace.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-2">
            No sign-in needed. Every workflow opens ready to run on labelled sample data, with a
            review gate you can try yourself.
          </p>
          <Button asChild size="lg" className="mt-8 px-5">
            <a href={WORKSPACE_URL}>
              Explore the workspace
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="size-2.5 rounded-[3px] bg-primary" aria-hidden="true" />
              <span className="text-[14px] font-semibold tracking-tight">Payo AI</span>
            </div>
            <p className="mt-3 max-w-xs text-[12.5px] leading-relaxed text-ink-3">
              V0 product prototype. Workflows, data, connections, approvals and outputs are
              simulated.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 text-[13px] md:items-end">
            <a href={WORKSPACE_URL} className="font-medium text-primary hover:text-primary-deep">
              Enter the workspace
            </a>
            <button
              type="button"
              onClick={openAbout}
              className="text-ink-2 transition-colors hover:text-foreground md:text-right"
            >
              About this demo
            </button>
            <span className="text-ink-3">© 2026 Payo AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
