import { expect, test } from "@playwright/test";
import { byLabel, person, reachStep, savedDraft, startApplication, waitForHydration } from "./helpers/application";

const notFound = "We couldn't find an application with those details";

async function attemptResume(page: import("@playwright/test").Page, reference: string, dateOfBirth = "") {
  await byLabel(page, "Reference number").fill(reference);
  await byLabel(page, "Date of birth").fill(dateOfBirth);
  await page.getByRole("button", { name: "Find my application" }).click();
}

test.describe("Resume", () => {
  test("a draft with no personal details resumes with just the reference, however it's typed", async ({ page }) => {
    await startApplication(page, "personal");
    const draft = await savedDraft(page);

    await page.goto("/resume");
    await waitForHydration(page);
    await attemptResume(page, draft.reference.toLowerCase());

    await expect(page).toHaveURL(new RegExp(`/apply/${draft.id}/applicant$`));
  });

  test("once a date of birth is saved, resuming needs it, and failures reveal nothing", async ({ page }) => {
    await reachStep(page, "address");
    const draft = await savedDraft(page);

    await page.goto("/resume");
    await waitForHydration(page);

    await attemptResume(page, draft.reference);
    await expect(page.getByRole("alert").filter({ hasText: notFound })).toBeVisible();

    await attemptResume(page, draft.reference, "1900-01-01");
    await expect(page.getByRole("alert").filter({ hasText: notFound })).toBeVisible();

    await attemptResume(page, draft.reference, person.dateOfBirth);
    await expect(page).toHaveURL(new RegExp(`/apply/${draft.id}/address$`));
  });

  test("an unknown reference gets the same message as a wrong date of birth", async ({ page }) => {
    await page.goto("/resume");
    await waitForHydration(page);

    await attemptResume(page, "GF-ZZZZ9999");
    await expect(page.getByRole("alert").filter({ hasText: notFound })).toBeVisible();
  });

  test("a malformed reference is explained", async ({ page }) => {
    await page.goto("/resume");
    await waitForHydration(page);

    await attemptResume(page, "abc");
    await expect(page.getByRole("alert").filter({ hasText: "Enter your reference as it appears" })).toBeVisible();
  });

  test("repeated failures cause a short lockout", async ({ page }) => {
    await reachStep(page, "address");
    const draft = await savedDraft(page);

    await page.goto("/resume");
    await waitForHydration(page);

    for (let attempt = 0; attempt < 5; attempt++) {
      await attemptResume(page, draft.reference, "1900-01-01");
      await expect(page.getByRole("alert").filter({ hasText: notFound })).toBeVisible();
    }

    await attemptResume(page, draft.reference, person.dateOfBirth);
    await expect(page.getByRole("alert").filter({ hasText: "Too many attempts" })).toBeVisible();
    await expect(page).toHaveURL(/\/resume$/);
  });

  test("another browser can't resume, because drafts live only in the browser that made them", async ({
    page,
    browser,
    baseURL,
  }) => {
    await startApplication(page, "personal");
    const draft = await savedDraft(page);

    const other = await browser.newContext({ baseURL });
    const otherPage = await other.newPage();
    await otherPage.goto("/resume");
    await waitForHydration(otherPage);
    await attemptResume(otherPage, draft.reference);

    await expect(otherPage.getByRole("alert").filter({ hasText: notFound })).toBeVisible();
    await other.close();
  });
});