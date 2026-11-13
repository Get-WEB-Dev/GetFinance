"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { getCountryProfile } from "@/config/country-profiles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ErrorSummary } from "@/components/ui/ErrorSummary";
import { SelectField } from "@/components/ui/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import { useReadyDraft } from "@/components/wizard/DraftProvider";
import { StepActions } from "@/components/wizard/StepLayout";
import { residenceTypeOptions } from "@/config/options";
import { addressRules } from "@/config/rules";
import { getStepPath } from "@/config/steps";
import { useAutosave } from "@/hooks/use-autosave";
import { withCompletedStep } from "@/lib/draft/completion";
import { AddressAutocomplete } from "@/components/apply/AddressAutocomplete";
import type { AddressSuggestion } from "@/types/places";
import {
  createAddressSchema,
  createEmptyAddress,
  needsPreviousAddress,
  sanitizeAddress,
  type AddressFormValues,
} from "@/lib/validation/address";
import { useReviewOnMount } from "@/hooks/use-review-on-mount";

export function AddressForm() {
  const router = useRouter();
  const { draft, updateDraft } = useReadyDraft();
  const profile = getCountryProfile(draft.country).address;
  const schema = useMemo(() => createAddressSchema(draft.country), [draft.country]);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: draft.address ?? createEmptyAddress(draft.country),
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setFocus,
    formState: { errors, isSubmitting, submitCount },
  } = form;

  const yearsAtAddress = useWatch({ control, name: "yearsAtAddress" });
  const showPreviousAddress = needsPreviousAddress(yearsAtAddress ?? "");

  useAutosave(form, (values) => {
    void updateDraft({ address: values });
  });
  useReviewOnMount(form, "address");

  function applySuggestion(suggestion: AddressSuggestion) {
    const options = { shouldValidate: true, shouldDirty: true, shouldTouch: true };
    setValue("addressLine1", suggestion.addressLine1, options);
    setValue("addressLine2", suggestion.addressLine2, options);
    setValue("city", suggestion.city, options);
    setValue("state", suggestion.state, options);
    setValue("pincode", suggestion.pincode, options);
    setFocus("addressLine1");
  }

  async function onSubmit(values: AddressFormValues) {
    await updateDraft({
      address: sanitizeAddress(values),
      completedSteps: withCompletedStep(draft.completedSteps, "address"),
    });
    router.push(getStepPath(draft.id, "employment"));
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

      <div className="mt-6">
        <AddressAutocomplete country={draft.country} onSelect={applySuggestion} />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <TextField
            label="Address line 1"
            autoComplete="address-line1"
            hint={profile.line1Hint}
            error={errors.addressLine1?.message}
            {...register("addressLine1")}
          />
        </div>
        <div className="md:col-span-2">
          <TextField
            label="Address line 2"
            optional
            autoComplete="address-line2"
            hint={profile.line2Hint}
            error={errors.addressLine2?.message}
            {...register("addressLine2")}
          />
        </div>

        <TextField
          label="City or town"
          autoComplete="address-level2"
          error={errors.city?.message}
          {...register("city")}
        />
        <SelectField
          label={profile.regionLabel}
          options={profile.regions}
          autoComplete="address-level1"
          error={errors.state?.message}
          {...register("state")}
        />
        <TextField
          label={profile.postalLabel}
          optional={!profile.postalRequired}
          maxLength={profile.postalMaxLength}
          autoComplete="postal-code"
          error={errors.pincode?.message}
          {...register("pincode")}
        />
        <TextField
          label="Country"
          readOnly
          error={errors.country?.message}
          {...register("country")}
        />

        <SelectField
          label="Residence type"
          options={residenceTypeOptions}
          error={errors.residenceType?.message}
          {...register("residenceType")}
        />
        <TextField
          label="Years at this address"
          inputMode="numeric"
          maxLength={2}
          hint="Enter 0 if less than a year."
          error={errors.yearsAtAddress?.message}
          {...register("yearsAtAddress")}
        />

        {showPreviousAddress && (
          <div className="md:col-span-2">
            <TextAreaField
              label="Previous address"
              hint={`Required because you've lived here for less than ${addressRules.historyYears} years.`}
              error={errors.previousAddress?.message}
              {...register("previousAddress")}
            />
          </div>
        )}
      </div>

      <StepActions
        back={
          <ButtonLink href={getStepPath(draft.id, "applicant")} variant="secondary">
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