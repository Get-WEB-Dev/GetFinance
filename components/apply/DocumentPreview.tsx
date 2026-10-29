"use client";

import { useEffect, useState } from "react";

export function DocumentPreview({ blob, mimeType, fileName }: { blob: Blob; mimeType: string; fileName: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  if (!url) return <p role="status">Loading preview…</p>;

  if (mimeType === "application/pdf") {
    return (
      <div>
        <iframe src={url} title={`Preview of ${fileName}`} className="h-[70vh] w-full rounded border border-line" />
        <p className="mt-2 text-sm text-slate-600">
          Can&apos;t see the PDF?{" "}
          <a href={url} target="_blank" rel="noopener noreferrer" className="font-medium text-accent-700 underline">
            Open it in a new tab
          </a>
          .
        </p>
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={`Preview of ${fileName}`} className="mx-auto max-h-[70vh] max-w-full rounded" />;
}