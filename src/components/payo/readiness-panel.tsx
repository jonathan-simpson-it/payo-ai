"use client";

import { Check, CircleAlert, CircleCheck, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { evaluateReadiness } from "@/lib/payo/authoring/readiness";
import type { ReadinessItem, ReadinessSection } from "@/lib/payo/authoring/types";
import type { Workflow } from "@/lib/payo/types";
import { cn } from "@/lib/utils";

const SECTIONS: ReadinessSection[] = ["Structure", "Sources", "Logic", "Control", "Clarity", "Evidence"];

function SeverityIcon({ severity }: { severity: ReadinessItem["severity"] }) {
  if (severity === "pass") return <CircleCheck className="size-4 shrink-0 text-positive" aria-hidden="true" />;
  if (severity === "warn") return <CircleAlert className="size-4 shrink-0 text-warn" aria-hidden="true" />;
  return <X className="size-4 shrink-0 text-danger" aria-hidden="true" />;
}

export function ReadinessPanel({
  open,
  onOpenChange,
  workflow,
  onFix,
  onSelectStep,
  onRunTest,
  onConfirmAssumptions,
  canTest,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  workflow: Workflow;
  onFix: (instruction: string) => void;
  onSelectStep: (stepId: string) => void;
  onRunTest: () => void;
  onConfirmAssumptions: () => void;
  canTest: boolean;
}) {
  const report = evaluateReadiness(workflow, workflow.testEvidence);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-hidden sm:max-w-2xl">
        <DialogHeader className="items-start space-y-1.5 border-b border-border px-6 py-5 text-left">
          <DialogTitle className="text-[17px] font-semibold">Verify workflow</DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed">
            {workflow.name} · {report.blockers} blocker{report.blockers === 1 ? "" : "s"},{" "}
            {report.warnings} warning{report.warnings === 1 ? "" : "s"}, {report.passed} checks
            passed. These checks are deterministic and use sample data.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[58vh] overflow-y-auto px-6 py-5">
          {SECTIONS.map((section) => {
            const items = report.items.filter((i) => i.section === section);
            if (items.length === 0) return null;
            return (
              <section key={section} className="mb-5 last:mb-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">{section}</p>
                <ul className="mt-2.5">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className={cn(
                        "flex flex-wrap items-start gap-x-3 gap-y-2 border-b border-border py-3 last:border-0",
                        item.severity === "block" && "text-foreground",
                      )}
                    >
                      <span className="mt-0.5">
                        <SeverityIcon severity={item.severity} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13.5px] font-medium leading-snug">{item.label}</p>
                        <p className="mt-0.5 text-[12.5px] leading-snug text-ink-3">{item.detail}</p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        {item.id === "assumptions" && (
                          <Button size="sm" className="h-7" onClick={onConfirmAssumptions}>
                            Confirm all
                          </Button>
                        )}
                        {item.fix && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7"
                            onClick={() => {
                              onOpenChange(false);
                              onFix(item.fix!);
                            }}
                          >
                            Fix with Payo
                          </Button>
                        )}
                        {item.stepId && !item.fix && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7"
                            onClick={() => {
                              onOpenChange(false);
                              onSelectStep(item.stepId!);
                            }}
                          >
                            Edit step
                          </Button>
                        )}
                        {item.id === "no-test" && (
                          <Button
                            size="sm"
                            className="h-7"
                            disabled={!canTest}
                            title={!canTest ? "Resolve blocking checks before testing." : undefined}
                            onClick={() => {
                              onOpenChange(false);
                              onRunTest();
                            }}
                          >
                            Run test
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/30 px-6 py-4">
          <p className="flex items-center gap-2 text-[12px] text-ink-3">
            <Check className="size-3.5 text-positive" aria-hidden="true" />
            {report.canPublish ? "This version is ready to publish." : "Clear all blockers and record a test before publishing."}
          </p>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
