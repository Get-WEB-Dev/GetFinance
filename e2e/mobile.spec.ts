import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll } from "./helpers/layout";
import { publicPages } from "./helpers/pages";
import { reachStep } from "./helpers/application";

// 320 CSS pixels is the width WCAG 1.4.10 uses for the reflow requirement.
test.use({ viewport: { width: 320, height: 640 } });

test.describe("Small screens (320px wide)", () => {
  for (const { path, name } of publicPages) {
    test(`${name} fits without sideways scrolling`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("main")).toBeVisible();
      await expectNoHorizontalScroll(page, `${name} (${path})`);
    });
  }

  test("the whole application can be completed on a phone", async ({ page }) => {
    await reachStep(page, "review", {
      signature: "typed",
      onStep: async (step, current) => expectNoHorizontalScroll(current, `Step: ${step}`),
    });

    await expectNoHorizontalScroll(page, "Review");
    await page.getByRole("button", { name: "Submit application" }).click();
    await expect(page.getByRole("heading", { name: "Application received", level: 1 })).toBeVisible();
    await expectNoHorizontalScroll(page, "Application received");
  });
});