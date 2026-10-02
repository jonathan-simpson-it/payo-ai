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
export function PayooChat() {
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
        <div className="w-72 overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] shadow-[0_24px_48px_-16px_rgba(0,0,0,0.7)]">
          {/* Header: Payoo + in-development status */}
          <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-4 py-3">
            <PayoMark className="size-7" />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold leading-tight text-white">Payoo</p>
              <p className="text-[11px] leading-tight text-[#8B939B]">Your workflow helper</p>
            </div>
            <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10.5px] font-medium text-amber-400">
              <span
                className="size-1.5 animate-pulse rounded-full bg-amber-400"
                aria-hidden="true"
              />
              Coming soon
            </span>
          </div>

          {/* Body: greeting + locally typed preview messages */}
          <div className="flex max-h-56 flex-col gap-2 overflow-y-auto px-4 py-4">
            <div className="max-w-[230px] self-start rounded-2xl rounded-tl-md bg-white/[0.06] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-[#E9EEF3]">
              Hi, I&apos;m Payoo! I&apos;ll help you run your finance workflows
              here soon. I&apos;m still in development.
            </div>
            {sent.map((m, i) => (
              <div
                key={i}
                className="ml-auto max-w-[230px] rounded-2xl rounded-br-md bg-[#FF6B00]/[0.15] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-[#FFE1CC]"
              >
                {m}
              </div>
            ))}
          </div>

          {/* Footer: real input, local preview only */}
          <form
            className="border-t border-white/[0.08] px-3 py-2.5"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-3 pr-1.5">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask me anything…"
                aria-label="Message Payoo"
                className="h-7 w-full bg-transparent text-[12px] text-[#E9EEF3] outline-none placeholder:text-[#6B7480]"
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={!draft.trim()}
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full transition-colors",
                  draft.trim()
                    ? "bg-[#FF6B00] text-white"
                    : "bg-white/10 text-[#8B939B]",
                )}
              >
                <ArrowUp className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          </form>
        </div>
      )}
      {!open && (
        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500 shadow-sm">
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
