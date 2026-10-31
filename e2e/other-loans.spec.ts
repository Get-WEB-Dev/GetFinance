import { expect, test } from "@playwright/test";
import { getLoanProduct } from "../config/loans";
import {
  chooseEmploymentStatus,
  chooseOption,
  fillField,
  loanRequest,
  reachStep,
  waitForHydration,
} from "./helpers/application";

const journeys = [
  {
    loanType: "home" as const,
    employerText: "Acme Technologies",
    loanRow: "Property value",
    ruleLabel: "Loan as a share of property value",
    documents: ["Property documents"],
    absentDocuments: ["Business registration"],
  },
  {
    loanType: "business" as const,
    employerText: "Rao Traders",
    loanRow: "Registration number",
    ruleLabel: "Years the business has operated",
    documents: ["Business registration", "Financial statements"],
    absentDocuments: ["Income proof"],
  },
];

for (const journey of journeys) {
  const { name } = getLoanProduct(journey.loanType);

  test.describe(name, () => {
    test("completes the whole journey with loan-specific details, rules and documents", async ({ page }) => {
      await reachStep(page, "review", { loanType: journey.loanType });

      await expect(page.getByRole("heading", { name: "Review and submit", level: 1 })).toBeVisible();
      await expect(page.getByText("Likely to be eligible (indicative)")).toBeVisible();
      await expect(page.getByText(journey.ruleLabel)).toBeVisible();

      const loanDetails = page.getByRole("region", { name: "Loan details", exact: true });
      await expect(loanDetails).toContainText(name);
      await expect(loanDetails).toContainText(journey.loanRow);
      await expect(page.getByRole("region", { name: "Employment & income", exact: true })).toContainText(
        journey.employerText,
      );

      const documents = page.getByRole("region", { name: "Documents", exact: true });
      for (const label of journey.documents) await expect(documents).toContainText(label);
      for (const label of journey.absentDocuments) await expect(documents).not.toContainText(label);

      await page.getByRole("button", { name: "Submit application" }).click();
      await expect(page).toHaveURL(/\/submitted$/);
      await expect(page.getByRole("heading", { name: "Application received", level: 1 })).toBeVisible();
    });
  });
}

test.describe("Loan-specific validation", () => {
  test("a home loan plus down payment can't exceed the property value", async ({ page }) => {
    await reachStep(page, "loan-details", { loanType: "home" });
    const { amount, months } = loanRequest("home");

    await waitForHydration(page);
    await fillField(page, "Loan amount", String(amount));
    await fillField(page, "Repayment period (months)", String(months));
    await chooseOption(page, "Purpose of the loan", "Purchase a property");
    await fillField(page, "Property value", String(amount - 1));
    await fillField(page, "Down payment", "0");
    await fillField(page, "Property city", "Pune");
    await chooseOption(page, "Property state or union territory", "Maharashtra");
    await page.getByRole("button", { name: "Save and continue" }).click();

    await expect(page.getByText(/exceed the property value/).first()).toBeVisible();
    await expect(page).toHaveURL(/\/loan-details$/);
  });

  test("a business loan only accepts self-employed applicants", async ({ page }) => {
    await reachStep(page, "employment", { loanType: "business" });

    await waitForHydration(page);
    await chooseEmploymentStatus(page, "salaried");
    await page.getByRole("button", { name: "Save and continue" }).click();

    await expect(page.getByText(/applicants must be/).first()).toBeVisible();
    await expect(page).toHaveURL(/\/employment$/);
  });
});