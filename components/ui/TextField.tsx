import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { AlertCircle } from "lucide-react";

interface TextFieldProps extends ComponentPropsWithoutRef<"input"> {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  optional?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, name, error, hint, optional = false, className = "", ...inputProps },
  ref,
) {
  const id = `field-${name}`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, errorId].filter(Boolean).join(" ");

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
        <p id={hintId} className="mt-1 text-sm text-slate-500">
          {hint}
        </p>
      )}

      <input
        {...inputProps}
        ref={ref}
        id={id}
        name={name}
        aria-required={!optional}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`mt-2 block w-full rounded-md border bg-white px-3 py-2.5 text-navy-900 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent-600 ${
          error ? "border-red-600" : "border-slate-300"
        } ${className}`}
      />

      <div id={errorId} aria-live="polite">
        {error && (
          <p className="mt-2 flex items-start gap-1.5 text-sm font-medium text-red-700">
            <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}
      </div>
    </div>
  );
});