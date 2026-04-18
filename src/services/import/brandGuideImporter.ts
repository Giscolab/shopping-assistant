import type { Brand, BrandSizeGuide, MeasurementRange } from "@/domain/sizing/schema";
import { brandSizeGuideSchema } from "@/domain/sizing/schema";
import type { GarmentCategory, RecommendationDimension, SizeSystemCode, StretchLevel } from "@/domain/shared/enums";
import { garmentCategories, recommendationDimensions, sizeSystems, stretchLevels } from "@/domain/shared/enums";
import { createId, nowIso } from "@/domain/shared/ids";
import { parseLocaleNumber } from "@/domain/units/measurements";

export interface BrandGuideImportResult {
  brand: Brand;
  guide: BrandSizeGuide;
  warnings: string[];
}

function parseCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index + 1] === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(csv: string) {
  const rows = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseCsvLine);
  const headers = rows.shift()?.map((header) => header.trim().toLowerCase()) ?? [];
  return rows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
}

function normalizeEnum<T extends readonly string[]>(value: string | undefined, allowed: T, fallback: T[number]): T[number] {
  const candidate = value?.trim();
  return allowed.includes(candidate as T[number]) ? (candidate as T[number]) : fallback;
}

function rangeFromRow(row: Record<string, string>, dimension: RecommendationDimension): MeasurementRange | undefined {
  const prefix = dimension.replace(/Cm$/, "_cm").replace(/Mm$/, "_mm").replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  const candidates = [prefix, dimension.toLowerCase()];
  for (const key of candidates) {
    const min = parseLocaleNumber(row[`${key}_min`] ?? "");
    const max = parseLocaleNumber(row[`${key}_max`] ?? "");
    const target = parseLocaleNumber(row[`${key}_target`] ?? row[key] ?? "");
    if (min !== null || max !== null || target !== null) {
      return {
        min,
        max,
        target,
        unit: dimension === "footLengthMm" ? "mm" : "cm",
        sourceNote: "CSV importé localement"
      };
    }
  }
  return undefined;
}

export function importBrandGuideFromCsv(csv: string, fileName = "guide.csv"): BrandGuideImportResult {
  const now = nowIso();
  const rows = parseCsv(csv);
  const first = rows[0] ?? {};
  const brand: Brand = {
    id: createId("brand"),
    name: first.brand || "Marque importée",
    country: first.country || null,
    website: first.website || null,
    isSample: false,
    notes: "Import CSV local.",
    createdAt: now,
    updatedAt: now
  };
  const guideId = createId("guide");
  const garmentCategory: GarmentCategory = normalizeEnum(first.garment_category, garmentCategories, "tshirts");
  const sizeSystem: SizeSystemCode = normalizeEnum(first.size_system, sizeSystems, "INT");
  const fabricStretch: StretchLevel = normalizeEnum(first.fabric_stretch, stretchLevels, "low");
  const warnings: string[] = [];

  const guide: BrandSizeGuide = {
    id: guideId,
    brandId: brand.id,
    name: first.guide_name || `${brand.name} - ${garmentCategory}`,
    garmentCategory,
    sizeSystem,
    fabricStretch,
    fitNotes: first.fit_notes || "",
    fabricNotes: first.fabric_notes || "",
    sourceType: "csv_import",
    sourceName: fileName,
    sourceUrl: null,
    isSample: false,
    isComplete: false,
    uncertainty: 0.2,
    rows: rows.map((row, index) => {
      const dimensions = Object.fromEntries(
        recommendationDimensions
          .map((dimension) => [dimension, rangeFromRow(row, dimension)] as const)
          .filter(([, value]) => value !== undefined)
      ) as BrandSizeGuide["rows"][number]["dimensions"];
      if (Object.keys(dimensions).length === 0) warnings.push(`Ligne ${index + 2}: aucune mesure exploitable.`);
      return {
        id: createId("row"),
        guideId,
        label: row.size_label || row.label || `Taille ${index + 1}`,
        sortOrder: index,
        dimensions,
        notes: row.notes || ""
      };
    }),
    createdAt: now,
    updatedAt: now
  };
  guide.isComplete = guide.rows.length > 0 && guide.rows.every((row) => Object.keys(row.dimensions).length >= 2);
  return { brand, guide: brandSizeGuideSchema.parse(guide), warnings };
}

export function importBrandGuideFromJson(json: string, fileName = "guide.json"): BrandGuideImportResult {
  const parsed = JSON.parse(json) as Partial<BrandGuideImportResult> & { guide?: BrandSizeGuide; brand?: Brand };
  const now = nowIso();
  const brand: Brand = parsed.brand ?? {
    id: createId("brand"),
    name: parsed.guide?.sourceName ?? "Marque importée",
    country: null,
    website: null,
    isSample: false,
    notes: "Import JSON local.",
    createdAt: now,
    updatedAt: now
  };
  const guide = brandSizeGuideSchema.parse({
    ...parsed.guide,
    id: parsed.guide?.id ?? createId("guide"),
    brandId: brand.id,
    sourceType: "json_import",
    sourceName: fileName,
    createdAt: parsed.guide?.createdAt ?? now,
    updatedAt: now
  });
  return { brand, guide, warnings: [] };
}
