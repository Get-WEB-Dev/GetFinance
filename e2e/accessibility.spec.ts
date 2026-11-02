import { expect, test } from "@playwright/test";
import { accessibilityReport, expectAccessible } from "./helpers/a11y";
import { publicPages } from "./helpers/pages";
import { reachStep, startApplication, waitForHydration } from "./helpers/application";

test.describe("Accessibility: public pages", () => {
  for (const { path, name } of publicPages) {
    test(`${name} has no detectable WCAG A/AA problems`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("main")).toBeVisible();
      await expectAccessible(page, `${name} (${path})`);
    });
  }
});

test.describe("Accessibility: the application", () => {
  test("every step, filled in, plus review and the result page", async ({ page }) => {
    const reports: string[] = [];

    await reachStep(page, "review", {
      signature: "typed",
      onStep: async (step, current) => {
        reports.push(await accessibilityReport(current, `Step: ${step} (filled in)`));
      },
    });

    reports.push(await accessibilityReport(page, "Review"));

    await page.getByRole("button", { name: "Submit application" }).click();
    await expect(page).toHaveURL(/\/submitted$/);
    await expect(page.getByRole("heading", { name: "Application received", level: 1 })).toBeVisible();
    reports.push(await accessibilityReport(page, "Application received"));

    expect(reports.filter(Boolean).join("\n\n"), "Accessibility problems found").toBe("");
  });

  test("a step showing validation errors", async ({ page }) => {
    await startApplication(page, "personal");
    await waitForHydration(page);

    await page.getByRole("button", { name: "Save and continue" }).click();
    await expect(page.locator('a[href^="#field-"]').first()).toBeVisible();

    await expectAccessible(page, "Applicant step with errors");
  });

  test("an open dialog", async ({ page }) => {
    await startApplication(page, "personal");
    await waitForHydration(page);

    await page.getByRole("button", { name: "Change loan type" }).click();
    await expect(page.getByRole("dialog", { name: "Change loan type?" })).toBeVisible();

    await expectAccessible(page, "Change loan type dialog");
  });
});