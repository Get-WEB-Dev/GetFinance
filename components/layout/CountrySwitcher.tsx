"use client";

import { useRouter } from "next/navigation";
import { countries, countryCodes, isCountryCode, type CountryCode } from "@/config/countries";
import { COUNTRY_COOKIE } from "@/lib/country/cookie";

export function CountrySwitcher({ country }: { country: CountryCode }) {
  const router = useRouter();

  function handleChange(value: string) {
    if (!isCountryCode(value)) return;
    document.cookie = `${COUNTRY_COOKIE}=${value}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <select
      key={country}
      aria-label="Country"
      defaultValue={country}
      onChange={(event) => handleChange(event.target.value)}
      className="max-w-[10rem] rounded-md border border-white/30 bg-navy-950 px-2 py-2 text-sm text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
    >
      {countryCodes.map((code) => (
        <option key={code} value={code}>
          {countries[code].flag} {countries[code].name}
        </option>
      ))}
    </select>
  );
}