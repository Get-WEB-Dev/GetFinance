import type { LoanType } from "@/config/loans";

export type DocumentId =
  | "identity-proof"
  | "address-proof"
  | "income-proof"
  | "bank-statement"
  | "property-documents"
  | "business-registration"
  | "financial-statements";

export const documentCatalog: Record<DocumentId, { label: string; description: string }> = {
  "identity-proof": {
    label: "Identity proof",
    description: "A photo ID. For this demo, use a sample or blank image, never your real ID.",
  },
  "address-proof": {
    label: "Address proof",
    description: "A utility bill or rental agreement showing your current address.",
  },
  "income-proof": {
    label: "Income proof",
    description: "Recent salary slips or an income tax return.",
  },
  "bank-statement": {
    label: "Bank statement",
    description: "The last 6 months of statements for your main account.",
  },
  "property-documents": {
    label: "Property documents",
    description: "Sale agreement or title documents for the property.",
  },
  "business-registration": {
    label: "Business registration",
    description: "Your business registration or incorporation certificate.",
  },
  "financial-statements": {
    label: "Financial statements",
    description: "Profit and loss statement and balance sheet for the last financial year.",
  },
};

export const requiredDocumentsByLoanType: Record<LoanType, DocumentId[]> = {
  personal: ["identity-proof", "address-proof", "income-proof", "bank-statement"],
  home: ["identity-proof", "address-proof", "income-proof", "bank-statement", "property-documents"],
  business: [
    "identity-proof",
    "address-proof",
    "bank-statement",
    "business-registration",
    "financial-statements",
  ],
};

export const uploadRules = {
  acceptedMimeTypes: ["application/pdf", "image/jpeg", "image/png"],
  acceptAttribute: ".pdf,.jpg,.jpeg,.png",
  maxPdfBytes: 5 * 1024 * 1024,
  maxImageInputBytes: 10 * 1024 * 1024,
  maxStoredBytes: 5 * 1024 * 1024,
  compressAboveBytes: 500 * 1024,
  maxImageDimension: 1600,
  jpegQuality: 0.8,
} as const;