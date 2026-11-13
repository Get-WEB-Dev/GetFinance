import { describe, expect, it } from "vitest";
import { errorsFor, validAddress } from "@/test/fixtures";
import { createAddressSchema } from "./address";

describe("createAddressSchema", () => {
  it("accepts an Ethiopian address with no P.O. Box", () => {
    expect(errorsFor(createAddressSchema("ET"), { ...validAddress, pincode: "" })).toEqual({});
  });

  it("requires a ZIP code in the US and checks its shape", () => {
    const schema = createAddressSchema("US");
    const us = { ...validAddress, country: "United States", state: "California", city: "San Francisco" };
    expect(errorsFor(schema, { ...us, pincode: "94105" })).toEqual({});
    expect(errorsFor(schema, { ...us, pincode: "" }).pincode).toBeDefined();
    expect(errorsFor(schema, { ...us, pincode: "9410" }).pincode).toBeDefined();
  });

  it("checks UK postcodes", () => {
    const schema = createAddressSchema("GB");
    const gb = { ...validAddress, country: "United Kingdom", state: "Wales", city: "Cardiff" };
    expect(errorsFor(schema, { ...gb, pincode: "CF10 1EP" })).toEqual({});
    expect(errorsFor(schema, { ...gb, pincode: "12345" }).pincode).toBeDefined();
  });

  it("rejects a region from another country", () => {
    const errors = errorsFor(createAddressSchema("US"), { ...validAddress, country: "United States", pincode: "94105" });
    expect(errors.state).toBeDefined();
  });
});