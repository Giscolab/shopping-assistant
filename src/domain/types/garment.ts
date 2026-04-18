import type { GarmentCategory, RecommendationDimension, StretchLevel } from "@/domain/shared/enums";

export type OntologyScope = "menswear";

export type OntologyFamilyId =
  | "tops"
  | "bottoms"
  | "outerwear"
  | "underwear"
  | "sportswear"
  | "nightwear"
  | "accessories_ported"
  | "footwear";

export type MenswearV1CategoryId =
  | "tshirt"
  | "polo"
  | "chemise"
  | "pull"
  | "hoodie"
  | "veste_legere"
  | "manteau"
  | "jean"
  | "pantalon"
  | "short"
  | "boxer"
  | "slip";

export type ExtendedGuideOnlyDimension = "shoulderCm" | "neckCm" | "sleeveLengthCm" | "inseamCm" | "backLengthCm";
export type OntologyDimension = RecommendationDimension | ExtendedGuideOnlyDimension;

export interface OntologyPriorityDimension {
  dimension: RecommendationDimension;
  weight: number;
}

export interface OntologyGarmentCategory {
  id: GarmentCategory;
  canonicalCategory: GarmentCategory;
  legacyCategory?: GarmentCategory;
  family: OntologyFamilyId;
  label: string;
  subcategories: string[];
  requiredBodyMeasurements: OntologyDimension[];
  requiredGuideMeasurements: OntologyDimension[];
  priorityDimensions: OntologyPriorityDimension[];
  easeProfile: string;
  defaultCut: string;
  defaultMaterialProfile: string;
  usageConstraints: string[];
  expectedEngineOutput: string[];
}

export interface MaterialProfileRule {
  id: string;
  label: string;
  stretch: StretchLevel;
  stretchRelaxationCm: number;
  shrinkageRisk: number;
  uncertaintyPenalty: number;
}
