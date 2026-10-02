"use client";

import { useState } from "react";
import { ArrowUp } from "lucide-react";

import { PayoMark } from "@/components/payo/mark";
import { cn } from "@/lib/utils";

/**
 * Payoo chat bubble: the mascot floats as a bare icon with no container.
 * Clicking Payoo opens a small chat panel preview. Typing works locally as
 * a preview; nothing is sent to a server yet.
 */
export function PayooChat({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<string[]>([]);

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    setSent((prev) => [...prev, text]);
    setDraft("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {open && (
        <div
          className={cn(
            "w-72 overflow-hidden rounded-2xl border shadow-[0_24px_48px_-20px_rgba(0,0,0,0.5)]",
            dark
              ? "border-white/[0.10] bg-[#14171B] text-[#E9EDF2]"
              : "border-border bg-popover text-popover-foreground",
          )}
        >
          {/* Header: Payoo + in-development status */}
          <div className={cn("flex items-center gap-2.5 border-b px-4 py-3", dark ? "border-white/[0.08]" : "border-border")}>
            <PayoMark className="size-7" />
            <div className="min-w-0">
              <p className={cn("text-[13px] font-semibold leading-tight", dark ? "text-[#E9EDF2]" : "text-foreground")}>
                Payoo
              </p>
              <p className={cn("text-[11px] leading-tight", dark ? "text-[#6E7681]" : "text-ink-3")}>
                Your workflow helper
              </p>
            </div>
            <span
              className={cn(
                "ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-medium",
                dark
                  ? "border-warn/30 bg-warn/10 text-warn"
                  : "border-warn-border bg-warn-tint text-warn",
              )}
            >
              <span
                className="size-1.5 animate-pulse rounded-full bg-warn"
                aria-hidden="true"
              />
              Coming soon
            </span>
          </div>

          {/* Body: greeting + locally typed preview messages */}
          <div className="flex max-h-56 flex-col gap-2 overflow-y-auto px-4 py-4">
            <div
              className={cn(
                "max-w-[230px] self-start rounded-2xl rounded-tl-md px-3.5 py-2.5 text-[12.5px] leading-relaxed",
                dark ? "bg-white/[0.06] text-[#E9EDF2]" : "bg-muted text-foreground",
              )}
            >
              Hi, I&apos;m Payoo! I&apos;ll help you run your finance workflows
              here soon. I&apos;m still in development.
            </div>
            {sent.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "ml-auto max-w-[230px] rounded-2xl rounded-br-md px-3.5 py-2.5 text-[12.5px] leading-relaxed",
                  dark ? "bg-[#C9500A]/[0.15] text-[#F08A3C]" : "bg-primary/15 text-primary-ink",
                )}
              >
                {m}
              </div>
            ))}
          </div>

          {/* Footer: real input, local preview only */}
          <form
            className={cn("border-t px-3 py-2.5", dark ? "border-white/[0.08]" : "border-border")}
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <div
              className={cn(
                "flex items-center gap-2 rounded-full border py-1 pl-3 pr-1.5",
                dark ? "border-white/10 bg-white/[0.04]" : "border-border bg-muted",
              )}
            >
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask me anything…"
                aria-label="Message Payoo"
                className={cn(
                  "h-7 w-full bg-transparent text-[12px] outline-none",
                  dark ? "text-[#E9EDF2] placeholder:text-[#6E7681]" : "text-foreground placeholder:text-ink-3",
                )}
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={!draft.trim()}
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full transition-colors",
                  draft.trim()
                    ? "bg-[#C9500A] text-white"
                    : dark
                      ? "bg-white/10 text-[#6E7681]"
                      : "bg-muted text-ink-3",
                )}
              >
                <ArrowUp className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          </form>
        </div>
      )}
      {!open && (
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 text-[11px] font-medium shadow-sm",
            dark
              ? "border-white/[0.12] bg-[#14171B] text-[#A9B1BA]"
              : "border-border bg-card text-ink-2",
          )}
        >
          Hi, I&apos;m Payoo, your assistant
        </span>
      )}
      <button
        type="button"
        aria-label="Payoo chat (coming soon)"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="grid size-20 place-items-center rounded-full"
      >
        <PayoMark className="h-20 w-20" />
      </button>
    </div>
  );
}
