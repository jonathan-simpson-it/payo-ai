# Landing Visual Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the QA polish pass — typography contrast, palette refinement, data-viz details, and minimal enterprise aesthetics — across all landing sections without touching layout grids, card shapes, aspect ratios, or geometry.

**Architecture:** All changes are single-line class/string edits inside existing files (`landing.tsx`, `hero-visual.tsx`, `landing-sections.tsx`, `helps-pipeline.tsx`, `feature-demo.tsx`, `template-library.tsx`, `waitlist.tsx`) plus one new local helper component. No new files, no dependency changes, no CSS keyframe changes.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, lucide-react 0.525, `cn()` from `@/lib/utils`.

**Spec:** User-provided QA polish directive, 2026-10-02 (sections 1–8), with 7 scope decisions confirmed by the user this session (recorded per task).

## Global Constraints

- DO NOT alter layout grids, card shapes, aspect ratios (16:9 bands, `h-[100svh]`), border radii, container paddings, or component geometry. Only spec-listed pill paddings/heights change.
- Payo orange `#FF6B00` stays on CTAs, active/selected states, and focus indicators only.
- Every class string below was verified against current markup on 2026-10-02 — replace exactly what's quoted, keep everything else in the `className`.
- No test framework in this repo (verified: `package.json` scripts are `dev`/`build`/`start`/`lint` only). Verification = targeted grep + `npm run lint`. Visual capture (Playwright, screenshots to `/tmp` only) is **deferred until the user asks for testing** — standing instruction from the 2026-10-02 session.
- Tailwind v4 has **no** `stroke-dasharray` utility (verified via docs — only `stroke-{color}`/`stroke-<width>`); use the SVG attribute `strokeDasharray="2 2"`.
- Section IDs for visual QA: `#evidence` (S2), `#what-payo-does` (S3), `#roles` (S4), `#connections` (S5), `#product` (S6), `#templates` (S7), `#trust` (S8), `#waitlist` (S9 form); hero + footer have no ID.
- Standing user instruction: do not run tests / visual captures until the user asks.

---

### Task 1: Hero polish — glass headline pill, quiet logo bar, roomier status pills

**Files:**
- Modify: `src/components/payo/landing.tsx:167` (headline span), `:47` (logo span)
- Modify: `src/components/payo/hero-visual.tsx:391` (status pill class)
- Modify: `src/app/globals.css:295` (stale comment only)

**Interfaces:**
- Produces: hero headline renders as glassmorphic pill; logo bar opacity-driven; hero table pills use `px-2.5 … tracking-wide`. Nothing downstream consumes these.

- [ ] **Step 1: Glassmorphic headline pill** — `landing.tsx:167` replace:

```tsx
<span className="headline-bar my-2 inline-block rounded-2xl bg-white px-5 pb-1.5 pt-1 text-black">
```
with:
```tsx
<span className="headline-bar my-2 inline-block rounded-2xl border border-white/20 bg-white/5 px-5 pb-1.5 pt-1 text-white shadow-sm">
```
Note: `.payo-neon .headline-bar` in `globals.css:296-298` keeps its soft `box-shadow` (higher specificity than Tailwind `shadow-sm`) — expected, no CSS change needed beyond the comment.

- [ ] **Step 2: Update the stale CSS comment** — `globals.css:295`:
`/* Inverted headline bar: flat white block, black text, no glow. */` → `/* Headline bar: glassmorphic border pill over the dark hero. */`

- [ ] **Step 3: Logo bar opacity** — `landing.tsx:47` replace:

```tsx
className="text-white/60 transition-colors duration-300 hover:text-white"
```
with:
```tsx
className="text-white opacity-50 transition-opacity hover:opacity-80"
```

- [ ] **Step 4: Roomier table status pills** — `hero-visual.tsx:391` replace:

```tsx
"inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium",
```
with:
```tsx
"inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-medium tracking-wide",
```

