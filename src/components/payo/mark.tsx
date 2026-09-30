import { cn } from "@/lib/utils";

/**
 * Payo: the little workflow helper.
 *
 * A simple, friendly mark in the spirit of classic developer pets:
 * one rounded body with a small tuft, two eyes, a soft smile and a
 * hint of blush. Flat shapes, minimal colours (brand orange, warm
 * ink, a white eye shine), no gradients, no glow.
 */
export function PayoMark({
  className,
  blink = true,
}: {
  className?: string;
  blink?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("shrink-0", className)}
      aria-hidden="true"
      focusable="false"
    >
      {/* tuft */}
      <rect x="34" y="1.5" width="11" height="17" rx="5.5" fill="#F97316" />
      {/* body */}
      <rect x="6" y="9" width="52" height="51" rx="17.5" fill="#F97316" />
      {/* eyes */}
      <g className={blink ? "payo-blink" : undefined}>
        <ellipse cx="24.5" cy="30.5" rx="3.6" ry="5.2" fill="#2A1708" />
        <ellipse cx="39.5" cy="30.5" rx="3.6" ry="5.2" fill="#2A1708" />
        <circle cx="25.8" cy="28.6" r="1.15" fill="#FFFFFF" />
        <circle cx="40.8" cy="28.6" r="1.15" fill="#FFFFFF" />
      </g>
      {/* blush */}
      <ellipse cx="15.5" cy="38.5" rx="3.4" ry="2.1" fill="#E2640E" opacity="0.6" />
      <ellipse cx="48.5" cy="38.5" rx="3.4" ry="2.1" fill="#E2640E" opacity="0.6" />
      {/* smile */}
      <path
        d="M26.5 42.5 Q32 47.8 37.5 42.5"
        fill="none"
        stroke="#2A1708"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
