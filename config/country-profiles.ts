import type { CountryCode } from "@/config/countries";

export interface Option {
  value: string;
  label: string;
}

export interface PhoneProfile {
  /** Tested against the number after spaces, dashes, dots and brackets are removed. */
  pattern: RegExp;
  maxLength: number;
  hint: string;
  message: string;
}

export interface AddressProfile {
  regionLabel: string;
  regionMissingMessage: string;
  regionInvalidMessage: string;
  regions: Option[];
  postalLabel: string;
  postalRequired: boolean;
  postalPattern: RegExp;
  postalMaxLength: number;
  postalMessage: string;
  line1Hint: string;
  line2Hint: string;
  /** Example searches shown above the address search box. */
  searchExamples: string[];
}

export interface CountryProfile {
  phone: PhoneProfile;
  address: AddressProfile;
}

const toOptions = (names: readonly string[]): Option[] => names.map((name) => ({ value: name, label: name }));

const ethiopianRegions = [
  "Addis Ababa", "Afar", "Amhara", "Benishangul-Gumuz", "Central Ethiopia", "Dire Dawa",
  "Gambela", "Harari", "Oromia", "Sidama", "Somali", "South Ethiopia", "South West Ethiopia", "Tigray",
];

const usStates = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah",
  "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
];

const ukNations = ["England", "Scotland", "Wales", "Northern Ireland"];

export const countryProfiles: Record<CountryCode, CountryProfile> = {
  ET: {
    phone: {
      pattern: /^0?[79]\d{8}$/,
      maxLength: 13,
      hint: "9 digits starting with 9 or 7, without +251. A leading 0 is fine.",
      message: "Enter an Ethiopian mobile number: 9 digits starting with 9 or 7 (a leading 0 is fine).",
    },
    address: {
      regionLabel: "Region",
      regionMissingMessage: "Select your region.",
      regionInvalidMessage: "Select a region from the list.",
      regions: toOptions(ethiopianRegions),
      postalLabel: "P.O. Box",
      postalRequired: false,
      postalPattern: /^[A-Za-z0-9][A-Za-z0-9 -]{0,9}$/,
      postalMaxLength: 10,
      postalMessage: "Use up to 10 letters, numbers, spaces or hyphens.",
      line1Hint: "Sub-city or town, woreda, kebele and house number.",
      line2Hint: "Landmark or area.",
      searchExamples: ["Bole", "Addis Ababa", "Hawassa"],
    },
  },
  US: {
    phone: {
      pattern: /^[2-9]\d{9}$/,
      maxLength: 14,
      hint: "10 digits, without +1.",
      message: "Enter a 10-digit US phone number that doesn't start with 0 or 1.",
    },
    address: {
      regionLabel: "State",
      regionMissingMessage: "Select your state.",
      regionInvalidMessage: "Select a state from the list.",
      regions: toOptions(usStates),
      postalLabel: "ZIP code",
      postalRequired: true,
      postalPattern: /^\d{5}(-\d{4})?$/,
      postalMaxLength: 10,
      postalMessage: "Enter a 5-digit ZIP code, or ZIP+4 such as 94105-1234.",
      line1Hint: "Street number and name.",
      line2Hint: "Apartment, suite or unit.",
      searchExamples: ["Market Street", "Austin", "Seattle"],
    },
  },
  GB: {
    phone: {
      pattern: /^0?7\d{9}$/,
      maxLength: 14,
      hint: "A UK mobile number starting 07, without +44.",
      message: "Enter a UK mobile number, such as 07123 456789.",
    },
    address: {
      regionLabel: "Nation",
      regionMissingMessage: "Select your nation.",
      regionInvalidMessage: "Select a nation from the list.",
      regions: toOptions(ukNations),
      postalLabel: "Postcode",
      postalRequired: true,
      postalPattern: /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s?\d[A-Za-z]{2}$/,
      postalMaxLength: 8,
      postalMessage: "Enter a valid UK postcode, such as SW1A 1AA.",
      line1Hint: "House number and street.",
      line2Hint: "Flat, building or locality.",
      searchExamples: ["High Street", "Manchester", "Cardiff"],
    },
  },
};

export function getCountryProfile(country: CountryCode): CountryProfile {
  return countryProfiles[country];
}

/** Removes the spaces, dashes, dots and brackets people type in phone numbers. */
export function normalizePhone(value: string): string {
  return value.replace(/[\s\-.()]/g, "");
}

export function isRegion(country: CountryCode, value: string): boolean {
  return countryProfiles[country].address.regions.some((region) => region.value === value);
}