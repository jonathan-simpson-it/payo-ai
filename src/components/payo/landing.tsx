"use client";

import { ArrowRight } from "lucide-react";

import { useUI } from "@/lib/payo/store";
import { PayoMark } from "@/components/payo/mark";
import {
  ConnectorsSection,
  EvidenceStrip,
  RolesSection,
  TrustSection,
} from "@/components/payo/landing-sections";
import { FeatureDemo } from "@/components/payo/feature-demo";
import { WaitlistSection } from "@/components/payo/waitlist";
import { HeroVisual } from "@/components/payo/hero-visual";
import { HelpsPipeline } from "@/components/payo/helps-pipeline";
import { TemplateLibrarySection } from "@/components/payo/template-library";
import {
  BlackRockLogo,
  BlackstoneLogo,
  HsbcLogo,
  MorganStanleyLogo,
} from "@/components/payo/logos";

const WORKSPACE_URL = "#/workspace/templates";

const NAV_LINKS = [
  { href: "#what-payo-does", label: "How it works" },
  { href: "#templates", label: "Templates" },
  { href: "#trust", label: "Governance & audit" },
  { href: "#connections", label: "Integrations" },
];

/* Social-proof bar: real vector marks, uniform 32px frame, quiet until hover. */
function LogoBar() {
  const logos = [
    { C: BlackRockLogo, name: "BlackRock" },
    { C: BlackstoneLogo, name: "Blackstone" },
    { C: MorganStanleyLogo, name: "Morgan Stanley" },
    { C: HsbcLogo, name: "HSBC" },
  ];
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-12 gap-y-6">
      {logos.map(({ C, name }) => (
        <span
          key={name}
          className="text-white opacity-50 transition-opacity hover:opacity-80"
          title={name}
        >
          <C />
        </span>
      ))}
    </div>
  );
}

/* Decorative bezier threads: keyphrases on the left wired to the showcase
 * card on the right, drawn as quiet dotted lines. Hidden on small screens
 * and from assistive tech. */
function HeroThreads() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden size-full lg:block"
      viewBox="0 0 1100 560"
      fill="none"
      preserveAspectRatio="none"
    >
      {/* slate: "Automated &" → card header tabs */}
      <path
        d="M440 150 C 550 150, 560 108, 664 104"
        stroke="rgba(255,255,255,0.16)"
        strokeWidth="1.2"
        className="laser-flow"
      />
      {/* orange: "Auditable." → card status column */}
      <path
        d="M448 330 C 556 330, 576 402, 656 410"
        stroke="rgba(201,80,10,0.55)"
        strokeWidth="1.2"
        className="laser-flow"
      />
      <circle cx="440" cy="150" r="3" fill="#6E7681" />
      <circle cx="664" cy="104" r="2.5" fill="#6E7681" />
      <circle cx="448" cy="330" r="3" fill="#C9500A" />
      <circle cx="656" cy="410" r="2.5" fill="#C9500A" />
    </svg>
  );
}

