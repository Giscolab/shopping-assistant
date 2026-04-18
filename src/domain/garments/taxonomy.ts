import type {
  EasePreference,
  FitPreference,
  GarmentCategory,
  LayeringIntent,
  RecommendationDimension,
  StretchLevel
} from "@/domain/shared/enums";

export interface DimensionRule {
  dimension: RecommendationDimension;
  weight: number;
  baseEaseCm: number;
  closeFitDeltaCm: number;
  relaxedFitDeltaCm: number;
}

export interface GarmentCategoryDefinition {
  id: GarmentCategory;
  label: string;
  family: "tops" | "bottoms" | "outerwear" | "underwear" | "feet";
  description: string;
  dimensionRules: DimensionRule[];
  defaultStretchSensitivity: StretchLevel;
  defaultLayering: LayeringIntent;
  notes: string[];
}

export const garmentTaxonomy: Record<GarmentCategory, GarmentCategoryDefinition> = {
  boxers_or_underwear: {
    id: "boxers_or_underwear",
    label: "Boxers et sous-vêtements",
    family: "underwear",
    description: "Coupe proche du corps, priorité taille, bassin et cuisse.",
    defaultStretchSensitivity: "high",
    defaultLayering: "base_layer",
    dimensionRules: [
      { dimension: "waistCm", weight: 0.38, baseEaseCm: 0, closeFitDeltaCm: -1.5, relaxedFitDeltaCm: 1 },
      { dimension: "seatHipsCm", weight: 0.34, baseEaseCm: 0, closeFitDeltaCm: -1, relaxedFitDeltaCm: 1.2 },
      { dimension: "thighCm", weight: 0.28, baseEaseCm: 0, closeFitDeltaCm: -0.5, relaxedFitDeltaCm: 1 }
    ],
    notes: ["Le stretch textile peut rendre deux tailles acceptables."]
  },
  socks: {
    id: "socks",
    label: "Chaussettes",
    family: "feet",
    description: "Priorité longueur de pied quand disponible, puis mollet pour les modèles hauts.",
    defaultStretchSensitivity: "high",
    defaultLayering: "base_layer",
    dimensionRules: [
      { dimension: "footLengthMm", weight: 0.7, baseEaseCm: 0, closeFitDeltaCm: -0.2, relaxedFitDeltaCm: 0.2 },
      { dimension: "calfCm", weight: 0.3, baseEaseCm: 0, closeFitDeltaCm: -0.5, relaxedFitDeltaCm: 0.8 }
    ],
    notes: ["Sans longueur de pied, la recommandation est moins fiable."]
  },
  tshirts: {
    id: "tshirts",
    label: "T-shirts",
    family: "tops",
    description: "Volume de poitrine et ventre avec aisance modérée.",
    defaultStretchSensitivity: "medium",
    defaultLayering: "single_layer",
    dimensionRules: [
      { dimension: "chestCm", weight: 0.5, baseEaseCm: 6, closeFitDeltaCm: -3, relaxedFitDeltaCm: 4 },
      { dimension: "stomachCm", weight: 0.3, baseEaseCm: 5, closeFitDeltaCm: -2, relaxedFitDeltaCm: 3 },
      { dimension: "heightCm", weight: 0.2, baseEaseCm: 0, closeFitDeltaCm: 0, relaxedFitDeltaCm: 0 }
    ],
    notes: ["La longueur dépend fortement de la marque; elle est traitée comme signal secondaire."]
  },
  shirts: {
    id: "shirts",
    label: "Chemises",
    family: "tops",
    description: "Poitrine et ventre avec moins de tolérance qu’un t-shirt.",
    defaultStretchSensitivity: "low",
    defaultLayering: "single_layer",
    dimensionRules: [
      { dimension: "chestCm", weight: 0.48, baseEaseCm: 8, closeFitDeltaCm: -3, relaxedFitDeltaCm: 4 },
      { dimension: "stomachCm", weight: 0.32, baseEaseCm: 7, closeFitDeltaCm: -2, relaxedFitDeltaCm: 4 },
      { dimension: "bicepsCm", weight: 0.2, baseEaseCm: 4, closeFitDeltaCm: -1, relaxedFitDeltaCm: 2 }
    ],
    notes: ["Si le guide ne donne pas les bras, une alerte de complétude est affichée."]
  },
  sweaters: {
    id: "sweaters",
    label: "Pulls",
    family: "tops",
    description: "Couche chaude avec aisance poitrine et ventre.",
    defaultStretchSensitivity: "medium",
    defaultLayering: "over_layer",
    dimensionRules: [
      { dimension: "chestCm", weight: 0.48, baseEaseCm: 9, closeFitDeltaCm: -3, relaxedFitDeltaCm: 5 },
      { dimension: "stomachCm", weight: 0.32, baseEaseCm: 8, closeFitDeltaCm: -2, relaxedFitDeltaCm: 4 },
      { dimension: "bicepsCm", weight: 0.2, baseEaseCm: 5, closeFitDeltaCm: -1, relaxedFitDeltaCm: 2 }
    ],
    notes: ["La maille peut détendre le besoin d’aisance, mais le rétrécissement compte."]
  },
  hoodies: {
    id: "hoodies",
    label: "Hoodies",
    family: "tops",
    description: "Coupe casual, souvent portée en surcouche légère.",
    defaultStretchSensitivity: "medium",
    defaultLayering: "over_layer",
    dimensionRules: [
      { dimension: "chestCm", weight: 0.46, baseEaseCm: 10, closeFitDeltaCm: -3, relaxedFitDeltaCm: 6 },
      { dimension: "stomachCm", weight: 0.34, baseEaseCm: 9, closeFitDeltaCm: -2, relaxedFitDeltaCm: 5 },
      { dimension: "bicepsCm", weight: 0.2, baseEaseCm: 5, closeFitDeltaCm: -1, relaxedFitDeltaCm: 3 }
    ],
    notes: ["La préférence oversize impacte fortement cette catégorie."]
  },
  jackets: {
    id: "jackets",
    label: "Vestes",
    family: "outerwear",
    description: "Surcouche structurée, sensible à l’aisance poitrine.",
    defaultStretchSensitivity: "low",
    defaultLayering: "over_layer",
    dimensionRules: [
      { dimension: "chestCm", weight: 0.55, baseEaseCm: 12, closeFitDeltaCm: -4, relaxedFitDeltaCm: 5 },
      { dimension: "stomachCm", weight: 0.25, baseEaseCm: 10, closeFitDeltaCm: -3, relaxedFitDeltaCm: 4 },
      { dimension: "bicepsCm", weight: 0.2, baseEaseCm: 6, closeFitDeltaCm: -1, relaxedFitDeltaCm: 3 }
    ],
    notes: ["Le layering augmente la cible plus vite que pour les hauts légers."]
  },
  coats: {
    id: "coats",
    label: "Manteaux",
    family: "outerwear",
    description: "Surcouche hiver avec marge pour pull ou veste fine.",
    defaultStretchSensitivity: "none",
    defaultLayering: "winter_layering",
    dimensionRules: [
      { dimension: "chestCm", weight: 0.55, baseEaseCm: 16, closeFitDeltaCm: -5, relaxedFitDeltaCm: 6 },
      { dimension: "stomachCm", weight: 0.25, baseEaseCm: 14, closeFitDeltaCm: -4, relaxedFitDeltaCm: 5 },
      { dimension: "bicepsCm", weight: 0.2, baseEaseCm: 8, closeFitDeltaCm: -2, relaxedFitDeltaCm: 3 }
    ],
    notes: ["Sans guide de coupe, le moteur préfère éviter une taille trop juste."]
  },
  jeans: {
    id: "jeans",
    label: "Jeans",
    family: "bottoms",
    description: "Taille, bassin et cuisses avec stretch variable.",
    defaultStretchSensitivity: "low",
    defaultLayering: "single_layer",
    dimensionRules: [
      { dimension: "waistCm", weight: 0.42, baseEaseCm: 1, closeFitDeltaCm: -1.5, relaxedFitDeltaCm: 2 },
      { dimension: "seatHipsCm", weight: 0.36, baseEaseCm: 2, closeFitDeltaCm: -1, relaxedFitDeltaCm: 3 },
      { dimension: "thighCm", weight: 0.22, baseEaseCm: 2, closeFitDeltaCm: -1, relaxedFitDeltaCm: 2 }
    ],
    notes: ["Un denim stretch peut accepter une taille inférieure, mais le confort assis doit rester prioritaire."]
  },
  trousers: {
    id: "trousers",
    label: "Pantalons",
    family: "bottoms",
    description: "Pantalon non denim, moins tolérant à la compression.",
    defaultStretchSensitivity: "low",
    defaultLayering: "single_layer",
    dimensionRules: [
      { dimension: "waistCm", weight: 0.42, baseEaseCm: 2, closeFitDeltaCm: -1, relaxedFitDeltaCm: 2.5 },
      { dimension: "seatHipsCm", weight: 0.36, baseEaseCm: 3, closeFitDeltaCm: -1, relaxedFitDeltaCm: 3 },
      { dimension: "thighCm", weight: 0.22, baseEaseCm: 3, closeFitDeltaCm: -1, relaxedFitDeltaCm: 2.5 }
    ],
    notes: ["La coupe slim ou carotte doit être représentée dans les notes du guide."]
  },
  shorts: {
    id: "shorts",
    label: "Shorts",
    family: "bottoms",
    description: "Taille, bassin et cuisse; longueur peu déterminante dans ce modèle.",
    defaultStretchSensitivity: "medium",
    defaultLayering: "single_layer",
    dimensionRules: [
      { dimension: "waistCm", weight: 0.43, baseEaseCm: 2, closeFitDeltaCm: -1, relaxedFitDeltaCm: 2 },
      { dimension: "seatHipsCm", weight: 0.34, baseEaseCm: 3, closeFitDeltaCm: -1, relaxedFitDeltaCm: 3 },
      { dimension: "thighCm", weight: 0.23, baseEaseCm: 3, closeFitDeltaCm: -1, relaxedFitDeltaCm: 2.5 }
    ],
    notes: ["Les shorts sportifs peuvent tolérer plus de stretch que les modèles habillés."]
  }
};

export function fitDelta(rule: DimensionRule, fit: FitPreference) {
  if (fit === "close") return rule.closeFitDeltaCm;
  if (fit === "relaxed") return rule.relaxedFitDeltaCm;
  if (fit === "oversized") return rule.relaxedFitDeltaCm * 1.8;
  return 0;
}

export function easeDelta(preference: EasePreference) {
  if (preference === "minimal") return -1.2;
  if (preference === "generous") return 1.8;
  return 0;
}

export function layeringDelta(intent: LayeringIntent, family: GarmentCategoryDefinition["family"]) {
  if (intent === "base_layer") return family === "underwear" || family === "feet" ? 0 : -0.5;
  if (intent === "over_layer") return family === "outerwear" ? 2.5 : 1.2;
  if (intent === "winter_layering") return family === "outerwear" ? 5 : 2;
  return 0;
}

export function stretchRelaxation(stretch: StretchLevel, dimension: RecommendationDimension) {
  if (dimension === "heightCm" || dimension === "footLengthMm") return 0;
  if (stretch === "high") return 2.2;
  if (stretch === "medium") return 1.2;
  if (stretch === "low") return 0.4;
  return 0;
}
