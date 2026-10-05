"use client";

import { useState } from "react";
import { ArrowRight, Check, Download, Eye, EyeOff, Lock, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Eyebrow, SampleTag } from "@/components/payo/ui";
import type { WaitlistEntry, WaitlistRole } from "@/lib/waitlist/store";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS: { value: WaitlistRole; label: string }[] = [
  { value: "investment-risk", label: "Investment & risk" },
  { value: "fund-operations", label: "Fund operations" },
  { value: "sme-finance", label: "Corporate finance" },
];

const ROLE_LABEL: Record<WaitlistRole, string> = {
  "investment-risk": "Investment & risk",
  "fund-operations": "Fund operations",
  "sme-finance": "Corporate finance",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Phase = "form" | "admin-password" | "admin";

export function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WaitlistRole | null>(null);
  const [consent, setConsent] = useState(false);
  const [phase, setPhase] = useState<Phase>("form");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [entries, setEntries] = useState<WaitlistEntry[] | null>(null);

  const submit = async () => {
    setError(null);
    const normalized = email.trim().toLowerCase();
    if (!EMAIL_RE.test(normalized)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!consent) {
      setError("Please agree to the Privacy Policy and to receiving launch updates.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized, role, consent }),
      });
      const data = (await res.json()) as { ok?: boolean; admin?: boolean; error?: string };
      if (data.admin) {
        setPhase("admin-password");
        setPassword("");
        return;
      }
      if (!res.ok || !data.ok) {
        setError(
          data.error === "invalid_email"
            ? "Enter a valid email address."
            : "The waitlist is not available right now. Please try again later.",
        );
        return;
      }
      setDone(true);
    } catch {
      setError("The waitlist is not available right now. Please try again later.");
    } finally {
      setBusy(false);
    }
  };

  const adminSignIn = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/waitlist/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        count?: number;
        entries?: WaitlistEntry[];
        error?: string;
      };
      if (res.status === 429) {
        setError("Too many attempts. Please try again later.");
        return;
      }
      if (res.status === 401) {
        setError("That password does not match.");
        return;
      }
      if (!res.ok || !data.ok) {
        setError(
          "The waitlist database is not reachable right now. Check the MongoDB connection and the Atlas IP allowlist.",
        );
        return;
      }
      setEntries(data.entries ?? []);
      setPhase("admin");
    } catch {
      setError(
        "The waitlist database is not reachable right now. Check the MongoDB connection and the Atlas IP allowlist.",
      );
    } finally {
      setBusy(false);
    }
  };

  const lock = () => {
    setPassword("");
    setEntries(null);
    setPhase("form");
    setError(null);
  };

  const downloadCsv = () => {
    if (!entries) return;
    const header = "joined,email,role";
    const rows = entries.map((e) => {
      const emailCell = `"${e.email.replace(/"/g, '""')}"`;
      const roleCell = e.role ? ROLE_LABEL[e.role] : "";
      return [e.createdAt, emailCell, roleCell].join(",");
    });
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payo-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section
      id="waitlist"
      className="band-rule relative flex min-h-[100svh] flex-col justify-center"
    >
      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 md:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
        <div>
          <Eyebrow>Early access</Eyebrow>
          <h2 className="mt-4 max-w-xl text-[28px] font-semibold leading-tight tracking-[-0.01em] text-white md:text-[32px]">
            Stop wrestling spreadsheets.
            <br />
            Start describing workflows.
          </h2>
          <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-ink-2">
            Join the early access program to turn your team's manual financial runbooks into
            visual, automated, and auditable pipelines.
          </p>
          <ul className="mt-6 space-y-2.5">
            {[
              "Early access before general release",
              "Occasional launch updates, nothing else",
              "The demo workspace stays open to explore in the meantime",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-[13.5px] leading-snug text-ink-2">
                <Check className="mt-0.5 size-4 shrink-0 text-ink-3" aria-hidden="true" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass edge-lit rounded-xl p-5 md:p-6">
          {done ? (
            <div className="flex flex-col items-start gap-3 py-6">
              <span className="grid size-9 place-items-center rounded-full bg-ok-solid text-white">
                <Check className="size-5" aria-hidden="true" />
              </span>
              <p className="text-[16px] font-semibold">You are on the list.</p>
              <p className="text-[13.5px] leading-relaxed text-ink-2">
                We will be in touch before launch with early access details.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setDone(false);
                  setEmail("");
                  setRole(null);
                  setConsent(false);
                }}
              >
                Add another email
              </Button>
            </div>
          ) : phase === "form" ? (
            <form
              noValidate
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
            >
              <div className="space-y-1.5">
                <label htmlFor="waitlist-email" className="block text-[12.5px] font-medium text-ink-2">
                  Email address
                </label>
                <input
                  id="waitlist-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your enterprise email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-white/[0.04] px-2.5 text-[13.5px] text-foreground outline-none transition-colors placeholder:text-ink-3 focus:border-primary"
                />
              </div>

              <fieldset>
                <legend className="text-[12.5px] font-medium text-ink-2">
                  I am joining as <span className="text-ink-3">(optional)</span>
                </legend>
                <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="I am joining as">
                  {ROLE_OPTIONS.map((o) => {
                    const active = role === o.value;
                    return (
                      <button
                        key={o.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setRole(active ? null : o.value)}
                        className={cn(
                          "rounded-md border px-3 py-1.5 text-[13px] font-medium transition-colors",
                          active
                            ? "border-white/[0.18] bg-white/[0.10] text-white"
                            : "border-border bg-transparent text-ink-2 hover:border-white/25 hover:text-white",
                        )}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <label className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-ink-2">
                <input
                  type="checkbox"
                  name="consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 rounded border-input accent-[var(--primary)]"
                />
                <span>
                  I agree to the <a href="/privacy" className="font-medium text-primary-ink underline-offset-2 hover:underline">Privacy Policy</a> and to
                  receiving launch updates.
                </span>
              </label>

              <div className="space-y-2.5">
                <Button type="submit" className="w-full rounded-full" disabled={busy}>
                  {busy ? "Joining…" : "Get early access"}
                  {!busy && <ArrowRight className="size-4" aria-hidden="true" />}
                </Button>
                <p className="text-center text-[11.5px] text-ink-3">
                  Free during early access sandbox. Zero spam. Exportable audit trails included.
                </p>
              </div>

              <p aria-live="polite" className="min-h-4 text-[12.5px] font-medium text-danger">
                {error}
              </p>
            </form>
          ) : phase === "admin-password" ? (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void adminSignIn();
              }}
            >
              <div>
                <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-3">
                  <Lock className="size-3.5" aria-hidden="true" />
                  Admin access
                </p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">
                  Enter the admin password to view the waitlist.
                </p>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="waitlist-password" className="block text-[12.5px] font-medium text-ink-2">
                  Admin password
                </label>
                <div className="relative">
                  <input
                    id="waitlist-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-9 w-full rounded-md border border-border bg-white/[0.04] px-2.5 pr-9 text-[13.5px] text-foreground outline-none transition-colors placeholder:text-ink-3 focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    title={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 grid w-9 place-items-center text-ink-3 transition-colors hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit" disabled={busy || password.length === 0}>
                  {busy ? "Checking…" : "View waitlist"}
                </Button>
                <Button type="button" variant="ghost" onClick={lock}>
                  Back
                </Button>
              </div>
              <p aria-live="polite" className="min-h-4 text-[12.5px] font-medium text-danger">
                {error}
              </p>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-3">
                  <Lock className="size-3.5" aria-hidden="true" />
                  Waitlist admin
                </p>
                <SampleTag label={`${entries?.length ?? 0} entries`} />
                <div className="ml-auto flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7"
                    onClick={() => void adminSignIn()}
                    disabled={busy}
                  >
                    <RefreshCcw className="size-3.5" aria-hidden="true" />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7"
                    onClick={downloadCsv}
                    disabled={!entries?.length}
                  >
                    <Download className="size-3.5" aria-hidden="true" />
                    CSV
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7" onClick={lock}>
                    Lock
                  </Button>
                </div>
              </div>

              <div className="max-h-[320px] overflow-auto rounded-md border border-border">
                <table className="w-full border-collapse text-[12px]">
                  <thead className="sticky top-0 bg-muted">
                    <tr className="border-b border-border text-left">
                      <th className="px-2.5 py-2 text-[11px] font-medium text-ink-3">Joined</th>
                      <th className="px-2.5 py-2 text-[11px] font-medium text-ink-3">Email</th>
                      <th className="px-2.5 py-2 text-[11px] font-medium text-ink-3">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(entries ?? []).map((e) => (
                      <tr key={e.email} className="border-b border-border/70 last:border-0">
                        <td className="whitespace-nowrap px-2.5 py-2 tabular-nums text-ink-2">
                          {new Date(e.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-2.5 py-2 font-medium text-foreground">{e.email}</td>
                        <td className="whitespace-nowrap px-2.5 py-2 text-ink-2">
                          {e.role ? ROLE_LABEL[e.role] : ""}
                        </td>
                      </tr>
                    ))}
                    {(entries ?? []).length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-2.5 py-6 text-center text-[12.5px] text-ink-3">
                          No entries yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="text-[11.5px] leading-relaxed text-ink-3">
                Internal view. The password is checked against the server configuration and is not
                stored in the browser.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
