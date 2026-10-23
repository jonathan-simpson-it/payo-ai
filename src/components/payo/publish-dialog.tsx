"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { evaluateReadiness } from "@/lib/payo/authoring/readiness";
import { fmtDateTime } from "@/lib/payo/format";
import { usePayo } from "@/lib/payo/store";
import type { Workflow } from "@/lib/payo/types";

export function PublishDialog({
  open,
  onOpenChange,
  workflow,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  workflow: Workflow;
}) {
  const { publish } = usePayo();
  const [acknowledged, setAcknowledged] = useState(false);
  const report = evaluateReadiness(workflow, workflow.testEvidence);
  const nextVersion = (workflow.publishedSnapshot?.version ?? 0) + 1;
  const canPublish = report.canPublish && (report.warnings === 0 || acknowledged);
  const testLabel = workflow.steps.length;

  const doPublish = () => {
    publish(workflow.id);
    toast("Workflow published (simulated). Version recorded in History.");
    setAcknowledged(false);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setAcknowledged(false);
      }}
    >
      <DialogContent className="gap-0 sm:max-w-lg">
        <DialogHeader className="items-start space-y-1.5 text-left">
          <DialogTitle className="text-[17px] font-semibold">Publish “{workflow.name}”?</DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed">
            This records version {nextVersion} of the workflow. Publishing in this prototype is
            simulated. No live integrations or external actions are enabled.
          </DialogDescription>
        </DialogHeader>

        <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 text-[13px]">
          <div>
            <dt className="text-ink-3">Steps</dt>
            <dd className="mt-0.5 font-medium tabular-nums">{testLabel} steps</dd>
          </div>
          <div>
            <dt className="text-ink-3">Review</dt>
            <dd className="mt-0.5 font-medium">
              {workflow.steps.find((s) => s.type === "review") ? "Human gate set" : "None"}
            </dd>
          </div>
          <div>
            <dt className="text-ink-3">Data</dt>
            <dd className="mt-0.5 font-medium">Labelled sample data</dd>
          </div>
          <div>
            <dt className="text-ink-3">Last test</dt>
            <dd className="mt-0.5 font-medium tabular-nums">
              {workflow.testEvidence ? fmtDateTime(workflow.testEvidence.at) : "Not tested"}
            </dd>
          </div>
        </dl>

        <div className="mt-4 space-y-2 rounded-md border border-border bg-muted/30 px-4 py-3 text-[12.5px]">
          <p className="flex items-center gap-2 text-ink-2">
            <Check className="size-3.5 text-positive" aria-hidden="true" />
            {report.passed} checks passed
          </p>
          {report.blockers > 0 ? (
            <p className="flex items-center gap-2 font-medium text-danger">{report.blockers} blocking issue{report.blockers === 1 ? "" : "s"}. Resolve them before publishing.</p>
          ) : (
            <p className="flex items-center gap-2 text-ink-2">
              <Check className="size-3.5 text-positive" aria-hidden="true" />
              No blocking issues
            </p>
          )}
          {report.warnings > 0 && (
            <label className="mt-1 flex items-start gap-2 text-ink-2">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-0.5 size-3.5 accent-[#c9500a]"
              />
              I have reviewed {report.warnings} warning{report.warnings === 1 ? "" : "s"}.
            </label>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={doPublish} disabled={!canPublish}>
            Publish workflow
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
