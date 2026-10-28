import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { AlertCircle } from "lucide-react";

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupFieldProps
  extends Omit<ComponentPropsWithoutRef<"input">, "type" | "value" | "id"> {
  legend: string;
  name: string;
  options: readonly RadioOption[];
  error?: string;
  layoutClassName?: string;
}

export const RadioGroupField = forwardRef<HTMLInputElement, RadioGroupFieldProps>(
 function RadioGroupField({ legend, name, options, error, layoutClassName = "md:grid-cols-3", ...inputProps }, ref) {
    const errorId = `field-${name}-error`;

    return (
      <fieldset aria-describedby={errorId}>
        <legend className="text-sm font-medium text-navy-900">
          {legend}
          <span aria-hidden className="ml-0.5 text-red-700">
            *
          </span>
        </legend>

        <div className={`mt-3 grid gap-3 ${layoutClassName}`}>
          {options.map((option, index) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border bg-white p-4 has-[:checked]:border-accent-600 has-[:checked]:ring-2 has-[:checked]:ring-accent-600 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent-600 ${
                error ? "border-red-600" : "border-slate-300"
              }`}
            >
              <input
                {...inputProps}
                ref={ref}
                id={index === 0 ? `field-${name}` : undefined}
                type="radio"
                name={name}
                value={option.value}
                className="mt-1 h-4 w-4 accent-accent-600"
              />
              <span>
                <span className="block text-sm font-semibold text-navy-900">{option.label}</span>
                {option.description && (
                  <span className="mt-0.5 block text-sm text-slate-600">{option.description}</span>
                )}
              </span>
            </label>
          ))}
        </div>

        <div id={errorId} aria-live="polite">
          {error && (
            <p className="mt-2 flex items-start gap-1.5 text-sm font-medium text-red-700">
              <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
        </div>
        {/* <div className={`mt-3 grid gap-3 ${layoutClassName}`}></div> */}
      </fieldset>
    );
  },
);