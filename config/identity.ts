import { DEFAULT_COUNTRY, type CountryCode } from "@/config/countries";
import type { IdentityKind } from "@/types/verification";

export interface IdentityDocument {
  /** Heading of the card, also its accessible name. */
  title: string;
  label: string;
  hint: string;
  placeholder: string;
  maxLength: number;
  inputMode: "text" | "numeric";
  verifyLabel: string;
  changeLabel: string;
  emptyMessage: string;
  invalidMessage: string;
  /** Removes spaces and dashes and fixes the case. */
  normalize: (raw: string) => string;
  isValid: (normalized: string) => boolean;
  /** What we keep after a successful check. Never the full number. */
  mask: (normalized: string) => string;
  /** Normalised values the simulated service reacts to. */
  testValues: { verified: string; failed: string; flaky: string };
}

const stripSeparators = (raw: string) => raw.replace(/[\s-]/g, "");
const stripAndUpper = (raw: string) => stripSeparators(raw).toUpperCase();
const keepLast = (value: string, count: number) =>
  "•".repeat(Math.max(0, value.length - count)) + value.slice(-count);

function isValidSsn(value: string): boolean {
  if (!/^\d{9}$/.test(value)) return false;
  const area = value.slice(0, 3);
  const group = value.slice(3, 5);
  const serial = value.slice(5);
  return area !== "000" && area !== "666" && area[0] !== "9" && group !== "00" && serial !== "0000";
}

const NINO_PATTERN = /^(?!BG|GB|NK|KN|TN|NT|ZZ)[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z]\d{6}[A-D]$/;

// Formats are placeholders for the demo. Confirm each with the issuing authority before real use.
export const identityDocuments: Record<CountryCode, Record<IdentityKind, IdentityDocument>> = {
  ET: {
    primary: {
      title: "Fayda ID",
      label: "Fayda ID number",
      hint: "16 digits. Spaces are fine.",
      placeholder: "1234 5678 9012 3456",
      maxLength: 19,
      inputMode: "numeric",
      verifyLabel: "Verify Fayda ID",
      changeLabel: "Use a different Fayda ID",
      emptyMessage: "Enter your Fayda ID number.",
      invalidMessage: "Enter a 16-digit Fayda ID number.",
      normalize: stripSeparators,
      isValid: (v) => /^\d{16}$/.test(v),
      mask: (v) => keepLast(v, 4),
      testValues: { verified: "1234567890123456", failed: "9999999999999999", flaky: "8888888888888888" },
    },
    secondary: {
      title: "Tax ID (TIN)",
      label: "TIN (Taxpayer Identification Number)",
      hint: "10 digits.",
      placeholder: "1234567890",
      maxLength: 10,
      inputMode: "numeric",
      verifyLabel: "Verify TIN",
      changeLabel: "Use a different TIN",
      emptyMessage: "Enter your TIN.",
      invalidMessage: "Enter a 10-digit TIN.",
      normalize: stripSeparators,
      isValid: (v) => /^\d{10}$/.test(v),
      mask: (v) => keepLast(v, 4),
      testValues: { verified: "1234567890", failed: "9999999999", flaky: "8888888888" },
    },
  },
  US: {
    primary: {
      title: "Social Security number",
      label: "Social Security number (SSN)",
      hint: "9 digits. Dashes and spaces are fine.",
      placeholder: "123-45-6789",
      maxLength: 11,
      inputMode: "numeric",
      verifyLabel: "Verify SSN",
      changeLabel: "Use a different SSN",
      emptyMessage: "Enter your Social Security number.",
      invalidMessage: "Enter a valid 9-digit SSN. It can't start with 000, 666 or 9, and no part can be all zeros.",
      normalize: stripSeparators,
      isValid: isValidSsn,
      mask: (v) => `•••-••-${v.slice(-4)}`,
      testValues: { verified: "123456789", failed: "234567890", flaky: "345678901" },
    },
    secondary: {
      title: "Driver's license or state ID",
      label: "Driver's license or state ID number",
      hint: "5 to 20 letters and numbers. Dashes are fine.",
      placeholder: "D1234567",
      maxLength: 24,
      inputMode: "text",
      verifyLabel: "Verify ID",
      changeLabel: "Use a different ID",
      emptyMessage: "Enter your driver's license or state ID number.",
      invalidMessage: "Enter 5 to 20 letters and numbers.",
      normalize: stripAndUpper,
      isValid: (v) => /^[A-Z0-9]{5,20}$/.test(v),
      mask: (v) => keepLast(v, 3),
      testValues: { verified: "D1234567", failed: "F0000000", flaky: "E9999999" },
    },
  },
  GB: {
    primary: {
      title: "National Insurance number",
      label: "National Insurance number",
      hint: "2 letters, 6 digits, then a letter A to D. Spaces are fine.",
      placeholder: "AB 12 34 56 C",
      maxLength: 13,
      inputMode: "text",
      verifyLabel: "Verify National Insurance number",
      changeLabel: "Use a different number",
      emptyMessage: "Enter your National Insurance number.",
      invalidMessage: "Enter a valid National Insurance number, such as AB123456C.",
      normalize: stripAndUpper,
      isValid: (v) => NINO_PATTERN.test(v),
      mask: (v) => `${v.slice(0, 2)}••••••${v.slice(-1)}`,
      testValues: { verified: "AB123456C", failed: "CE123456A", flaky: "JT123456B" },
    },
    secondary: {
      title: "Passport",
      label: "Passport number",
      hint: "9 digits.",
      placeholder: "123456789",
      maxLength: 9,
      inputMode: "numeric",
      verifyLabel: "Verify passport",
      changeLabel: "Use a different passport",
      emptyMessage: "Enter your passport number.",
      invalidMessage: "Enter a 9-digit passport number.",
      normalize: stripSeparators,
      isValid: (v) => /^\d{9}$/.test(v),
      mask: (v) => keepLast(v, 4),
      testValues: { verified: "123456789", failed: "999999999", flaky: "888888888" },
    },
  },
};

export function getIdentityDocument(country: CountryCode, kind: IdentityKind): IdentityDocument {
  return identityDocuments[country][kind];
}

export function getTestValues(country: CountryCode) {
  return {
    primary: identityDocuments[country].primary.testValues,
    secondary: identityDocuments[country].secondary.testValues,
  };
}

/** Test values for the default country. Used by end-to-end tests. */
export const simulationTestValues = getTestValues(DEFAULT_COUNTRY);