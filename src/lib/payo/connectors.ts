import type { StepTypeId } from "./types";

/**
 * Illustrative connections for Payo. Nothing here is connected in this
 * prototype and no external service is called; the connection status is
 * stated once per surface rather than on every card.
 */

export interface ConnectorSource {
  name: string;
  /** Logo in /public/icons, or omitted for a monogram tile. */
  icon?: string;
}

export interface ConnectorGroup {
  id: string;
  name: string;
  /** One line: what this connection would supply. */
  functionLabel: string;
  /** Short sentence used in the inspector. */
  description: string;
  sources: ConnectorSource[];
  /** Workflow steps this source would feed. */
  feeds: StepTypeId[];
  /** Illustrative integration method. */
  method: string;
}

export const PLANNED_CONNECTORS: ConnectorGroup[] = [
  {
    id: "custodian",
    name: "Custodian & fund administration",
    functionLabel: "Daily NAV and valuation files from custodian portals",
    description:
      "Would pull administrator valuations and holdings files into the load and map steps, so reconciliations start from the file your administrator already issues.",
    sources: [
      { name: "HSBC", icon: "hsbc-color.svg" },
      { name: "UBS" },
      { name: "Julius Baer", icon: "juliusbaer.png" },
      { name: "LGT", icon: "lgt.png" },
    ],
    feeds: ["load", "map"],
    method: "Session-based portal access",
  },
  {
    id: "market-data",
    name: "Portfolio & market data",
    functionLabel: "Positions, IBOR and market levels for checks",
    description:
      "Would supply position lists, portfolio valuation points and market levels used by exposure calculations and tolerance checks.",
    sources: [
      { name: "BlackRock", icon: "blackrock.png" },
      { name: "Bloomberg", icon: "bloomberg.svg" },
      { name: "FactSet", icon: "factset.png" },
    ],
    feeds: ["load", "calculate", "check"],
    method: "API key",
  },
  {
    id: "accounting",
    name: "Accounting & ERP",
    functionLabel: "Ledger, bank and close data for finance operations",
    description:
      "Would bring ledger balances, bank statements and close-period data into reconciliation and completeness checks.",
    sources: [
      { name: "Xero", icon: "xero-color.svg" },
      { name: "QuickBooks" },
      { name: "NetSuite", icon: "netsuite.svg" },
    ],
    feeds: ["load", "check"],
    method: "OAuth 2.0",
  },
  {
    id: "microsoft",
    name: "Microsoft 365",
    functionLabel: "Excel workbooks, mail attachments and shared drives",
    description:
      "Would read administrator spreadsheets from mail or SharePoint and publish prepared outputs back to your team's folders.",
    sources: [
      { name: "Excel", icon: "excel-color.svg" },
      { name: "Outlook", icon: "outlook-color.svg" },
      { name: "SharePoint", icon: "sharepoint.svg" },
      { name: "OneDrive", icon: "onedrive-color.svg" },
    ],
    feeds: ["load", "report"],
    method: "OAuth 2.0",
  },
  {
    id: "google",
    name: "Google Workspace",
    functionLabel: "Sheets, Docs, Drive and Calendar inputs",
    description:
      "Would read sheets and documents from Drive, and use calendar context when preparing scheduled finance updates.",
    sources: [
      { name: "Google Sheets", icon: "google-color.svg" },
      { name: "Google Docs", icon: "googledocs-color.svg" },
      { name: "Google Drive", icon: "googledrive-color.svg" },
      { name: "Google Calendar", icon: "googlecalendar-color.svg" },
    ],
    feeds: ["load", "map"],
    method: "OAuth 2.0",
  },
  {
    id: "meetings",
    name: "Meeting intelligence",
    functionLabel: "Notes and transcripts for the draft step",
    description:
      "Would turn meeting notes and transcripts into structured context for an AI-assisted draft that a person still checks.",
    sources: [
      { name: "Granola", icon: "granola.png" },
      { name: "Fireflies.ai", icon: "fireflies.svg" },
      { name: "Otter.ai", icon: "otter.svg" },
    ],
    feeds: ["draft"],
    method: "Webhook",
  },
  {
    id: "knowledge",
    name: "Knowledge & procedures",
    functionLabel: "Runbooks, policies and process notes",
    description:
      "Would keep policies and runbooks beside the workflow, so checks reference the same written procedure your team follows.",
    sources: [
      { name: "Notion", icon: "notion.svg" },
      { name: "Confluence", icon: "confluence-color.svg" },
    ],
    feeds: ["draft", "report"],
    method: "OAuth 2.0",
  },
  {
    id: "alerts",
    name: "Alerts & comms",
    functionLabel: "Review requests and report delivery",
    description:
      "Would notify the right reviewer when a run pauses, and deliver a prepared report to your team's channels after approval.",
    sources: [
      { name: "Teams", icon: "teams-color.svg" },
      { name: "Slack", icon: "slack-color.svg" },
      { name: "WhatsApp", icon: "whatsapp-color.svg" },
    ],
    feeds: ["review", "report"],
    method: "OAuth 2.0 / webhook",
  },
];

/** The sample files that actually exist in this prototype. */
export const SAMPLE_INPUTS: { name: string; detail: string }[] = [
  { name: "Sample administrator NAV", detail: "29 Sep 2026 · 8 funds" },
  { name: "Sample internal valuation", detail: "29 Sep 2026 · 8 funds" },
  { name: "Sample positions file", detail: "29 Sep 2026 · 10 positions" },
  { name: "Sample market snapshot", detail: "30 Sep 2026 · 07:45" },
];
