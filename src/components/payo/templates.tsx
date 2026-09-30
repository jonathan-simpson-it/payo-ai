"use client";

import { Button } from "@/components/ui/button";
import { TEMPLATES } from "@/lib/payo/data";
import type { TemplateDef } from "@/lib/payo/types";
import { usePayo } from "@/lib/payo/store";
import { SampleTag } from "@/components/payo/ui";

function TemplateCard({
  template,
  onUse,
}: {
  template: TemplateDef;
  onUse: (id: string) => void;
}) {
  const steps = template.steps ?? [];
  const labels = steps.length > 0 ? steps.map((s) => s.label) : (template.stepLabels ?? []);
  return (
    <article className="flex flex-col rounded-md border border-border bg-card p-5 transition-colors hover:border-line-strong">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">
            {template.category}
          </p>
          <h3 className="mt-1.5 text-[16px] font-semibold leading-snug">{template.name}</h3>
        </div>
        {template.sampleData && <SampleTag />}
      </div>
      <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-2">{template.outcome}</p>
      <ol className="mt-4 flex-1 space-y-1.5 border-t border-border pt-3.5">
        {labels.map((label, i) => (
          <li key={label} className="flex gap-2.5 text-[13px] leading-snug text-ink-2">
            <span className="w-3.5 shrink-0 text-right tabular-nums text-ink-3">{i + 1}</span>
            {label}
          </li>
        ))}
      </ol>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className="text-[12px] text-ink-3">
          {steps.length > 0 ? `${steps.length} steps · editable` : "Workflow outline"}
        </span>
        <Button size="sm" onClick={() => onUse(template.id)}>
          Use template
        </Button>
      </div>
    </article>
  );
}

function ComingSoonCard({ template }: { template: TemplateDef }) {
  return (
    <article className="flex flex-col rounded-md border border-dashed border-line-strong bg-card/60 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">
            {template.category}
          </p>
          <h3 className="mt-1.5 text-[15px] font-semibold leading-snug text-ink-2">
            {template.name}
          </h3>
        </div>
        <span className="inline-flex shrink-0 items-center rounded-sm bg-neutral-tint px-1.5 py-0.5 text-[11.5px] font-medium text-ink-2">
          Coming soon
        </span>
      </div>
      <p className="mt-2.5 text-[13px] leading-relaxed text-ink-3">{template.outcome}</p>
      <ol className="mt-4 flex-1 space-y-1.5 border-t border-border pt-3.5">
        {(template.stepLabels ?? []).map((label, i) => (
          <li key={label} className="flex gap-2.5 text-[12.5px] leading-snug text-ink-3">
            <span className="w-3.5 shrink-0 text-right tabular-nums">{i + 1}</span>
            {label}
          </li>
        ))}
      </ol>
    </article>
  );
}

export function TemplateLibrary() {
  const { useTemplate } = usePayo();
  const available = TEMPLATES.filter((t) => !t.comingSoon);
  const comingSoon = TEMPLATES.filter((t) => t.comingSoon);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:px-10">
      <header>
        <h1 className="text-[24px] font-semibold tracking-[-0.01em]">Template library</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-2">
          Curated finance workflows, ready to adjust and run. Each template opens as an editable
          workflow and runs on labelled sample data.
        </p>
      </header>

      <section aria-labelledby="available-templates">
        <h2 id="available-templates" className="mt-10 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">
          Available now
        </h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {available.map((t) => (
            <TemplateCard key={t.id} template={t} onUse={useTemplate} />
          ))}
        </div>
      </section>

      <section aria-labelledby="upcoming-templates">
        <h2 id="upcoming-templates" className="mt-12 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">
          In development
        </h2>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          {comingSoon.map((t) => (
            <ComingSoonCard key={t.id} template={t} />
          ))}
        </div>
        <p className="mt-4 text-[12.5px] text-ink-3">
          These templates are shown as a preview of the planned library — they are not runnable in
          this demo.
        </p>
      </section>
    </div>
  );
}
