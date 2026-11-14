import { DEFAULT_COUNTRY, countries, type CountryCode } from "@/config/countries";

const formatters = new Map<CountryCode, Intl.NumberFormat>();

export function formatPercent(ratio: number, country: CountryCode = DEFAULT_COUNTRY): string {
  let formatter = formatters.get(country);
  if (!formatter) {
    formatter = new Intl.NumberFormat(countries[country].locale, { style: "percent", maximumFractionDigits: 0 });
    formatters.set(country, formatter);
  }
  return formatter.format(ratio);
}