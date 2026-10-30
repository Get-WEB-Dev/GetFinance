import { describe, expect, it } from "vitest";
import { declarationsVersion, getRequiredDeclarations } from "@/config/declarations";
import { isSignatureSubstantial, strokeLength } from "@/lib/signature/strokes";
import { makeDraft } from "@/test/fixtures";
import {
  getApplicantFullName,
  getDeclarationIssues,
  namesMatch,
  validateDeclarationsInput,
} from "./check";

const allAccepted = (loanType: Parameters<typeof getRequiredDeclarations>[0]) =>
  Object.fromEntries(getRequiredDeclarations(loanType).map((item) => [item.id, true]));

describe("declarations per loan type", () => {
  it("adds loan-specific declarations", () => {
    const ids = (type: "personal" | "home" | "business") => getRequiredDeclarations(type).map((i) => i.id);
    expect(ids("personal")).not.toContain("property-rights");
    expect(ids("home")).toContain("property-rights");
    expect(ids("business")).toContain("business-authority");
  });
});

describe("namesMatch", () => {
  it("ignores case and extra spaces", () => {
    expect(namesMatch("  asha   RAO ", "Asha Rao")).toBe(true);
  });
  it("rejects different or empty names", () => {
    expect(namesMatch("Asha Rao", "Asha Menon")).toBe(false);
    expect(namesMatch("", "")).toBe(false);
  });
});

describe("validateDeclarationsInput", () => {
  const base = { loanType: "personal" as const, fullName: "Asha Rao" };

  it("passes with everything ticked and a drawn signature", () => {
    expect(
      validateDeclarationsInput({
        ...base,
        accepted: allAccepted("personal"),
        signature: { method: "drawn", hasDrawing: true },
      }),
    ).toEqual([]);
  });

  it("lists every unticked declaration", () => {
    const issues = validateDeclarationsInput({
      ...base,
      accepted: {},
      signature: { method: "drawn", hasDrawing: true },
    });
    expect(issues).toHaveLength(getRequiredDeclarations("personal").length);
  });

  it("requires a drawing or a matching typed name", () => {
    const accepted = allAccepted("personal");
    expect(validateDeclarationsInput({ ...base, accepted, signature: { method: "drawn", hasDrawing: false } })).toHaveLength(1);
    expect(validateDeclarationsInput({ ...base, accepted, signature: { method: "typed", typedName: "" } })).toHaveLength(1);
    expect(validateDeclarationsInput({ ...base, accepted, signature: { method: "typed", typedName: "Someone Else" } })).toHaveLength(1);
    expect(validateDeclarationsInput({ ...base, accepted, signature: { method: "typed", typedName: "asha rao" } })).toEqual([]);
  });
});

describe("getDeclarationIssues (saved record)", () => {
  function signedDraft(overrides: Partial<NonNullable<ReturnType<typeof makeDraft>["declarations"]>> = {}) {
    const draft = makeDraft();
    return makeDraft({
      declarations: {
        version: declarationsVersion,
        accepted: allAccepted(draft.loanType),
        marketingConsent: false,
        signature: {
          method: "typed",
          signedAs: getApplicantFullName(draft),
          typedName: getApplicantFullName(draft),
          signedAt: "2026-01-01T00:00:00.000Z",
        },
        ...overrides,
      },
    });
  }

  it("flags a missing record", () => {
    expect(getDeclarationIssues(makeDraft())).toHaveLength(1);
  });

  it("accepts a complete record", () => {
    expect(getDeclarationIssues(signedDraft())).toEqual([]);
  });

  it("flags outdated wording", () => {
    expect(getDeclarationIssues(signedDraft({ version: "old" }))).toHaveLength(1);
  });

  it("flags a signature made under a different name", () => {
    const draft = signedDraft();
    const changed = { ...draft, applicant: { ...draft.applicant!, fullName: "Someone Else" } };
    expect(getDeclarationIssues(changed).some((issue) => issue.field === "signature")).toBe(true);
  });
});

describe("signature strokes", () => {
  it("measures stroke length", () => {
    expect(strokeLength([{ x: 0, y: 0 }, { x: 3, y: 4 }])).toBe(5);
  });
  it("treats a tap as not substantial and a real scribble as substantial", () => {
    expect(isSignatureSubstantial([[{ x: 5, y: 5 }]])).toBe(false);
    expect(isSignatureSubstantial([[{ x: 0, y: 0 }, { x: 200, y: 50 }]])).toBe(true);
  });
});