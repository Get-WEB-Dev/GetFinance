import { documentCatalog } from "@/config/documents";
import { getLoanProduct } from "@/config/loans";
import {
  businessTypeOptions,
  employmentStatusOptions,
  industryOptions,
  loanPurposeOptions,
  yesNoOptions,
} from "@/config/options";
import { getStepLabel, type StepSlug } from "@/config/steps";
import { getRequiredDocuments } from "@/lib/documents/requirements";
import { formatBytes } from "@/lib/format/bytes";
import { formatCurrency } from "@/lib/format/currency";
import { formatIsoDate } from "@/lib/format/date";
import { formatTerm } from "@/lib/format/term";
import { isWholeNumber, parseAmount } from "@/lib/validation/helpers";
import type { ApplicationDraft } from "@/types/application";

export interface ReviewRow {
  label: string;
  value: string;
}

export interface ReviewSection {
  slug: StepSlug;
  title: string;
  rows: ReviewRow[];
}

type Option = { value: string; label: string };

function humanise(value: string): string {
  const text = value.replace(/-/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function labelFor(options: readonly Option[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? humanise(value);
}

function money(value: string): string {
  const amount = parseAmount(value);
  return amount === null ? value : formatCurrency(amount);
}

function years(value: string): string {
  return isWholeNumber(value, 0, 100) ? (Number(value) === 1 ? "1 year" : `${value} years`) : value;
}

/** Keeps only rows that have something to show. */
function rows(...candidates: [label: string, value: string | undefined][]): ReviewRow[] {
  return candidates.flatMap(([label, value]) =>
    value !== undefined && value.trim() !== "" ? [{ label, value: value.trim() }] : [],
  );
}

export function buildReviewSections(draft: ApplicationDraft): ReviewSection[] {
  const sections: ReviewSection[] = [];
  const add = (slug: StepSlug, sectionRows: ReviewRow[]) => {
    if (sectionRows.length > 0) sections.push({ slug, title: getStepLabel(slug), rows: sectionRows });
  };

  const applicant = draft.applicant;
  if (applicant) {
    add(
      "applicant",
      rows(
        ["Full name", applicant.fullName],
        ["Date of birth", formatIsoDate(applicant.dateOfBirth)],
        ["Email", applicant.email],
        ["Mobile", applicant.mobile],
        ["Alternate mobile", applicant.alternateMobile],
      ),
    );
  }

  const address = draft.address;
  if (address) {
    const fullAddress = [address.addressLine1, address.addressLine2, address.city, address.state, address.pincode, address.country]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(", ");
    add(
      "address",
      rows(
        ["Address", fullAddress],
        ["Residence type", address.residenceType ? humanise(address.residenceType) : ""],
        ["Time at this address", address.yearsAtAddress ? years(address.yearsAtAddress) : ""],
        ["Previous address", address.previousAddress],
      ),
    );
  }

  const employment = draft.employment;
  if (employment) {
    add(
      "employment",
      rows(
        ["Employment status", labelFor(employmentStatusOptions, employment.employmentStatus)],
        ["Employer", employment.employerName],
        ["Designation", employment.designation],
        ["Years with employer", employment.yearsWithEmployer ? years(employment.yearsWithEmployer) : ""],
        ["Business name", employment.businessName],
        ["Profession", employment.profession],
        ["Years in business", employment.yearsInBusiness ? years(employment.yearsInBusiness) : ""],
        ["Income source", employment.incomeSource ? humanise(employment.incomeSource) : ""],
        ["Monthly income", money(employment.monthlyIncome)],
      ),
    );
  }

  const details = draft.loanDetails;
  if (details) {
    const purposes: readonly Option[] = loanPurposeOptions[draft.loanType];
    add(
      "loan-details",
      rows(
        ["Loan type", getLoanProduct(draft.loanType).name],
        ["Loan amount", money(details.loanAmount)],
        ["Term", isWholeNumber(details.termMonths, 1, 1200) ? formatTerm(Number(details.termMonths)) : details.termMonths],
        ["Purpose", details.purpose ? labelFor(purposes, details.purpose) : ""],
        ["Purpose (other)", details.purposeOther],
        ["Property value", details.propertyValue ? money(details.propertyValue) : ""],
        ["Down payment", details.downPayment ? money(details.downPayment) : ""],
        ["Property location", [details.propertyCity, details.propertyState].filter(Boolean).join(", ")],
        ["Business type", details.businessType ? labelFor(businessTypeOptions, details.businessType) : ""],
        ["Industry", details.industry ? labelFor(industryOptions, details.industry) : ""],
        ["Registration number", details.registrationNumber],
        ["Years operating", details.yearsOperating ? years(details.yearsOperating) : ""],
        ["Annual revenue", details.annualRevenue ? money(details.annualRevenue) : ""],
      ),
    );
  }

  const finances = draft.finances;
  if (finances) {
    add(
      "finances",
      rows(
        ["Monthly expenses", money(finances.monthlyExpenses)],
        ["Existing loan repayments", finances.hasExistingLoans ? labelFor(yesNoOptions, finances.hasExistingLoans) : ""],
        ["Existing monthly EMI", finances.existingMonthlyEmi ? money(finances.existingMonthlyEmi) : ""],
        ["Dependents", finances.dependents],
        ["Savings", finances.savings ? money(finances.savings) : ""],
        ["Annual business expenses", finances.annualBusinessExpenses ? money(finances.annualBusinessExpenses) : ""],
      ),
    );
  }

  const verification = draft.verification;
  if (verification) {
    add(
      "verification",
      rows(
        ["PAN (masked)", verification.pan ? `${verification.pan.maskedValue}, verified (simulated)` : ""],
        ["Aadhaar (masked)", verification.aadhaar ? `${verification.aadhaar.maskedValue}, verified (simulated)` : ""],
      ),
    );
  }

  const documents = draft.documents;
  if (documents) {
    const required = getRequiredDocuments(draft.loanType, draft.employment?.employmentStatus);
    add(
      "documents",
      required.flatMap((id) => {
        const stored = documents[id];
        return stored
          ? [{ label: documentCatalog[id].label, value: `${stored.fileName} (${formatBytes(stored.sizeBytes)})` }]
          : [];
      }),
    );
  }

  const declarations = draft.declarations;
  if (declarations?.signature) {
    add(
      "signature",
      rows(
        ["Declarations accepted", String(Object.values(declarations.accepted).filter(Boolean).length)],
        ["Signed as", declarations.signature.signedAs],
        ["Signature method", declarations.signature.method === "drawn" ? "Drawn (simulated)" : "Typed name (simulated)"],
        ["Marketing messages", declarations.marketingConsent ? "Yes" : "No"],
      ),
    );
  }

  return sections;
}