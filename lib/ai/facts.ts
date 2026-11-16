import { getLoanProducts } from "@/config/loans";
import { getCountry } from "@/config/countries";
import type { CountryCode } from "@/config/countries";
import { formatCurrency } from "@/lib/format/currency";
import { calculateRepayment } from "@/lib/calculations/repayment";
import { parseQuestion } from "./parse";

export interface Estimate {
  productName: string;
  amount: number;
  months: number;
  ratePercent: number;
  rateIsIllustrative: boolean;
  monthlyPayment: number;
  totalPayable: number;
  totalInterest: number;
}

export interface Facts {
  text: string;
  estimate: Estimate | null;
}

function guessType(text: string): "home" | "business" | "personal" {
  const t = text.toLowerCase();
  if (/\b(home|house|mortgage|property)\b/.test(t)) return "home";
  if (/\b(business|shop|company|startup|store)\b/.test(t)) return "business";
  return "personal";
}

export function buildFacts(country: CountryCode, userText: string): Facts {
  const products = getLoanProducts(country);
  const lines = products.map(
    (p) =>
      `- ${p.name}: ${formatCurrency(p.minAmount, country)} to ${formatCurrency(p.maxAmount, country)}, ` +
      `${p.minMonths} to ${p.maxMonths} months, illustrative rate ${p.illustrativeRate}% a year.`,
  );

  const parsed = parseQuestion(userText);
  let estimate: Estimate | null = null;
  if (parsed.amount && parsed.months) {
    const product = products.find((p) => p.type === guessType(userText)) ?? products[0];
    const rate = parsed.ratePercent ?? product.illustrativeRate;
    const r = calculateRepayment(parsed.amount, rate, parsed.months);
    if (r) {
      estimate = {
        productName: product.name,
        amount: parsed.amount,
        months: parsed.months,
        ratePercent: rate,
        rateIsIllustrative: parsed.ratePercent === undefined,
        monthlyPayment: r.monthlyPayment,
        totalPayable: r.totalPayable,
        totalInterest: r.totalInterest,
      };
      lines.push(
        `- VERIFIED CALCULATION (use these exact numbers): ${formatCurrency(estimate.amount, country)} over ` +
          `${estimate.months} months at ${rate}%${estimate.rateIsIllustrative ? " (illustrative rate)" : ""}: ` +
          `monthly ${formatCurrency(Math.round(r.monthlyPayment), country)}, total payable ` +
          `${formatCurrency(Math.round(r.totalPayable), country)}, total interest ` +
          `${formatCurrency(Math.round(r.totalInterest), country)}.`,
      );
    }
  }

  return {
    text: `Country: ${getCountry(country).name}\nLoan products here:\n${lines.join("\n")}`,
    estimate,
  };
}