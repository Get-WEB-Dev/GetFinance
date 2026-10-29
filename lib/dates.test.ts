import { describe, expect, it } from "vitest";
import { calculateAge, parseIsoDate } from "./dates";

const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));

describe("parseIsoDate", () => {
  it("accepts real dates, including a leap day", () => {
    expect(parseIsoDate("2024-02-29")).not.toBeNull();
  });

  it("rejects impossible dates and bad formats", () => {
    expect(parseIsoDate("2023-02-29")).toBeNull();
    expect(parseIsoDate("2024-02-30")).toBeNull();
    expect(parseIsoDate("20-01-2024")).toBeNull();
    expect(parseIsoDate("")).toBeNull();
  });
});

describe("calculateAge", () => {
  const birth = utc(2000, 6, 15);

  it("is one year less the day before the birthday", () => {
    expect(calculateAge(birth, utc(2018, 6, 14))).toBe(17);
  });

  it("turns over exactly on the birthday", () => {
    expect(calculateAge(birth, utc(2018, 6, 15))).toBe(18);
  });
});