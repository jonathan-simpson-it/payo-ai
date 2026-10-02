# Payoo Character Doc + Chat Bubble Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the orange character an official identity — a `docs/characters/PAYOO.md` spec — and add a global, non-functional "Coming soon" Payoo chat bubble to the bottom-right corner.

**Architecture:** One new markdown doc, one one-line code-comment update, one new presentational component (`PayooChat`), and two small wiring edits in `app.tsx` (render the bubble globally; move the Sonner toaster to bottom-left). No dependencies, no state, no routing changes.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, existing `PayoMark` SVG component.

**Spec:** This plan (user directives 2026-10-02 + 7 decisions confirmed this session).

## Global Constraints

- The character is named **Payoo** in docs; the exported component stays `PayoMark` (6 import sites untouched).
- The bubble is **non-interactive**: `disabled`, `pointer-events-none`, `aria-label`, always-visible "Coming soon" pill. No click behavior, no popover.
- Toaster moves to `position="bottom-left"`; no other toaster changes.
- Facts in the MD must match the code exactly — no invented lore (user chose design-spec-only).
- Standing user instruction: **do not run tests / lint / visual captures until the user asks.** Verification = targeted grep only. No commits (standing "no commit or push" instruction).

---

### Task 1: Payoo character doc + code comment

**Files:**
- Create: `docs/characters/PAYOO.md`
- Modify: `src/components/payo/mark.tsx:4` (doc comment first line)

**Interfaces:**
- Produces: canonical character doc at `docs/characters/PAYOO.md`, referenced from the `mark.tsx` comment. No code consumes it.

- [x] **Step 1: Create `docs/characters/PAYOO.md`** — content as written in the approved plan (see execution record at bottom).
- [x] **Step 2: Update the comment** — `mark.tsx` line 4 → ` * Payoo: the little workflow helper (see docs/characters/PAYOO.md).`
- [x] **Step 3: Verify** — grep checks pass.
- [ ] **Step 4: Commit** — deferred per standing "no commit" instruction.

---

### Task 2: Global Payoo chat bubble ("Coming soon")

**Files:**
- Create: `src/components/payo/payoo-chat.tsx`
- Modify: `src/components/payo/app.tsx` (import block + Router return)

**Interfaces:**
- Consumes: `PayoMark` from `@/components/payo/mark`.
- Produces: `export function PayooChat()` — no props; renders fixed bottom-right, `z-40` (below Radix dialogs' `z-50`), non-interactive.

- [x] **Step 1: Create `src/components/payo/payoo-chat.tsx`** — content as written in the approved plan.
- [x] **Step 2: Wire it into `app.tsx`** — add `import { PayooChat } from "@/components/payo/payoo-chat";` after the AboutDemoDialog import.
- [x] **Step 3: Render globally + move the toaster** — `<PayooChat />` after `<AboutDemoDialog />`; `<Toaster position="bottom-left" />`.
- [x] **Step 4: Verify** — grep checks pass.
- [ ] **Step 5: Commit** — deferred per standing "no commit" instruction.

---

## Self-Review

- **Coverage:** MD file (Task 1, user's naming/location/content choices) + code comment rename (Task 1) + FAB icon = PayoMark (Task 2) + "Coming soon" always-visible pill (Task 2) + non-functional/disabled (Task 2) + global placement (Task 2) + toaster moved bottom-left (Task 2). All confirmed decisions implemented.
- **Placeholders:** none — full file contents and exact diffs included in the approved plan presented to the user 2026-10-02.
- **Facts verified:** every coordinate, colour, keyframe, timing, and size in the MD table was read from `mark.tsx`, `globals.css`, and the six usage sites during this session.
- **A11y:** SVG stays `aria-hidden`; the disabled button carries `aria-label`; `disabled` removes it from tab order.
- **Deferred:** lint, visual capture, commits.

## Execution record (2026-10-02)

- Executed via subagent-driven development: fresh subagent per task, reviewed between tasks. Both tasks completed and grep-verified; lint/testing/commits deferred per standing instructions.
