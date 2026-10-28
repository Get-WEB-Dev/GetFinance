import { z } from "zod";
import { isIndianState } from "@/config/india-states";
import { locale } from "@/config/locale";
import { isOptionValue, residenceTypeOptions } from "@/config/options";
import { addressRules } from "@/config/rules";
import { isWholeNumber } from "@/lib/validation/helpers";

const PIN_PATTERN = /^[1-9]\d{5}$/;
const PLACE_PATTERN = new RegExp("^\\p{L}[\\p{L}\\p{M}'. -]*$", "u");

export const addressFieldsSchema = z.object({
  addressLine1: z.string(),
  addressLine2: z.string(),
  city: z.string(),
  state: z.string(),
  pincode: z.string(),
  country: z.string(),
  residenceType: z.string(),
  yearsAtAddress: z.string(),
  previousAddress: z.string(),
});

export type AddressFormValues = z.infer<typeof addressFieldsSchema>;

export const emptyAddress: AddressFormValues = {
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  country: locale.country,
  residenceType: "",
  yearsAtAddress: "",
  previousAddress: "",
};

export function needsPreviousAddress(yearsAtAddress: string): boolean {
  return isWholeNumber(yearsAtAddress, 0, 80) && Number(yearsAtAddress) < addressRules.historyYears;
}

export const addressSchema = addressFieldsSchema.superRefine((v, ctx) => {
  const fail = (path: keyof AddressFormValues, message: string) =>
    ctx.addIssue({ code: "custom", path: [path], message });

  const line1 = v.addressLine1.trim();
  if (line1.length === 0) fail("addressLine1", "Enter your street address.");
  else if (line1.length < 5) fail("addressLine1", "Your street address looks too short.");
  else if (line1.length > 120) fail("addressLine1", "Use 120 characters or fewer.");

  if (v.addressLine2.trim().length > 120) fail("addressLine2", "Use 120 characters or fewer.");

  const city = v.city.trim();
  if (city.length === 0) fail("city", "Enter your city or town.");
  else if (!PLACE_PATTERN.test(city)) fail("city", "Use letters, spaces, hyphens and full stops only.");

  if (v.state === "") fail("state", "Select your state or union territory.");
  else if (!isIndianState(v.state)) fail("state", "Select a state or union territory from the list.");

  if (v.pincode.trim() === "") fail("pincode", "Enter your PIN code.");
  else if (!PIN_PATTERN.test(v.pincode.trim())) fail("pincode", "Enter a 6-digit PIN code that doesn't start with 0.");

  if (v.country !== locale.country) fail("country", `This demo supports applicants in ${locale.country} only.`);

  if (v.residenceType === "") fail("residenceType", "Select your residence type.");
  else if (!isOptionValue(residenceTypeOptions, v.residenceType)) fail("residenceType", "Select a residence type from the list.");

  if (!isWholeNumber(v.yearsAtAddress, 0, 80)) {
    fail("yearsAtAddress", "Enter whole years at this address (0 if less than a year).");
  } else if (needsPreviousAddress(v.yearsAtAddress) && v.previousAddress.trim().length < 10) {
    fail("previousAddress", `You've lived here under ${addressRules.historyYears} years. Enter your previous address.`);
  }
});

export function sanitizeAddress(values: AddressFormValues): AddressFormValues {
  return {
    addressLine1: values.addressLine1.trim(),
    addressLine2: values.addressLine2.trim(),
    city: values.city.trim(),
    state: values.state,
    pincode: values.pincode.trim(),
    country: values.country,
    residenceType: values.residenceType,
    yearsAtAddress: values.yearsAtAddress.trim(),
    previousAddress: needsPreviousAddress(values.yearsAtAddress) ? values.previousAddress.trim() : "",
  };
}