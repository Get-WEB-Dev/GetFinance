import { DEFAULT_COUNTRY, countries, type CountryCode } from "@/config/countries";

export function formatIsoDate(isoDate: string, country: CountryCode = DEFAULT_COUNTRY): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat(countries[country].locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatDateTime(isoDateTime: string, country: CountryCode = DEFAULT_COUNTRY): string {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return isoDateTime;
  return new Intl.DateTimeFormat(countries[country].locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
}