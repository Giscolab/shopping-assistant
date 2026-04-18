import { describe, expect, it } from "vitest";
import { normalizeLengthToCm, normalizeLengthToMm, parseLocaleNumber } from "@/domain/units/measurements";

describe("unit normalization", () => {
  it("convertit les longueurs et nombres locaux", () => {
    expect(normalizeLengthToCm(875, "mm")).toBe(87.5);
    expect(normalizeLengthToMm(25.4, "cm")).toBe(254);
    expect(parseLocaleNumber("77,1 cm")).toBe(77.1);
  });
});
