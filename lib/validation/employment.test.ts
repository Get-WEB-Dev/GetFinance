import { describe, expect, it } from "vitest";
import { errorsFor, validEmployment } from "@/test/fixtures";
import { createEmploymentSchema, sanitizeEmployment } from "./employment";

describe("createEmploymentSchema", () => {
  it("accepts salaried employment for a personal loan", () => {
    expect(errorsFor(createEmploymentSchema("personal"), validEmployment)).toEqual({});
  });

  it("rejects salaried employment for a business loan", () => {
    const errors = errorsFor(createEmploymentSchema("business"), validEmployment);
    expect(errors.employmentStatus).toMatch(/Business Loan/);
  });

  it("requires business details for self-employed applicants", () => {
    const errors = errorsFor(createEmploymentSchema("business"), {
      ...validEmployment,
      employmentStatus: "self-employed",
    });
    expect(Object.keys(errors)).toEqual(expect.arrayContaining(["businessName", "profession", "yearsInBusiness"]));
  });

  it("lets an unemployed applicant leave income blank but not the income source", () => {
    const errors = errorsFor(createEmploymentSchema("personal"), {
      ...validEmployment,
      employmentStatus: "unemployed",
      monthlyIncome: "",
    });
    expect(errors).toEqual({ incomeSource: expect.any(String) });
  });
});

describe("sanitizeEmployment", () => {
  it("drops fields that belong to a different employment status", () => {
    const result = sanitizeEmployment({
      ...validEmployment,
      employmentStatus: "self-employed",
      businessName: "Shop",
      profession: "Retail",
      yearsInBusiness: "4",
    });
    expect(result.employerName).toBe("");
    expect(result.designation).toBe("");
    expect(result.businessName).toBe("Shop");
  });
});