- [ ] **Step 5: Variance bars — NO CHANGE.** User confirmed: keep status colors; Exception bars already render `#EF4444` at `opacity: 0.85` (`hero-visual.tsx:414-421`). Do not edit.

- [ ] **Step 6: Verify**

Run: `grep -n "bg-white/5 border border-white/20" src/components/payo/landing.tsx && grep -n "px-2.5 py-0.5 text-\[10px\] font-medium tracking-wide" src/components/payo/hero-visual.tsx && ! grep -n "text-white/60" src/components/payo/landing.tsx`
Expected: two matches, no `text-white/60` remaining.

- [ ] **Step 7: Commit**

```bash
git add src/components/payo/landing.tsx src/components/payo/hero-visual.tsx src/app/globals.css
git commit -m "style(hero): glass headline pill, opacity-dimmed logo bar, roomier status pills"
```

---

### Task 2: Section 2 — bar chart refinement + standardized solution cards

**Files:**
- Modify: `src/components/payo/landing-sections.tsx` — `GrowthBars` (lines 28–62), solution card `li` (line 145), tag `span` (line 154)

**Interfaces:**
- Consumes: nothing new.
- Produces: `GrowthBars` with gradient $132B bar, uniform slate-700 value labels, 25/50/75% axis hairlines. No external consumers.

- [ ] **Step 1: Gradient on the $132B bar** — line 31:

```tsx
    { year: "2030", value: "$132B", pct: 100, tone: "bg-gradient-to-b from-[#FF6B00] to-[#E05E00]" },
```

- [ ] **Step 2: Uniform value labels** — lines 41–47:

```tsx
            <span className="font-mono text-xs font-semibold tabular-nums text-slate-700">
              {b.value}
            </span>
```

- [ ] **Step 3: Faint axis lines** — line 38, relative chart row + three hairlines (positions 25/50/75% are an inference — spec says only "faint horizontal background axis lines"):

```tsx
      <div className="relative flex h-[104px] items-end gap-10 border-b border-slate-200 px-2">
        {[25, 50, 75].map((p) => (
          <span
            key={p}
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-2 border-b border-slate-200/60"
            style={{ bottom: `${p}%` }}
          />
        ))}
        {bars.map((b) => (
          <div key={b.year} className="relative z-10 flex h-full w-16 flex-col items-center justify-end gap-1.5">
```
(the bar column div gains `relative z-10` so bars paint above the hairlines)

- [ ] **Step 4: Standardize card borders** — line 145:

```tsx
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-200 hover:border-[#FF6B00] xl:p-6"
```
Spec-implied removals (flag for review): the 3px left accent border and the `hover:translate-x-1` slide — `transition-colors` only transitions color.

- [ ] **Step 5: Refine category badges** — line 154:

```tsx
                  <span className="ml-auto inline-flex items-center rounded border border-orange-200/60 bg-orange-50 px-2 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-orange-700">
```

- [ ] **Step 6: Verify**

Run: `grep -n "from-\[#FF6B00\] to-\[#E05E00\]\|border-orange-200/60\|hover:border-\[#FF6B00\] xl:p-6" src/components/payo/landing-sections.tsx && ! grep -n "border-l-\[3px\]\|FED7AA\|FFF7ED" src/components/payo/landing-sections.tsx`

- [ ] **Step 7: Commit**

```bash
git add src/components/payo/landing-sections.tsx
git commit -m "style(evidence): gradient forecast bar, axis hairlines, standardized solution cards"
```

---

### Task 3: Section 3 — pipeline graphic containers, donut gauge, sparkline details

**Files:**
- Modify: `src/components/payo/helps-pipeline.tsx` — 3 graphic containers (lines 64, 114, 191), donut track/center (lines 124, 146–148), sparkline (lines 192–201)

