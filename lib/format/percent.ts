import { locale } from "@/config/locale";

const formatter = new Intl.NumberFormat(locale.language, {
  style: "percent",
  maximumFractionDigits: 0,
});

export function formatPercent(ratio: number, country: string): string {
  return formatter.format(ratio);
}