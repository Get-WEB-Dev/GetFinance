import { describe, expect, it } from "vitest";
import { declarationsVersion, getRequiredDeclarations } from "@/config/declarations";
import { steps } from "@/config/steps";
import { getApplicantFullName } from "@/lib/declarations/check";
import { getRequiredDocuments } from "@/lib/documents/requirements";
import { formatIsoDate } from "@/lib/format/date";
import { makeDraft } from "@/test/fixtures";
import type { ApplicationDraft } from "@/types/application";
import { getSubmissionBlockers } from "./readiness";
import { buildReviewSections } from "./sections";

function completeDraft(): ApplicationDraft {
  const base = makeDraft();
  const name = getApplicantFullName(base);
  const identity = {
    status: "verified" as const,
    maskedValue: "XXXXX1234X",
    referenceId: "SIM-1",
    verifiedAt: "2026-01-01T00:00:00.000Z",
  };

  return makeDraft({
    completedSteps: steps.map((step) => step.slug),
    verification: { primary: identity, secondary: identity },
    documents: Object.fromEntries(
      getRequiredDocuments(base.loanType, base.employment?.employmentStatus).map((id) => [
        id,
        {
          documentId: id,
          fileName: `${id}.pdf`,
          mimeType: "application/pdf",
          sizeBytes: 1000,
          originalSizeBytes: 1000,
          compressed: false,
          uploadedAt: "2026-01-01T00:00:00.000Z",
        },
      ]),
    ),
    declarations: {
      version: declarationsVersion,
      accepted: Object.fromEntries(getRequiredDeclarations(base.loanType).map((item) => [item.id, true])),
      marketingConsent: false,
      signature: { method: "typed", signedAs: name, typedName: name, signedAt: "2026-01-01T00:00:00.000Z" },
    },
  });
}

describe("getSubmissionBlockers", () => {
  it("has no blockers for a complete draft", () => {
    expect(getSubmissionBlockers(completeDraft())).toEqual([]);
  });

  it("flags a completed step whose data is now invalid", () => {
    const blockers = getSubmissionBlockers({ ...completeDraft(), documents: {} });
    expect(blockers.map((blocker) => blocker.slug)).toContain("documents");
  });

  it("flags a step that was never completed", () => {
    const draft = completeDraft();
    const blockers = getSubmissionBlockers({
      ...draft,
      completedSteps: draft.completedSteps.filter((slug) => slug !== "finances"),
    });
    expect(blockers.map((blocker) => blocker.slug)).toContain("finances");
  });

  it("flags a signature made under a different name", () => {
    const draft = completeDraft();
    const blockers = getSubmissionBlockers({
      ...draft,
      applicant: { ...draft.applicant!, fullName: "A Different Person" },
    });
    expect(blockers.map((blocker) => blocker.slug)).toContain("signature");
  });

  it("never requires loan selection or review itself", () => {
    const slugs = getSubmissionBlockers({ ...completeDraft(), completedSteps: [] }).map((blocker) => blocker.slug);
    expect(slugs).not.toContain("loan-selection");
    expect(slugs).not.toContain("review");
  });
});

describe("buildReviewSections", () => {
  it("lists the data steps in order", () => {
    expect(buildReviewSections(completeDraft()).map((section) => section.slug)).toEqual([
      "applicant",
      "address",
      "employment",
      "loan-details",
      "finances",
      "verification",
      "documents",
      "signature",
    ]);
  });

  it("shows the applicant's name and only masked identity numbers", () => {
    const draft = completeDraft();
    const sections = buildReviewSections(draft);

    const applicant = sections.find((section) => section.slug === "applicant")!;
    expect(applicant.rows).toContainEqual({ label: "Full name", value: draft.applicant!.fullName });

    const verification = sections.find((section) => section.slug === "verification")!;
    expect(verification.rows.every((row) => row.value.includes("XXXXX1234X"))).toBe(true);
  });

  it("never shows empty or undefined values", () => {
    for (const section of buildReviewSections(completeDraft())) {
      for (const row of section.rows) {
        expect(row.value.trim()).not.toBe("");
        expect(row.value).not.toContain("undefined");
      }
    }
  });
});

describe("formatIsoDate", () => {
  it("formats a calendar date without shifting the day", () => {
    const text = formatIsoDate("1990-05-17");
    expect(text).toContain("17");
    expect(text).toContain("1990");
  });

  it("returns the input when it isn't a date", () => {
    expect(formatIsoDate("not a date")).toBe("not a date");
  });
});