import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { FieldShell, describedBy } from "./FieldShell";

interface TextFieldProps extends ComponentPropsWithoutRef<"input"> {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  startAdornment?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, name, error, hint, optional = false, startAdornment, ...inputProps },
  ref,
) {
  const id = `field-${name}`;

  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
      <div
        className={`mt-2 flex items-stretch overflow-hidden rounded-md border focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-accent-600 ${
          error ? "border-red-600" : "border-slate-300"
        } ${inputProps.readOnly ? "bg-surface" : "bg-white"}`}
      >
        {startAdornment && (
          <span aria-hidden className="flex items-center border-r border-slate-300 bg-surface px-3 text-slate-600">
            {startAdornment}
          </span>
        )}
        <input
          {...inputProps}
          ref={ref}
          id={id}
          name={name}
          aria-required={optional || inputProps.readOnly ? undefined : true}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, Boolean(hint))}
          className="block w-full bg-transparent px-3 py-2.5 text-navy-900 placeholder:text-slate-400 focus:outline-none"
        />
      </div>
    </FieldShell>
  );
});