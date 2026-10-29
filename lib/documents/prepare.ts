import { uploadRules } from "@/config/documents";
import { formatBytes } from "@/lib/format/bytes";
import { detectFileKind, kindForMime, validateFileBasics } from "./file-checks";
import { compressImage, verifyDecodable } from "./image";

export type PrepareResult =
  | {
      ok: true;
      blob: Blob;
      fileName: string;
      mimeType: string;
      originalSizeBytes: number;
      compressed: boolean;
    }
  | { ok: false; message: string };

const fail = (message: string): PrepareResult => ({ ok: false, message });

function withJpgExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return `${dot > 0 ? fileName.slice(0, dot) : fileName}.jpg`;
}

export async function prepareFile(file: File): Promise<PrepareResult> {
  const basics = validateFileBasics(file);
  if (!basics.ok) return fail(basics.message);

  let header: Uint8Array;
  try {
    header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  } catch {
    return fail("We couldn't read this file. Try choosing it again.");
  }

  const kind = detectFileKind(header);
  if (kind === null || kind !== kindForMime(file.type)) {
    return fail("This file doesn't look like a valid PDF, JPG or PNG. It may be damaged or renamed.");
  }

  if (kind === "pdf") {
    return {
      ok: true,
      blob: file,
      fileName: file.name,
      mimeType: "application/pdf",
      originalSizeBytes: file.size,
      compressed: false,
    };
  }

  try {
    await verifyDecodable(file);
  } catch {
    return fail("We couldn't open this image. It may be damaged. Try a different file.");
  }

  let blob: Blob = file;
  let fileName = file.name;
  let mimeType = file.type;
  let compressed = false;

  if (file.size > uploadRules.compressAboveBytes) {
    try {
      const smaller = await compressImage(file);
      if (smaller.size < file.size) {
        blob = smaller;
        fileName = withJpgExtension(file.name);
        mimeType = "image/jpeg";
        compressed = true;
      }
    } catch {
      // Compression failed: fall back to the original file if it is small enough.
    }
  }

  if (blob.size > uploadRules.maxStoredBytes) {
    return fail(
      `This image is still ${formatBytes(blob.size)} after optimising. The maximum is ${formatBytes(uploadRules.maxStoredBytes)}.`,
    );
  }

  return { ok: true, blob, fileName, mimeType, originalSizeBytes: file.size, compressed };
}