/** Export a workflow as a Mermaid flowchart. Read-only documentation, not the editor. */

import type { Workflow } from "../types";

function esc(label: string): string {
  return label.replace(/["\n\r]/g, " ").trim();
}

export function workflowToMermaid(wf: Workflow): string {
  if (wf.steps.length === 0) return "flowchart LR\n  empty[No steps yet]";

  const ids = wf.steps.map((s) => `n${s.id.replace(/[^a-zA-Z0-9]/g, "_")}`);
  const nodeLines = wf.steps.map((s, i) => {
    const label = esc(`${i + 1}. ${s.label}`);
    if (s.type === "review") return `  ${ids[i]}{${label}}`;
    if (s.type === "check") return `  ${ids[i]}[${label}]`;
    return `  ${ids[i]}(["${label}"])`;
  });

  const edges: string[] = [];
  wf.steps.forEach((s, i) => {
    const next = wf.steps[i + 1];
    if (!next) return;
    if (s.type === "check" && next.type === "review" && next.when === "only-when-exceptions") {
      const after = wf.steps[i + 2];
      edges.push(`  ${ids[i]} -- exceptions --> ${ids[i + 1]}`);
      if (after) edges.push(`  ${ids[i]} -. no exceptions .-> ${ids[i + 2]}`);
    } else {
      edges.push(`  ${ids[i]} --> ${ids[i + 1]}`);
    }
  });

  return ["flowchart LR", ...nodeLines, ...edges].join("\n");
}
