import { NextResponse } from "next/server";

import { listSignups, verifyAdminPassword } from "@/lib/waitlist/store";

/** Small in-memory throttle so the admin password cannot be hammered. */
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function rateLimited(key: string): boolean {
  const now = Date.now();
  for (const [k, v] of attempts) {
    if (v.resetAt <= now) attempts.delete(k);
  }
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";

  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "too_many_attempts" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  const { password } = (body ?? {}) as { password?: unknown };
  if (typeof password !== "string" || !verifyAdminPassword(password)) {
    return NextResponse.json({ ok: false, error: "unauthorised" }, { status: 401 });
  }

  // Correct password: clear this address's failed attempts.
  attempts.delete(ip);

  try {
    const entries = await listSignups(1000);
    return NextResponse.json({ ok: true, count: entries.length, entries });
  } catch (error) {
    console.error("waitlist admin list failed", error);
    return NextResponse.json({ ok: false, error: "storage_unavailable" }, { status: 503 });
  }
}
