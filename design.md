# Payo AI — Design Contract

This is the implementation contract for the Payo interface. `docs/DESIGN-PHILOSOPHY.md` explains
why the product works this way; this file defines exactly how it looks and behaves, and every
screen is reviewed against it before merge.

The one-sentence test: a screen must be describable as
**"the place where a finance user makes one clear decision about one visible workflow."**

## 1. Design promise

Payo makes a complex finance process feel like a short sequence of understandable decisions.
Every screen helps the user answer one of: what am I building or reviewing, what happens next,
what do I need to decide, what evidence supports the result, is this ready to release.
If a visual element does not serve one of those questions, it is removed or made secondary.

## 2. Colour

Colour is a semantic signal, never decoration. Hierarchy comes from surface tones, text contrast,
spacing, border weight, typography and selected-state outlines — not from colour.

| Meaning | Token | Light | Dark |
| --- | --- | --- | --- |
| Action, selection, navigation | `primary` / `primary-strong` / `primary-ink` | `#14556B` / `#0F4459` / `#14556B` | `#2E7D93` / `#3C93AA` / `#6FB4C6` |
| Complete | `ok` / `ok-tint` | `#1F7350` / `#E9F3EE` | `#4FAE7E` / `#122A20` |
| Needs review | `warn` / `warn-tint` | `#96650A` / `#FAF2E1` | `#C99A3F` / `#2E2515` |
| Exception | `danger` / `danger-tint` | `#B3261E` / `#FAECEA` | `#E06A5F` / `#331A18` |
| Neutral / draft | `neutral` / `neutral-tint` | `#6F7680` / `#EFEFEC` | `#8B939B` / `#22282E` |
| Payo brand mark | fixed in the mascot SVG | `#F97316` body | unchanged |

Surfaces: light theme uses warm paper `#F6F5F1` with white cards and `#E5E3DD` borders.
Dark theme uses near-black `#101316` with `#171B1F` cards and `#262C32` borders. The dark theme is
the "workstation" surface: petrol brightens slightly for selected nodes and progress so structure
stays legible, while tables and the light shell remain restrained.

Rules:
- Orange never signals a state; it only marks the Payo character and tiny brand details.
- Never use colour as the only channel for a state — pair it with a label, icon or outline.
- If removing colour still leaves the hierarchy clear, the design is working.

## 3. Typography

- Inter for UI; mono (`Geist Mono`) only for small technical labels.
- Tabular numerals (`tabular-nums`) for NAV, exposure, percentages, dates, durations and codes.
- Sentence case for labels and actions; uppercase only for small section labels (`REVIEW QUEUE`).
- Primary action labels are verbs: `Run workflow`, `Test on sample data`, `Approve summary`,
  `Return for review`, `Mark ready`, `Explore the workspace`.
- No marketing language inside the workspace.

## 4. Shape, surface and squircles

- **Continuous curvature everywhere.** A global `@supports (corner-shape: squircle)` rule applies
  `corner-shape: squircle` to all elements, so every radius reads as a smooth superellipse corner
  instead of a circular arc. Native Chrome/Edge 139+ today; Safari/Firefox fall back to the same
  small radii until they ship the standard. Never add per-element squircle hacks.
- Radii: controls and chips 5–8px (`radius-sm`–`radius-lg`), overlays up to 11px (`radius-xl`).
  Pills are reserved for status, category and filter labels.
- Flat surfaces and 1px borders define structure. Shadows only separate overlays and inspectors.
- Avoid stacked cards with identical radius, background and shadow.

## 5. Status vocabulary

Workflow: `Draft` (editable) → `Testing` (sample run in progress) → `Tested` → `Ready to publish`.
Runs: `Draft`, `Running`, `Needs review`, `Completed`. Every status label implies a next action.
Green, amber and red appear only where a status genuinely completes, waits or fails.

## 6. Modes

The builder has explicit boundaries: **Build** (edit the workflow) and **Test** (run sample data and
inspect results), plus **History** (simulated activity and ready-state changes). Editing controls and
release controls never mix without a visible mode header. The workflow run itself is a separate,
simulated experience with the review gate.

## 7. Components

- **Step cards**: sequence number, finance-facing action name, one-line purpose, source or key
  setting, run state, visible selection (border + pressed state), never colour-only.
- **Inspector**: one contextual panel for the selected step — what it does, what it receives, the
  small set of settings most users need, what it produces, and an `Advanced` disclosure.
- **Add step**: opens at the insertion point, curated finance categories (Load data, Map fields,
  Calculate, Check limit, Draft summary, Request review, Create report); no connector catalogue.
- **Tables**: compact, 12–13px, tabular numerals, thin row dividers, status chips; source noted
  wherever a result could be mistaken for live data.
- **Review gate**: shows what was flagged, why, the values and threshold, the expected reviewer,
  and what approving or returning will do next.
- **Connector tiles (landing)**: grouped planned connections with quiet icon fan-out on hover or
  focus, one inline inspector, and a `Planned` tag; never presented as connected.
- **Dialogs/overlays**: flat, bordered, focus-trapped; one primary action.

## 8. Evidence and labelling

Every example, preview, run, decision and connection carries the right label:
`Sample data`, `Simulated`, `Simulated preview`, `AI-assisted draft`, `Planned — not connected`.
Source language is concrete: `Sample administrator NAV — 29 Sep 2026`, `Tolerance ±0.50%`.
Nothing may imply live market data, real integrations, regulatory approval or guaranteed savings.

## 9. Motion

Slow, quiet, purposeful: step completions, progress ticks, icon fan-out. No celebration effects,
no auto-playing spectacle, no fake live telemetry. Under `prefers-reduced-motion: reduce` animation
collapses to its end state (CSS rule plus JS checks in animated components).

## 10. Accessibility

Keyboard access, visible focus (petrol ring), selected state not colour-only, named controls, and
`aria-pressed` / `aria-expanded` where a control toggles. Tables remain legible at 1024px; the full
experience is composed at 1440px. Light/dark follows the system with a manual override.

## 11. Empty states

- Empty workflow: `Choose a finance template to begin.`
- Empty review queue: `No sample exceptions are waiting for review.`
- Empty connections: `No live connections are configured. This prototype uses sample inputs.`

## 12. Never

No chat as the default surface, no blank canvas, no connector marketplace, no raw JSON, no model
settings, no branching playground. No emoji, sparkles, glow, gradients, orbs or robot art. No
fictional client logos, no regulator marks, no unverified claims.

## 13. Review checklist

- **Clarity**: can a first-time user say what this screen is for and what to do next?
- **Focus**: one dominant working surface, one contextual inspector, advanced options hidden.
- **Trust**: source, threshold and evidence visible; human decision explicit; every simulated
  state labelled.
- **Finance fit**: numbers scannable, status colours operational, serves professional and SME
  users without becoming generic.
- **Restraint**: nothing decorative without a decision to help; mascot present but secondary.
