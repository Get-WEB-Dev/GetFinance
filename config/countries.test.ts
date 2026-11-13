import { describe, expect, it } from "vitest";
import { countryCodes, getCurrencySymbol, isCountryCode } from "./countries";

describe("countries", () => {
  it("has exactly the three launch countries", () => {
    expect(countryCodes).toEqual(["ET", "US", "GB"]);
  });

  it("recognises valid country codes only", () => {
    expect(isCountryCode("US")).toBe(true);
    expect(isCountryCode("IN")).toBe(false);
  });

  it("gives a currency symbol for each country", () => {
    expect(getCurrencySymbol("US")).toBe("$");
    expect(getCurrencySymbol("GB")).toBe("£");
    expect(getCurrencySymbol("ET")).toBe("ETB");
  });
});