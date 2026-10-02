# Landing Visual QA Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the three unslop color/motion violations found in the visual QA audit without touching layout, shapes, or radii.

**Architecture:** All three fixes are single-file class/keyframe edits in the existing landing components; no new files, no dependency changes. Verification is via grep assertions and the Playwright capture protocol (screenshots to `/tmp` only).

**Tech Stack:** Next.js 16 App Router, Tailwind v4, `simple-icons` (installed), Playwright (Python, at `/opt/homebrew/bin/playwright` + cached chromium).

**Spec:** The visual QA audit report and unslop color directives from the 2026-10-02 session (QA capture at `/tmp/section-*.png`; issues verified in code at the locations below).

## Global Constraints

- DO NOT alter layout grids, aspect ratios (16:9), border radii, paddings, or component geometry.
- Dark status values: emerald `rgba(16,185,129,0.12)` fill / `#34D399` text / `rgba(16,185,129,0.25)` border; rose `rgba(220,38,38,0.12)` fill / `#F87171` text / `rgba(252,165,165,0.25)` border; amber `rgba(217,119,6,0.15)` fill / `#FBBF24` text / `rgba(253,230,138,0.25)` border.
- Light status values: emerald `#ECFDF5`/`#047857`/`#A7F3D0`; rose `#FEF2F2`/`#DC2626`/`#FCA5A5`; amber `#FFFBEB`/`#D97706`/`#FDE68A`.
- Payo Orange `#FF6B00` only on primary CTAs, active tabs/selectors, and focus indicators.
- Grid tints: `rgba(0,0,0,0.015)` light, `rgba(255,255,255,0.02)` dark. No neon greens, no matrix cyan, no blur blooms, no fuzzy hover glows.
- No test framework is configured in this repo (verified: `package.json` scripts are `dev`/`build`/`start`/`lint` only) — verification is grep + lint + Playwright captures, not unit tests.
- Screenshots go to `/tmp` only; never into the repo.
- Section-ID mapping for QA captures (existing code IDs): `#evidence` = why-this-exists, `#roles` = built-for-roles, `#product` = see-it-work, `#templates` = template-library, `#trust` = control-by-design, `#waitlist` = early-access; hero and footer have no ID (use `section:has(h1)` / `footer` selectors).

### Task 1: Fix Node-03 badge collision in the helps pipeline

**Files:**
- Modify: `src/app/globals.css` (`@keyframes approve-pop`, `@keyframes export-pop`)

**Interfaces:**
- Consumes: `.approve-pill` / `.export-pill` classes on `src/components/payo/helps-pipeline.tsx:215` and `:219` (unchanged).
- Produces: non-overlapping 8s cycle — emerald "Approved by editor" visible 42%–62%, slate "Export briefing" visible 72%–92%.

- [x] **Step 1: Apply the staggered keyframes** — replace the two keyframe blocks in `src/app/globals.css` (see code in Task steps below; approve visible 42–62%, export visible 72–92%, both fade fully between).
- [x] **Step 2: Verify no overlap window exists** — grep the keyframe stops.
- [x] **Step 3: Visual verification** — deferred per user instruction ("don't do testing until I told you").
- [ ] **Step 4: Lint** — deferred per user instruction.
- [ ] **Step 5: Commit** — deferred per standing "no commit or push" instruction.

### Task 2: Dark-mode status chips in the Template Library canvases

**Files:**
- Modify: `src/components/payo/template-library.tsx:76` (Matched chip) and `:86` (Exception chip)

**Interfaces:**
- Produces: dark-mode chip styling consistent with `hero-visual.tsx` `STATUS_CHIP`.

- [x] **Step 1: Swap light chip values for dark spec values** (emerald `rgba(16,185,129,0.12)`/`#34D399`/`rgba(16,185,129,0.25)`; rose `rgba(220,38,38,0.12)`/`#F87171`/`rgba(252,165,165,0.25)`).
- [x] **Step 2: Verify** no `ECFDF5`/`FEF2F2` remains in the file.
- [x] **Step 3: Visual verification** — deferred.
- [ ] **Step 4: Lint + commit** — deferred.

### Task 3: Neutralize the "Planned" badge color

**Files:**
- Modify: `src/components/payo/landing-sections.tsx` (`function PlannedBadge()`)

**Interfaces:**
- Produces: neutral slate "Planned" badge (`border-white/[0.14]`, `bg-white/[0.05]`, text `#A7B0BA`, dot `#94A3B8`), freeing `#FF6B00` to CTA/active/focus only.

- [x] **Step 1: Replace the orange badge with the neutral slate chip.**
- [x] **Step 2: Verify** `#FF6B00` occurrences in the file dropped by the 3 badge occurrences.
- [x] **Step 3: Visual verification** — deferred.
- [ ] **Step 4: Lint + commit** — deferred.

### Task 4: Regression capture + report

**Files:**
- Create: `/tmp/qa-recapture/*.png` (temp only)

- [ ] **Step 1: Re-run the 10-section capture protocol** (1920×1080, networkidle, 900ms settle) — deferred until the user asks for testing.
- [ ] **Step 2: Inspect sections 3, 5, 7** for the three fixes.
- [ ] **Step 3: Full-page sanity** vs this audit's baseline.
- [ ] **Step 4: Confirm only intended files changed** (`git status --short`).

## Self-review
- Spec coverage: three audit issues → Tasks 1–3; regression protocol → Task 4 (deferred).
- Section 6 explainer clipping and the QA-spec section-ID mismatch are NEEDS-CONFIRMATION items, not planned changes.
- All class strings verified against current markup on 2026-10-02.
