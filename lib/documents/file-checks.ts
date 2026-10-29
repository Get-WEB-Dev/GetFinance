import { uploadRules } from "@/config/documents";
import { formatBytes } from "@/lib/format/bytes";

export type FileCheck = { ok: true } | { ok: false; message: string };
export type FileKind = "pdf" | "jpeg" | "png";

const fail = (message: string): FileCheck => ({ ok: false, message });

export function validateFileBasics(file: Pick<File, "name" | "type" | "size">): FileCheck {
  const accepted = uploadRules.acceptedMimeTypes as readonly string[];

  if (!accepted.includes(file.type)) {
    return fail("This file type isn't supported. Upload a PDF, JPG or PNG file.");
  }
  if (file.size === 0) {
    return fail("This file is empty. Choose a different file.");
  }
  if (file.type === "application/pdf" && file.size > uploadRules.maxPdfBytes) {
    return fail(
      `PDFs must be ${formatBytes(uploadRules.maxPdfBytes)} or smaller. This file is ${formatBytes(file.size)}.`,
    );
  }
  if (file.type !== "application/pdf" && file.size > uploadRules.maxImageInputBytes) {
    return fail(
      `Images must be ${formatBytes(uploadRules.maxImageInputBytes)} or smaller. This file is ${formatBytes(file.size)}.`,
    );
  }
  return { ok: true };
}

export function detectFileKind(bytes: Uint8Array): FileKind | null {
  const startsWith = (signature: number[]) => signature.every((byte, index) => bytes[index] === byte);

  if (startsWith([0x25, 0x50, 0x44, 0x46, 0x2d])) return "pdf";
  if (startsWith([0xff, 0xd8, 0xff])) return "jpeg";
  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  return null;
}

export function kindForMime(mimeType: string): FileKind | null {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType === "image/jpeg") return "jpeg";
  if (mimeType === "image/png") return "png";
  return null;
}