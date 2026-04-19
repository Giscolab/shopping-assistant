import { describe, expect, it } from "vitest";
import { importBrandGuideFromCsv, importBrandGuideFromJson } from "@/services/import/brandGuideImporter";

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

describe("importBrandGuideFromJson", () => {
  it("complète un guide JSON minimal (doc imports) avec nom, catégorie et système par défaut", () => {
    const json = JSON.stringify({
      brand: {
        id: "brand_1",
        name: "Marque",
        country: null,
        website: null,
        isSample: false,
        notes: "",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z"
      },
      guide: {
        id: "guide_1",
        brandId: "brand_1",
        rows: []
      }
    });
    const result = importBrandGuideFromJson(json, "guide.json");
    expect(result.guide.name).toBe("Marque - tshirts");
    expect(result.guide.garmentCategory).toBe("tshirts");
    expect(result.guide.sizeSystem).toBe("INT");
  });

  it("rejette l’absence d’objet guide", () => {
    expect(() => importBrandGuideFromJson("{}", "empty.json")).toThrow(/guide/);
  });
});
