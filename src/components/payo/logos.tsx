import { siHsbc } from "simple-icons";

/**
 * Trust-bar logos as uniform 32px-height vector frames.
 * HSBC uses the official simple-icons glyph path; BlackRock, Blackstone
 * and Morgan Stanley are rendered as SVG wordmark frames (no outline path
 * data is available for those marks) so every logo scales identically.
 * All marks inherit `currentColor` for monochrome theme treatment.
 */

function WordmarkFrame({
  viewBox,
  children,
  label,
}: {
  viewBox: string;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <svg
      viewBox={viewBox}
      role="img"
      aria-label={label}
      className="h-8 w-auto"
      style={{ fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif" }}
    >
      {children}
    </svg>
  );
}

export function BlackRockLogo() {
  return (
    <WordmarkFrame viewBox="0 0 148 32" label="BlackRock">
      <text
        x="0"
        y="24"
        fontSize="25"
        fontWeight={800}
        letterSpacing="-0.8"
        fill="currentColor"
      >
        BlackRock
      </text>
    </WordmarkFrame>
  );
}

export function BlackstoneLogo() {
  return (
    <WordmarkFrame viewBox="0 0 148 32" label="Blackstone">
      <text
        x="0"
        y="24"
        fontSize="24"
        fontWeight={600}
        letterSpacing="0.4"
        fill="currentColor"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        Blackstone
      </text>
    </WordmarkFrame>
  );
}

export function MorganStanleyLogo() {
  return (
    <WordmarkFrame viewBox="0 0 178 32" label="Morgan Stanley">
      <text
        x="0"
        y="23"
        fontSize="21"
        fontWeight={600}
        letterSpacing="0.6"
        fill="currentColor"
      >
        Morgan Stanley
      </text>
    </WordmarkFrame>
  );
}

export function HsbcLogo() {
  return (
    <span className="flex h-8 items-center gap-2" role="img" aria-label="HSBC">
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor" aria-hidden="true">
        <path d={siHsbc.path} />
      </svg>
      <svg viewBox="0 0 96 32" className="h-8 w-auto" aria-hidden="true">
        <text
          x="0"
          y="25"
          fontSize="26"
          fontWeight={700}
          letterSpacing="2"
          fill="currentColor"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          HSBC
        </text>
      </svg>
    </span>
  );
}
