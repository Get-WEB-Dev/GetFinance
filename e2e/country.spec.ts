import { expect, test } from "@playwright/test";
import { waitForHydration } from "./helpers/application";

test("switching country changes the currency on the loans page and is remembered", async ({ page }) => {
  await page.goto("/loans");
  await waitForHydration(page);
  await expect(page.getByRole("table")).toContainText("ETB");

  await page.getByLabel("Country").selectOption("US");
  await expect(page.getByRole("table")).toContainText("$");

  await page.reload();
  await expect(page.getByLabel("Country")).toHaveValue("US");

  await page.getByLabel("Country").selectOption("GB");
  await expect(page.getByRole("table")).toContainText("£");
});