import { expect, test } from "@playwright/test";
import { makePdfOfSize, makePng } from "./helpers/files";
import { documentSlot, reachStep, samplePdf, waitForHydration } from "./helpers/application";

const MB = 1024 * 1024;

const identity = (page: import("@playwright/test").Page) => documentSlot(page, "Identity proof");
const fileInput = (page: import("@playwright/test").Page) => identity(page).locator('input[type="file"]');
const added = "Added (simulated upload)";

test.describe("Documents", () => {
  test("bad files are refused with a specific reason each time", async ({ page }) => {
    await reachStep(page, "documents");
    await waitForHydration(page);

    const attempts = [
      { file: { name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("hello") }, message: "isn't supported" },
      { file: { name: "fake.pdf", mimeType: "application/pdf", buffer: Buffer.from("hello world") }, message: "doesn't look like a valid PDF" },
      { file: { name: "empty.pdf", mimeType: "application/pdf", buffer: Buffer.alloc(0) }, message: "This file is empty" },
      { file: { name: "huge.pdf", mimeType: "application/pdf", buffer: makePdfOfSize(5 * MB + 1) }, message: "PDFs must be" },
    ];

    for (const { file, message } of attempts) {
      await fileInput(page).setInputFiles(file);
      await expect(identity(page)).toContainText(message);
      await expect(identity(page)).not.toContainText(added);
    }

    await expect(page.getByRole("button", { name: "Save and continue" })).toBeDisabled();
  });

  test("replace keeps the old file when the new one is bad, and remove restores the requirement", async ({ page }) => {
    await reachStep(page, "documents");
    await waitForHydration(page);

    await fileInput(page).setInputFiles({ ...samplePdf, name: "first.pdf" });
    await expect(identity(page)).toContainText("first.pdf");

    await fileInput(page).setInputFiles({ ...samplePdf, name: "second.pdf" });
    await expect(identity(page)).toContainText("second.pdf");
    await expect(identity(page)).not.toContainText("first.pdf");

    await fileInput(page).setInputFiles({ name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("x") });
    await expect(identity(page)).toContainText("isn't supported");
    await expect(identity(page)).toContainText("second.pdf");

    await fileInput(page).setInputFiles({ ...samplePdf, name: "fail-upload.pdf" });
    await expect(identity(page)).toContainText("The simulated upload failed");
    await expect(identity(page)).toContainText("second.pdf");

    await identity(page).getByRole("button", { name: "Remove" }).click();
    await expect(identity(page)).not.toContainText(added);
    await expect(page.getByText(/Still needed:.*Identity proof/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Save and continue" })).toBeDisabled();
  });

  test("large images are optimised, previews work, and files are gone after a refresh", async ({ page }) => {
    await reachStep(page, "documents");
    await waitForHydration(page);

    await fileInput(page).setInputFiles({ name: "photo.png", mimeType: "image/png", buffer: makePng(800, 800, true) });
    await expect(identity(page)).toContainText("Optimised from");
    await expect(identity(page)).toContainText("photo.jpg");

    await identity(page).getByRole("button", { name: "Preview" }).click();
    const dialog = page.getByRole("dialog", { name: "Preview: Identity proof" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("img", { name: "Preview of photo.jpg" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    // A small image is kept as it is.
    await fileInput(page).setInputFiles({ name: "tiny.png", mimeType: "image/png", buffer: makePng(20, 20, false) });
    await expect(identity(page)).toContainText("tiny.png");
    await expect(identity(page)).not.toContainText("Optimised from");

    // Only metadata survives a refresh.
    await page.reload();
    await expect(identity(page)).toContainText("tiny.png");
    await expect(identity(page)).toContainText("doesn't keep files after a refresh");
    await expect(identity(page).getByRole("button", { name: "Preview" })).toHaveCount(0);
  });
});