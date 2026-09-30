import type { Metadata } from "next";
import Link from "next/link";

import { PayoMark } from "@/components/payo/mark";

export const metadata: Metadata = {
  title: "Privacy | Payo AI",
  description: "How the Payo AI waitlist handles your details.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-16">
      <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Payo AI home">
        <PayoMark className="size-7" />
        <span className="text-[15px] font-semibold tracking-tight">Payo AI</span>
      </Link>

      <h1 className="mt-10 text-[28px] font-semibold tracking-[-0.01em]">Privacy</h1>
      <p className="mt-2 text-[13px] text-ink-3">Applies to the waitlist on payoai.space-z.ai.</p>

      <div className="mt-8 space-y-6 text-[14px] leading-relaxed text-ink-2">
        <section>
          <h2 className="text-[15px] font-semibold text-foreground">What we collect</h2>
          <p className="mt-2">
            When you join the waitlist we store the email address you enter, an optional role
            selection (Idea-Maker, Investor or Co-Founder), and the date you joined.
          </p>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-foreground">Why we collect it</h2>
          <p className="mt-2">
            To give you early access to Payo and to send occasional launch updates. We do not sell
            your details and we do not share them with third parties for marketing.
          </p>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-foreground">Where it is stored</h2>
          <p className="mt-2">
            Entries are stored in a MongoDB database hosted in the Hong Kong region (ap-east-1).
            Access is limited to the maintainers of this project.
          </p>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-foreground">Removing your details</h2>
          <p className="mt-2">
            You can ask to be removed at any time by replying to any update email, or via the
            contact form on jonathansimpson.co. We will delete your entry promptly.
          </p>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-foreground">This prototype</h2>
          <p className="mt-2">
            The demo workspace uses fictional sample data only. It does not connect to live data
            sources, and nothing you do in the demo is stored.
          </p>
        </section>
      </div>

      <p className="mt-10 border-t border-border pt-5 text-[13px]">
        <Link href="/" className="font-medium text-primary-ink underline-offset-2 hover:underline">
          Back to Payo AI
        </Link>
      </p>
    </main>
  );
}
