import { expect, type Page } from "@playwright/test";
import { documentCatalog } from "../../config/documents";
import { simulationTestValues } from "../../config/identity";
import { getLoanProduct, type LoanType } from "../../config/loans";
import { getRequiredDocuments } from "../../lib/documents/requirements";

export interface Person {
  fullName: string;
  dateOfBirth: string;
  email: string;
  mobile: string;
}

export const person: Person = {
  fullName: "Asha Rao",
  dateOfBirth: "1990-05-17",
  email: "asha.rao@example.com",
  mobile: "9876543210",
};

export const panLabel = "PAN (Permanent Account Number)";
export const aadhaarLabel = "Aadhaar number";

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Matches a field whose label starts with the given text, so "Mobile number" never matches "Alternate mobile number". */
export const byLabel = (page: Page, label: string) => page.getByLabel(new RegExp(`^${escapeRegExp(label)}`));

export async function fillField(page: Page, label: string, value: string) {
  await byLabel(page, label).fill(value);
}

export async function chooseOption(page: Page, label: string, optionLabel: string) {
  await byLabel(page, label).selectOption({ label: optionLabel });
}

/**
 * Waits until React has attached to the page. Typing into a form before hydration can be wiped
 * when React takes over, which makes tests fail randomly.
 */
export async function waitForHydration(page: Page) {
  await page.waitForFunction(() => {
    const root = document.querySelector("form") ?? document.querySelector("main") ?? document.body;
    return Object.keys(root).some((key) => key.startsWith("__reactProps"));
  });
}

export async function saveAndContinue(page: Page, nextUrl: RegExp) {
  await page.getByRole("button", { name: "Save and continue" }).click();
  await expect(page).toHaveURL(nextUrl);
}

export function applicationId(page: Page): string {
  const match = new URL(page.url()).pathname.match(/^\/apply\/([^/]+)/);
  if (!match) throw new Error(`Not inside an application: ${page.url()}`);
  return match[1];
}

export async function startApplication(page: Page, loanType: LoanType) {
  const product = getLoanProduct(loanType);

  await page.goto(`/loans/${loanType}`);
  await page.getByRole("link", { name: `Start a ${product.name.toLowerCase()} application` }).click();
  await expect(page).toHaveURL(new RegExp(`/apply\\?type=${loanType}$`));
  await expect(page.getByRole("radio", { name: new RegExp(`^${escapeRegExp(product.name)}`) })).toBeChecked();

  await waitForHydration(page);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/apply\/[^/]+\/applicant$/);
}

interface Context {
  loanType: LoanType;
  person: Person;
  signature: "drawn" | "typed";
}

export async function completeApplicant(page: Page, { person: who }: Context) {
  await waitForHydration(page);
  await fillField(page, "Full legal name", who.fullName);
  await fillField(page, "Date of birth", who.dateOfBirth);
  await fillField(page, "Email address", who.email);
  await fillField(page, "Mobile number", who.mobile);
}

export async function completeAddress(page: Page) {
  await waitForHydration(page);
  await fillField(page, "Address line 1", "12 MG Road");
  await fillField(page, "City or town", "Bengaluru");
  await chooseOption(page, "State or union territory", "Karnataka");
  await fillField(page, "PIN code", "560001");
  await chooseOption(page, "Residence type", "Rented");
  await fillField(page, "Years at this address", "5");
}

export async function completeEmployment(page: Page, { loanType }: Context) {
  if (loanType !== "personal") throw new Error("Employment for other loan types arrives in Lesson 18.");

  await waitForHydration(page);
  await page.getByRole("radio", { name: /^Salaried/ }).check({ force: true });
  await expect(page.getByRole("radio", { name: /^Salaried/ })).toBeChecked();
  await fillField(page, "Employer name", "Acme Technologies");
  await fillField(page, "Job title", "Engineer");
  await fillField(page, "Years with this employer", "3");
  await fillField(page, "Gross monthly salary", "150000");
}

/** A modest, in-range request that the demo rules should treat as eligible. */
export function loanRequest(loanType: LoanType) {
  const product = getLoanProduct(loanType);
  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
  return {
    amount: clamp(100_000, product.minAmount, product.maxAmount),
    months: clamp(24, product.minMonths, product.maxMonths),
  };
}

export async function completeLoanDetails(page: Page, { loanType }: Context) {
  if (loanType !== "personal") throw new Error("Loan details for other loan types arrive in Lesson 18.");

  const { amount, months } = loanRequest(loanType);
  await waitForHydration(page);
  await fillField(page, "Loan amount", String(amount));
  await fillField(page, "Repayment period (months)", String(months));
  await chooseOption(page, "Purpose of the loan", "Medical expenses");
}

