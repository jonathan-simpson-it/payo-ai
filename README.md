# Payo AI

A V0 product prototype of a finance workflow workspace: start from a template, adjust the steps, run it on labelled sample data, review exceptions, and inspect the output.

Everything in this repository is simulated. Workflows, runs, sources, connections, approvals and reports use fictional sample data and are labelled as such in the interface. Payo is not an SFC-licensed firm and this prototype does not provide compliance determinations, live data, or real integrations.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS v4 with a light/dark token system
- Radix-based UI primitives, lucide icons, sonner toasts, next-themes
- Hash-based client routing; no backend or external API calls

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Other scripts: `npm run build`, `npm start`, `npm run lint`.

## Documentation

- `design.md` — the design contract: palette, typography, shape (squircles), components, motion, copy rules.
- `docs/DESIGN-PHILOSOPHY.md` — why the product is shaped this way.
- `docs/PAYO-AI-V0-PRD.md` — the original V0 product brief.
