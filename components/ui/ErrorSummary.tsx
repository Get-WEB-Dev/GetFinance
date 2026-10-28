"use client";

import { useEffect, useRef } from "react";

export interface ErrorSummaryItem {
  name: string;
  message: string;
}

export function ErrorSummary({ items, focusKey }: { items: ErrorSummaryItem[]; focusKey: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusKey > 0) containerRef.current?.focus();
    // Focus only when a new submit attempt happens, not while the user is fixing fields.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey]);

  if (items.length === 0) return null;

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      aria-labelledby="error-summary-title"
      className="mb-8 rounded-lg border-2 border-red-700 bg-red-50 p-5 focus:outline-none"
    >
      <h2 id="error-summary-title" className="font-semibold text-red-800">
        There&apos;s a problem. Please fix the following:
      </h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
        {items.map((item) => (
          <li key={item.name}>
            <a href={`#field-${item.name}`} className="font-medium text-red-800 underline">
              {item.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}