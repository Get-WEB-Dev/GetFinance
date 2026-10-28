import { locale } from "@/config/locale";

const formatter = new Intl.NumberFormat(locale.language, {
  style: "currency",
  currency: locale.currency,
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number): string {
  return formatter.format(amount);
}