export function LandingPage() {
  const { openAbout } = useUI();

  return (
    <div className="payo-neon relative min-h-screen bg-background text-foreground">
      <div className="relative">
        {/* Navigation */}
        <header className="sticky top-0 z-40 border-b border-border bg-background">
          <div className="mx-auto flex h-16 max-w-[1720px] items-center gap-8 px-6 lg:px-10">
            <a href="#/" className="flex shrink-0 items-center gap-2.5" aria-label="Payo AI home">
              <PayoMark className="size-[26px]" />
              <span className="text-[15px] font-semibold tracking-tight text-white">Payo AI</span>
              <span className="ml-1 hidden rounded border border-border px-1.5 py-px font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3 lg:inline">
                V0
              </span>
            </a>
            <nav
              className="hidden items-center gap-6 lg:flex"
              aria-label="Landing sections"
            >
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  className="relative py-1 text-[13px] text-ink-2 transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-white/35 after:transition-transform after:duration-200 hover:text-white hover:after:scale-x-100"
                  href={l.href}
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-3">
              {/* Hand-drawn note pointing at the waitlist CTA (decorative). */}
              <div className="mr-1 hidden items-center gap-2 xl:flex" aria-hidden="true">
                <span className="-translate-y-2 -rotate-3 whitespace-nowrap text-[11.5px] italic leading-none text-ink-2">
                  join for early access
                </span>
                <svg
                  className="-mb-1 h-7 w-12 shrink-0 text-ink-2"
                  viewBox="0 0 48 32"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 6C20 4 34 10 42 24" />
                  <path d="M34.5 21.5L43 25l-.5-8.5" />
                </svg>
              </div>
              <a
                href="#waitlist"
                className="inline-flex h-9 items-center rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary-strong focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/40"
              >
                <span className="sm:hidden">Waitlist</span>
                <span className="hidden sm:inline">Join the waitlist</span>
              </a>
              <a
                href={WORKSPACE_URL}
                className="hidden h-9 items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.03] px-3.5 text-[13px] font-medium text-white transition-colors duration-200 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-white/20 sm:inline-flex"
              >
                Build a Workflow
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </header>

        {/* SECTION 1 — Hero & product showcase */}
        <section className="relative flex min-h-[calc(100vh-4rem)] flex-col justify-center overflow-hidden bg-background">
          {/* Fine 24px grid, center-masked */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
                maskImage: "radial-gradient(ellipse 72% 68% at 50% 46%, black 25%, transparent 76%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 72% 68% at 50% 46%, black 25%, transparent 76%)",
              }}
            />
          </div>

          <div className="relative mx-auto w-full max-w-[1920px] px-6 py-12 lg:px-20 xl:py-16">
            <div className="relative grid items-center gap-12 lg:grid-cols-[45fr_55fr] lg:gap-10">
              <HeroThreads />
              <div className="min-w-0">
                <h1 className="text-balance text-[32px] font-bold leading-[1.12] tracking-[-0.03em] text-white sm:text-[38px]">
                  Describe your workflow.
                  <br />
                  AI builds the <span className="text-primary">auditable graph</span>.
                </h1>
                <p className="mt-6 max-w-[520px] text-[16px] leading-[1.6] text-ink-2">
                  Turn plain-English descriptions into visual, deterministic financial
                  pipelines, backed by human sign-off and complete line-item lineage.
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-3">
                  <a
                    href={WORKSPACE_URL}
                    className="inline-flex h-12 items-center gap-2 rounded-[10px] bg-primary px-7 text-[15px] font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary-strong focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/40"
                  >
                    Generate Your First Graph
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </a>
                  <a
                    href="#templates"
                    className="inline-flex h-12 items-center gap-2 rounded-[10px] border border-white/15 bg-white/[0.03] px-7 text-[14.5px] font-semibold text-white transition-colors duration-200 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-white/20"
                  >
                    Explore Template Library
                  </a>
                </div>
                <p className="mt-4 text-[12px] text-ink-3">
                  No code required · Zero execution without human approval · Sample data sandbox
                </p>
              </div>
              <HeroVisual />
            </div>

            {/* Social proof logo bar */}
            <div className="relative mt-14 border-t border-white/[0.08] pt-8">
              <p className="text-center text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-3">
                Trusted concept for modern finance ops
              </p>
              <div className="mt-6">
                <LogoBar />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2 — Why this exists */}
        <EvidenceStrip />

        {/* SECTION 3 — What Payo helps teams do (animated pipeline) */}
        <HelpsPipeline />

        {/* SECTION 4 — Built for three roles */}
        <RolesSection />

        {/* SECTION 5 — Connections */}
        <ConnectorsSection />

        {/* SECTION 6 — See it work */}
        <FeatureDemo />

        {/* SECTION 7 — Template library */}
        <TemplateLibrarySection />

        {/* SECTION 8 — Control by design */}
        <TrustSection />

        {/* SECTION 9 — Early access waitlist */}
        <WaitlistSection />

        {/* SECTION 10 — Footer */}
        <footer className="relative border-t border-border bg-background">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-white/[0.08]"
          />
          <div className="mx-auto flex max-w-[1720px] flex-col gap-6 px-6 py-10 md:flex-row md:items-start md:justify-between lg:px-20">
            <div>
              <div className="flex items-center gap-2.5">
                <PayoMark className="size-6" />
                <span className="text-[14px] font-semibold tracking-tight text-white">Payo AI</span>
              </div>
              <p className="mt-3 max-w-xs text-[12px] leading-relaxed text-ink-3">
                V0 product prototype. Workflows, data, connections, approvals and outputs are
                simulated. Not investment advice or an official report.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 text-[13px] md:items-end">
              <a
                href={WORKSPACE_URL}
                className="font-medium text-primary-ink transition-colors hover:text-white"
              >
                Enter the workspace
              </a>
              <button
                type="button"
                onClick={openAbout}
                className="text-ink-2 transition-colors hover:text-white md:text-right"
              >
                About this demo
              </button>
              <span className="text-ink-3">© 2026 Payo AI</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
