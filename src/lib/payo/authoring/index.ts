/** Public surface of the authoring layer. */

export * from "./types";
export { STEP_BLUEPRINTS, buildStep } from "./step-blueprints";
export { sanitizeDraft, sanitizeChange, draftToWorkflow, detailToText } from "./normalize";
export { runJsonPrompt, isAuthoringConfigured, authoringEnv } from "./deepseek";
export { DRAFT_SYSTEM, CHANGE_SYSTEM } from "./prompts";
export { draftRequestSchema, changeRequestSchema } from "./schema";
export { checkRateLimit } from "./rate-limit";
export { evaluateReadiness } from "./readiness";
export { validateProposal, applyOperations, describeOperation, updateDiff } from "./proposals";
export { workflowToMermaid } from "./mermaid";
