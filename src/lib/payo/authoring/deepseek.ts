/** Minimal DeepSeek client (OpenAI-compatible) for authoring. Server-side only. */

import { AuthoringError } from "./types";

interface ResolvedEnv {
  key: string | undefined;
  model: string;
  base: string;
}

function findEnv(re: RegExp): string | undefined {
  for (const [k, v] of Object.entries(process.env)) {
    if (re.test(k) && typeof v === "string" && v.length > 10) return v;
  }
  return undefined;
}

export function authoringEnv(): ResolvedEnv {
  const key =
    process.env.DEEPSEEK_API_KEY ||
    findEnv(/deepseek[-_]?api[-_]?key/i) ||
    process.env.DEEPSEEK_API;
  return {
    key,
    model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
    base: (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/+$/, ""),
  };
}

export function isAuthoringConfigured(): boolean {
  return Boolean(authoringEnv().key);
}

interface CallResult {
  content: string;
  finishReason: string;
  usage?: { total_tokens?: number };
}

async function callOnce(
  env: ResolvedEnv,
  messages: { role: string; content: string }[],
  maxTokens: number,
  timeoutMs: number,
): Promise<CallResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(`${env.base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.key}`,
      },
      body: JSON.stringify({
        model: env.model,
        messages,
        response_format: { type: "json_object" },
        stream: false,
        temperature: 0.2,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if ((err as Error)?.name === "AbortError") {
      throw new AuthoringError("timeout", "The draft took too long. Try again or start from a template.");
    }
    throw new AuthoringError("provider_error", "The drafting service is unavailable. Try again shortly.");
  }
  clearTimeout(timer);

  let body: any;
  try {
    body = await res.json();
  } catch {
    throw new AuthoringError("provider_error", "The drafting service returned an unreadable response.");
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new AuthoringError("provider_error", "The drafting service rejected its credentials.");
    }
    if (res.status === 429) {
      throw new AuthoringError("rate_limited", "Payo is receiving too many drafting requests. Try again in a minute.");
    }
    throw new AuthoringError("provider_error", "The drafting service is unavailable. Try again shortly.");
  }

  const choice = body?.choices?.[0];
  const content: string = choice?.message?.content ?? "";
  const finishReason: string = choice?.finish_reason ?? "stop";
  if (!content.trim()) {
    throw new AuthoringError("invalid_response", "Payo could not produce a usable draft. Try rephrasing your brief.");
  }
  return { content, finishReason, usage: body?.usage };
}

/** Extract the first JSON object from a possibly fenced or padded response. */
function extractJson(text: string): string {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start > -1 && end > start) return t.slice(start, end + 1);
  return t;
}

/**
 * Send a JSON-mode prompt, validate it parses, and repair once on failure.
 * Throws AuthoringError with a stable code on unrecoverable problems.
 */
export async function runJsonPrompt(
  system: string,
  user: string,
  opts: { maxTokens?: number; timeoutMs?: number } = {},
): Promise<unknown> {
  const env = authoringEnv();
  if (!env.key) {
    throw new AuthoringError("not_configured", "AI drafting is not configured for this demo.");
  }
  const maxTokens = opts.maxTokens ?? 3000;
  const timeoutMs = opts.timeoutMs ?? 20000;

  let first: CallResult;
  try {
    first = await callOnce(env, [{ role: "system", content: system }, { role: "user", content: user }], maxTokens, timeoutMs);
  } catch (err) {
    if (err instanceof AuthoringError && (err.code === "timeout" || err.code === "rate_limited" || err.code === "not_configured")) throw err;
    // A single provider hiccup is worth one retry.
    await new Promise((r) => setTimeout(r, 400));
    first = await callOnce(env, [{ role: "system", content: system }, { role: "user", content: user }], maxTokens, timeoutMs);
  }

  try {
    return JSON.parse(extractJson(first.content));
  } catch {
    const repairMessages = [
      { role: "system", content: system },
      { role: "user", content: user },
      { role: "assistant", content: first.content.slice(0, 4000) },
      { role: "user", content: "That was not valid JSON. Reply again with ONLY a single valid JSON object matching the required shape. No prose, no code fences." },
    ];
    const second = await callOnce(env, repairMessages, maxTokens, timeoutMs);
    try {
      return JSON.parse(extractJson(second.content));
    } catch {
      throw new AuthoringError("invalid_response", "Payo could not produce a usable draft. Try rephrasing your brief.");
    }
  }
}
