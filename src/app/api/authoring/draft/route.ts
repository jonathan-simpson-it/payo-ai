import { NextResponse } from "next/server";

import { AuthoringError } from "@/lib/payo/authoring/types";
import { runJsonPrompt } from "@/lib/payo/authoring/deepseek";
import { DRAFT_SYSTEM } from "@/lib/payo/authoring/prompts";
import { draftRequestSchema } from "@/lib/payo/authoring/schema";
import { checkRateLimit } from "@/lib/payo/authoring/rate-limit";
import { sanitizeDraft } from "@/lib/payo/authoring/normalize";

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

  const parsed = draftRequestSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues?.[0]?.message ?? "Check the brief and try again.";
    return NextResponse.json({ ok: false, error: "invalid_request", message }, { status: 400 });
  }

  const rl = checkRateLimit(`draft:${clientKey(req)}`);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "rate_limited", message: `Too many requests. Try again in ${rl.retryAfterSec}s.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const user = JSON.stringify({ brief: parsed.data.brief, details: parsed.data.details ?? null });

  try {
    const raw = await runJsonPrompt(DRAFT_SYSTEM, user, { maxTokens: 3000, timeoutMs: 25000 });
    const { draft, dropped } = sanitizeDraft(raw);
    if (draft.steps.length === 0) {
      return NextResponse.json(
        { ok: false, error: "invalid_response", message: "Payo could not build a workflow from that. Add a source, a check and an output, then try again." },
        { status: 422 },
      );
    }
    return NextResponse.json({ ok: true, draft, dropped });
  } catch (err) {
    if (err instanceof AuthoringError) {
      return NextResponse.json({ ok: false, error: err.code, message: err.message }, { status: STATUS[err.code] ?? 502 });
    }
    console.error("draft failed", err);
    return NextResponse.json({ ok: false, error: "provider_error", message: "The drafting service is unavailable." }, { status: 502 });
  }
}
