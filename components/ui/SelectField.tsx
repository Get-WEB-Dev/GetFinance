import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { FieldShell, controlClass, describedBy } from "./FieldShell";

interface SelectFieldProps extends ComponentPropsWithoutRef<"select"> {
  label: string;
  name: string;
  options: readonly { value: string; label: string }[];
  placeholder?: string;
  error?: string;
  hint?: string;
  optional?: boolean;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, name, options, placeholder = "Select…", error, hint, optional = false, ...selectProps },
  ref,
) {
  const id = `field-${name}`;

  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
      <select
        {...selectProps}
        ref={ref}
        id={id}
        name={name}
        aria-required={optional ? undefined : true}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, Boolean(hint))}
        className={controlClass(Boolean(error))}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
});