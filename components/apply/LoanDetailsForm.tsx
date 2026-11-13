"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { RepaymentEstimateCard } from "@/components/apply/RepaymentEstimateCard";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ErrorSummary } from "@/components/ui/ErrorSummary";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import { useReadyDraft } from "@/components/wizard/DraftProvider";
import { StepActions } from "@/components/wizard/StepLayout";
import { stateOptions } from "@/config/india-states";
import { getLoanProduct } from "@/config/loans";
import { getCurrencySymbol } from "@/config/countries";
import { businessTypeOptions, industryOptions, loanPurposeOptions } from "@/config/options";
import { getStepPath } from "@/config/steps";
import { useAutosave } from "@/hooks/use-autosave";
import { withCompletedStep } from "@/lib/draft/completion";
import { formatCurrency as formatMoney } from "@/lib/format/currency";
import { formatTerm } from "@/lib/format/term";
import {
  createLoanDetailsSchema,
  emptyLoanDetails,
  sanitizeLoanDetails,
  type LoanDetailsFormValues,
} from "@/lib/validation/loan-details";
import { useReviewOnMount } from "@/hooks/use-review-on-mount";

export function LoanDetailsForm() {
  const router = useRouter();
  const { draft, updateDraft } = useReadyDraft();
   const loanType = draft.loanType;
  const country = draft.country;
  const product = getLoanProduct(loanType, country);
  const formatCurrency = (amount: number) => formatMoney(amount, country);
  const currencySymbol = getCurrencySymbol(country);

  const schema = useMemo(() => createLoanDetailsSchema(loanType, country), [loanType, country]);

  const form = useForm<LoanDetailsFormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: draft.loanDetails ?? emptyLoanDetails,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, submitCount },
  } = form;

  const [amount, term, purpose] = useWatch({ control, name: ["loanAmount", "termMonths", "purpose"] });

  useAutosave(form, (values) => {
    void updateDraft({ loanDetails: values });
  });

  useReviewOnMount(form, "loan-details");

  async function onSubmit(values: LoanDetailsFormValues) {
    await updateDraft({
      loanDetails: sanitizeLoanDetails(values, loanType),
      completedSteps: withCompletedStep(draft.completedSteps, "loan-details"),
    });
    router.push(getStepPath(draft.id, "finances"));
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
          label="Loan amount"
          startAdornment={currencySymbol}
          inputMode="numeric"
          maxLength={9}
          hint={`Between ${formatCurrency(product.minAmount)} and ${formatCurrency(product.maxAmount)}.`}
          error={errors.loanAmount?.message}
          {...register("loanAmount")}
        />
        <TextField
          label="Repayment period (months)"
          inputMode="numeric"
          maxLength={3}
          hint={`${product.minMonths} to ${product.maxMonths} months (${formatTerm(product.minMonths)} to ${formatTerm(product.maxMonths)}).`}
          error={errors.termMonths?.message}
          {...register("termMonths")}
        />

        <SelectField
          label="Purpose of the loan"
          options={loanPurposeOptions[loanType]}
          error={errors.purpose?.message}
          {...register("purpose")}
        />
        {purpose === "other" && (
          <TextField
            label="Describe the purpose"
            error={errors.purposeOther?.message}
            {...register("purposeOther")}
          />
        )}
      </div>

      {loanType === "home" && (
        <div className="mt-8 grid gap-6 rounded-lg border border-line bg-surface p-5 md:grid-cols-2">
          <h2 className="font-semibold text-navy-900 md:col-span-2">Property details</h2>
          <TextField
            label="Property value"
            startAdornment={currencySymbol}
            inputMode="numeric"
            maxLength={9}
            error={errors.propertyValue?.message}
            {...register("propertyValue")}
          />
          {purpose === "purchase" && (
            <TextField
              label="Down payment"
              startAdornment={currencySymbol}
              inputMode="numeric"
              maxLength={9}
              hint="Enter 0 if none."
              error={errors.downPayment?.message}
              {...register("downPayment")}
            />
          )}
          <TextField label="Property city" error={errors.propertyCity?.message} {...register("propertyCity")} />
          <SelectField
            label="Property state or union territory"
            options={stateOptions}
            error={errors.propertyState?.message}
            {...register("propertyState")}
          />
        </div>
      )}

      {loanType === "business" && (
        <div className="mt-8 grid gap-6 rounded-lg border border-line bg-surface p-5 md:grid-cols-2">
          <h2 className="font-semibold text-navy-900 md:col-span-2">Business details</h2>
          <SelectField label="Business type" options={businessTypeOptions} error={errors.businessType?.message} {...register("businessType")} />
          <SelectField label="Industry" options={industryOptions} error={errors.industry?.message} {...register("industry")} />
          <TextField
            label="Business registration number"
            hint="Demo format only. It is not checked against any registry."
            error={errors.registrationNumber?.message}
            {...register("registrationNumber")}
          />
          <TextField
            label="Years in operation"
            inputMode="numeric"
            maxLength={3}
            hint="Enter 0 if less than a year."
            error={errors.yearsOperating?.message}
            {...register("yearsOperating")}
          />
          <TextField
            label="Annual revenue"
            startAdornment={currencySymbol}
            inputMode="numeric"
            maxLength={9}
            error={errors.annualRevenue?.message}
            {...register("annualRevenue")}
          />
        </div>
      )}

      <RepaymentEstimateCard loanType={loanType} amount={amount ?? ""} months={term ?? ""} country={country} />

      <StepActions
        back={
          <ButtonLink href={getStepPath(draft.id, "employment")} variant="secondary">
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