"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Check, Circle } from "lucide-react";
import { loanProducts, getLoanProduct, type LoanType } from "@/config/loans";
import { getStepPath } from "@/config/steps";
import { createDraft } from "@/lib/draft/create-draft";
import { formatCurrency } from "@/lib/format/currency";
import { formatTerm } from "@/lib/format/term";
import { draftRepository } from "@/lib/persistence";
import {
  loanSelectionSchema,
  type LoanSelectionValues,
} from "@/lib/validation/loan-selection";
import { Button } from "@/components/ui/Button";

export function LoanSelectionForm({ initialType }: { initialType?: LoanType }) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoanSelectionValues>({
    resolver: zodResolver(loanSelectionSchema),
    mode: "onChange",
    defaultValues: { loanType: initialType },
  });

  const selectedType = useWatch({ control, name: "loanType" });
  const selectedProduct = selectedType ? getLoanProduct(selectedType) : null;
  const errorMessage = errors.loanType?.message;

  async function onSubmit(values: LoanSelectionValues) {
    setSubmitError(null);
    try {
      const draft = createDraft(values.loanType);
      await draftRepository.create(draft);
      router.push(getStepPath(draft.id, "applicant"));
    } catch {
      setSubmitError("We couldn't start your application. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <fieldset aria-describedby={errorMessage ? "loan-type-error" : undefined}>
        <legend className="text-lg font-semibold text-navy-900">Choose a loan type</legend>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {loanProducts.map((product) => {
            const Icon = product.icon;
            const isSelected = selectedType === product.type;

            return (
              <label key={product.type} className="block cursor-pointer">
                <input
                  type="radio"
                  value={product.type}
                  className="peer sr-only"
                  {...register("loanType")}
                />
                <span className="flex h-full flex-col rounded-lg border border-line bg-white p-5 transition-colors hover:border-navy-800 peer-checked:border-accent-600 peer-checked:ring-2 peer-checked:ring-accent-600 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-600">
                  <span className="flex items-start justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-navy-900">
                      <Icon aria-hidden className="h-5 w-5 text-accent-400" />
                    </span>
                    {isSelected ? (
                      <Check aria-hidden className="h-5 w-5 text-accent-700" />
                    ) : (
                      <Circle aria-hidden className="h-5 w-5 text-slate-300" />
                    )}
                  </span>
                  <span className="mt-4 font-semibold text-navy-900">{product.name}</span>
                  <span className="mt-1 text-sm leading-relaxed text-slate-600">
                    {product.summary}
                  </span>
                  {isSelected && <span className="sr-only">(selected)</span>}
                </span>
              </label>
            );
          })}
        </div>

        {errorMessage && (
          <p id="loan-type-error" role="alert" className="mt-3 text-sm font-medium text-red-700">
            {errorMessage}
          </p>
        )}
      </fieldset>

      <div aria-live="polite" className="mt-6">
        {selectedProduct && (
          <div className="rounded-lg border border-line bg-surface p-5">
            <p className="font-semibold text-navy-900">{selectedProduct.name}</p>
            <p className="mt-1 text-sm text-slate-600">{selectedProduct.summary}</p>
            <p className="mt-3 text-sm text-slate-700">
              Illustrative range: {formatCurrency(selectedProduct.minAmount)} to{" "}
              {formatCurrency(selectedProduct.maxAmount)}, over{" "}
              {formatTerm(selectedProduct.minMonths)} to {formatTerm(selectedProduct.maxMonths)}.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              You can change your selection before continuing. These figures are samples, not an
              offer.
            </p>
          </div>
        )}
      </div>

      {submitError && (
        <p role="alert" className="mt-4 text-sm font-medium text-red-700">
          {submitError}
        </p>
      )}

      <div className="mt-8">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Starting…" : "Continue"}
        </Button>
      </div>
    </form>
  );
}