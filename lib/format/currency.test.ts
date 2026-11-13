import { describe, expect, it } from "vitest";
import { formatCurrency } from "./currency";

const plain = (text: string) => text.replace(/\u00a0/g, " ");

describe("formatCurrency", () => {
  it("uses each country's currency", () => {
    expect(plain(formatCurrency(1234567, "US"))).toBe("$1,234,567");
    expect(plain(formatCurrency(1234567, "GB"))).toBe("£1,234,567");
    expect(plain(formatCurrency(1234567, "ET"))).toBe("ETB 1,234,567");
  });
});