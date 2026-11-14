import { expect, test } from "@playwright/test";
import { simulationTestValues } from "../config/identity";
import {
  identityRegion,
  person,
  reachStep,
  startApplication,
  verifySecondary,
  verifyPrimary,
  waitForHydration,
} from "./helpers/application";

test.describe("Validation", () => {
  test("an empty step shows a focused error summary and stays put", async ({ page }) => {
    await startApplication(page, "personal");
    await waitForHydration(page);

    await page.getByRole("button", { name: "Save and continue" }).click();

    await expect(page.getByRole("heading", { name: "There's a problem. Please fix the following:" })).toBeVisible();
    await expect(page.locator('[aria-labelledby="error-summary-title"]')).toBeFocused();
    await expect(page).toHaveURL(/\/applicant$/);
  });
});

test.describe("Identity verification", () => {
  test("a failed check blocks continuing until a valid number is verified", async ({ page }) => {
    await reachStep(page, "verification");

    await verifyPrimary(page, simulationTestValues.primary.failed);
    await expect(identityRegion(page, "primary")).toContainText("Verification failed.");
    await expect(identityRegion(page, "primary")).not.toContainText("Simulation reference");
    await expect(page.getByRole("button", { name: "Save and continue" })).toBeDisabled();

    await verifyPrimary(page, simulationTestValues.primary.verified);
    await expect(identityRegion(page, "primary")).toContainText("Simulation reference");

    await verifySecondary(page, simulationTestValues.secondary.verified);
    await expect(page.getByRole("button", { name: "Save and continue" })).toBeEnabled();
  });

  test("a temporary service error can be retried", async ({ page }) => {
    await reachStep(page, "verification");

    await verifyPrimary(page, simulationTestValues.primary.flaky);
    await expect(identityRegion(page, "primary")).toContainText("Something went wrong.");

    await identityRegion(page, "primary").getByRole("button", { name: "Try again" }).click();
    await expect(identityRegion(page, "primary")).toContainText("Simulation reference");
  });

  test("a network failure shows an error and recovers when the network returns", async ({ page }) => {
    await reachStep(page, "verification");

    await page.route("**/api/verify/identity", (route) => route.abort());
    await verifyPrimary(page, simulationTestValues.primary.verified);
    await expect(identityRegion(page, "primary")).toContainText("Something went wrong.");

    await page.unroute("**/api/verify/identity");
    await identityRegion(page, "primary").getByRole("button", { name: "Try again" }).click();
    await expect(identityRegion(page, "primary")).toContainText("Simulation reference");
  });
});

test.describe("Submission", () => {
  test("a failed submission saves nothing and can be retried", async ({ page }) => {
    await reachStep(page, "review", { person: { ...person, email: "fail-submit@example.com" } });

    await page.getByRole("button", { name: "Submit application" }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: "The simulated lender system is unavailable" }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/review$/);

    const stored = await page.evaluate(() => JSON.stringify(Object.entries(localStorage)));
    expect(stored).not.toContain('\\"submission\\"');

    // Let the retry through, but with the failure switch turned off.
    await page.route("**/api/applications/submit", async (route) => {
      const body = route.request().postDataJSON() as Record<string, unknown>;
      await route.continue({ postData: JSON.stringify({ ...body, simulateFailure: false }) });
    });
    await page.getByRole("button", { name: "Try again" }).click();

    await expect(page).toHaveURL(/\/submitted$/);
    await expect(page.getByRole("heading", { name: "Application received", level: 1 })).toBeVisible();
  });

  test("double-clicking submit sends only one request", async ({ page }) => {
    await reachStep(page, "review");

    let requests = 0;
    await page.route("**/api/applications/submit", async (route) => {
      requests += 1;
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.continue();
    });

    await page.getByRole("button", { name: "Submit application" }).dblclick();

    await expect(page).toHaveURL(/\/submitted$/);
    expect(requests).toBe(1);
  });
});