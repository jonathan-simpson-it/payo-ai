import { NextResponse } from "next/server";

import { addSignup, isAdminEmail, type WaitlistRole } from "@/lib/waitlist/store";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ROLES: WaitlistRole[] = ["investment-risk", "fund-operations", "sme-finance"];

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  const { email, role, consent } = (body ?? {}) as {
    email?: unknown;
    role?: unknown;
    consent?: unknown;
  };
  const normalized = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!EMAIL_RE.test(normalized) || normalized.length > 254) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  // Admin emails open the internal waitlist view instead of signing up.
  if (isAdminEmail(normalized)) {
    return NextResponse.json({ ok: true, admin: true });
  }

  if (consent !== true) {
    return NextResponse.json({ ok: false, error: "consent_required" }, { status: 400 });
  }

  const roleValue: WaitlistRole | null =
    typeof role === "string" && (ROLES as string[]).includes(role) ? (role as WaitlistRole) : null;

  try {
    await addSignup(normalized, roleValue);
  } catch (error) {
    console.error("waitlist signup failed", error);
    return NextResponse.json({ ok: false, error: "storage_unavailable" }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
