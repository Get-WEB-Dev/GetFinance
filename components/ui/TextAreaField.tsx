import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { FieldShell, controlClass, describedBy } from "./FieldShell";

interface TextAreaFieldProps extends ComponentPropsWithoutRef<"textarea"> {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  optional?: boolean;
}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(function TextAreaField(
  { label, name, error, hint, optional = false, rows = 3, ...textareaProps },
  ref,
) {
  const id = `field-${name}`;

  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
      <textarea
        {...textareaProps}
        ref={ref}
        id={id}
        name={name}
        rows={rows}
        aria-required={optional ? undefined : true}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, Boolean(hint))}
        className={controlClass(Boolean(error))}
      />
    </FieldShell>
  );
});