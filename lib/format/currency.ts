import { DEFAULT_COUNTRY, countries, type CountryCode } from "@/config/countries";

const formatters = new Map<CountryCode, Intl.NumberFormat>();

function formatterFor(country: CountryCode): Intl.NumberFormat {
  let formatter = formatters.get(country);
  if (!formatter) {
    const { locale, currency } = countries[country];
    formatter = new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 });
    formatters.set(country, formatter);
  }
  return formatter;
}

export function formatCurrency(amount: number, country: CountryCode = DEFAULT_COUNTRY): string {
  return formatterFor(country).format(amount);
}