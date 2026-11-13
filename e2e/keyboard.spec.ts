import { expect, test } from "@playwright/test";
import {
  byLabel,
  reachStep,
  samplePdf,
  startApplication,
  waitForHydration,
  documentSlot,
} from "./helpers/application";

test.describe("Keyboard use", () => {
  test("loan choices move with the arrow keys and Enter continues", async ({ page }) => {
    await page.goto("/apply?type=personal");
    await waitForHydration(page);

    const personal = page.getByRole("radio", { name: /^Personal Loan/ });
    const home = page.getByRole("radio", { name: /^Home Loan/ });
    await expect(personal).toBeChecked();

    await personal.focus();
    await page.keyboard.press("ArrowDown");
    await expect(home).toBeChecked();
    await expect(home).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/apply\/[^/]+\/applicant$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  });

  test("a dialog opens from the keyboard, closes with Escape, and focus returns to its button", async ({
    page,
  }) => {
    await startApplication(page, "personal");
    await waitForHydration(page);

    const opener = page.getByRole("button", { name: "Change loan type" });
    await opener.focus();
    await page.keyboard.press("Enter");

    const dialog = page.getByRole("dialog", { name: "Change loan type?" });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator(":focus")).toHaveCount(1);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test("an address can be found and chosen without a mouse", async ({ page }) => {
    await reachStep(page, "address");
    await waitForHydration(page);

    const search = page.getByRole("combobox", { name: /^Find your address/ });
    await search.focus();
    await search.fill("Bole");

    await expect(page.getByRole("option").first()).toBeVisible();
    await expect(search).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("ArrowDown");
    await expect(search).toHaveAttribute("aria-activedescendant", /option-0$/);
    await page.keyboard.press("Enter");

    await expect(byLabel(page, "City or town")).not.toHaveValue("");
    await expect(byLabel(page, "P.O. Box")).not.toHaveValue("");
    await expect(page.getByText(/filled from your selection/)).toBeVisible();
  });

  test("a document can be chosen from the keyboard", async ({ page }) => {
    await reachStep(page, "documents");
    await waitForHydration(page);

    const slot = documentSlot(page, "Identity proof");
    const input = slot.locator('input[type="file"]');
    await input.focus();
    await expect(input).toBeFocused();

    const [chooser] = await Promise.all([page.waitForEvent("filechooser"), page.keyboard.press("Space")]);
    await chooser.setFiles(samplePdf);

    await expect(slot).toContainText("Added (simulated upload)");
  });
});