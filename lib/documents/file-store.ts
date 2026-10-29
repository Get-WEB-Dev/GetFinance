interface StoredFile {
  blob: Blob;
  fileName: string;
  mimeType: string;
}

const files = new Map<string, StoredFile>();
const keyOf = (applicationId: string, documentId: string) => `${applicationId}:${documentId}`;

export const fileStore = {
  get(applicationId: string, documentId: string): StoredFile | undefined {
    return files.get(keyOf(applicationId, documentId));
  },
  set(applicationId: string, documentId: string, file: StoredFile): void {
    files.set(keyOf(applicationId, documentId), file);
  },
  remove(applicationId: string, documentId: string): void {
    files.delete(keyOf(applicationId, documentId));
  },
  clearApplication(applicationId: string): void {
    for (const key of Array.from(files.keys())) {
      if (key.startsWith(`${applicationId}:`)) files.delete(key);
    }
  },
};