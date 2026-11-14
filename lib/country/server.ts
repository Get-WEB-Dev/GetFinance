import { cookies } from "next/headers";
import { DEFAULT_COUNTRY, isCountryCode, type CountryCode } from "@/config/countries";
import { COUNTRY_COOKIE } from "./cookie";

/** The country chosen in the header switcher, or the default. Server components only. */
export async function getCurrentCountry(): Promise<CountryCode> {
  const value = (await cookies()).get(COUNTRY_COOKIE)?.value;
  return value && isCountryCode(value) ? value : DEFAULT_COUNTRY;
}