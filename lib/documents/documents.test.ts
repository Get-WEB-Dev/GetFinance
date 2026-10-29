import { describe, expect, it } from "vitest";
import { formatBytes } from "@/lib/format/bytes";
import { makeDraft } from "@/test/fixtures";
import { detectFileKind, validateFileBasics } from "./file-checks";
import { fitWithin } from "./image";
import { getMissingDocuments, getRequiredDocuments } from "./requirements";

const MB = 1024 * 1024;
const file = (type: string, size: number) => ({ name: "doc", type, size });

describe("validateFileBasics", () => {
  it("accepts a normal PDF, JPG and PNG", () => {
    expect(validateFileBasics(file("application/pdf", 1 * MB)).ok).toBe(true);
    expect(validateFileBasics(file("image/jpeg", 1 * MB)).ok).toBe(true);
    expect(validateFileBasics(file("image/png", 1 * MB)).ok).toBe(true);
  });

  it("rejects unsupported types and empty files", () => {
    expect(validateFileBasics(file("text/plain", 100)).ok).toBe(false);
    expect(validateFileBasics(file("application/pdf", 0)).ok).toBe(false);
  });

  it("allows a PDF of exactly 5 MB and rejects one byte more", () => {
    expect(validateFileBasics(file("application/pdf", 5 * MB)).ok).toBe(true);
    expect(validateFileBasics(file("application/pdf", 5 * MB + 1)).ok).toBe(false);
  });

  it("allows a 10 MB image (it will be compressed) but not more", () => {
    expect(validateFileBasics(file("image/jpeg", 10 * MB)).ok).toBe(true);
    expect(validateFileBasics(file("image/jpeg", 10 * MB + 1)).ok).toBe(false);
  });
});

describe("detectFileKind", () => {
  it("recognises real file signatures", () => {
    expect(detectFileKind(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]))).toBe("pdf");
    expect(detectFileKind(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe("jpeg");
    expect(detectFileKind(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe("png");
  });

  it("returns null for anything else, such as a renamed text file", () => {
    expect(detectFileKind(new TextEncoder().encode("hello world"))).toBeNull();
    expect(detectFileKind(new Uint8Array([]))).toBeNull();
  });
});

describe("fitWithin", () => {
  it("leaves small images alone", () => {
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });

  it("scales the longest side down and keeps the ratio", () => {
    expect(fitWithin(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(1000, 4000, 1600)).toEqual({ width: 400, height: 1600 });
  });

  it("never produces a zero dimension", () => {
    expect(fitWithin(10_000, 1, 1600)).toEqual({ width: 1600, height: 1 });
  });
});

describe("formatBytes", () => {
  it("formats sizes for people", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2 KB");
    expect(formatBytes(5 * MB)).toBe("5.0 MB");
  });
});

describe("required documents", () => {
  it("depends on the loan type", () => {
    expect(getRequiredDocuments("personal")).not.toContain("property-documents");
    expect(getRequiredDocuments("home")).toContain("property-documents");
    expect(getRequiredDocuments("business")).toContain("business-registration");
    expect(getRequiredDocuments("business")).not.toContain("income-proof");
  });

  it("drops income proof for unemployed applicants", () => {
    expect(getRequiredDocuments("personal", "unemployed")).not.toContain("income-proof");
    expect(getRequiredDocuments("personal", "salaried")).toContain("income-proof");
  });

  it("reports which documents are still missing", () => {
    expect(getMissingDocuments(makeDraft())).toHaveLength(4);
    const stored = {
      documentId: "identity-proof",
      fileName: "id.pdf",
      mimeType: "application/pdf",
      sizeBytes: 1000,
      originalSizeBytes: 1000,
      compressed: false,
      uploadedAt: "2026-01-01T00:00:00.000Z",
    };
    expect(getMissingDocuments(makeDraft({ documents: { "identity-proof": stored } }))).toHaveLength(3);
  });
});