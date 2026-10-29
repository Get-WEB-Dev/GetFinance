import { uploadRules } from "@/config/documents";

export function fitWithin(width: number, height: number, maxDimension: number): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxDimension) return { width, height };

  const scale = maxDimension / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export async function verifyDecodable(file: Blob): Promise<void> {
  const bitmap = await createImageBitmap(file);
  bitmap.close();
}

export async function compressImage(file: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

  try {
    const { width, height } = fitWithin(bitmap.width, bitmap.height, uploadRules.maxImageDimension);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not available.");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", uploadRules.jpegQuality),
    );
    if (!blob) throw new Error("The image could not be encoded.");
    return blob;
  } finally {
    bitmap.close();
  }
}