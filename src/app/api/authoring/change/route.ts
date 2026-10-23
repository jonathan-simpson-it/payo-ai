import { NextResponse } from "next/server";

import { AuthoringError } from "@/lib/payo/authoring/types";
import { runJsonPrompt } from "@/lib/payo/authoring/deepseek";
import { CHANGE_SYSTEM } from "@/lib/payo/authoring/prompts";
import { changeRequestSchema } from "@/lib/payo/authoring/schema";
import { checkRateLimit } from "@/lib/payo/authoring/rate-limit";
import { sanitizeChange } from "@/lib/payo/authoring/normalize";
import { validateProposal } from "@/lib/payo/authoring/proposals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS: Record<string, number> = {
  rate_limited: 429,
  timeout: 504,
  not_configured: 503,
  invalid_response: 422,
  invalid_request: 400,
  provider_error: 502,
};

function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "anon").slice(0, 80);
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_request", message: "Malformed request." }, { status: 400 });
  }

  const parsed = changeRequestSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues?.[0]?.message ?? "Check the instruction and try again.";
    return NextResponse.json({ ok: false, error: "invalid_request", message }, { status: 400 });
  }

  const rl = checkRateLimit(`change:${clientKey(req)}`);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "rate_limited", message: `Too many requests. Try again in ${rl.retryAfterSec}s.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const { workflow, instruction, selectedStepId } = parsed.data;
  const user = JSON.stringify({
    workflow,
    instruction,
    selectedStepId: selectedStepId ?? null,
  });

  try {
    const raw = await runJsonPrompt(CHANGE_SYSTEM, user, { maxTokens: 2000, timeoutMs: 25000 });
    const proposal = sanitizeChange(raw);
    const { valid, rejected } = validateProposal(proposal.operations, workflow);

    if (!valid.length && !proposal.question && !proposal.summary) {
      return NextResponse.json(
        { ok: false, error: "invalid_response", message: "Payo could not turn that into a change. Try naming a step or a setting." },
        { status: 422 },
      );
    }

    return NextResponse.json({
      ok: true,
      proposal: { ...proposal, operations: valid },
      rejected,
    });
  } catch (err) {
    if (err instanceof AuthoringError) {
      return NextResponse.json({ ok: false, error: err.code, message: err.message }, { status: STATUS[err.code] ?? 502 });
    }
    console.error("change failed", err);
    return NextResponse.json({ ok: false, error: "provider_error", message: "The drafting service is unavailable." }, { status: 502 });
  }
}
