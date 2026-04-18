import { z } from "zod";
import { bodyProfileSchema, type BodyProfile, type MeasurementProvenance } from "@/domain/body-profile/schema";
import type { BodyMeasurementKey } from "@/domain/shared/enums";
import { createId } from "@/domain/shared/ids";
import { parseLocaleNumber, roundMeasurement } from "@/domain/units/measurements";

export interface ImportSourceMetadata {
  fileName: string;
  byteSize?: number;
  importedAt: string;
}

export interface BodyProfileImportPreview {
  profile: BodyProfile;
  mappedLabels: Array<{ label: string; key: BodyMeasurementKey; value: number; unit: string }>;
  warnings: string[];
}

const labelMap: Array<{ patterns: RegExp[]; key: BodyMeasurementKey; unit: string }> = [
  { patterns: [/poids/i, /weight/i], key: "weightKg", unit: "kg" },
  { patterns: [/graisse corporelle/i, /body fat/i], key: "bodyFatPercent", unit: "%" },
  { patterns: [/poitrine/i, /chest/i], key: "chestCm", unit: "cm" },
  { patterns: [/ventre/i, /stomach/i], key: "stomachCm", unit: "cm" },
  { patterns: [/^taille$/i, /waist/i], key: "waistCm", unit: "cm" },
  { patterns: [/fessiers/i, /seat/i, /hips/i], key: "seatHipsCm", unit: "cm" },
  { patterns: [/biceps gauche/i, /left biceps/i], key: "leftBicepsCm", unit: "cm" },
  { patterns: [/biceps droit/i, /right biceps/i], key: "rightBicepsCm", unit: "cm" },
  { patterns: [/av-?bras gauche/i, /left forearm/i], key: "leftForearmCm", unit: "cm" },
  { patterns: [/av-?bras droit/i, /right forearm/i], key: "rightForearmCm", unit: "cm" },
  { patterns: [/cuisse gauche/i, /left thigh/i], key: "leftThighCm", unit: "cm" },
  { patterns: [/cuisse droite/i, /right thigh/i], key: "rightThighCm", unit: "cm" },
  { patterns: [/mollet gauche/i, /left calf/i], key: "leftCalfCm", unit: "cm" },
  { patterns: [/mollet droit/i, /right calf/i], key: "rightCalfCm", unit: "cm" }
];

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&eacute;/g, "é")
    .replace(/&egrave;/g, "è")
    .replace(/&agrave;/g, "à")
    .replace(/&ccedil;/g, "ç")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

function mapLabel(label: string) {
  const normalized = decodeHtml(label).trim();
  return labelMap.find((entry) => entry.patterns.some((pattern) => pattern.test(normalized)));
}

function extractMeasureBoxes(html: string) {
  const boxes = [...html.matchAll(/<div\s+class=["']measure-box["'][\s\S]*?<\/div>/gi)].map((match) => match[0]);
  return boxes
    .map((box) => {
      const labelMatch = box.match(/<span\s+class=["']label["'][^>]*>([\s\S]*?)<\/span>/i);
      const valueMatch = box.match(/<span\s+class=["']value["'][^>]*>([\s\S]*?)<\/span>/i);
      const unitMatch = valueMatch?.[1]?.match(/<span\s+class=["']unit["'][^>]*>([\s\S]*?)<\/span>/i);
      const valueText = valueMatch ? stripHtml(valueMatch[1]) : "";
      return {
        label: labelMatch ? stripHtml(labelMatch[1]) : "",
        value: parseLocaleNumber(valueText),
        unit: unitMatch ? stripHtml(unitMatch[1]) : ""
      };
    })
    .filter((item) => item.label && item.value !== null);
}

function extractUpdateDate(html: string) {
  const text = stripHtml(html);
  const match = text.match(/Mise\s+à\s+jour\s*:\s*([^<.]+?)(?:\s{2,}| Profil| Assistant|$)/i);
  return match?.[1]?.trim();
}

export function parseBodyProfileHtml(html: string, source: ImportSourceMetadata): BodyProfileImportPreview {
  const importedAt = source.importedAt;
  const measurements: Partial<Record<BodyMeasurementKey, number | null>> = {};
  const provenance: Partial<Record<BodyMeasurementKey, MeasurementProvenance>> = {};
  const mappedLabels: BodyProfileImportPreview["mappedLabels"] = [];
  const warnings: string[] = [];

  for (const candidate of extractMeasureBoxes(html)) {
    const mapped = mapLabel(candidate.label);
    if (!mapped || candidate.value === null) continue;
    const key = mapped.key;
    const value = roundMeasurement(candidate.value, key === "footLengthMm" ? 0 : 1);
    measurements[key] = value;
    provenance[key] = {
      sourceType: "html_import",
      sourceName: source.fileName,
      importedAt,
      originalLabel: candidate.label,
      originalUnit: candidate.unit || mapped.unit,
      confidence: 0.92
    };
    mappedLabels.push({ label: candidate.label, key, value, unit: candidate.unit || mapped.unit });
  }

  const updateDate = extractUpdateDate(html);
  if (!("heightCm" in measurements)) {
    warnings.push("La taille corporelle n’est pas présente dans le HTML; elle reste à compléter manuellement.");
  }
  if (!("footLengthMm" in measurements)) {
    warnings.push("La longueur de pied n’est pas présente; les chaussettes et chaussures auront une confiance réduite.");
  }
  if (!("chestCm" in measurements) || !("waistCm" in measurements) || !("seatHipsCm" in measurements)) {
    warnings.push("Le profil importé ne couvre pas toutes les mesures pivot nécessaires aux recommandations.");
  }

  const profile: BodyProfile = {
    id: createId("profile"),
    name: updateDate ? `Profil importé - ${updateDate}` : "Profil importé",
    version: 1,
    profileMode: "unisex",
    heightCm: null,
    weightKg: measurements.weightKg ?? null,
    bodyFatPercent: measurements.bodyFatPercent ?? null,
    chestCm: measurements.chestCm ?? null,
    waistCm: measurements.waistCm ?? null,
    stomachCm: measurements.stomachCm ?? null,
    seatHipsCm: measurements.seatHipsCm ?? null,
    leftBicepsCm: measurements.leftBicepsCm ?? null,
    rightBicepsCm: measurements.rightBicepsCm ?? null,
    leftForearmCm: measurements.leftForearmCm ?? null,
    rightForearmCm: measurements.rightForearmCm ?? null,
    leftThighCm: measurements.leftThighCm ?? null,
    rightThighCm: measurements.rightThighCm ?? null,
    leftCalfCm: measurements.leftCalfCm ?? null,
    rightCalfCm: measurements.rightCalfCm ?? null,
    footLengthMm: null,
    shoeSizeRefs: [],
    notes: `Import HTML local depuis ${source.fileName}. Données normalisées; source non utilisée à l’exécution.`,
    provenance,
    createdAt: importedAt,
    updatedAt: importedAt
  };

  return {
    profile: bodyProfileSchema.parse(profile),
    mappedLabels,
    warnings
  };
}

export const bodyProfileImportPreviewSchema = z.object({
  profile: bodyProfileSchema,
  mappedLabels: z.array(z.object({ label: z.string(), key: z.string(), value: z.number(), unit: z.string() })),
  warnings: z.array(z.string())
});
