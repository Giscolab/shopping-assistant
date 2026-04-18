import { createId, nowIso } from "@/domain/shared/ids";
import type { Brand, BrandSizeGuide, MeasurementRange, SizeGuideRow } from "@/domain/sizing/schema";
import type { GarmentCategory, RecommendationDimension, SizeSystemCode, StretchLevel } from "@/domain/shared/enums";

const timestamp = nowIso();

export const sampleBrand: Brand = {
  id: "brand_sample_atlas",
  name: "Atlas Local Demo",
  country: "FR",
  website: null,
  isSample: true,
  notes:
    "Données illustratives pour tester le moteur. Elles ne représentent aucun standard officiel ni aucune marque réelle.",
  createdAt: timestamp,
  updatedAt: timestamp
};

function range(min: number, max: number, unit: "cm" | "mm" = "cm"): MeasurementRange {
  return { min, max, target: null, unit, sourceNote: "Plage illustrative non officielle" };
}

function row(
  guideId: string,
  label: string,
  sortOrder: number,
  dimensions: Partial<Record<RecommendationDimension, MeasurementRange>>,
  notes = ""
): SizeGuideRow {
  return {
    id: `${guideId}_${label.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
    guideId,
    label,
    sortOrder,
    dimensions,
    notes
  };
}

function guide(
  id: string,
  name: string,
  garmentCategory: GarmentCategory,
  sizeSystem: SizeSystemCode,
  fabricStretch: StretchLevel,
  rows: SizeGuideRow[],
  fitNotes: string
): BrandSizeGuide {
  return {
    id,
    brandId: sampleBrand.id,
    name,
    garmentCategory,
    sizeSystem,
    fabricStretch,
    fitNotes,
    fabricNotes: "Profil textile illustratif; ajustez avec vos données réelles de marque.",
    sourceType: "seed",
    sourceName: "Seed local illustratif",
    sourceUrl: null,
    isSample: true,
    isComplete: rows.every((candidate) => Object.keys(candidate.dimensions).length >= 2),
    uncertainty: 0.38,
    rows,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

function alphaTopGuide(category: GarmentCategory, id: string, label: string, stretch: StretchLevel) {
  return guide(
    id,
    label,
    category,
    "INT",
    stretch,
    [
      row(id, "XS", 0, { chestCm: range(84, 91), stomachCm: range(78, 86), bicepsCm: range(28, 32) }),
      row(id, "S", 1, { chestCm: range(90, 97), stomachCm: range(84, 92), bicepsCm: range(30, 34) }),
      row(id, "M", 2, { chestCm: range(96, 104), stomachCm: range(90, 99), bicepsCm: range(32, 36) }),
      row(id, "L", 3, { chestCm: range(103, 112), stomachCm: range(98, 108), bicepsCm: range(35, 39) }),
      row(id, "XL", 4, { chestCm: range(111, 121), stomachCm: range(107, 118), bicepsCm: range(38, 43) })
    ],
    "Coupe régulière illustrative."
  );
}

function bottomGuide(category: GarmentCategory, id: string, label: string, stretch: StretchLevel) {
  return guide(
    id,
    label,
    category,
    "INT",
    stretch,
    [
      row(id, "XS", 0, { waistCm: range(70, 76), seatHipsCm: range(86, 93), thighCm: range(47, 52) }),
      row(id, "S", 1, { waistCm: range(75, 82), seatHipsCm: range(92, 99), thighCm: range(50, 55) }),
      row(id, "M", 2, { waistCm: range(81, 89), seatHipsCm: range(98, 106), thighCm: range(54, 59) }),
      row(id, "L", 3, { waistCm: range(88, 97), seatHipsCm: range(105, 114), thighCm: range(58, 64) }),
      row(id, "XL", 4, { waistCm: range(96, 106), seatHipsCm: range(113, 123), thighCm: range(63, 70) })
    ],
    "Plages corporelles illustratives pour bas."
  );
}

export function createSampleGuides(): BrandSizeGuide[] {
  const guides = [
    alphaTopGuide("tshirts", "guide_sample_tshirts", "T-shirts alpha illustratif", "medium"),
    alphaTopGuide("shirts", "guide_sample_shirts", "Chemises alpha illustratif", "low"),
    alphaTopGuide("sweaters", "guide_sample_sweaters", "Pulls alpha illustratif", "medium"),
    alphaTopGuide("hoodies", "guide_sample_hoodies", "Hoodies alpha illustratif", "medium"),
    alphaTopGuide("jackets", "guide_sample_jackets", "Vestes alpha illustratif", "low"),
    alphaTopGuide("coats", "guide_sample_coats", "Manteaux alpha illustratif", "none"),
    bottomGuide("jeans", "guide_sample_jeans", "Jeans alpha illustratif", "low"),
    bottomGuide("trousers", "guide_sample_trousers", "Pantalons alpha illustratif", "low"),
    bottomGuide("shorts", "guide_sample_shorts", "Shorts alpha illustratif", "medium"),
    bottomGuide("boxers_or_underwear", "guide_sample_underwear", "Sous-vêtements alpha illustratif", "high"),
    guide(
      "guide_sample_socks",
      "Chaussettes longueur de pied illustrative",
      "socks",
      "SOCK",
      "high",
      [
        row("guide_sample_socks", "35-38", 0, { footLengthMm: range(220, 245, "mm"), calfCm: range(28, 38) }),
        row("guide_sample_socks", "39-42", 1, { footLengthMm: range(246, 270, "mm"), calfCm: range(30, 41) }),
        row("guide_sample_socks", "43-46", 2, { footLengthMm: range(271, 295, "mm"), calfCm: range(32, 44) })
      ],
      "Guide illustratif par longueur de pied."
    )
  ];

  return guides.map((item) => ({
    ...item,
    rows: item.rows.map((candidate) => ({ ...candidate, id: candidate.id || createId("row") }))
  }));
}
