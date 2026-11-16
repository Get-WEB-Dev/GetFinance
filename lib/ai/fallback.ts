import type { CountryCode } from "@/config/countries";
import { formatCurrency } from "@/lib/format/currency";
import type { Facts } from "./facts";

export function fallbackAnswer(country: CountryCode, facts: Facts, text: string): string {
  const e = facts.estimate;
  if (e) {
    const note = e.rateIsIllustrative
      ? `I used an illustrative rate of ${e.ratePercent}% a year; your real rate may differ.`
      : `At ${e.ratePercent}% a year.`;
    return (
      `For ${formatCurrency(e.amount, country)} over ${e.months} months (${e.productName}): ` +
      `about ${formatCurrency(Math.round(e.monthlyPayment), country)} a month, ` +
      `${formatCurrency(Math.round(e.totalPayable), country)} in total, ` +
      `of which ${formatCurrency(Math.round(e.totalInterest), country)} is interest. ${note} ` +
      `This is an estimate, not an offer.`
    );
  }
  const t = text.toLowerCase();
  if (/document|upload|proof/.test(t))
    return "You will upload proof of identity, income and address in the Documents step. Clear photos or PDFs work best.";
  if (/eligib|qualify|approve|approval|chance/.test(t))
    return "Eligibility depends on your income, existing monthly debts and the loan size. The pre-approval summary near the end of the application shows an indicative result. It is not a final decision.";
  if (/rate|interest/.test(t))
    return "Rates shown are illustrative. Your final rate depends on the lender's assessment. Tell me an amount and a term, for example '10,000 over 24 months', and I will work out the monthly payment.";
  if (/how long|time|days|fast/.test(t))
    return "The application takes about 10 to 15 minutes, and you can save your progress and resume later. Decision times in this demo are simulated.";
  if (/start|apply|begin/.test(t))
    return "Choose a loan on the Apply page, then follow the steps. Your progress is saved automatically.";
  return (
    "I can calculate monthly payments, explain loan types and eligibility, and guide you through the steps. " +
    "Try: 'What would 10,000 over 24 months cost?'\n\n" +
    facts.text
  );
}