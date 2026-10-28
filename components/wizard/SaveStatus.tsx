import { AlertCircle, Check, LoaderCircle } from "lucide-react";
import type { SaveState } from "@/types/application";

export function SaveStatus({ state }: { state: SaveState }) {
  return (
    <p role="status" aria-live="polite" className="flex items-center gap-2 text-sm">
      {state === "saving" && (
        <>
          <LoaderCircle aria-hidden className="h-4 w-4 animate-spin text-slate-500 motion-reduce:animate-none" />
          <span className="text-slate-600">Saving…</span>
        </>
      )}
      {state === "saved" && (
        <>
          <Check aria-hidden className="h-4 w-4 text-emerald-700" />
          <span className="text-slate-600">Saved</span>
        </>
      )}
      {state === "error" && (
        <>
          <AlertCircle aria-hidden className="h-4 w-4 text-red-700" />
          <span className="font-medium text-red-700">Couldn&apos;t save</span>
        </>
      )}
    </p>
  );
}