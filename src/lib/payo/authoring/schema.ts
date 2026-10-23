/** Zod schemas for the authoring API request boundary. */

import { z } from "zod";

const stepConfigValue = z.union([z.string().max(240), z.number()]);

export const draftRequestSchema = z.object({
  brief: z.string().trim().min(5, "Describe the workflow in a little more detail.").max(4000),
  details: z
    .object({
      sources: z.string().max(600).optional(),
      reviewer: z.string().max(200).optional(),
      output: z.string().max(200).optional(),
      cadence: z.string().max(120).optional(),
    })
    .optional(),
});

const snapshotStep = z.object({
  id: z.string().min(1).max(60),
  type: z.enum(["load", "map", "calculate", "check", "draft", "review", "report"]),
  label: z.string().max(80),
  purpose: z.string().max(200).optional(),
  when: z.enum(["always", "only-when-exceptions"]).optional(),
  config: z.record(z.string(), stepConfigValue),
});

export const changeRequestSchema = z.object({
  workflow: z.object({
    id: z.string().min(1).max(60),
    name: z.string().max(80),
    category: z.string().max(40),
    sampleProfile: z.enum(["nav", "risk", "market", "bank", "generic"]),
    steps: z.array(snapshotStep).min(1).max(10),
  }),
  instruction: z.string().trim().min(2, "Tell Payo what to change.").max(1000),
  selectedStepId: z.string().max(60).optional(),
});

export type DraftRequest = z.infer<typeof draftRequestSchema>;
export type ChangeRequest = z.infer<typeof changeRequestSchema>;
