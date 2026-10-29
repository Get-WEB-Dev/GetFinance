import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { errorsFor, validApplicant } from "@/test/fixtures";
import { applicantSchema } from "./applicant";

describe("applicantSchema", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-29T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("accepts a valid applicant", () => {
    expect(errorsFor(applicantSchema, validApplicant)).toEqual({});
  });

  it("allows someone who turns 18 today", () => {
    expect(errorsFor(applicantSchema, { ...validApplicant, dateOfBirth: "2008-10-29" })).toEqual({});
  });

  it("rejects someone who turns 18 tomorrow", () => {
    const errors = errorsFor(applicantSchema, { ...validApplicant, dateOfBirth: "2008-10-30" });
    expect(errors.dateOfBirth).toMatch(/at least 18/);
  });

  it("rejects future dates and impossible dates", () => {
    expect(errorsFor(applicantSchema, { ...validApplicant, dateOfBirth: "2030-01-01" }).dateOfBirth).toBeDefined();
    expect(errorsFor(applicantSchema, { ...validApplicant, dateOfBirth: "1990-02-31" }).dateOfBirth).toBeDefined();
  });

  it("rejects a mobile number that doesn't start with 6-9", () => {
    expect(errorsFor(applicantSchema, { ...validApplicant, mobile: "1234567890" }).mobile).toBeDefined();
  });

  it("rejects an alternate number identical to the mobile", () => {
    const errors = errorsFor(applicantSchema, { ...validApplicant, alternateMobile: validApplicant.mobile });
    expect(errors.alternateMobile).toMatch(/different/);
  });
});