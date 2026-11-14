import { expect, test } from "@playwright/test";
import { simulationTestValues } from "../config/identity";
import { applicationId, person, reachStep, typeSignature, waitForHydration } from "./helpers/application";

test.describe("Personal loan", () => {
  test("a salaried applicant completes the whole journey and gets a reference", async ({ page }) => {
    await reachStep(page, "review");

    await expect(page.getByRole("heading", { name: "Review and submit", level: 1 })).toBeVisible();
    await expect(page.getByText("Likely to be eligible (indicative)")).toBeVisible();
    await expect(page.getByRole("region", { name: "Applicant", exact: true })).toContainText(person.fullName);

    // Privacy: full identity numbers are never shown or stored, and files are never stored.
    await expect(page.locator("body")).not.toContainText(simulationTestValues.primary.verified);
    const stored = await page.evaluate(() => JSON.stringify(Object.entries(localStorage)));
    expect(stored).not.toContain(simulationTestValues.primary.verified);
    expect(stored).not.toContain(simulationTestValues.secondary.verified);
    expect(stored).not.toContain("%PDF-");

    const id = applicationId(page);
    await page.getByRole("button", { name: "Submit application" }).click();

    await expect(page).toHaveURL(/\/submitted$/);
    await expect(page.getByRole("heading", { name: "Application received", level: 1 })).toBeVisible();
       // The reference is shown in the wizard header and in the result card, and both must agree.
    const references = page.getByText(/^GF-[A-Z0-9]{8}$/);
    await expect(references).toHaveCount(2);
    const reference = (await references.first().innerText()).trim();
    await expect(references).toHaveText([reference, reference]);
    await expect(page.getByText("This is a demonstration. No real application has been made.")).toBeVisible();

    // The result survives a refresh because it is read from the saved snapshot.
    await page.reload();
    await expect(page.getByText(reference)).toHaveCount(2);
    // A submitted application is locked: step URLs send you back to the result.
    await page.goto(`/apply/${id}/applicant`);
    await expect(page).toHaveURL(/\/submitted$/);
  });

  test("declarations start unchecked and a typed name works instead of drawing", async ({ page }) => {
    await reachStep(page, "signature");

    const declarations = page.getByRole("group", { name: "Declarations", exact: true });
    const boxes = declarations.getByRole("checkbox");
    for (let index = 0; index < (await boxes.count()); index++) {
      await expect(boxes.nth(index)).not.toBeChecked();
    }

    // Nothing ticked and nothing signed: we get a list of problems, not a silent failure.
    await page.getByRole("button", { name: "Save and continue" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Please fix the following" })).toBeVisible();
    await expect(page).toHaveURL(/\/signature$/);

    await waitForHydration(page);
    for (let index = 0; index < (await boxes.count()); index++) await boxes.nth(index).check();

    // A name that doesn't match the applicant is rejected.
    await typeSignature(page, "Somebody Else");
    await page.getByRole("button", { name: "Save and continue" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "must match the name on your application" })).toBeVisible();

    await typeSignature(page, person.fullName);
    await page.getByRole("button", { name: "Save and continue" }).click();
    await expect(page).toHaveURL(/\/review$/);
  });
});