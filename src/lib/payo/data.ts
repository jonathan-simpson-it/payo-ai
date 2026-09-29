import type {
  FieldOption,
  Run,
  RunStepRecord,
  RunStepState,
  StepConfig,
  StepDef,
  StepTypeId,
  TemplateDef,
  Workflow,
} from "./types";

/**
 * Payo AI — local mock data and template definitions.
 * Every dataset here is fictional and labelled as sample data in the interface.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Step type catalogue
// ─────────────────────────────────────────────────────────────────────────────

export const STEP_TYPE_LABELS: Record<StepTypeId, string> = {
  load: "Load data",
  map: "Map fields",
  calculate: "Calculate",
  check: "Check limit",
  draft: "Draft summary",
  review: "Request review",
  report: "Create report",
};

const opts = (...labels: string[]): FieldOption[] =>
  labels.map((l) => ({ value: l, label: l }));

// ─────────────────────────────────────────────────────────────────────────────
// Sample data — NAV reconciliation
// ─────────────────────────────────────────────────────────────────────────────

export interface NavFundRow {
  fund: string;
  adminNav: number;
  internalNav: number;
  note: string;
}

export const NAV_FUNDS: NavFundRow[] = [
  { fund: "Ashbourne Global Equity", adminNav: 48215600, internalNav: 48214850, note: "Matched within tolerance" },
  { fund: "Brookfield Income", adminNav: 12684320, internalNav: 12684320, note: "Matched" },
  { fund: "Calverton Emerging Markets", adminNav: 8942150, internalNav: 8904600, note: "Pricing timing difference — immaterial" },
  { fund: "Delmore Credit", adminNav: 21308900, internalNav: 21318400, note: "Fee accrual difference — immaterial" },
  { fund: "Elmwood Sterling Bond", adminNav: 15770450, internalNav: 15770450, note: "Matched" },
  { fund: "Ferngate Diversified", adminNav: 9864720, internalNav: 9998300, note: "Unlisted holding priced differently — query raised with administrator" },
  { fund: "Greystoke Alternatives", adminNav: 6203440, internalNav: 6199080, note: "Matched within tolerance" },
  { fund: "Harborpoint Property", adminNav: 4518300, internalNav: 4438250, note: "Late valuation adjustment missing from administrator file" },
];

export type NavRowStatus = "Matched" | "Within tolerance" | "Exception";

export interface NavResultRow extends NavFundRow {
  difference: number;
  diffPct: number;
  status: NavRowStatus;
}

export function navResults(tolerance: number): NavResultRow[] {
  return NAV_FUNDS.map((f) => {
    const difference = f.internalNav - f.adminNav;
    const diffPct = (difference / f.adminNav) * 100;
    const abs = Math.abs(diffPct);
    const status: NavRowStatus =
      abs === 0 ? "Matched" : abs <= tolerance ? "Within tolerance" : "Exception";
    return { ...f, difference, diffPct, status };
  });
}

export function navExceptions(tolerance: number): NavResultRow[] {
  return navResults(tolerance).filter((r) => r.status === "Exception");
}

export function navTotals(tolerance: number) {
  const rows = navResults(tolerance);
  const adminTotal = rows.reduce((s, r) => s + r.adminNav, 0);
  const internalTotal = rows.reduce((s, r) => s + r.internalNav, 0);
  const difference = internalTotal - adminTotal;
  return {
    adminTotal,
    internalTotal,
    difference,
    diffPct: (difference / adminTotal) * 100,
    matched: rows.filter((r) => r.status === "Matched").length,
    within: rows.filter((r) => r.status === "Within tolerance").length,
    exceptions: rows.filter((r) => r.status === "Exception").length,
    fundCount: rows.length,
  };
}

export const NAV_VALUATION_DATE = "29 September 2026";
export const NAV_SOURCES = [
  "Sample administrator NAV — 29 Sep 2026",
  "Sample internal valuation — 29 Sep 2026",
  "Fund reference list — sample",
];

// ─────────────────────────────────────────────────────────────────────────────
// Sample data — Position risk review
// ─────────────────────────────────────────────────────────────────────────────

export interface RiskPosition {
  position: string;
  assetType: string;
  marketValue: number;
  limitPct: number;
  reviewerNote: string;
}

export const RISK_POSITIONS: RiskPosition[] = [
  { position: "Ashbourne Global Equity", assetType: "Global equity", marketValue: 6850000, limitPct: 18, reviewerNote: "Concentration rose after the March inflow — reduction scheduled" },
  { position: "US Treasury 10Y", assetType: "Government bond", marketValue: 5830000, limitPct: 25, reviewerNote: "—" },
  { position: "Delmore Credit Fund", assetType: "Credit", marketValue: 4940000, limitPct: 12, reviewerNote: "Awaiting credit committee decision on the limit" },
  { position: "Brookfield Income Fund", assetType: "Multi-asset income", marketValue: 3120000, limitPct: 15, reviewerNote: "—" },
  { position: "Calverton Emerging Markets", assetType: "EM equity", marketValue: 2890000, limitPct: 12, reviewerNote: "—" },
  { position: "Elmwood Sterling Bond", assetType: "Bond fund", marketValue: 2670000, limitPct: 12, reviewerNote: "—" },
  { position: "Greystoke Alternatives", assetType: "Alternatives", marketValue: 2280000, limitPct: 7, reviewerNote: "Approaching limit — monitored monthly" },
  { position: "Ferngate Diversified", assetType: "Diversified growth", marketValue: 2240000, limitPct: 12, reviewerNote: "—" },
  { position: "EUR/GBP forward", assetType: "FX forward", marketValue: 1875000, limitPct: 8, reviewerNote: "—" },
  { position: "Gold futures", assetType: "Commodity", marketValue: 1460000, limitPct: 6, reviewerNote: "—" },
];

export const RISK_PORTFOLIO_TOTAL = RISK_POSITIONS.reduce((s, p) => s + p.marketValue, 0);
export const RISK_AS_AT = "29 September 2026";

export type RiskRowStatus = "Over limit" | "Near limit" | "Within limit";

export interface RiskResultRow extends RiskPosition {
  weight: number;
  utilisation: number;
  status: RiskRowStatus;
}

export function riskResults(reviewThreshold: number): RiskResultRow[] {
  return RISK_POSITIONS.map((p) => {
    const weight = (p.marketValue / RISK_PORTFOLIO_TOTAL) * 100;
    const utilisation = (weight / p.limitPct) * 100;
    const status: RiskRowStatus =
      weight > p.limitPct
        ? "Over limit"
        : utilisation >= reviewThreshold
          ? "Near limit"
          : "Within limit";
    return { ...p, weight, utilisation, status };
  });
}

export const RISK_SOURCES = [
  "Sample positions — 29 Sep 2026",
  "Sample limit policy — standard",
];

// ─────────────────────────────────────────────────────────────────────────────
// Sample data — Daily market movements
// ─────────────────────────────────────────────────────────────────────────────

export interface MarketMove {
  instrument: string;
  group: "Indices" | "FX" | "Rates";
  level: string;
  changePct: number;
}

export const MARKET_SNAPSHOT: MarketMove[] = [
  { instrument: "FTSE 100", group: "Indices", level: "8,214.60", changePct: 0.8 },
  { instrument: "S&P 500", group: "Indices", level: "5,482.30", changePct: 0.4 },
  { instrument: "Nikkei 225", group: "Indices", level: "39,204.00", changePct: -1.2 },
  { instrument: "Euro Stoxx 50", group: "Indices", level: "5,012.40", changePct: 0.3 },
  { instrument: "MSCI Emerging Markets", group: "Indices", level: "1,128.70", changePct: -0.9 },
  { instrument: "GBP/USD", group: "FX", level: "1.2718", changePct: -0.3 },
  { instrument: "EUR/USD", group: "FX", level: "1.0842", changePct: 0.2 },
  { instrument: "USD/JPY", group: "FX", level: "149.65", changePct: 0.6 },
  { instrument: "2Y Gilt yield", group: "Rates", level: "4.12%", changePct: 0.07 },
  { instrument: "10Y Gilt yield", group: "Rates", level: "4.05%", changePct: 0.02 },
  { instrument: "10Y US Treasury yield", group: "Rates", level: "4.28%", changePct: -0.05 },
];

export function notableMoves(threshold: number): MarketMove[] {
  return MARKET_SNAPSHOT.filter((m) => Math.abs(m.changePct) >= threshold);
}

export interface HoldingLink {
  holding: string;
  exposure: string;
  move: string;
  estImpact: number;
  note: string;
}

export const HOLDING_LINKS: HoldingLink[] = [
  {
    holding: "Ashbourne Global Equity",
    exposure: "Japanese equities (28% of fund)",
    move: "Nikkei 225 −1.2%",
    estImpact: -23000,
    note: "Largest single-day effect on this holding this month",
  },
  {
    holding: "Calverton Emerging Markets",
    exposure: "Emerging-market equity",
    move: "MSCI Emerging Markets −0.9%",
    estImpact: -26000,
    note: "Consistent with regional outflows over the week",
  },
  {
    holding: "Brookfield Income Fund",
    exposure: "UK gilts",
    move: "10Y Gilt +1bp",
    estImpact: -2000,
    note: "Minor mark-to-market effect",
  },
];

export const BRIEFING_SNAPSHOT_NOTES = [
  "Japanese shares fell 1.2% while European and US benchmarks finished modestly higher.",
  "Sterling weakened 0.3% against the US dollar, and short-dated gilt yields edged higher.",
];

export const BRIEFING_RELEVANCE = [
  "Ashbourne Global Equity holds around 28% in Japanese equities; the Nikkei 225 decline of 1.2% is an estimated £23,000 effect on the portfolio (simulated estimate).",
  "Calverton Emerging Markets broadly tracks emerging-market indices; the 0.9% decline is an estimated £26,000 effect (simulated estimate).",
  "Brookfield Income Fund carries gilt exposure; the 1bp move in 10-year gilts is a minor mark-to-market effect.",
];

export const BRIEFING_ITEMS = [
  "Confirm the Ashbourne Global Equity weight remains within its concentration limit after this week's moves.",
  "Note the Calverton Emerging Markets effect for Tuesday's risk review.",
];

export const MARKET_SOURCES = [
  "Sample market snapshot — 30 Sep 2026, 07:45",
  "Sample holdings — 29 Sep 2026",
];

export const BRIEFING_DATE = "30 September 2026";

// ─────────────────────────────────────────────────────────────────────────────
// Templates
// ─────────────────────────────────────────────────────────────────────────────

export const TEMPLATES: TemplateDef[] = [
  {
    id: "nav-reconciliation",
    category: "Operations",
    name: "NAV reconciliation",
    outcome:
      "Compare administrator NAV with internal NAV and route material differences for review.",
    sampleData: true,
    keySources: ["Administrator NAV file", "Internal valuation file"],
    steps: [
      {
        id: "load-valuations",
        type: "load",
        label: "Load sample valuations",
        purpose:
          "Brings in the administrator and internal valuations used for the comparison.",
        durationMs: 1200,
        fields: [
          { key: "primary", label: "Source file", kind: "select", options: opts("Sample administrator NAV (29 Sep)", "Sample administrator NAV (26 Sep)") },
          { key: "compare", label: "Compare against", kind: "select", options: opts("Sample internal valuation (29 Sep)", "Sample internal valuation (26 Sep)") },
          { key: "zeroFunds", label: "Include funds with a zero valuation", kind: "select", options: opts("No", "Yes"), advanced: true },
        ],
        config: { primary: "Sample administrator NAV (29 Sep)", compare: "Sample internal valuation (29 Sep)", zeroFunds: "No" },
        summary: (c) => `${c.primary}`,
      },
      {
        id: "map-funds",
        type: "map",
        label: "Map funds",
        purpose:
          "Matches administrator fund names to the internal fund list so both files can be compared.",
        durationMs: 900,
        fields: [
          { key: "matchOn", label: "Match on", kind: "select", options: opts("Fund name", "ISIN", "Fund code") },
          { key: "unmatched", label: "Unmatched funds", kind: "select", options: opts("Flag for review", "Exclude from run") },
          { key: "nameTolerance", label: "Name matching", kind: "select", options: opts("Close match", "Exact match"), advanced: true },
        ],
        config: { matchOn: "Fund name", unmatched: "Flag for review", nameTolerance: "Close match" },
        summary: () => "Matched on fund name · 8 of 8 funds",
      },
      {
        id: "calc-variance",
        type: "calculate",
        label: "Calculate variance",
        purpose: "Works out the difference between the two valuations for each fund.",
        durationMs: 1100,
        fields: [
          { key: "measure", label: "Variance measure", kind: "select", options: opts("Difference % of administrator NAV", "Absolute difference (£)", "Both") },
          { key: "rounding", label: "Round to", kind: "select", options: opts("2 decimal places", "3 decimal places", "4 decimal places") },
          { key: "sign", label: "Sign convention", kind: "select", options: opts("Internal minus administrator", "Administrator minus internal"), advanced: true },
        ],
        config: { measure: "Difference % of administrator NAV", rounding: "2 decimal places", sign: "Internal minus administrator" },
        summary: (c) => `${c.measure}`,
      },
      {
        id: "flag-breaches",
        type: "check",
        label: "Flag tolerance breaches",
        purpose: "Marks each fund whose variance is larger than the tolerance you set.",
        durationMs: 1000,
        fields: [
          { key: "tolerance", label: "Tolerance", kind: "number", suffix: "%", min: 0.05, max: 5, step: 0.05, hint: "Funds whose difference % exceeds this tolerance are marked as exceptions." },
          { key: "basis", label: "Apply tolerance to", kind: "select", options: opts("Difference %", "Absolute difference (£)") },
          { key: "absFlag", label: "Also flag absolute differences over £50,000", kind: "select", options: opts("No", "Yes"), advanced: true },
        ],
        config: { tolerance: 0.5, basis: "Difference %", absFlag: "No" },
        summary: (c) => `Tolerance ±${Number(c.tolerance).toFixed(2)}%`,
      },
      {
        id: "review-variances",
        type: "review",
        label: "Review material variances",
        purpose:
          "Stops the run so a person can review material variances before the summary is created.",
        durationMs: 800,
        fields: [
          { key: "reviewer", label: "Reviewer", kind: "select", options: opts("Operations reviewer", "Senior operations reviewer", "Fund accounting") },
          { key: "decision", label: "Decision required", kind: "static" },
          { key: "instructions", label: "Instructions to reviewer", kind: "textarea" },
          { key: "minReviewers", label: "Minimum reviewers", kind: "select", options: opts("One", "Two"), advanced: true },
        ],
        config: {
          reviewer: "Operations reviewer",
          decision: "Approve summary or return for review",
          instructions: "Check the note on each material variance and confirm the summary can be completed.",
          minReviewers: "One",
        },
        summary: (c) => `Pauses for ${c.reviewer}`,
      },
      {
        id: "create-summary",
        type: "report",
        label: "Create reconciliation summary",
        purpose: "Prepares the reconciliation summary from the checked results.",
        durationMs: 1400,
        fields: [
          { key: "title", label: "Report title", kind: "text" },
          { key: "contents", label: "Contents", kind: "select", options: opts("Exceptions and totals", "All funds", "Exceptions only") },
          { key: "reviewerNotes", label: "Include reviewer notes", kind: "select", options: opts("Yes", "No"), advanced: true },
        ],
        config: { title: "NAV reconciliation — 29 September 2026", contents: "Exceptions and totals", reviewerNotes: "Yes" },
        summary: (c) => `${c.title}`,
      },
    ],
  },
  {
    id: "position-risk",
    category: "Risk",
    name: "Position risk review",
    outcome:
      "Identify positions that exceed an exposure or concentration threshold.",
    sampleData: true,
    keySources: ["Positions file", "Limit policy"],
    steps: [
      {
        id: "load-positions",
        type: "load",
        label: "Load sample positions",
        purpose: "Brings in the position list used for the risk review.",
        durationMs: 1200,
        fields: [
          { key: "primary", label: "Source file", kind: "select", options: opts("Sample positions (29 Sep)", "Sample positions (26 Sep)") },
          { key: "count", label: "Positions", kind: "static" },
          { key: "includeFx", label: "Include FX forwards", kind: "select", options: opts("Yes", "No"), advanced: true },
        ],
        config: { primary: "Sample positions (29 Sep)", count: "10 positions across 6 asset types", includeFx: "Yes" },
        summary: (c) => `${c.primary}`,
      },
      {
        id: "calc-exposure",
        type: "calculate",
        label: "Calculate exposure",
        purpose: "Works out each position's weight of the portfolio total.",
        durationMs: 1100,
        fields: [
          { key: "basis", label: "Exposure basis", kind: "select", options: opts("Market value as % of portfolio", "Market value in GBP") },
          { key: "portfolioTotal", label: "Portfolio total", kind: "static" },
          { key: "unsettled", label: "Include unsettled trades", kind: "select", options: opts("No", "Yes"), advanced: true },
        ],
        config: { basis: "Market value as % of portfolio", portfolioTotal: "£34,155,000 — sample portfolio total", unsettled: "No" },
        summary: (c) => `${c.basis}`,
      },
      {
        id: "compare-limits",
        type: "check",
        label: "Compare with limits",
        purpose: "Reads the applicable limit for each position from the limit policy.",
        durationMs: 1000,
        fields: [
          { key: "limitType", label: "Limit type", kind: "select", options: opts("Single-position concentration", "Position weight vs portfolio total") },
          { key: "policy", label: "Applicable limits", kind: "select", options: opts("Standard policy by asset type", "Conservative policy") },
          { key: "classTotals", label: "Also check asset-type totals", kind: "select", options: opts("No", "Yes"), advanced: true },
        ],
        config: { limitType: "Single-position concentration", policy: "Standard policy by asset type", classTotals: "No" },
        summary: (c) => `${c.limitType}`,
      },
      {
        id: "flag-breaches",
        type: "check",
        label: "Flag breaches",
        purpose: "Lists positions that are over their limit, or close enough to warrant a look.",
        durationMs: 1000,
        fields: [
          { key: "threshold", label: "Review threshold", kind: "number", suffix: "% of limit", min: 50, max: 100, step: 5, hint: "Positions using at least this share of their limit are listed for review." },
          { key: "includeNear", label: "Near-limit positions in summary", kind: "select", options: opts("Yes", "No") },
        ],
        config: { threshold: 90, includeNear: "Yes" },
        summary: (c) => `Review threshold ${c.threshold}% of limit`,
      },
      {
        id: "analyst-review",
        type: "review",
        label: "Analyst review",
        purpose: "Stops the run so a risk analyst can review flagged positions before the summary is published.",
        durationMs: 800,
        fields: [
          { key: "reviewer", label: "Reviewer", kind: "select", options: opts("Risk analyst", "Senior risk analyst") },
          { key: "decision", label: "Decision required", kind: "static" },
          { key: "instructions", label: "Instructions to reviewer", kind: "textarea" },
        ],
        config: {
          reviewer: "Risk analyst",
          decision: "Approve summary or return for review",
          instructions: "Confirm the note on each breach and whether the position remains within appetite.",
        },
        summary: (c) => `Pauses for ${c.reviewer}`,
      },
      {
        id: "publish-summary",
        type: "report",
        label: "Publish risk summary",
        purpose: "Prepares the risk summary from the checked results.",
        durationMs: 1400,
        fields: [
          { key: "title", label: "Report title", kind: "text" },
          { key: "contents", label: "Contents", kind: "select", options: opts("Breaches and near-limit positions", "All positions") },
        ],
        config: { title: "Position risk summary — 29 September 2026", contents: "Breaches and near-limit positions" },
        summary: (c) => `${c.title}`,
      },
    ],
  },
  {
    id: "market-movements",
    category: "Research",
    name: "Daily market movements",
    outcome:
      "Produce a concise morning brief from market moves and holdings context.",
    sampleData: true,
    keySources: ["Market snapshot", "Holdings file"],
    steps: [
      {
        id: "load-snapshot",
        type: "load",
        label: "Load market snapshot",
        purpose: "Brings in the morning snapshot of indices, FX and rates.",
        durationMs: 1100,
        fields: [
          { key: "source", label: "Source file", kind: "select", options: opts("Sample market snapshot (30 Sep, 07:45)", "Sample market snapshot (29 Sep, 07:45)") },
          { key: "includes", label: "Snapshot includes", kind: "static" },
        ],
        config: { source: "Sample market snapshot (30 Sep, 07:45)", includes: "Indices, FX and rates — 11 instruments" },
        summary: (c) => `${c.source}`,
      },
      {
        id: "notable-moves",
        type: "check",
        label: "Identify notable moves",
        purpose: "Separates the morning's notable moves from background noise.",
        durationMs: 900,
        fields: [
          { key: "threshold", label: "Notable move threshold", kind: "number", suffix: "%", min: 0.1, max: 3, step: 0.05, hint: "Instruments that moved at least this much are treated as notable." },
          { key: "appliesTo", label: "Applies to", kind: "select", options: opts("All instruments", "Indices only", "FX only") },
        ],
        config: { threshold: 0.75, appliesTo: "All instruments" },
        summary: (c) => `Moves over ${Number(c.threshold).toFixed(2)}%`,
      },
      {
        id: "match-holdings",
        type: "map",
        label: "Match portfolio holdings",
        purpose: "Connects notable moves to the portfolio's holdings.",
        durationMs: 1000,
        fields: [
          { key: "holdingsFile", label: "Holdings file", kind: "select", options: opts("Sample holdings (29 Sep)", "Sample holdings (26 Sep)") },
          { key: "matchOn", label: "Match on", kind: "select", options: opts("Instrument and region", "Asset type") },
        ],
        config: { holdingsFile: "Sample holdings (29 Sep)", matchOn: "Instrument and region" },
        summary: () => "Matched against sample holdings",
      },
      {
        id: "draft-briefing",
        type: "draft",
        label: "Draft morning briefing",
        purpose: "Prepares an AI-assisted draft of the morning briefing for an editor to check.",
        durationMs: 1600,
        fields: [
          { key: "sections", label: "Briefing sections", kind: "select", options: opts("Snapshot, relevance, items to review", "Snapshot only") },
          { key: "tone", label: "Tone", kind: "select", options: opts("Concise and factual", "Detailed") },
          { key: "impacts", label: "Include estimated impact figures", kind: "select", options: opts("Yes", "No"), advanced: true },
        ],
        config: { sections: "Snapshot, relevance, items to review", tone: "Concise and factual", impacts: "Yes" },
        summary: () => "AI-assisted draft · 3 sections",
      },
      {
        id: "editor-review",
        type: "review",
        label: "Editor review",
        purpose: "Stops the run so an editor can check the draft before it is exported.",
        durationMs: 800,
        fields: [
          { key: "reviewer", label: "Reviewer", kind: "select", options: opts("Research editor", "Senior editor") },
          { key: "decision", label: "Decision required", kind: "static" },
          { key: "instructions", label: "Instructions to reviewer", kind: "textarea" },
        ],
        config: {
          reviewer: "Research editor",
          decision: "Approve briefing or return for review",
          instructions: "Check holdings references and estimated impacts before the briefing is exported.",
        },
        summary: (c) => `Pauses for ${c.reviewer}`,
      },
      {
        id: "export-briefing",
        type: "report",
        label: "Export briefing",
        purpose: "Prepares the final briefing from the approved draft.",
        durationMs: 1200,
        fields: [
          { key: "title", label: "Report title", kind: "text" },
          { key: "format", label: "Format", kind: "select", options: opts("Structured brief", "Table-first brief") },
        ],
        config: { title: "Morning market briefing — 30 September 2026", format: "Structured brief" },
        summary: (c) => `${c.title}`,
      },
    ],
  },
  {
    id: "kyc-checklist",
    category: "Operations",
    name: "KYC document checklist",
    outcome: "Identify missing items in a client onboarding checklist.",
    sampleData: false,
    comingSoon: true,
    stepLabels: ["Select checklist", "Compare sample documents", "Flag missing items", "Reviewer approval", "Create checklist summary"],
  },
  {
    id: "monthly-close",
    category: "Finance",
    name: "Monthly close pack",
    outcome: "Assemble a close checklist and list outstanding items.",
    sampleData: false,
    comingSoon: true,
    stepLabels: ["Select close period", "Collect sample tasks", "Calculate completion", "Review blockers", "Create close summary"],
  },
  {
    id: "client-report",
    category: "Reporting",
    name: "Client report preparation",
    outcome: "Prepare a reviewable draft package from account data.",
    sampleData: false,
    comingSoon: true,
    stepLabels: ["Select client", "Gather sample portfolio data", "Generate draft", "Compliance review", "Mark ready to send"],
  },
];

export function getTemplate(id: string): TemplateDef | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

// ─────────────────────────────────────────────────────────────────────────────
// Workflow helpers
// ─────────────────────────────────────────────────────────────────────────────

export function cloneStep(step: StepDef): StepDef {
  return { ...step, config: { ...step.config }, fields: step.fields };
}

export function cloneWorkflow(wf: Workflow): Workflow {
  return { ...wf, steps: wf.steps.map(cloneStep) };
}

export function workflowFromTemplate(t: TemplateDef): Workflow {
  return {
    id: t.id,
    templateId: t.id,
    name: t.name,
    category: t.category,
    status: "draft",
    steps: (t.steps ?? []).map(cloneStep),
    createdAt: new Date().toISOString(),
  };
}

function stepConfigValue(wf: Workflow, stepId: string, key: string): string | number | undefined {
  return wf.steps.find((s) => s.id === stepId)?.config[key];
}

/** The key setting echoed under the workflow name and used for the run. */
export function snapshotConfig(wf: Workflow) {
  const reportTitle = wf.steps.find((s) => s.type === "report")?.config.title;
  switch (wf.templateId) {
    case "nav-reconciliation":
      return {
        tolerance: Number(stepConfigValue(wf, "flag-breaches", "tolerance") ?? 0.5),
        reportTitle: String(reportTitle ?? "NAV reconciliation"),
      };
    case "position-risk":
      return {
        reviewThreshold: Number(stepConfigValue(wf, "flag-breaches", "threshold") ?? 90),
        reportTitle: String(reportTitle ?? "Position risk summary"),
      };
    case "market-movements":
      return {
        notableThreshold: Number(stepConfigValue(wf, "notable-moves", "threshold") ?? 0.75),
        reportTitle: String(reportTitle ?? "Morning market briefing"),
      };
    default:
      return { reportTitle: String(reportTitle ?? "Report") };
  }
}

