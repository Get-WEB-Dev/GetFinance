"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { ErrorSummary } from "@/components/ui/ErrorSummary";
import { TextField } from "@/components/ui/TextField";
import { useReadyDraft } from "@/components/wizard/DraftProvider";
import { StepActions } from "@/components/wizard/StepLayout";
import { applicantRules } from "@/config/rules";
import { getStepPath } from "@/config/steps";
import { useAutosave } from "@/hooks/use-autosave";
import { withCompletedStep } from "@/lib/draft/completion";
import { useMemo } from "react";
import { getCountryProfile } from "@/config/country-profiles";
import {
  createApplicantSchema,
  emptyApplicant,
  type ApplicantFormValues,
} from "@/lib/validation/applicant";
import { useReviewOnMount } from "@/hooks/use-review-on-mount";

export function ApplicantForm() {
  const router = useRouter();
  const { draft, updateDraft } = useReadyDraft();
  const phone = getCountryProfile(draft.country).phone;
  const schema = useMemo(() => createApplicantSchema(draft.country), [draft.country]);

  const form = useForm<ApplicantFormValues>({
   resolver: zodResolver(schema),
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: draft.applicant ?? emptyApplicant,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, submitCount },
  } = form;

  useAutosave(form, (values) => {
    void updateDraft({ applicant: values });
  });

  useReviewOnMount(form, "applicant"); 

  async function onSubmit(values: ApplicantFormValues) {
    await updateDraft({
      applicant: values,
      completedSteps: withCompletedStep(draft.completedSteps, "applicant"),
    });
    router.push(getStepPath(draft.id, "address"));
  }

  const summaryItems = Object.entries(errors).flatMap(([name, error]) =>
    error?.message ? [{ name, message: error.message }] : [],
  );

  const today = new Date().toISOString().slice(0, 10);

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
        <div className="md:col-span-2">
          <TextField
            label="Full legal name"
            autoComplete="name"
            hint="As it appears on your government ID."
            error={errors.fullName?.message}
            {...register("fullName")}
          />
        </div>

        <TextField
          label="Date of birth"
          type="date"
          max={today}
          autoComplete="bday"
          hint={`You must be at least ${applicantRules.minAge} years old.`}
          error={errors.dateOfBirth?.message}
          {...register("dateOfBirth")}
        />

        <TextField
          label="Email address"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <TextField
          label="Mobile number"
          type="tel"
          inputMode="tel"
          maxLength={phone.maxLength}
          autoComplete="tel-national"
          hint={phone.hint}
          error={errors.mobile?.message}
          {...register("mobile")}
        />

        <TextField
          label="Alternate mobile number"
          optional
          type="tel"
          inputMode="tel"
          maxLength={phone.maxLength}
          autoComplete="off"
          error={errors.alternateMobile?.message}
          {...register("alternateMobile")}
        />
      </div>

      <StepActions>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save and continue"}
        </Button>
      </StepActions>
    </form>
  );
}