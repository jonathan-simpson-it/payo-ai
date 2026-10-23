/** Readiness checks that gate Test and Publish. Deterministic, no model call. */

import type { TestEvidence, Workflow } from "../types";
import type { ReadinessItem, ReadinessReport, ReadinessSection } from "./types";

function item(
  id: string,
  section: ReadinessSection,
  severity: ReadinessItem["severity"],
  label: string,
  detail: string,
  extra?: { stepId?: string; fix?: string },
): ReadinessItem {
  return { id, section, severity, label, detail, ...extra };
}

export function evaluateReadiness(wf: Workflow, testEvidence?: TestEvidence): ReadinessReport {
  const items: ReadinessItem[] = [];
  const steps = wf.steps;
  const loads = steps.filter((s) => s.type === "load");
  const reports = steps.filter((s) => s.type === "report");
  const reviews = steps.filter((s) => s.type === "review");
  const checks = steps.filter((s) => s.type === "check");

  // Structure
  if (steps.length === 0) {
    items.push(item("no-steps", "Structure", "block", "The workflow has no steps", "Add at least one step before testing."));
  }
  if (loads.length === 0 && steps.length > 0) {
    items.push(item("no-input", "Structure", "warn", "No load step", "Most workflows begin by loading a source file.", { fix: "Add a step that loads the source file." }));
  } else if (loads.length > 0) {
    items.push(item("has-input", "Structure", "pass", "Input defined", "The workflow starts from a source."));
  }
  if (steps.length > 0 && reports.length === 0) {
    items.push(item("no-output", "Structure", "block", "No output step", "Add a final step that creates a report or summary.", { fix: "Add a final step that creates the report." }));
  } else if (reports.length > 0) {
    items.push(item("has-output", "Structure", "pass", "Output defined", "The workflow ends with a report."));
  }

  // Sources
  if (loads.length > 0) {
    const blank = loads.find((s) => !String(s.config.source ?? s.config.primary ?? "").trim());
    if (blank) {
      items.push(item("blank-source", "Sources", "block", `${blank.label} has no source`, "Give this load step a sample source name.", { stepId: blank.id }));
    } else {
      items.push(item("sources-ok", "Sources", "pass", "Every load step has a source", "Sources are sample data."));
    }
  }

  // Logic
  if (checks.length > 0) {
    const weak = checks.find((s) => s.config.basis !== "Unmatched items" && Number(s.config.threshold ?? 0) <= 0);
    if (weak) {
      items.push(item("check-zero", "Logic", "warn", `${weak.label} threshold is zero`, "A zero threshold flags every row. Set a value above zero.", { stepId: weak.id }));
    } else {
      items.push(item("check-ok", "Logic", "pass", "Checks have thresholds", `${checks.length} check step${checks.length === 1 ? "" : "s"} configured.`));
    }
  }

  // Control
  const lastReportIndex = reports.length ? Math.max(...reports.map((s) => steps.indexOf(s))) : -1;
  const reviewsBeforeOutput = reviews.filter((s) => steps.indexOf(s) < lastReportIndex);
  if (reports.length > 0 && reviews.length === 0) {
    items.push(item("no-review", "Control", "warn", "No human review before output", "Add a review step so a person checks the result.", { fix: "Add a review step before the report." }));
  } else if (reviews.length > 0 && reviewsBeforeOutput.length === 0 && lastReportIndex > -1) {
    items.push(item("review-after-output", "Control", "block", "Review comes after the output", "Move the review before the final report.", { stepId: reviews[0].id }));
  } else if (reviews.length > 0) {
    items.push(item("review-ok", "Control", "pass", "Review comes before output", "A person checks the result before it is released."));
  }
  const badConditional = reviews.find(
    (s) => s.when === "only-when-exceptions" && !steps.slice(0, steps.indexOf(s)).some((p) => p.type === "check"),
  );
  if (badConditional) {
    items.push(item("conditional-no-check", "Control", "block", `${badConditional.label} is conditional but has no check`, "Add a check step before it, or set it to always review.", { stepId: badConditional.id, fix: `Add a check step before ${badConditional.label}.` }));
  }

  // Clarity
  const openAssumptions = (wf.assumptions ?? []).filter((a) => !a.resolved);
  if (openAssumptions.length > 0) {
    const preview = openAssumptions.slice(0, 2).map((a) => a.text).join(" ");
    const more = openAssumptions.length > 2 ? ` And ${openAssumptions.length - 2} more.` : "";
    items.push(
      item(
        "assumptions",
        "Clarity",
        "warn",
        `${openAssumptions.length} assumption${openAssumptions.length === 1 ? "" : "s"} to confirm`,
        `${preview}${more}`,
      ),
    );
  } else if ((wf.assumptions ?? []).length > 0) {
    items.push(item("assumptions-ok", "Clarity", "pass", "Assumptions confirmed", "All assumptions are resolved."));
  }

  // Evidence
  if (steps.length > 0 && !testEvidence) {
    items.push(item("no-test", "Evidence", "block", "Not tested on sample data", "Run a test to record evidence before publishing."));
  } else if (testEvidence) {
    items.push(item("tested", "Evidence", "pass", "Tested on sample data", "This version has passing test evidence."));
  }

  const structuralBlockers = items.filter((i) => i.severity === "block" && i.section !== "Evidence").length;
  const warnings = items.filter((i) => i.severity === "warn").length;
  const passed = items.filter((i) => i.severity === "pass").length;
  const blockers = items.filter((i) => i.severity === "block").length;

  return {
    items,
    blockers,
    warnings,
    passed,
    canTest: structuralBlockers === 0 && steps.length > 0,
    canPublish: structuralBlockers === 0 && Boolean(testEvidence),
  };
}