export function canvasSubtitle(wf: Workflow): string {
  const n = wf.steps.length;
  switch (wf.templateId) {
    case "nav-reconciliation": {
      const tol = Number(stepConfigValue(wf, "flag-breaches", "tolerance") ?? 0.5);
      return `Tolerance ±${tol.toFixed(2)}% · ${n} steps · Sample data`;
    }
    case "position-risk": {
      const t = Number(stepConfigValue(wf, "flag-breaches", "threshold") ?? 90);
      return `Review threshold ${t}% of limit · ${n} steps · Sample data`;
    }
    case "market-movements": {
      const t = Number(stepConfigValue(wf, "notable-moves", "threshold") ?? 0.75);
      return `Notable move threshold ${t.toFixed(2)}% · ${n} steps · Sample data`;
    }
    default:
      return `${n} steps · Sample data`;
  }
}

export function sourcesFor(templateId: string): string[] {
  switch (templateId) {
    case "nav-reconciliation":
      return NAV_SOURCES;
    case "position-risk":
      return RISK_SOURCES;
    case "market-movements":
      return MARKET_SOURCES;
    default:
      return ["Sample source"];
  }
}

/** One-line summary used in run lists and the builder's last-run bar. */
export function runSummary(run: Run): string {
  switch (run.workflowId) {
    case "nav-reconciliation": {
      if (run.status === "draft") return "Configured, not yet run";
      const ex = navExceptions(run.config.tolerance ?? 0.5).length;
      if (run.status === "completed") {
        return ex === 0
          ? "Completed — no exceptions"
          : `Completed — ${ex} exception${ex === 1 ? "" : "s"} reviewed`;
      }
      return `${ex} material variance${ex === 1 ? "" : "s"} awaiting review`;
    }
    case "position-risk": {
      if (run.status === "draft") return "Configured, not yet run";
      const rows = riskResults(run.config.reviewThreshold ?? 90);
      const over = rows.filter((r) => r.status === "Over limit").length;
      const near = rows.filter((r) => r.status === "Near limit").length;
      if (run.status === "completed") {
        return `Completed — ${over} over limit, ${near} near limit`;
      }
      return `${over} position${over === 1 ? "" : "s"} over limit — awaiting analyst review`;
    }
    case "market-movements": {
      if (run.status === "draft") return "Configured, not yet run";
      if (run.status === "completed") return "Completed — briefing approved and exported";
      return "Briefing awaiting editor review";
    }
    default:
      return "Simulated run";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Steps added by the user in the builder
// ─────────────────────────────────────────────────────────────────────────────

export function makeDefaultStep(type: StepTypeId): StepDef {
  const id = `${type}-${Date.now().toString(36)}`;
  const label = STEP_TYPE_LABELS[type];
  switch (type) {
    case "load":
      return {
        id, type, label,
        purpose: "Brings in a sample data set for this step.",
        durationMs: 1100,
        fields: [{ key: "source", label: "Source file", kind: "select", options: opts("Sample dataset A", "Sample dataset B") }],
        config: { source: "Sample dataset A" },
        summary: (c) => `${c.source}`,
      };
    case "map":
      return {
        id, type, label,
        purpose: "Lines up fields between two sample data sets so they can be compared.",
        durationMs: 1000,
        fields: [{ key: "matchOn", label: "Match on", kind: "select", options: opts("Name", "Code") }],
        config: { matchOn: "Name" },
        summary: (c) => `Matched on ${c.matchOn}`,
      };
    case "calculate":
      return {
        id, type, label,
        purpose: "Calculates a value for each row from the loaded data.",
        durationMs: 1100,
        fields: [{ key: "output", label: "Output", kind: "select", options: opts("Difference %", "Total") }],
        config: { output: "Difference %" },
        summary: (c) => `${c.output}`,
      };
    case "check":
      return {
        id, type, label,
        purpose: "Checks each row against a limit or threshold you set.",
        durationMs: 1000,
        fields: [{ key: "threshold", label: "Threshold", kind: "number", suffix: "%", min: 0, max: 100, step: 0.25 }],
        config: { threshold: 1 },
        summary: (c) => `Threshold ${c.threshold}%`,
      };
    case "draft":
      return {
        id, type, label,
        purpose: "Prepares an AI-assisted draft from the checked results.",
        durationMs: 1400,
        fields: [{ key: "focus", label: "Focus", kind: "select", options: opts("Summary of inputs", "Detailed notes") }],
        config: { focus: "Summary of inputs" },
        summary: () => "AI-assisted draft",
      };
    case "review":
      return {
        id, type, label,
        purpose: "Stops the run so a person can check the results before anything is released.",
        durationMs: 800,
        fields: [{ key: "reviewer", label: "Reviewer", kind: "select", options: opts("Operations reviewer", "Risk analyst", "Research editor") }],
        config: { reviewer: "Operations reviewer" },
        summary: (c) => `Pauses for ${c.reviewer}`,
      };
    case "report":
      return {
        id, type, label,
        purpose: "Prepares a reviewable output from the run results.",
        durationMs: 1300,
        fields: [{ key: "title", label: "Report title", kind: "text" }],
        config: { title: "New report" },
        summary: (c) => `${c.title}`,
      };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Seeded workspace state — workflows and historical simulated runs
// ─────────────────────────────────────────────────────────────────────────────

export function seedWorkflows(): Workflow[] {
  return TEMPLATES.filter((t) => t.steps).map((t) => {
    const wf = workflowFromTemplate(t);
    wf.createdAt = "2026-09-26T09:00:00+01:00";
    return wf;
  });
}

function seedTimeline(
  templateId: string,
  states: RunStepState[],
  reviewNote?: string,
): RunStepRecord[] {
  const steps = getTemplate(templateId)?.steps ?? [];
  return steps.map((s, i) => ({
    stepId: s.id,
    label: s.label,
    type: s.type,
    state: states[i] ?? "queued",
    durationSec:
      states[i] === "complete" ? Math.round((s.durationMs / 1000) * 10) / 10 : undefined,
    note: states[i] === "needs-review" ? reviewNote : undefined,
  }));
}

export function seedRuns(): Run[] {
  const allComplete: RunStepState[] = ["complete", "complete", "complete", "complete", "complete", "complete"];
  const pausedAtReview: RunStepState[] = ["complete", "complete", "complete", "complete", "needs-review", "queued"];

  return [
    {
      id: "run-32",
      code: "PR-0032",
      workflowId: "nav-reconciliation",
      workflowName: "NAV reconciliation",
      startedAt: "2026-09-29T16:20:00+01:00",
      status: "draft",
      statusNote: "Configured, not yet run",
      config: { tolerance: 0.5, reportTitle: "NAV reconciliation — 29 September 2026" },
      timeline: seedTimeline("nav-reconciliation", ["queued", "queued", "queued", "queued", "queued", "queued"]),
      sources: NAV_SOURCES,
    },
    {
      id: "run-31",
      code: "PR-0031",
      workflowId: "nav-reconciliation",
      workflowName: "NAV reconciliation",
      startedAt: "2026-09-29T14:02:00+01:00",
      finishedAt: "2026-09-29T14:02:09+01:00",
      status: "completed",
      config: { tolerance: 0.5, reportTitle: "NAV reconciliation — 29 September 2026" },
      timeline: seedTimeline("nav-reconciliation", allComplete, "Approved by Operations reviewer — simulated"),
      sources: NAV_SOURCES,
      review: { decision: "approved", at: "2026-09-29T14:02:07+01:00", by: "Operations reviewer" },
    },
    {
      id: "run-30",
      code: "PR-0030",
      workflowId: "position-risk",
      workflowName: "Position risk review",
      startedAt: "2026-09-29T09:10:00+01:00",
      status: "needs-review",
      statusNote: "Returned for review — awaiting analyst decision",
      config: { reviewThreshold: 90, reportTitle: "Position risk summary — 29 September 2026" },
      timeline: seedTimeline("position-risk", pausedAtReview, "Returned for review — awaiting analyst decision"),
      sources: RISK_SOURCES,
      review: { decision: "returned", at: "2026-09-29T09:11:02+01:00", by: "Risk analyst" },
    },
    {
      id: "run-29",
      code: "PR-0029",
      workflowId: "market-movements",
      workflowName: "Daily market movements",
      startedAt: "2026-09-29T07:35:00+01:00",
      finishedAt: "2026-09-29T07:35:08+01:00",
      status: "completed",
      config: { notableThreshold: 0.75, reportTitle: "Morning market briefing — 29 September 2026" },
      timeline: seedTimeline("market-movements", allComplete, "Approved by Research editor — simulated"),
      sources: MARKET_SOURCES,
      review: { decision: "approved", at: "2026-09-29T07:35:06+01:00", by: "Research editor" },
    },
    {
      id: "run-28",
      code: "PR-0028",
      workflowId: "nav-reconciliation",
      workflowName: "NAV reconciliation",
      startedAt: "2026-09-26T14:05:00+01:00",
      finishedAt: "2026-09-26T14:05:09+01:00",
      status: "completed",
      statusNote: "No exceptions — all funds within tolerance",
      config: { tolerance: 2.0, reportTitle: "NAV reconciliation — 26 September 2026" },
      timeline: seedTimeline("nav-reconciliation", allComplete, "Approved by Operations reviewer — simulated"),
      sources: NAV_SOURCES,
      review: { decision: "approved", at: "2026-09-26T14:05:07+01:00", by: "Operations reviewer" },
    },
  ];
}

export const FIRST_RUN_NUMBER = 33;
