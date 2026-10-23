export type TourGroup = "Landing" | "Workspace" | "Builder" | "Run";
export type TourPlacement = "top" | "bottom" | "left" | "right" | "center" | "auto";
export type TourFallback =
  | "openTemplate"
  | "selectFirstStep"
  | "enterTest"
  | "exitTest"
  | "startRun"
  | "approveReview";

export type TourAdvance =
  | { type: "route"; pattern: string }
  | { type: "target"; selector: string };

export interface TourStep {
  id: string;
  group: TourGroup;
  title: string;
  body: string;
  route?: string;
  targets?: string[];
  placement?: TourPlacement;
  action?: boolean;
  advanceOn?: TourAdvance[];
  fallback?: TourFallback;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    group: "Landing",
    title: "Welcome to Payo AI",
    body: "This short tour follows one finance workflow from a template to a reviewed result. Everything you see uses simulated sample data.",
    placement: "center",
  },
  {
    id: "landing-hero",
    group: "Landing",
    title: "A workflow starts with a sentence",
    body: "Describe the work in plain English, or start from a finance template. Payo turns it into a visible, editable graph.",
    targets: ['[data-tour="landing-hero"]'],
    placement: "bottom",
  },
  {
    id: "landing-how-it-works",
    group: "Landing",
    title: "See the shape of the work",
    body: "Every workflow is a short sequence of named steps: load, match, calculate, check, review, report.",
    targets: ['[data-tour="landing-how-it-works"]'],
    placement: "bottom",
  },
  {
    id: "landing-connections",
    group: "Landing",
    title: "Know what is connected",
    body: "Planned integrations are labelled as planned. This prototype runs on sample files and connects to nothing live.",
    targets: ['[data-tour="landing-connections"]'],
    placement: "bottom",
  },
  {
    id: "landing-sandbox",
    group: "Landing",
    title: "Preview the behaviour",
    body: "The sandbox shows how a run moves through its steps, pauses at review, and prepares an output.",
    targets: ['[data-tour="landing-sandbox"]'],
    placement: "bottom",
  },
  {
    id: "landing-templates",
    group: "Landing",
    title: "Begin with a proven template",
    body: "Start from a finance template for reconciliations, risk checks, or briefings, then adjust it to your process.",
    targets: ['[data-tour="landing-templates"]'],
    placement: "bottom",
  },
  {
    id: "landing-trust",
    group: "Landing",
    title: "Control is part of the design",
    body: "Review gates, visible lineage, and sample-data labels are built into the workflow rather than added afterwards.",
    targets: ['[data-tour="landing-trust"]'],
    placement: "bottom",
  },
  {
    id: "enter-workspace",
    group: "Landing",
    title: "Enter the workspace",
    body: "The workspace is where you describe a workflow or start from a template. This tour uses a template.",
    targets: ['[data-tour="landing-enter-workspace"]', '[data-tour="landing-hero-cta"]'],
    placement: "bottom",
  },
  {
    id: "workspace-nav",
    group: "Workspace",
    title: "Your workspace",
    body: "Overview, Workflows, Templates, and Runs, plus Create for a plain-English workflow. Sample data is labelled in the header.",
    route: "#/workspace/templates",
    targets: ['[data-tour="workspace-nav"]'],
    placement: "right",
  },
  {
    id: "template-controls",
    group: "Workspace",
    title: "Find the right starting point",
    body: "Search the library, filter by category, sort the list, and switch between grid and pipeline views.",
    targets: ['[data-tour="template-controls"]'],
    placement: "bottom",
  },
  {
    id: "template-card",
    group: "Workspace",
    title: "Open a template",
    body: "Choose any available template. Click Use template to open it in the builder.",
    route: "#/workspace/templates",
    targets: ['[data-tour="template-card"]'],
    placement: "top",
    action: true,
    advanceOn: [{ type: "route", pattern: "^#/workspace/workflows/" }],
    fallback: "openTemplate",
  },
  {
    id: "builder-header",
    group: "Builder",
    title: "This is your workflow",
    body: "Rename it, check its state, switch between Build and Test, or open History to see how it reached this point.",
    targets: ['[data-tour="builder-header"]'],
    placement: "bottom",
  },
  {
    id: "builder-canvas",
    group: "Builder",
    title: "The graph is the process",
    body: "Each card is one step in the workflow. Click a card to inspect it, or ask Payo to add, remove, or change a step in plain English. No dragging needed.",
    targets: ['[data-tour="builder-canvas"]'],
    placement: "bottom",
  },
  {
    id: "inspect-step",
    group: "Builder",
    title: "Inspect any step",
    body: "Click a step to see what it does, what it receives, and the settings it uses.",
    targets: ['[data-tour="step-card"]'],
    placement: "bottom",
    action: true,
    advanceOn: [{ type: "target", selector: '[data-tour="step-inspector"]' }],
    fallback: "selectFirstStep",
  },
  {
    id: "step-inspector",
    group: "Builder",
    title: "One focused panel",
    body: "Edit the step name and key settings here. Advanced hides the rest, and this panel also moves or removes the step.",
    targets: ['[data-tour="step-inspector"]'],
    placement: "left",
  },
  {
    id: "test-mode",
    group: "Builder",
    title: "Test before you run",
    body: "Test mode runs the workflow on sample inputs without creating a run record and without publishing anything.",
    targets: ['[data-tour="builder-mode"]'],
    placement: "bottom",
    action: true,
    advanceOn: [{ type: "target", selector: '[data-tour="test-panel"]' }],
    fallback: "enterTest",
  },
  {
    id: "test-panel",
    group: "Builder",
    title: "Read the preview",
    body: "The test shows every step beside the sample results. Run the test if you like, then exit test when you are ready to run the workflow.",
    targets: ['[data-tour="test-header"]'],
    placement: "bottom",
    action: true,
    advanceOn: [{ type: "target", selector: '[data-tour="builder-canvas"]' }],
    fallback: "exitTest",
  },
  {
    id: "run-workflow",
    group: "Builder",
    title: "Run the workflow",
    body: "Run workflow plays the steps in order and pauses wherever a person must make a decision.",
    targets: ['[data-tour="builder-run"]'],
    placement: "bottom",
    action: true,
    advanceOn: [{ type: "target", selector: '[data-tour="run-strip"]' }],
    fallback: "startRun",
  },
  {
    id: "run-progress",
    group: "Run",
    title: "Watch the steps complete",
    body: "The run strip shows the current step and overall progress. The run will pause when it reaches its review gate.",
    targets: ['[data-tour="run-strip"]'],
    placement: "bottom",
    advanceOn: [
      { type: "target", selector: '[data-tour="review-dialog"]' },
      { type: "route", pattern: "^#/workspace/runs/" },
    ],
  },
  {
    id: "review-gate",
    group: "Run",
    title: "A person makes the decision",
    body: "The run has paused at its review step. Approve the summary to continue, or return it for review.",
    targets: [
      '[data-tour="review-dialog"]',
      '[data-tour="review-open"]',
      '[data-tour="run-approve"]',
    ],
    placement: "auto",
    action: true,
    advanceOn: [
      { type: "route", pattern: "^#/workspace/runs/" },
      { type: "target", selector: '[data-tour="run-result"]' },
    ],
    fallback: "approveReview",
  },
  {
    id: "run-result",
    group: "Run",
    title: "Read the evidence",
    body: "The run detail keeps the timeline, sample sources, findings, and final report together so the outcome can be checked.",
    targets: ['[data-tour="run-result"]'],
    placement: "auto",
  },
  {
    id: "runs-queue",
    group: "Run",
    title: "Every run stays visible",
    body: "Use Runs to revisit completed work and to find anything waiting for review.",
    route: "#/workspace/runs",
    targets: ['[data-tour="runs-list"]'],
    placement: "top",
  },
  {
    id: "finish",
    group: "Run",
    title: "Tour complete",
    body: "You have followed a template to a reviewed result. Replay the tour any time from About this demo, or start with a template.",
    placement: "center",
  },
];