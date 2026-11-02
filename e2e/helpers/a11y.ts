import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

const standards = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

/** Returns a readable list of WCAG A/AA problems on the current page, or "" when there are none. */
export async function accessibilityReport(page: Page, label: string): Promise<string> {
  await page.waitForLoadState("load");
  const { violations } = await new AxeBuilder({ page }).withTags(standards).analyze();
  if (violations.length === 0) return "";

  const lines = violations.map((violation) => {
    const examples = violation.nodes
      .slice(0, 4)
      .map((node) => {
        const summary = (node.failureSummary ?? "").split("\n").slice(1).join(" ").trim();
        return `    - ${node.target.map(String).join(" ")}\n      ${summary}`;
      })
      .join("\n");
    return `  ${violation.id} (${violation.impact}): ${violation.help}\n${examples}`;
  });

  return `${label}\n${lines.join("\n")}`;
}

export async function expectAccessible(page: Page, label: string) {
  expect(await accessibilityReport(page, label), `Accessibility problems on ${label}`).toBe("");
}