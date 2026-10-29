import { describe, expect, it } from "vitest";
import { addressSchema } from "@/lib/validation/address";
import { errorsFor, validAddress } from "@/test/fixtures";
import { demoAddresses, PLACES_ERROR_QUERY, simulatePlacesSearch } from "./places";

describe("demo address data", () => {
  it("has unique ids", () => {
    const ids = demoAddresses.map((address) => address.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(demoAddresses.map((address) => [address.label, address] as const))(
    "fills the real address schema validly: %s",
    (_label, address) => {
      const values = {
        ...validAddress,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      };
      expect(errorsFor(addressSchema, values)).toEqual({});
    },
  );
});

describe("simulatePlacesSearch", () => {
  it("finds addresses by city, case-insensitively", () => {
    const result = simulatePlacesSearch("PUNE");
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.suggestions.length).toBeGreaterThanOrEqual(2);
      expect(result.suggestions.every((s) => s.city === "Pune")).toBe(true);
    }
  });

  it("requires every word to match", () => {
    const result = simulatePlacesSearch("mg road pune");
    expect(result.status === "ok" && result.suggestions).toHaveLength(1);
  });

  it("returns no suggestions for nonsense or very short queries", () => {
    expect(simulatePlacesSearch("zzzzzz")).toEqual({ status: "ok", suggestions: [] });
    expect(simulatePlacesSearch("pu")).toEqual({ status: "ok", suggestions: [] });
  });

  it("caps the number of results", () => {
    const result = simulatePlacesSearch("road");
    expect(result.status === "ok" && result.suggestions).toHaveLength(5);
  });

  it("simulates a service failure for the documented query", () => {
    expect(simulatePlacesSearch(PLACES_ERROR_QUERY).status).toBe("error");
  });
});