**Interfaces:**
- Produces: `.pipe-graphic` surfaces `bg-[#131C2E] border-white/10`; RiskGraphic track/center; BriefingGraphic dashed baseline + blue end dot.

- [ ] **Step 1: Elevate all three graphic containers** — string appears exactly 3×; replace all with:

```
pipe-graphic relative flex h-[210px] flex-col justify-between rounded-xl border border-white/10 bg-[#131C2E] p-4
```

- [ ] **Step 2: Donut track + center text** — line 124:

```tsx
            <circle cx="60" cy="60" r={34} className="stroke-slate-800" strokeWidth="9" />
```
lines 146–148: `text-[18px] font-semibold tabular-nums text-[#F8FAFC]` → `text-[18px] font-bold tabular-nums text-white` (keep `absolute font-mono`).

- [ ] **Step 3: Sparkline baseline + end dot** — insert before the existing `<path>` in `BriefingGraphic`:

```tsx
        <line x1="4" y1="50" x2="256" y2="50" className="stroke-slate-700" strokeWidth="1" strokeDasharray="2 2" />
```
(baseline y=50 is an inference; Tailwind v4 has no `stroke-dasharray` class, hence the attribute). End dot (line 200):

```tsx
        <circle cx="256" cy="6" r="3" fill="#3B82F6" />
```

- [ ] **Step 4: Verify**

Run: `grep -c "bg-\[#131C2E\]" src/components/payo/helps-pipeline.tsx && grep -n "stroke-slate-800\|strokeDasharray" src/components/payo/helps-pipeline.tsx && ! grep -n "bg-black/25" src/components/payo/helps-pipeline.tsx`
Expected: `3`, two matches, no `bg-black/25`.

- [ ] **Step 5: Commit**

```bash
git add src/components/payo/helps-pipeline.tsx
git commit -m "style(pipeline): elevated graphic surfaces, donut track, sparkline baseline and end dot"
```

---

### Task 4: Section 4 — dark active tab, slim risk bars, standardized risk pills

**Files:**
- Modify: `src/components/payo/landing-sections.tsx` — `TabsTrigger` (line 509), progress track (line 268), `AnalystPreview` table (line 310)

**Interfaces:**
- Consumes: `cn` from `@/lib/utils` (already imported).
- Produces: new local component `RiskStatusPill({ status }: { status: string })` — used only inside `AnalystPreview`. **Scope confirmed by user:** shared `ToneChip` stays untouched.

- [ ] **Step 1: Dark pill active tab** — line 509 (dark-pill option, preserves pill geometry — user decision):

```tsx
data-[state=active]:border-transparent data-[state=active]:bg-slate-900 data-[state=active]:font-semibold data-[state=active]:text-white data-[state=active]:shadow-sm"
```

- [ ] **Step 2: Slim progress bars** — line 268: `h-[7px]` → `h-1` (inner fill uses `inset-y-0`, keep its `rounded-full`).

- [ ] **Step 3: Add RiskStatusPill** — insert above `function AnalystPreview()`:

```tsx
/* Light-canvas status pills for the position-risk table (spec: emerald/red, amber for near-limit). */
const RISK_PILL: Record<string, string> = {
  "Over limit": "bg-red-50 text-red-700 border border-red-200",
  "Near limit": "bg-amber-50 text-amber-700 border border-amber-200",
  "Within limit": "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

function RiskStatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium",
        RISK_PILL[status],
      )}
    >
      {status}
    </span>
  );
}
```

- [ ] **Step 4: Use it in the Position Risk table** — line 310 (AnalystPreview tbody only):

```tsx
                <RiskStatusPill status={r.status} />
```
Leave the identical `ToneChip` lines in `OperationsPreview` (line 349) and `SmePreview` (line 406) untouched.

- [ ] **Step 5: Verify**

Run: `grep -n "data-\[state=active\]:bg-slate-900\|h-1 flex-1\|RiskStatusPill" src/components/payo/landing-sections.tsx && ! grep -n "data-\[state=active\]:bg-\[#FF6B00\]" src/components/payo/landing-sections.tsx`

