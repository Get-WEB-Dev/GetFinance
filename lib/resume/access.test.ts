import { describe, expect, it } from "vitest";
import { makeDraft } from "@/test/fixtures";
import { checkResumeAccess, isReferenceFormat, normalizeReference } from "./access";

describe("normalizeReference", () => {
  it("accepts common ways of typing a reference", () => {
    expect(normalizeReference("GF-1A2B3C4D")).toBe("GF-1A2B3C4D");
    expect(normalizeReference("  gf-1a2b3c4d ")).toBe("GF-1A2B3C4D");
    expect(normalizeReference("GF 1A2B3C4D")).toBe("GF-1A2B3C4D");
    expect(normalizeReference("gf1a2b3c4d")).toBe("GF-1A2B3C4D");
    expect(normalizeReference("1a2b3c4d")).toBe("GF-1A2B3C4D");
  });
});

describe("isReferenceFormat", () => {
  it("only accepts GF- followed by 8 letters or digits", () => {
    expect(isReferenceFormat("GF-1A2B3C4D")).toBe(true);
    expect(isReferenceFormat("GF-1A2B3C4")).toBe(false);
    expect(isReferenceFormat("XX-1A2B3C4D")).toBe(false);
    expect(isReferenceFormat("GF-1A2B3C4!")).toBe(false);
    expect(isReferenceFormat(normalizeReference(""))).toBe(false);
  });
});

describe("checkResumeAccess", () => {
  it("needs only the reference when no date of birth is saved yet", () => {
    expect(checkResumeAccess(makeDraft({ applicant: undefined }), "")).toBe("ok");
  });

  it("requires the saved date of birth once it exists", () => {
    const draft = makeDraft();
    const saved = draft.applicant!.dateOfBirth;
    expect(checkResumeAccess(draft, saved)).toBe("ok");
    expect(checkResumeAccess(draft, ` ${saved} `)).toBe("ok");
    expect(checkResumeAccess(draft, "")).toBe("denied");
    expect(checkResumeAccess(draft, "1900-01-01")).toBe("denied");
  });
});