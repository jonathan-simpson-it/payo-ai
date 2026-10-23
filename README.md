# Payo AI

A V0 product prototype of a finance workflow workspace: start from a template, adjust the steps, run it on labelled sample data, review exceptions, and inspect the output.

Everything in this repository is simulated. Workflows, runs, sources, connections, approvals and reports use fictional sample data and are labelled as such in the interface. Payo is not an SFC-licensed firm and this prototype does not provide compliance determinations, live data, or real integrations.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS v4 with a light/dark token system
- Radix-based UI primitives, lucide icons, sonner toasts, next-themes
- Hash-based client routing; workflow data is in-memory client state
- DeepSeek (OpenAI-compatible) for the natural-language authoring endpoints (`/api/authoring/draft` and `/api/authoring/change`). The key stays server-side; drafted and changed workflows are always drafts you review before testing or publishing.

## Getting started

```bash
npm install
cp .env.example .env.local   # then set DEEPSEEK_API_KEY (and MONGO_URI if you use the waitlist)
npm run dev
```

Then open http://localhost:3000. To describe a workflow, open **Create** in the workspace, or the landing page "Generate Your First Graph" button. Without a key, drafting shows a clear message and you can still start from a template.

Other scripts: `npm run build`, `npm start`, `npm run lint`, `npm run test` (Vitest unit tests for the authoring core).

## Samples and versions

- `public/samples/` contains three example Excel workbooks: a bank statement, a ledger, and the reconciliation output. Bank rows match ledger rows on `TID`; the reconciliation sheet shows the matched `Ledger UID`, the difference, and the status for every row.
- Publishing a workflow records a version snapshot. Open **History** in the studio to see published versions or restore one as a new draft. Published versions are kept.

## Documentation

- `design.md` — the design contract: palette, typography, shape (squircles), components, motion, copy rules.
- `docs/DESIGN-PHILOSOPHY.md` — why the product is shaped this way.
- `docs/PAYO-AI-V0-PRD.md` — the original V0 product brief.
