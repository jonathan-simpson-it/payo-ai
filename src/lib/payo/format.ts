/** UK-locale formatting helpers. All values are simulated sample data. */

const nf = (dp: number) =>
  new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });

export function fmtInt(n: number): string {
  return new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(n);
}

export function fmtNum(n: number, dp = 2): string {
  return nf(dp).format(n);
}

export function fmtHKD(n: number, dp = 0): string {
  return `HK$${nf(dp).format(n)}`;
}

/** Signed money, e.g. +HK$37,550 / −HK$133,580 (true minus sign). */
export function fmtSignedHKD(n: number, dp = 0): string {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}HK$${nf(dp).format(Math.abs(n))}`;
}

export function fmtPct(n: number, dp = 2): string {
  return `${nf(dp).format(n)}%`;
}

/** Signed percentage, e.g. +1.35% / −1.77%. */
export function fmtSignedPct(n: number, dp = 2): string {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${nf(dp).format(Math.abs(n))}%`;
}

export function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function fmtLongDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
