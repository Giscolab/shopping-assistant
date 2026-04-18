import { describe, expect, it } from "vitest";
import { importBrandGuideFromCsv } from "@/services/import/brandGuideImporter";

describe("importBrandGuideFromCsv", () => {
  it("normalise un guide CSV minimal", () => {
    const csv = [
      "brand,guide_name,garment_category,size_system,fabric_stretch,size_label,chest_cm_min,chest_cm_max,waist_cm_min,waist_cm_max",
      "Local Brand,Tshirt Guide,tshirts,INT,medium,S,88,96,78,88",
      "Local Brand,Tshirt Guide,tshirts,INT,medium,M,96,104,86,96"
    ].join("\n");
    const result = importBrandGuideFromCsv(csv, "guide.csv");
    expect(result.brand.name).toBe("Local Brand");
    expect(result.guide.rows).toHaveLength(2);
    expect(result.guide.rows[0].dimensions.chestCm?.min).toBe(88);
    expect(result.guide.isComplete).toBe(true);
  });
});
