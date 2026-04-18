export const garmentCategories = [
  "tshirt",
  "polo",
  "chemise",
  "pull",
  "hoodie",
  "veste_legere",
  "manteau",
  "jean",
  "pantalon",
  "chino",
  "cargo",
  "short",
  "boxer",
  "slip",
  "chaussette",
  "parka",
  "doudoune",
  "boxers_or_underwear",
  "socks",
  "tshirts",
  "shirts",
  "sweaters",
  "hoodies",
  "jackets",
  "coats",
  "jeans",
  "trousers",
  "shorts"
] as const;

export type GarmentCategory = (typeof garmentCategories)[number];

export const fitPreferences = ["close", "regular", "relaxed", "oversized"] as const;
export type FitPreference = (typeof fitPreferences)[number];

export const easePreferences = ["minimal", "balanced", "generous"] as const;
export type EasePreference = (typeof easePreferences)[number];

export const layeringIntents = ["base_layer", "single_layer", "over_layer", "winter_layering"] as const;
export type LayeringIntent = (typeof layeringIntents)[number];

export const stretchLevels = ["none", "low", "medium", "high"] as const;
export type StretchLevel = (typeof stretchLevels)[number];

export const sizeSystems = ["FR", "EU", "US", "UK", "IT", "INT", "WAIST_INSEAM", "FOOTWEAR", "SOCK"] as const;
export type SizeSystemCode = (typeof sizeSystems)[number];

export const measurementKeys = [
  "heightCm",
  "weightKg",
  "bodyFatPercent",
  "chestCm",
  "waistCm",
  "stomachCm",
  "seatHipsCm",
  "leftBicepsCm",
  "rightBicepsCm",
  "leftForearmCm",
  "rightForearmCm",
  "leftThighCm",
  "rightThighCm",
  "leftCalfCm",
  "rightCalfCm",
  "footLengthMm"
] as const;

export type BodyMeasurementKey = (typeof measurementKeys)[number];

export const recommendationDimensions = [
  "chestCm",
  "waistCm",
  "stomachCm",
  "seatHipsCm",
  "bicepsCm",
  "forearmCm",
  "thighCm",
  "calfCm",
  "footLengthMm",
  "heightCm"
] as const;

export type RecommendationDimension = (typeof recommendationDimensions)[number];

export const profileModes = ["menswear", "womenswear", "unisex", "custom"] as const;
export type ProfileMode = (typeof profileModes)[number];