- [ ] **Step 6: Commit**

```bash
git add src/components/payo/landing-sections.tsx
git commit -m "style(roles): slate active tab, h-1 limit bars, standardized risk status pills"
```

---

### Task 5: Section 5 — chevron stepper, neutral Planned pills, brighter source tags

**Files:**
- Modify: `src/components/payo/landing-sections.tsx` — lucide import (line 4), rail chevron (line 587), `PlannedBadge` (line 558), inspector Sources `li` (line 675)

**Interfaces:**
- Consumes: `ChevronRight` from lucide-react (add).
- Produces: neutral slate connector chrome. **Scope confirmed:** only inspector Sources chips; "Available now" chips unchanged.

- [ ] **Step 1: Add the import** — line 4:

```tsx
import { ArrowRight, ArrowUpRight, Check, ChevronRight, ExternalLink, FileText, Zap } from "lucide-react";
```

- [ ] **Step 2: SVG chevron between rail nodes** — line 587 (parent div already `aria-hidden`):

```tsx
                {i > 0 && <ChevronRight className="size-3.5 text-slate-600" />}
```

- [ ] **Step 3: Neutralize PlannedBadge** — line 558:

```tsx
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-700/60 bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
```
Keep the dot `bg-[#94A3B8]` (identical to slate-400).

- [ ] **Step 4: Brighter source tags** — ⚠️ the "Available now" chips share the exact same class string; disambiguate by context (the `li` inside `selected.sources.map`). Replace:

```tsx
                  <li
                    key={s.name}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-800/50 px-2 py-1 text-[11.5px] text-slate-300"
                  >
                    <span className="grid size-4 place-items-center overflow-hidden">
```

- [ ] **Step 5: Verify**

Run: `grep -n "ChevronRight" src/components/payo/landing-sections.tsx && grep -c "bg-slate-800/80" src/components/payo/landing-sections.tsx && grep -c "bg-white/\[0.04\] px-2 py-1 text-\[11.5px\] text-\[#A7B0BA\]" src/components/payo/landing-sections.tsx`
Expected: import + usage found, `1` PlannedBadge, `1` remaining (untouched "Available now" chip).

- [ ] **Step 6: Commit**

```bash
git add src/components/payo/landing-sections.tsx
git commit -m "style(connectors): chevron rail, neutral planned pills, brighter source tags"
```

---

### Task 6: Section 6 — dotted workspace grid + stepper label contrast

**Files:**
- Modify: `src/components/payo/feature-demo.tsx` — workspace card (line 423), `statusChip` (lines 345–360)

**Interfaces:**
- Produces: dotted canvas card; stepper chips `text-slate-800` active / `text-slate-400` inactive.

- [ ] **Step 1: Dotted workspace grid** — line 423 (`bg-white` color + radial image compose; no overlay div):

```tsx
          <div className="mt-5 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] p-6 shadow-[0_16px_32px_-8px_rgba(0,0,0,0.06)]">
```

- [ ] **Step 2: Stepper label colors** — inside `statusChip` (tone tint backgrounds retained; wrapper already carries `font-medium`):

```tsx
        active
          ? tone === "ok"
            ? "bg-ok-tint text-slate-800"
            : tone === "warn"
              ? "bg-warn-tint text-slate-800"
              : "bg-neutral-tint text-slate-800"
          : "text-slate-400",
```

- [ ] **Step 3: Verify**

Run: `grep -n "radial-gradient(#e2e8f0_1px,transparent_1px)" src/components/payo/feature-demo.tsx && grep -c "text-slate-400" src/components/payo/feature-demo.tsx`

- [ ] **Step 4: Commit**

```bash
git add src/components/payo/feature-demo.tsx
git commit -m "style(demo): dotted workspace grid, slate stepper label contrast"
```

