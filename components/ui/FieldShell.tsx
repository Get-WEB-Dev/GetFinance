import { AlertCircle } from "lucide-react";

interface FieldShellProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}

export function describedBy(id: string, hasHint: boolean): string {
  return [hasHint ? `${id}-hint` : null, `${id}-error`].filter(Boolean).join(" ");
}

export function controlClass(hasError: boolean): string {
  return `mt-2 block w-full rounded-md border bg-white px-3 py-2.5 text-navy-900 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent-600 ${
    hasError ? "border-red-600" : "border-slate-300"
  }`;
}

export function FieldShell({ id, label, hint, error, optional = false, children }: FieldShellProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-navy-900">
        {label}
        {optional ? (
          <span className="ml-1 font-normal text-slate-500">(optional)</span>
        ) : (
          <span aria-hidden className="ml-0.5 text-red-700">
            *
          </span>
        )}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-slate-500">
          {hint}
        </p>
      )}
      {children}
      <div id={`${id}-error`} aria-live="polite">
        {error && (
          <p className="mt-2 flex items-start gap-1.5 text-sm font-medium text-red-700">
            <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}