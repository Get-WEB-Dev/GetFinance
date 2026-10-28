"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { AffordabilitySnapshot } from "@/components/apply/AffordabilitySnapshot";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ErrorSummary } from "@/components/ui/ErrorSummary";
import { RadioGroupField } from "@/components/ui/RadioGroupField";
import { TextField } from "@/components/ui/TextField";
import { useReadyDraft } from "@/components/wizard/DraftProvider";
import { StepActions } from "@/components/wizard/StepLayout";
import { locale } from "@/config/locale";
import { yesNoOptions } from "@/config/options";
import { getStepPath } from "@/config/steps";
import { useAutosave } from "@/hooks/use-autosave";
import { withCompletedStep } from "@/lib/draft/completion";
import {
  createFinancesSchema,
  emptyFinances,
  sanitizeFinances,
  type FinancesFormValues,
} from "@/lib/validation/finances";
import { useReviewOnMount } from "@/hooks/use-review-on-mount";

export function FinancesForm() {
  const router = useRouter();
  const { draft, updateDraft } = useReadyDraft();
  const loanType = draft.loanType;

  const schema = useMemo(() => createFinancesSchema(loanType), [loanType]);

  const form = useForm<FinancesFormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: draft.finances ?? emptyFinances,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, submitCount },
  } = form;

  const [expenses, hasLoans, existingEmi] = useWatch({
    control,
    name: ["monthlyExpenses", "hasExistingLoans", "existingMonthlyEmi"],
  });

  useAutosave(form, (values) => {
    void updateDraft({ finances: values });
  });

  useReviewOnMount(form, "finances");

  async function onSubmit(values: FinancesFormValues) {
    await updateDraft({
      finances: sanitizeFinances(values, loanType),
      completedSteps: withCompletedStep(draft.completedSteps, "finances"),
    });
    router.push(getStepPath(draft.id, "verification"));
  }

  const summaryItems = Object.entries(errors).flatMap(([name, error]) =>
    error?.message ? [{ name, message: error.message }] : [],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <ErrorSummary items={summaryItems} focusKey={submitCount} />

      <p className="text-sm text-slate-600">
        <span aria-hidden className="text-red-700">
          *
        </span>{" "}
        Required field
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <TextField
          label="Monthly living expenses"
          startAdornment={locale.currencySymbol}
          inputMode="numeric"
          maxLength={9}
          hint="Rent, food, utilities, transport and similar."
          error={errors.monthlyExpenses?.message}
          {...register("monthlyExpenses")}
        />
        <TextField
          label="Number of dependents"
          inputMode="numeric"
          maxLength={2}
          error={errors.dependents?.message}
          {...register("dependents")}
        />

        <div className="md:col-span-2">
          <RadioGroupField
            legend="Do you have existing loan repayments?"
            options={yesNoOptions}
            layoutClassName="md:grid-cols-2"
            error={errors.hasExistingLoans?.message}
            {...register("hasExistingLoans")}
          />
        </div>

        {hasLoans === "yes" && (
          <TextField
            label="Total existing monthly loan payments"
            startAdornment={locale.currencySymbol}
            inputMode="numeric"
            maxLength={9}
            error={errors.existingMonthlyEmi?.message}
            {...register("existingMonthlyEmi")}
          />
        )}

        <TextField
          label="Savings and investments"
          optional
          startAdornment={locale.currencySymbol}
          inputMode="numeric"
          maxLength={9}
          error={errors.savings?.message}
          {...register("savings")}
        />

        {loanType === "business" && (
          <TextField
            label="Annual business expenses"
            startAdornment={locale.currencySymbol}
            inputMode="numeric"
            maxLength={9}
            error={errors.annualBusinessExpenses?.message}
            {...register("annualBusinessExpenses")}
          />
        )}
      </div>

      <AffordabilitySnapshot
        draft={draft}
        monthlyExpenses={expenses ?? ""}
        existingEmi={hasLoans === "yes" ? (existingEmi ?? "") : "0"}
      />

      <StepActions
        back={
          <ButtonLink href={getStepPath(draft.id, "loan-details")} variant="secondary">
            Back
          </ButtonLink>
        }
      >
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save and continue"}
        </Button>
      </StepActions>
    </form>
  );
}