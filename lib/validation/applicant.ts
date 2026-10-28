import { z } from "zod";
import { applicantRules } from "@/config/rules";
import { calculateAge, parseIsoDate } from "@/lib/dates";

const MOBILE_PATTERN = /^[6-9]\d{9}$/;
// Built from a string so unicode property escapes don't depend on the TS target.
const NAME_PATTERN = new RegExp("^\\p{L}[\\p{L}\\p{M}'. -]*$", "u");

const MOBILE_MESSAGE = "Enter a 10-digit mobile number starting with 6, 7, 8 or 9.";

function dateOfBirthError(value: string): string | null {
  if (value === "") return "Enter your date of birth.";

  const birth = parseIsoDate(value);
  if (!birth) return "Enter a valid date of birth.";
  if (birth.getTime() > Date.now()) return "Date of birth can't be in the future.";

  const age = calculateAge(birth);
  if (age < applicantRules.minAge) {
    return `You must be at least ${applicantRules.minAge} years old to apply.`;
  }
  if (age > applicantRules.maxAge) {
    return `Applicants must be ${applicantRules.maxAge} or younger for this product.`;
  }
  return null;
}

/** Loose shape used for saved drafts: raw strings, possibly incomplete. */
export const applicantStoredSchema = z.object({
  fullName: z.string(),
  dateOfBirth: z.string(),
  email: z.string(),
  mobile: z.string(),
  alternateMobile: z.string(),
});

export type ApplicantFormValues = z.infer<typeof applicantStoredSchema>;

export const emptyApplicant: ApplicantFormValues = {
  fullName: "",
  dateOfBirth: "",
  email: "",
  mobile: "",
  alternateMobile: "",
};

/** Strict rules used to decide whether the step is complete. */
export const applicantSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "Enter your full legal name.")
      .min(2, "Your name must be at least 2 characters.")
      .max(100, "Your name must be 100 characters or fewer.")
      .regex(NAME_PATTERN, "Use letters, spaces, apostrophes, hyphens and full stops only."),
    dateOfBirth: z.string().superRefine((value, ctx) => {
      const message = dateOfBirthError(value);
      if (message) ctx.addIssue({ code: "custom", message });
    }),
    email: z
      .string()
      .trim()
      .min(1, "Enter your email address.")
      .max(254, "Your email address is too long.")
      .email("Enter a valid email address, such as name@example.com."),
    mobile: z.string().trim().min(1, "Enter your mobile number.").regex(MOBILE_PATTERN, MOBILE_MESSAGE),
    alternateMobile: z
      .string()
      .trim()
      .refine((value) => value === "" || MOBILE_PATTERN.test(value), MOBILE_MESSAGE),
  })
  .refine((v) => v.alternateMobile === "" || v.alternateMobile !== v.mobile, {
    path: ["alternateMobile"],
    message: "Use a different number from your main mobile number.",
  });