---

### Task 7: Section 7 — template canvas fills, area gradient, dark red banners

**Files:**
- Modify: `src/components/payo/template-library.tsx` — 3 canvas containers (lines 65, 108, 161), `ResearchCanvas` SVG (lines 162–179), alert pills (lines 94–97, 149–153)

**Interfaces:**
- Produces: SVG `<defs>` gains `id="blue-gradient"` (unique in repo — verified by grep). **Scope confirmed:** both alert pills restyled; green "Briefing approved" pill untouched.

- [ ] **Step 1: Canvas container fills** — string appears exactly 3×; replace all with:

```
flex h-[216px] flex-col justify-between rounded-xl border border-white/10 bg-[#111827] p-3.5
```

- [ ] **Step 2: Area gradient under the curve** — add to `<defs>` after `tpl-spark`:

```tsx
          <linearGradient id="blue-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </linearGradient>
```
Insert before the existing stroke `<path>`:

```tsx
        <path
          d="M4 48 L 40 42 L 76 45 L 112 34 L 148 37 L 184 24 L 220 28 L 256 12 L 296 8 L 296 56 L 4 56 Z"
          fill="url(#blue-gradient)"
        />
```
Note: an end-node dot already exists (`<circle cx="296" cy="8" r="2.5" fill="#0EA5E9" />`) — no change needed.

- [ ] **Step 3: Dark red exception banners** — NavCanvas pill (lines 94–97):

```tsx
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300">
          <span className="size-1.5 rounded-full bg-red-300" aria-hidden="true" />
```
RiskCanvas pill (line 149):

```tsx
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300">
```
(the `TriangleAlert` icon inherits `currentColor` → red-300)

- [ ] **Step 4: Verify**

Run: `grep -c "bg-\[#111827\]" src/components/payo/template-library.tsx && grep -n "blue-gradient" src/components/payo/template-library.tsx && ! grep -n "FFA45C\|EF4444" src/components/payo/template-library.tsx`
Expected: `3`, gradient def + fill, no old colors.

- [ ] **Step 5: Commit**

```bash
git add src/components/payo/template-library.tsx
git commit -m "style(templates): deep canvas fills, curve area gradient, dark red alert banners"
```

---

### Task 8: Section 8 + Early Access — emerald checkmarks, dark form inputs

**Files:**
- Modify: `src/components/payo/landing-sections.tsx:757-762` (checkmark span)
- Modify: `src/components/payo/waitlist.tsx:218` (email input), `:306` (password input), `:239` (role buttons)

**Interfaces:**
- Produces: light-mode checkmark tiles; fixed dark-slate form controls. **Scope confirmed:** both inputs restyled; active role-button state unchanged.

- [ ] **Step 1: Checkmark icon containers** — in `TrustSection` (glow removed; `size-8` = `w-8 h-8`):

```tsx
              <span
                className="grid size-8 place-items-center rounded-lg border border-emerald-200/80 bg-emerald-50 text-emerald-600"
                aria-hidden="true"
              >
```

- [ ] **Step 2: Dark email input** — `waitlist.tsx:218`:

```tsx
                  className="h-9 w-full rounded-md border border-slate-700 bg-slate-900/80 px-2.5 text-[13.5px] text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-[#FF6B00]"
```

- [ ] **Step 3: Dark admin password input** — `waitlist.tsx:306`, same but keep `pr-9` (clears the eye toggle):

```tsx
                    className="h-9 w-full rounded-md border border-slate-700 bg-slate-900/80 px-2.5 pr-9 text-[13.5px] text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-[#FF6B00]"
```

- [ ] **Step 4: Role filter buttons (inactive state)** — `waitlist.tsx:239` (keep `bg-background`; active branch untouched):

```tsx
                            : "border-slate-700 bg-background text-slate-300 hover:border-slate-500",
```

- [ ] **Step 5: Verify**

