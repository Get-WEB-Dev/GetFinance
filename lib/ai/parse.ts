export interface ParsedQuestion {
  amount?: number;
  months?: number;
  ratePercent?: number;
}

const MULTIPLIERS: Record<string, number> = {
  k: 1_000,
  thousand: 1_000,
  m: 1_000_000,
  million: 1_000_000,
};

export function parseQuestion(text: string): ParsedQuestion {
  let rest = text.toLowerCase();
  const out: ParsedQuestion = {};

  const rate = rest.match(/(\d+(?:\.\d+)?)\s*%/);
  if (rate) {
    out.ratePercent = Number(rate[1]);
    rest = rest.replace(rate[0], " ");
  }

  const term = rest.match(/(\d+(?:\.\d+)?)\s*(years?|yrs?|months?|mos?)\b/);
  if (term) {
    const n = Number(term[1]);
    const months = /^y/.test(term[2]) ? Math.round(n * 12) : Math.round(n);
    if (months > 0) out.months = months;
    rest = rest.replace(term[0], " ");
  }

  const amounts = rest.matchAll(/(\d[\d,]*(?:\.\d+)?)\s*(k|m|thousand|million)?\b/g);
  for (const m of amounts) {
    const base = Number(m[1].replace(/,/g, ""));
    const value = base * (m[2] ? MULTIPLIERS[m[2]] : 1);
    if (Number.isFinite(value) && value >= 1_000) {
      out.amount = value;
      break;
    }
  }
  return out;
}