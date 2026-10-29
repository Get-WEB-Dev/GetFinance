export type UploadOutcome = { status: "uploaded" } | { status: "error"; message: string };

export interface DocumentUploader {
  upload(
    file: { fileName: string; blob: Blob },
    onProgress: (percent: number) => void,
    signal: AbortSignal,
  ): Promise<UploadOutcome>;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Simulation only: nothing leaves the browser. */
export class SimulatedDocumentUploader implements DocumentUploader {
  async upload(
    file: { fileName: string; blob: Blob },
    onProgress: (percent: number) => void,
    signal: AbortSignal,
  ): Promise<UploadOutcome> {
    const shouldFail = file.fileName.toLowerCase().includes("fail-upload");

    for (let step = 1; step <= 10; step++) {
      await wait(70);
      if (signal.aborted) return { status: "error", message: "Upload cancelled." };
      if (shouldFail && step === 6) {
        return { status: "error", message: "The simulated upload failed. Please try again." };
      }
      onProgress(step * 10);
    }

    return { status: "uploaded" };
  }
}