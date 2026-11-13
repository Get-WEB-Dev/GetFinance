export type CountryCode = "ET" | "US" | "GB";

export interface CountryConfig {
  code: CountryCode;
  name: string;
  flag: string;
  /** ISO 4217 currency code. */
  currency: string;
  /** Used by Intl for number, currency and date formatting. */
  locale: string;
  /** Languages the interface will offer for this country, first is the default. */
  languages: string[];
  /** International dialling code, shown in phone fields. */
  callingCode: string;
}

export const countries: Record<CountryCode, CountryConfig> = {
  ET: {
    code: "ET",
    name: "Ethiopia",
    flag: "🇪🇹",
    currency: "ETB",
    locale: "en-ET",
    languages: ["en", "am"],
    callingCode: "+251",
  },
  US: {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    currency: "USD",
    locale: "en-US",
    languages: ["en"],
    callingCode: "+1",
  },
  GB: {
    code: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    currency: "GBP",
    locale: "en-GB",
    languages: ["en"],
    callingCode: "+44",
  },
};

export const countryCodes = Object.keys(countries) as CountryCode[];

export function isCountryCode(value: string): value is CountryCode {
  return value in countries;
}

export function getCountry(code: CountryCode): CountryConfig {
  return countries[code];
}

/** The symbol Intl uses for this country's currency, e.g. "$" or "£". */
export function getCurrencySymbol(code: CountryCode): string {
  const { locale, currency } = countries[code];
  const parts = new Intl.NumberFormat(locale, { style: "currency", currency }).formatToParts(1);
  return parts.find((part) => part.type === "currency")?.value ?? currency;
}
/** Used when no country is chosen yet, and for drafts saved before countries existed. */
export const DEFAULT_COUNTRY: CountryCode = "ET";