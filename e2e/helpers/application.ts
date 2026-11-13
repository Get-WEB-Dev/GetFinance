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
  mobile: "911234567",
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
  try {
    await expect(page).toHaveURL(nextUrl, { timeout: 5000 });
    } catch (error) {
    const messages = await page
      .locator('[role="alert"], [id$="-error"], .text-red-700')
      .allInnerTexts();

    const stored = await page.evaluate(() => {
      const key = Object.keys(localStorage).find((name) => name.startsWith("getfinance:draft:"));
      if (!key) return null;
      const draft = JSON.parse(localStorage.getItem(key) as string);
      return {
        loanType: draft.loanType,
        completedSteps: draft.completedSteps,
        stepsToReview: draft.stepsToReview,
        loanDetails: draft.loanDetails,
      };
    });

    throw new Error(
      `Save did not move to ${nextUrl} (still on ${page.url()}).\nMessages:\n${messages
        .map((text) => text.trim())
        .filter((text) => text && text !== "*")
        .join("\n")}\nSaved draft:\n${JSON.stringify(stored, null, 2)}`,
      { cause: error },
    );
  }
}

export function applicationId(page: Page): string {
  const match = new URL(page.url()).pathname.match(/^\/apply\/([^/]+)/);
  if (!match) throw new Error(`Not inside an application: ${page.url()}`);
  return match[1];
}

export interface SavedDraft {
  id: string;
  reference: string;
  applicant?: { dateOfBirth?: string };
}

