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
        stroke="rgba(148,163,184,0.4)"
        strokeWidth="1.2"
        className="laser-flow"
      />
      {/* orange: "Auditable." → card status column */}
      <path
        d="M448 330 C 556 330, 576 402, 656 410"
        stroke="rgba(255,107,0,0.5)"
        strokeWidth="1.2"
        className="laser-flow"
      />
      <circle cx="440" cy="150" r="3" fill="#94A3B8" />
      <circle cx="664" cy="104" r="2.5" fill="#94A3B8" />
      <circle cx="448" cy="330" r="3" fill="#FF6B00" />
      <circle cx="656" cy="410" r="2.5" fill="#FF6B00" />
    </svg>
  );
}

export function LandingPage() {
  const { openAbout } = useUI();

  return (
    <div className="payo-neon relative min-h-screen bg-[#030712] text-[#EDF1F5]">
      <div className="relative">
        {/* Navigation */}
        <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#050608]/70 backdrop-blur-xl">
          <div className="relative mx-auto flex h-14 max-w-[1720px] items-center justify-between px-6 lg:px-10">
            <a href="#/" className="flex items-center gap-2.5" aria-label="Payo AI home">
              <PayoMark className="size-[26px]" />
              <span className="text-[15px] font-semibold tracking-tight text-white">Payo AI</span>
            </a>
            <nav
              className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-7 lg:flex"
              aria-label="Landing sections"
            >
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  className="text-[13px] text-white/60 transition-colors hover:text-white"
                  href={l.href}
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-4">
              <a
                href="#/workspace"
                className="hidden text-[13px] font-medium text-white/85 transition-colors hover:text-white sm:inline"
              >
                Sign In
              </a>
              <a
                href={WORKSPACE_URL}
                className="neon-cta inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#FF6B00] px-3.5 text-[13px] font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:bg-[#FF7A1A] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#FF6B00]/40"
              >
                Build a Workflow
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </header>

        {/* SECTION 1 — Hero & product showcase (dark) */}
        <section className="relative flex min-h-[calc(100vh-3.5rem)] flex-col justify-center overflow-hidden bg-[#0B0F17]">
          {/* Radial base + fine 24px grid, center-masked */}
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
                maskImage: "radial-gradient(ellipse 72% 68% at 50% 46%, black 25%, transparent 76%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 72% 68% at 50% 46%, black 25%, transparent 76%)",
              }}
            />
            {/* Ambient orange glow highlights behind the showcase card */}
          </div>

          <div className="relative mx-auto w-full max-w-[1920px] px-6 py-12 lg:px-20 xl:py-16">
            <div className="relative grid items-center gap-12 lg:grid-cols-[45fr_55fr] lg:gap-10">
              <HeroThreads />
              <div className="min-w-0">
                <h1 className="text-balance text-[32px] font-bold leading-[1.12] tracking-[-0.03em] text-white sm:text-[38px]">
                  Describe your workflow.
                  <br />
                  AI builds the <span className="text-[#FF6B00]">auditable graph</span>.
                </h1>
                <p className="mt-6 max-w-[520px] text-[16px] leading-[1.6] text-[#CBD5E1]">
                  Turn plain-English descriptions into visual, deterministic financial
                  pipelines—backed by human sign-off and complete line-item lineage.
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-3">
                  <a
                    href={WORKSPACE_URL}
                    className="inline-flex h-12 items-center gap-2 rounded-[10px] bg-[#FF6B00] px-7 text-[15px] font-semibold text-white shadow-[0_4px_20px_rgba(255,107,0,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FF7A1A] hover:shadow-[0_8px_28px_rgba(255,107,0,0.5)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#FF6B00]/40"
                  >
                    Generate Your First Graph
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </a>
                  <a
                    href="#templates"
                    className="inline-flex h-12 items-center gap-2 rounded-[10px] border border-[#E2E8F0] bg-white px-7 text-[14.5px] font-semibold text-[#0F172A] transition-colors duration-200 hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#0F172A]/20"
                  >
                    Explore Template Library
                  </a>
                </div>
                <p className="mt-4 text-[12px] text-[#6B7480]">
                  No code required · Zero execution without human approval · Sample data sandbox
                </p>
              </div>
              <HeroVisual />
            </div>

            {/* Social proof logo bar */}
            <div className="relative mt-14 border-t border-white/[0.08] pt-8">
              <p className="text-center text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6B7480]">
                Trusted concept for modern finance ops
              </p>
              <div className="mt-6">
                <LogoBar />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2 — Why this exists (light) */}
        <EvidenceStrip />

        {/* SECTION 3 — What Payo helps teams do (dark, animated pipeline) */}
        <HelpsPipeline />

        {/* SECTION 4 — Built for three roles (light) */}
        <RolesSection />

        {/* SECTION 5 — Planned connections (dark) */}
        <ConnectorsSection />

        {/* SECTION 6 — See it work (light) */}
        <FeatureDemo />

        {/* SECTION 7 — Template library (dark) */}
        <TemplateLibrarySection />

        {/* SECTION 8 — Control by design (light) */}
        <TrustSection />

        {/* SECTION 9 — Early access waitlist (dark) */}
        <WaitlistSection />

        {/* SECTION 10 — Footer (dark) */}
        <footer className="relative border-t border-white/[0.08] bg-[#030712]">
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
              <p className="mt-3 max-w-xs text-[12px] leading-relaxed text-[#6B7480]">
                V0 product prototype. Workflows, data, connections, approvals and outputs are
                simulated. Not investment advice or an official report.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 text-[13px] md:items-end">
              <a
                href={WORKSPACE_URL}
                className="font-medium text-[#FF6B00] transition-colors hover:text-[#FF8A4C]"
              >
                Enter the workspace
              </a>
              <button
                type="button"
                onClick={openAbout}
                className="text-[#A7B0BA] transition-colors hover:text-white md:text-right"
              >
                About this demo
              </button>
              <span className="text-[#6B7480]">© 2026 Payo AI</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
