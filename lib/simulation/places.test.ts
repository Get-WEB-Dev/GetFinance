import { describe, expect, it } from "vitest";
import { countries, countryCodes } from "@/config/countries";
import { createAddressSchema } from "@/lib/validation/address";
import { errorsFor, validAddress } from "@/test/fixtures";
import { demoAddressesByCountry, PLACES_ERROR_QUERY, simulatePlacesSearch } from "./places";

describe("demo address data", () => {
  it("has unique ids", () => {
    const ids = countryCodes.flatMap((code) => demoAddressesByCountry[code].map((address) => address.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  describe.each(countryCodes)("%s", (code) => {
    it.each(demoAddressesByCountry[code].map((address) => [address.label, address] as const))(
      "fills the real address schema validly: %s",
      (_label, address) => {
        const values = {
          ...validAddress,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          country: countries[code].name,
        };
        expect(errorsFor(createAddressSchema(code), values)).toEqual({});
      },
    );
  });
});

describe("simulatePlacesSearch", () => {
  it("finds addresses by city, case-insensitively", () => {
    const result = simulatePlacesSearch("ADDIS", "ET");
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.suggestions.length).toBeGreaterThanOrEqual(2);
      expect(result.suggestions.every((s) => s.city === "Addis Ababa")).toBe(true);
    }
  });

  it("only searches the chosen country", () => {
    const result = simulatePlacesSearch("Austin", "GB");
    expect(result.status === "ok" && result.suggestions).toHaveLength(0);
  });

  it("requires every word to match", () => {
    const result = simulatePlacesSearch("bole addis", "ET");
    expect(result.status === "ok" && result.suggestions).toHaveLength(1);
  });

  it("returns no suggestions for nonsense or very short queries", () => {
    expect(simulatePlacesSearch("zzzzzz")).toEqual({ status: "ok", suggestions: [] });
    expect(simulatePlacesSearch("ad")).toEqual({ status: "ok", suggestions: [] });
  });

  it("caps the number of results", () => {
    const result = simulatePlacesSearch("street", "US");
    expect(result.status === "ok" && result.suggestions).toHaveLength(5);
  });

  it("simulates a service failure for the documented query", () => {
    expect(simulatePlacesSearch(PLACES_ERROR_QUERY).status).toBe("error");
  });
});