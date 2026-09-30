"use client";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TEMPLATES } from "@/lib/payo/data";
import { useUI } from "@/lib/payo/store";
import { Eyebrow, SampleTag } from "@/components/payo/ui";
import { PayoMark } from "@/components/payo/mark";
import { ProductMockup } from "@/components/payo/landing-mockup";
import {
  ConnectorsSection,
  EvidenceStrip,
  RolesSection,
  TrustSection,
} from "@/components/payo/landing-sections";
import { FeatureDemo } from "@/components/payo/feature-demo";
import { ThemeToggle } from "@/components/payo/theme-toggle";

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

const NAV_LINKS = [
  { href: "#what-payo-does", label: "What Payo does" },
  { href: "#roles", label: "Roles" },
  { href: "#connections", label: "Connections" },
  { href: "#product", label: "Product" },
  { href: "#templates", label: "Templates" },
  { href: "#trust", label: "Trust" },
];

export function LandingPage() {
  const { openAbout } = useUI();
  const available = TEMPLATES.filter((t) => !t.comingSoon);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
          <a href="#/" className="flex items-center gap-2.5" aria-label="Payo AI home">
            <PayoMark className="size-[26px]" />
            <span className="text-[15px] font-semibold tracking-tight">Payo AI</span>
          </a>
          <nav className="ml-auto hidden items-center gap-5 lg:flex" aria-label="Landing sections">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                className="text-[13px] text-ink-2 transition-colors hover:text-foreground"
                href={l.href}
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <ThemeToggle className="size-8" />
            <Button asChild className="h-8 px-3.5 text-[13px]">
              <a href={WORKSPACE_URL}>Explore the workspace</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-12 md:pb-20 md:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:gap-12">
          <div>
            <Eyebrow>Finance workflow workspace</Eyebrow>
            <h1 className="mt-4 text-[36px] font-semibold leading-[1.06] tracking-[-0.02em] md:text-[46px]">
              Finance workflows, made clear.
            </h1>
            <p className="mt-4 max-w-md text-[15.5px] leading-relaxed text-ink-2">
              Build repeatable reconciliations, risk checks and daily briefings in a visual
              workspace your team can inspect — with a person in the loop before anything is
              released.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
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
            <p className="mt-4 text-[12px] text-ink-3">
              No sign-in needed · every run uses labelled sample data.
            </p>
          </div>
          <ProductMockup />
        </div>
      </section>

      {/* Evidence */}
      <EvidenceStrip />

      {/* What Payo helps teams do */}
      <section id="what-payo-does" className="border-t border-border/70">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <Eyebrow>What Payo helps teams do</Eyebrow>
          <h2 className="mt-4 max-w-xl text-[28px] font-semibold leading-tight tracking-[-0.01em] md:text-[32px]">
            The repeatable work of a finance team, made visible.
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {HELPS.map((h, i) => (
              <div key={h.title} className="border-t-2 border-primary/25 pt-5">
                <span className="text-[12px] font-semibold tabular-nums text-ink-3">0{i + 1}</span>
                <h3 className="mt-2 text-[15px] font-semibold leading-snug">{h.title}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-2">{h.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for three roles */}
      <RolesSection />

      {/* Planned connections */}
      <ConnectorsSection />

      {/* Product demo */}
      <FeatureDemo />

      {/* Templates preview */}
      <section id="templates" className="border-t border-border/70">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Template library</Eyebrow>
              <h2 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.01em] md:text-[32px]">
                Start from a template, not a blank canvas.
              </h2>
            </div>
            <Button asChild variant="ghost" className="text-[13.5px] text-primary-ink">
              <a href={WORKSPACE_URL}>
                View all templates
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </Button>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {available.map((t) => (
              <div
                key={t.id}
                className="flex flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-line-strong"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                  {t.category}
                </p>
                <h3 className="mt-2 text-[15.5px] font-semibold">{t.name}</h3>
                <p className="mt-2 min-h-10 text-[13px] leading-relaxed text-ink-2">{t.outcome}</p>
                <p className="mt-3 text-[12px] leading-relaxed text-ink-3">
                  <span className="font-medium text-ink-2">Key sources: </span>
                  {t.keySources?.join(" · ")}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3.5">
                  <SampleTag />
                  <a
                    href={`#/workspace/workflows/${t.id}`}
                    className="inline-flex items-center gap-1 text-[12.5px] font-medium text-primary-ink transition-colors hover:text-primary-deep"
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

      {/* Review & licensing */}
      <TrustSection />

      {/* Final CTA */}
      <section className="border-t border-border/70 bg-card/50">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center md:py-20">
          <h2 className="mx-auto max-w-xl text-[28px] font-semibold leading-tight tracking-[-0.01em] md:text-[32px]">
            See it in the demo workspace.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[14.5px] leading-relaxed text-ink-2">
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
              <PayoMark className="size-6" />
              <span className="text-[14px] font-semibold tracking-tight">Payo AI</span>
            </div>
            <p className="mt-3 max-w-xs text-[12px] leading-relaxed text-ink-3">
              V0 product prototype. Workflows, data, connections, approvals and outputs are
              simulated. Not investment advice or an official report.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 text-[13px] md:items-end">
            <a
              href={WORKSPACE_URL}
              className="font-medium text-primary-ink hover:text-primary-deep"
            >
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