Run: `grep -n "rounded-lg border border-emerald-200/80" src/components/payo/landing-sections.tsx && grep -c "border-slate-700 bg-slate-900/80" src/components/payo/waitlist.tsx && ! grep -n "boxShadow" src/components/payo/landing-sections.tsx`
Expected: match, `2` inputs, no inline boxShadow left.

- [ ] **Step 6: Lint the whole change set** — DEFERRED per standing user instruction ("don't test until I told you to do so").

- [ ] **Step 7: Commit** — deferred pending user instruction (previous session recorded a standing "no commit or push").

---

## Self-Review

- **Spec coverage:** S1 → Task 1 (variance bars confirmed no-op); S2 → Task 2; S3 → Task 3; S4 → Task 4; S5 → Task 5; S6 → Task 6; S7 → Task 7; S8 → Task 8. All 8 spec sections covered.
- **Placeholder scan:** none — every step carries exact old/new strings and verify commands.
- **Type consistency:** `RiskStatusPill` defined (Task 4) and consumed (Task 4); `ChevronRight` imported and used (Task 5); `blue-gradient` defined and referenced within Task 7.
- **Inferences flagged inline:** axis-line count/positions (Task 2 Step 3), sparkline baseline y=50 (Task 3 Step 3), removal of left accent border + hover slide (Task 2 Step 4).
- **Deferred by standing instruction:** lint, visual Playwright capture, commits.

## Execution status (2026-10-02)

- Tasks 1–8: all edits applied and grep-verified. Steps 1–N of each task done.
- Task 1 grep note: remaining `text-white/60` at `landing.tsx:111` is the nav links (out of scope, untouched).
- Task 7 grep note: `#EF4444` remains at `template-library.tsx:82` (exception row tint) and `:134` (concentration bar fill) — data-viz elements, not banners, out of scope.
- Lint (Task 8 Step 6), visual captures, and all commit steps: deferred per standing user instructions ("don't test until I told you to do so"; previous session's "no commit or push").
- Task 1 follow-up (same day): user directive replaced the glass headline pill with "Clean Accent Text" — `Automated` and `Auditable.` now `text-[#FF6B00]` spans, pill wrapper and the dead `.payo-neon .headline-bar` CSS rule removed. Responsive type scale + line breaks kept; HeroThreads anchor coordinates (landing.tsx:69-86) were tuned to the old pill metrics and may drift a few px — retune during visual QA if needed.
- Task 2 follow-up (same day): user directive replaced the `GrowthBars` component entirely with `GrowthTrend` — a smooth SVG area trend (curve `#FF6B00` w=2.5 round cap, `growth-area` gradient 0.12→0, dashed `#E2E8F0` gridlines), HTML-overlay nodes/labels percentage-mapped to the 320×120 viewBox (`preserveAspectRatio="none"` + `vectorEffect="non-scaling-stroke"`), `+69% Growth` badge in a right-aligned header row, citation wrapper → `text-xs text-slate-400`.
- Task 6 follow-up (same day): user directive restyled the FeatureDemo section — orange active tabs on `bg-slate-100/80` segment container (hover scoped to `data-[state=inactive]`), card → `rounded-xl border-slate-200 shadow-sm` (supersedes the dotted-grid/rounded-2xl treatment), mono slate "Run again", amber paused banner + spec CTAs (`h-auto` added to defeat Button `h-9`; `has-[>svg]:px-4` on primary CTA to defeat Button's `has-[>svg]:px-3`), uniform mono stepper chips (tone param removed from `statusChip`), dark slate "Mark ready". Out-of-spec leftovers flagged: "returned" banner still orange `#FFF0E6`, idle "Run on sample data" button still old orange, header/footer `border-[#E2E8F0]` dividers, status-line icon still `#E14E00`.
- Working tree also carries the previous session's uncommitted dark-mode rework; the two change sets are intentionally not interleaved into commits.