/** Reads the (single) draft this browser context has saved. */
export async function savedDraft(page: Page): Promise<SavedDraft> {
  const draft = await page.evaluate(() => {
    const key = Object.keys(localStorage).find((name) => name.startsWith("getfinance:draft:"));
    return key ? (JSON.parse(localStorage.getItem(key) as string) as SavedDraft) : null;
  });
  if (!draft) throw new Error("No saved draft found in this browser.");
  return draft;
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

export type EmploymentKind = "salaried" | "self-employed";
export type SignatureMethod = "drawn" | "typed";

interface Context {
  loanType: LoanType;
  person: Person;
  signature: SignatureMethod;
  employment: EmploymentKind;
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
  await fillField(page, "Address line 1", "Bole Sub-city, Woreda 03, House 1204");
  await fillField(page, "City or town", "Addis Ababa");
  await chooseOption(page, "Region", "Addis Ababa");
  await chooseOption(page, "Residence type", "Rented");
  await fillField(page, "Years at this address", "5");
}

export async function chooseEmploymentStatus(page: Page, kind: EmploymentKind) {
  const radio = page.getByRole("radio", { name: kind === "salaried" ? /^Salaried/ : /^Self-employed/ });
  await radio.check({ force: true });
  await expect(radio).toBeChecked();
}

export async function completeEmployment(page: Page, { employment }: Context) {
  await waitForHydration(page);
  await chooseEmploymentStatus(page, employment);

  if (employment === "salaried") {
    await fillField(page, "Employer name", "Acme Technologies");
    await fillField(page, "Job title", "Engineer");
    await fillField(page, "Years with this employer", "3");
    await fillField(page, "Gross monthly salary", "150000");
  } else {
    await fillField(page, "Business or practice name", "Rao Traders");
    await fillField(page, "Profession or line of business", "Wholesale trade");
    await fillField(page, "Years in business", "5");
    await fillField(page, "Average monthly income", "200000");
  }
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** A modest, in-range request that the demo rules should treat as eligible. */
export function loanRequest(loanType: LoanType) {
  const product = getLoanProduct(loanType);
  const target: Record<LoanType, [amount: number, months: number]> = {
    personal: [100_000, 24],
    home: [2_000_000, 240],
    business: [500_000, 36],
  };
  const amount = clamp(target[loanType][0], product.minAmount, product.maxAmount);
  const months = clamp(target[loanType][1], product.minMonths, product.maxMonths);
  return { amount, months, propertyValue: amount * 2, downPayment: Math.round(amount / 4) };
}

export async function completeLoanDetails(page: Page, { loanType }: Context) {
  const { amount, months, propertyValue, downPayment } = loanRequest(loanType);
  await waitForHydration(page);
  await fillField(page, "Loan amount", String(amount));
  await fillField(page, "Repayment period (months)", String(months));

  if (loanType === "personal") {
    await chooseOption(page, "Purpose of the loan", "Medical expenses");
  }

  if (loanType === "home") {
    await chooseOption(page, "Purpose of the loan", "Purchase a property");
    await fillField(page, "Property value", String(propertyValue));
    await fillField(page, "Down payment", String(downPayment));
    await fillField(page, "Property city", "Addis Ababa");
    await chooseOption(page, "Property state or union territory", "Addis Ababa");
   
  }

  if (loanType === "business") {
    await chooseOption(page, "Purpose of the loan", "Working capital");
    await chooseOption(page, "Business type", "Private limited company");
    await chooseOption(page, "Industry", "Technology");
    await fillField(page, "Business registration number", "REG-123456");
    await fillField(page, "Years in operation", "5");
    await fillField(page, "Annual revenue", "3000000");
  }
}

export async function completeFinances(page: Page, { loanType }: Context) {
  await waitForHydration(page);
  await fillField(page, "Monthly living expenses", "30000");
  await fillField(page, "Number of dependents", "1");
  await page.getByRole("radio", { name: "No", exact: true }).check({ force: true });
  await expect(page.getByRole("radio", { name: "No", exact: true })).toBeChecked();
  if (loanType === "business") await fillField(page, "Annual business expenses", "600000");
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

/** Safe to run when an identity is already verified: it only verifies what's still missing. */
export async function completeVerification(page: Page) {
  await waitForHydration(page);

  if ((await identityRegion(page, "PAN").getByText("Simulation reference").count()) === 0) {
    await verifyPan(page, simulationTestValues.pan.verified);
  }
  await expect(identityRegion(page, "PAN")).toContainText("Simulation reference");

  if ((await identityRegion(page, "Aadhaar").getByText("Simulation reference").count()) === 0) {
    await verifyAadhaar(page, simulationTestValues.aadhaar.verified);
  }
  await expect(identityRegion(page, "Aadhaar")).toContainText("Simulation reference");
}

export const samplePdf = {
  name: "sample.pdf",
  mimeType: "application/pdf",
  buffer: Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n"),
};

export const documentSlot = (page: Page, label: string) =>
  page.getByRole("article", { name: new RegExp(`^${escapeRegExp(label)}`) });

/** Safe to run when some documents are already added: it only adds what's missing. */
export async function completeDocuments(page: Page, { loanType, employment }: Context) {
  await waitForHydration(page);
  for (const id of getRequiredDocuments(loanType, employment)) {
    const slot = documentSlot(page, documentCatalog[id].label);
    if ((await slot.getByText("Added (simulated upload)").count()) > 0) continue;

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

const isJourneyStep = (value: string): value is JourneyStep => (order as readonly string[]).includes(value);

const handlers: Record<JourneyStep, (page: Page, context: Context) => Promise<void>> = {
  applicant: completeApplicant,
  address: (page) => completeAddress(page),
  employment: completeEmployment,
  "loan-details": completeLoanDetails,
  finances: completeFinances,
  verification: (page) => completeVerification(page),
  documents: completeDocuments,
  signature: completeSignature,
};

export interface JourneyOptions {
  loanType?: LoanType;
  person?: Person;
  signature?: SignatureMethod;
  employment?: EmploymentKind;
  onStep?: (step: JourneyStep, page: Page) => Promise<void>;
}

function buildContext(options: JourneyOptions): Context {
  const loanType = options.loanType ?? "personal";
  return {
    loanType,
    person: options.person ?? person,
    signature: options.signature ?? "drawn",
    employment: options.employment ?? (loanType === "business" ? "self-employed" : "salaried"),
  };
}

async function completeAndAdvance(
  page: Page,
  step: JourneyStep,
  context: Context,
  onStep?: JourneyOptions["onStep"],
) {
  await handlers[step](page, context);
  await onStep?.(step, page);
  const index = order.indexOf(step);
  const next = index + 1 < order.length ? order[index + 1] : "review";
  await saveAndContinue(page, new RegExp(`/${next}$`));
}

/** Starts a new application and completes every step before `target`, leaving the browser on `target`. */
export async function reachStep(page: Page, target: JourneyStep | "review", options: JourneyOptions = {}) {
  const context = buildContext(options);
  await startApplication(page, context.loanType);

  const stop = target === "review" ? order.length : order.indexOf(target);
  for (let index = 0; index < stop; index++) {
  await completeAndAdvance(page, order[index], context, options.onStep);
}
}

/**
 * From whichever step the browser is on, completes each remaining step until the review page.
 * It starts with a reload so the first form is built from the saved draft, exactly as when someone
 * returns to an application, instead of from a page that was just redirected into place.
 */
export async function continueToReview(page: Page, options: JourneyOptions = {}) {
  const context = buildContext(options);

  await page.reload();

  for (let attempts = 0; attempts <= order.length; attempts++) {
    const slug = new URL(page.url()).pathname.split("/").pop() ?? "";
    if (slug === "review") return;
    if (!isJourneyStep(slug)) throw new Error(`Can't continue from ${page.url()}`);
    await completeAndAdvance(page, slug, context, options.onStep);
  }
  throw new Error("Did not reach the review step.");
}