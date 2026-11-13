import { z } from "zod";
import { DEFAULT_COUNTRY, countries, type CountryCode } from "@/config/countries";
import { getCountryProfile, isRegion } from "@/config/country-profiles";
import { isOptionValue, residenceTypeOptions } from "@/config/options";
import { addressRules } from "@/config/rules";
import { isWholeNumber } from "@/lib/validation/helpers";

const PLACE_PATTERN = new RegExp("^\\p{L}[\\p{L}\\p{M}'. -]*$", "u");

// "pincode" is the stored name of the postal field for every country (PIN, ZIP or postcode).
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

export function createEmptyAddress(country: CountryCode = DEFAULT_COUNTRY): AddressFormValues {
  return {
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: countries[country].name,
    residenceType: "",
    yearsAtAddress: "",
    previousAddress: "",
  };
}

export const emptyAddress = createEmptyAddress();

export function needsPreviousAddress(yearsAtAddress: string): boolean {
  return isWholeNumber(yearsAtAddress, 0, 80) && Number(yearsAtAddress) < addressRules.historyYears;
}

export function createAddressSchema(country: CountryCode = DEFAULT_COUNTRY) {
  const profile = getCountryProfile(country).address;
  const countryName = countries[country].name;

  return addressFieldsSchema.superRefine((v, ctx) => {
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

    if (v.state === "") fail("state", profile.regionMissingMessage);
    else if (!isRegion(country, v.state)) fail("state", profile.regionInvalidMessage);

    const postal = v.pincode.trim();
    if (postal === "") {
      if (profile.postalRequired) fail("pincode", `Enter your ${profile.postalLabel}.`);
    } else if (!profile.postalPattern.test(postal)) {
      fail("pincode", profile.postalMessage);
    }

    if (v.country !== countryName) fail("country", `This application is for ${countryName}.`);

    if (v.residenceType === "") fail("residenceType", "Select your residence type.");
    else if (!isOptionValue(residenceTypeOptions, v.residenceType)) fail("residenceType", "Select a residence type from the list.");

    if (!isWholeNumber(v.yearsAtAddress, 0, 80)) {
      fail("yearsAtAddress", "Enter whole years at this address (0 if less than a year).");
    } else if (needsPreviousAddress(v.yearsAtAddress) && v.previousAddress.trim().length < 10) {
      fail("previousAddress", `You've lived here under ${addressRules.historyYears} years. Enter your previous address.`);
    }
  });
}

export const addressSchema = createAddressSchema();

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