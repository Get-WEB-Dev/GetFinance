"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ErrorSummary } from "@/components/ui/ErrorSummary";
import { RadioGroupField } from "@/components/ui/RadioGroupField";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import { useReadyDraft } from "@/components/wizard/DraftProvider";
import { StepActions } from "@/components/wizard/StepLayout";
import { locale } from "@/config/locale";
import { employmentStatusOptions, incomeSourceOptions } from "@/config/options";
import { allowedEmploymentStatuses } from "@/config/rules";
import { getStepPath } from "@/config/steps";
import { useAutosave } from "@/hooks/use-autosave";
import { withCompletedStep } from "@/lib/draft/completion";
import {
  createEmploymentSchema,
  emptyEmployment,
  sanitizeEmployment,
  type EmploymentFormValues,
} from "@/lib/validation/employment";

export function EmploymentForm() {
  const router = useRouter();
  const { draft, updateDraft } = useReadyDraft();

  const schema = useMemo(() => createEmploymentSchema(draft.loanType), [draft.loanType]);
  const statusChoices = employmentStatusOptions.filter((option) =>
    allowedEmploymentStatuses[draft.loanType].includes(option.value),
  );

  const form = useForm<EmploymentFormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: draft.employment ?? emptyEmployment,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, submitCount },
  } = form;

  const status = useWatch({ control, name: "employmentStatus" });

  useAutosave(form, (values) => {
    void updateDraft({ employment: values });
  });

  async function onSubmit(values: EmploymentFormValues) {
    await updateDraft({
      employment: sanitizeEmployment(values),
      completedSteps: withCompletedStep(draft.completedSteps, "employment"),
    });
    router.push(getStepPath(draft.id, "loan-details"));
  }

  const summaryItems = Object.entries(errors).flatMap(([name, error]) =>
    error?.message ? [{ name, message: error.message }] : [],
  );

  const incomeLabel =
    status === "salaried"
      ? "Gross monthly salary"
      : status === "self-employed"
        ? "Average monthly income"
        : "Other monthly income";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <ErrorSummary items={summaryItems} focusKey={submitCount} />

      <p className="text-sm text-slate-600">
        <span aria-hidden className="text-red-700">
          *
        </span>{" "}
        Required field
      </p>

      <div className="mt-6">
        <RadioGroupField
          legend="Employment status"
          options={statusChoices}
          error={errors.employmentStatus?.message}
          {...register("employmentStatus")}
        />
      </div>

      {status === "salaried" && (
        <div className="mt-8 grid gap-6 rounded-lg border border-line bg-surface p-5 md:grid-cols-2">
          <h2 className="font-semibold text-navy-900 md:col-span-2">Employer details</h2>
          <TextField label="Employer name" autoComplete="organization" error={errors.employerName?.message} {...register("employerName")} />
          <TextField label="Job title" autoComplete="organization-title" error={errors.designation?.message} {...register("designation")} />
          <TextField label="Years with this employer" inputMode="numeric" maxLength={2} hint="Enter 0 if less than a year." error={errors.yearsWithEmployer?.message} {...register("yearsWithEmployer")} />
        </div>
      )}

      {status === "self-employed" && (
        <div className="mt-8 grid gap-6 rounded-lg border border-line bg-surface p-5 md:grid-cols-2">
          <h2 className="font-semibold text-navy-900 md:col-span-2">Business details</h2>
          <TextField label="Business or practice name" error={errors.businessName?.message} {...register("businessName")} />
          <TextField label="Profession or line of business" error={errors.profession?.message} {...register("profession")} />
          <TextField label="Years in business" inputMode="numeric" maxLength={2} hint="Enter 0 if less than a year." error={errors.yearsInBusiness?.message} {...register("yearsInBusiness")} />
        </div>
      )}

      {status === "unemployed" && (
        <div className="mt-8 grid gap-6 rounded-lg border border-line bg-surface p-5 md:grid-cols-2">
          <h2 className="font-semibold text-navy-900 md:col-span-2">Income source</h2>
          <SelectField label="Main source of income" options={incomeSourceOptions} error={errors.incomeSource?.message} {...register("incomeSource")} />
        </div>
      )}

      {(status === "salaried" || status === "self-employed" || status === "unemployed") && (
        <div className="mt-8 max-w-sm">
          <TextField
            label={incomeLabel}
            optional={status === "unemployed"}
            startAdornment={locale.currencySymbol}
            inputMode="numeric"
            maxLength={9}
            hint="Before tax, in rupees. Digits only."
            error={errors.monthlyIncome?.message}
            {...register("monthlyIncome")}
          />
        </div>
      )}

      <StepActions
        back={
          <ButtonLink href={getStepPath(draft.id, "address")} variant="secondary">
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