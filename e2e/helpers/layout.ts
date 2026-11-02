import { expect, type Page } from "@playwright/test";

/** WCAG 1.4.10 (Reflow): at 320px wide, content must not need sideways scrolling. */
export async function expectNoHorizontalScroll(page: Page, label: string) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, `${label} scrolls sideways by ${overflow}px`).toBeLessThanOrEqual(1);
}