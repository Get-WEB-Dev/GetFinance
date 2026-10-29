import type { IdentityKind } from "@/types/verification";

export const simulationTestValues = {
  pan: { verified: "ABCDE1234F", failed: "FAILE1234X", flaky: "ERROR1234X" },
  aadhaar: { verified: "234567890123", failed: "999999999999", flaky: "888888888888" },
} as const;

interface IdentityConfig {
  title: string;
  label: string;
  hint: string;
  placeholder: string;
  maxLength: number;
  inputMode: "text" | "numeric";
  verifyLabel: string;
  changeLabel: string;
}

export const identityConfig: Record<IdentityKind, IdentityConfig> = {
  pan: {
    title: "PAN",
    label: "PAN (Permanent Account Number)",
    hint: "10 characters: 5 letters, 4 digits, 1 letter.",
    placeholder: "ABCDE1234F",
    maxLength: 10,
    inputMode: "text",
    verifyLabel: "Verify PAN",
    changeLabel: "Use a different PAN",
  },
  aadhaar: {
    title: "Aadhaar",
    label: "Aadhaar number",
    hint: "12 digits. Spaces are fine.",
    placeholder: "2345 6789 0123",
    maxLength: 14,
    inputMode: "numeric",
    verifyLabel: "Verify Aadhaar",
    changeLabel: "Use a different Aadhaar number",
  },
};