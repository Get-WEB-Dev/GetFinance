"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DocumentPreview } from "@/components/apply/DocumentPreview";
import { documentCatalog, uploadRules, type DocumentId } from "@/config/documents";
import { prepareFile } from "@/lib/documents/prepare";
import { fileStore } from "@/lib/documents/file-store";
import { formatBytes } from "@/lib/format/bytes";
import { documentUploader } from "@/lib/services";
import type { StoredDocument } from "@/lib/validation/documents";

interface DocumentSlotProps {
  applicationId: string;
  documentId: DocumentId;
  stored: StoredDocument | undefined;
  onStored: (document: StoredDocument) => void;
  onRemoved: () => void;
}

type Busy = null | "preparing" | "uploading";

export function DocumentSlot({ applicationId, documentId, stored, onStored, onRemoved }: DocumentSlotProps) {
  const { label, description } = documentCatalog[documentId];
  const [busy, setBusy] = useState<Busy>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const memoryFile = fileStore.get(applicationId, documentId);
  const titleId = `doc-${documentId}-title`;

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function handleFile(file: File) {
    if (busy) return;

    setError(null);
    setBusy("preparing");
    const controller = new AbortController();
    abortRef.current = controller;

    const prepared = await prepareFile(file);
    if (controller.signal.aborted) return;
    if (!prepared.ok) {
      setBusy(null);
      setError(prepared.message);
      return;
    }

    setBusy("uploading");
    setProgress(0);
    const outcome = await documentUploader.upload(
      { fileName: prepared.fileName, blob: prepared.blob },
      setProgress,
      controller.signal,
    );
    if (controller.signal.aborted) return;
    if (outcome.status === "error") {
      setBusy(null);
      setError(outcome.message);
      return;
    }

    fileStore.set(applicationId, documentId, {
      blob: prepared.blob,
      fileName: prepared.fileName,
      mimeType: prepared.mimeType,
    });
    onStored({
      documentId,
      fileName: prepared.fileName.slice(0, 120),
      mimeType: prepared.mimeType,
      sizeBytes: prepared.blob.size,
      originalSizeBytes: prepared.originalSizeBytes,
      compressed: prepared.compressed,
      uploadedAt: new Date().toISOString(),
    });
    setBusy(null);
  }

  function handleRemove() {
    fileStore.remove(applicationId, documentId);
    setError(null);
    onRemoved();
  }

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    const files = event.dataTransfer.files;
    if (files.length > 1) {
      setError("Please add one file at a time.");
      return;
    }
    if (files[0]) void handleFile(files[0]);
  }

  return (
    <article aria-labelledby={titleId} className="rounded-lg border border-line bg-white p-5">
      <h2 id={titleId} className="font-semibold text-navy-900">
        {label}
        <span aria-hidden className="ml-0.5 text-red-700">
          *
        </span>
      </h2>
      <p className="mt-1 text-sm text-slate-600">{description}</p>

      {stored && (
        <div className="mt-4 rounded-md bg-surface p-4">
          <p className="flex items-center gap-2 font-medium text-navy-900">
            <CheckCircle2 aria-hidden className="h-5 w-5 text-emerald-700" />
            Added (simulated upload)
          </p>
          <p className="mt-1 break-all text-sm text-slate-700">
            {stored.fileName} · {formatBytes(stored.sizeBytes)}
          </p>
          {stored.compressed && (
            <p className="mt-1 text-sm text-slate-600">
              Optimised from {formatBytes(stored.originalSizeBytes)} to {formatBytes(stored.sizeBytes)}.
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-3">
            {memoryFile ? (
              <Button variant="secondary" onClick={() => setPreviewOpen(true)}>
                Preview
              </Button>
            ) : (
              <p className="text-sm text-slate-600">
                Preview isn&apos;t available because this demo doesn&apos;t keep files after a refresh.
              </p>
            )}
            <Button variant="secondary" onClick={handleRemove}>
              Remove
            </Button>
          </div>
        </div>
      )}

      <label
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`mt-4 flex cursor-pointer flex-col items-center gap-1 rounded-md border-2 border-dashed p-5 text-center text-sm focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent-600 ${
          dragging ? "border-accent-600 bg-accent-600/10" : "border-slate-300"
        } ${busy ? "pointer-events-none opacity-60" : ""}`}
      >
        <Upload aria-hidden className="h-5 w-5 text-slate-500" />
        <span className="font-medium text-navy-900">{stored ? "Replace file" : "Choose a file"}</span>
        <span className="text-slate-500">
          or drag and drop. PDF, JPG or PNG, up to {formatBytes(uploadRules.maxPdfBytes)}.
        </span>
        <input
          type="file"
          accept={uploadRules.acceptAttribute}
          disabled={busy !== null}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void handleFile(file);
          }}
        />
      </label>

      <div aria-live="polite" className="mt-3 text-sm">
        {busy === "preparing" && <p className="text-slate-600">Checking and optimising your file…</p>}
        {busy === "uploading" && (
          <div>
            <p className="text-slate-600">Uploading (simulated)… {progress}%</p>
            <div
              role="progressbar"
              aria-label={`Upload progress for ${label}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              className="mt-2 h-2 rounded-full bg-slate-200"
            >
              <div className="h-2 rounded-full bg-accent-600" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        {error && (
          <p className="flex items-start gap-2 font-medium text-red-700">
            <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}
      </div>

      {memoryFile && (
        <Modal open={previewOpen} title={`Preview: ${label}`} onClose={() => setPreviewOpen(false)}>
          <DocumentPreview blob={memoryFile.blob} mimeType={memoryFile.mimeType} fileName={memoryFile.fileName} />
        </Modal>
      )}
    </article>
  );
}