export async function completeFinances(page: Page) {
  await waitForHydration(page);
  await fillField(page, "Monthly living expenses", "30000");
  await fillField(page, "Number of dependents", "1");
  await page.getByRole("radio", { name: "No", exact: true }).check({ force: true });
  await expect(page.getByRole("radio", { name: "No", exact: true })).toBeChecked();
}

export const identityRegion = (page: Page, title: "PAN" | "Aadhaar") =>
  page.getByRole("region", { name: title, exact: true });

export async function verifyPan(page: Page, value: string) {
  await fillField(page, panLabel, value);
  await page.getByRole("button", { name: /^(Verify PAN|Try again)$/ }).click();
}

export async function verifyAadhaar(page: Page, value: string) {
  await fillField(page, aadhaarLabel, value);
  await page.getByRole("button", { name: /^(Verify Aadhaar|Try again)$/ }).click();
}

export async function completeVerification(page: Page) {
  await waitForHydration(page);
  await verifyPan(page, simulationTestValues.pan.verified);
  await expect(identityRegion(page, "PAN")).toContainText("Simulation reference");
  await verifyAadhaar(page, simulationTestValues.aadhaar.verified);
  await expect(identityRegion(page, "Aadhaar")).toContainText("Simulation reference");
}

const samplePdf = {
  name: "sample.pdf",
  mimeType: "application/pdf",
  buffer: Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n"),
};

export async function completeDocuments(page: Page, { loanType }: Context) {
  await waitForHydration(page);
  for (const id of getRequiredDocuments(loanType, "salaried")) {
    const slot = page.getByRole("article", { name: new RegExp(`^${escapeRegExp(documentCatalog[id].label)}`) });
    await slot.locator('input[type="file"]').setInputFiles(samplePdf);
    await expect(slot).toContainText("Added (simulated upload)");
  }
}

export async function acceptDeclarations(page: Page) {
  const boxes = page.getByRole("group", { name: "Declarations", exact: true }).getByRole("checkbox");
  const count = await boxes.count();
  for (let index = 0; index < count; index++) await boxes.nth(index).check();
}

export async function drawSignature(page: Page) {
  const canvas = page.getByRole("img", { name: /Signature drawing area/ });
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  if (!box) throw new Error("The signature canvas is not visible.");

  await page.mouse.move(box.x + box.width * 0.15, box.y + box.height * 0.6);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.3, { steps: 8 });
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.7, { steps: 8 });
  await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.4, { steps: 8 });
  await page.mouse.up();

  await expect(page.getByRole("button", { name: "Undo" })).toBeEnabled();
}

export async function typeSignature(page: Page, fullName: string) {
  await page.getByRole("radio", { name: "Type my name instead" }).check();
  await fillField(page, "Type your full name", fullName);
}

export async function completeSignature(page: Page, { person: who, signature }: Context) {
  await waitForHydration(page);
  await acceptDeclarations(page);
  if (signature === "drawn") await drawSignature(page);
  else await typeSignature(page, who.fullName);
}

const order = [
  "applicant",
  "address",
  "employment",
  "loan-details",
  "finances",
  "verification",
  "documents",
  "signature",
] as const;

export type JourneyStep = (typeof order)[number];

const handlers: Record<JourneyStep, (page: Page, context: Context) => Promise<void>> = {
  applicant: completeApplicant,
  address: completeAddress,
  employment: completeEmployment,
  "loan-details": completeLoanDetails,
  finances: completeFinances,
  verification: completeVerification,
  documents: completeDocuments,
  signature: completeSignature,
};

interface JourneyOptions {
  loanType?: LoanType;
  person?: Person;
  signature?: "drawn" | "typed";
}

/** Starts a new application and completes every step before `target`, leaving the browser on `target`. */
export async function reachStep(page: Page, target: JourneyStep | "review", options: JourneyOptions = {}) {
  const context: Context = {
    loanType: options.loanType ?? "personal",
    person: options.person ?? person,
    signature: options.signature ?? "drawn",
  };

  await startApplication(page, context.loanType);

  const stop = target === "review" ? order.length : order.indexOf(target);
  for (let index = 0; index < stop; index++) {
    await handlers[order[index]](page, context);
    const next = index + 1 < order.length ? order[index + 1] : "review";
    await saveAndContinue(page, new RegExp(`/${next}$`));
  }
}