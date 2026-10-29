import { z } from "zod";

export const storedDocumentSchema = z.object({
  documentId: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number(),
  originalSizeBytes: z.number(),
  compressed: z.boolean(),
  uploadedAt: z.string(),
});

export type StoredDocument = z.infer<typeof storedDocumentSchema>;

export const documentsStoredSchema = z.record(z.string(), storedDocumentSchema);

export type DocumentsData = z.infer<typeof documentsStoredSchema>;