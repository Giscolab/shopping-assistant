import garmentsJson from "@/domain/ontology/garments.json";
import cutsJson from "@/domain/ontology/cuts.json";
import easeJson from "@/domain/ontology/ease.json";
import materialsJson from "@/domain/ontology/materials.json";
import measurementMappingJson from "@/domain/ontology/measurement-mapping.json";
import { garmentTaxonomy } from "@/domain/garments/taxonomy";
import { ontologyBundleSchema } from "@/domain/schemas/ontology";
import type { GarmentCategory } from "@/domain/shared/enums";
import type { MenswearV1CategoryId } from "@/domain/types/garment";
import type { OntologyBundle, OntologyDiagnostic } from "@/domain/types/ontology";

export const menswearV1CategoryIds = [
  "tshirt",
  "polo",
  "chemise",
  "pull",
  "hoodie",
  "veste_legere",
  "manteau",
  "jean",
  "pantalon",
  "short",
  "boxer",
  "slip"
] as const satisfies readonly MenswearV1CategoryId[];

export const ontologyBundle: OntologyBundle = ontologyBundleSchema.parse({
  garments: garmentsJson,
  cuts: cutsJson,
  ease: easeJson,
  materials: materialsJson,
  measurementMapping: measurementMappingJson
});

export function getOntologyCategory(categoryId: GarmentCategory) {
  return ontologyBundle.garments.categories.find((category) => category.id === categoryId);
}

export function getMenswearV1Category(categoryId: MenswearV1CategoryId) {
  return ontologyBundle.garments.categories.find((category) => category.id === categoryId);
}

export function getOntologyEaseProfile(profileId: string) {
  return ontologyBundle.ease.profiles.find((profile) => profile.id === profileId);
}

export function getOntologyMaterialProfile(profileId: string) {
  return ontologyBundle.materials.profiles.find((profile) => profile.id === profileId);
}

export function getOntologyCut(cutId: string) {
  return ontologyBundle.cuts.cuts.find((cut) => cut.id === cutId);
}

export function validateOntologyIntegration(): OntologyDiagnostic[] {
  const diagnostics: OntologyDiagnostic[] = [];
  const easeProfileIds = new Set(ontologyBundle.ease.profiles.map((profile) => profile.id));
  const materialProfileIds = new Set(ontologyBundle.materials.profiles.map((profile) => profile.id));
  const cutIds = new Set(ontologyBundle.cuts.cuts.map((cut) => cut.id));
  const mappingIds = new Set(ontologyBundle.measurementMapping.canonicalDimensions.map((dimension) => dimension.id));

  for (const category of ontologyBundle.garments.categories) {
    if (!garmentTaxonomy[category.canonicalCategory]) {
      diagnostics.push({
        severity: "error",
        code: "missing_taxonomy_category",
        entityId: category.id,
        message: `La catégorie ${category.id} n'est pas branchée dans garmentTaxonomy.`
      });
    }
    if (!easeProfileIds.has(category.easeProfile)) {
      diagnostics.push({
        severity: "error",
        code: "missing_ease_profile",
        entityId: category.id,
        message: `Le profil d'aisance ${category.easeProfile} est introuvable.`
      });
    }
    if (!materialProfileIds.has(category.defaultMaterialProfile)) {
      diagnostics.push({
        severity: "error",
        code: "missing_material_profile",
        entityId: category.id,
        message: `Le profil matière ${category.defaultMaterialProfile} est introuvable.`
      });
    }
    if (!cutIds.has(category.defaultCut)) {
      diagnostics.push({
        severity: "warning",
        code: "missing_default_cut",
        entityId: category.id,
        message: `La coupe par défaut ${category.defaultCut} n'est pas dans cuts.json.`
      });
    }
    for (const dimension of [...category.requiredBodyMeasurements, ...category.requiredGuideMeasurements]) {
      if (!mappingIds.has(dimension)) {
        diagnostics.push({
          severity: "warning",
          code: "missing_measurement_mapping",
          entityId: category.id,
          message: `La dimension ${dimension} n'a pas de mapping de labels.`
        });
      }
    }
  }

  for (const categoryId of menswearV1CategoryIds) {
    if (!ontologyBundle.garments.garmentMeasurementsCatalog.some((entry) => entry.category_id === categoryId)) {
      diagnostics.push({
        severity: "error",
        code: "missing_garment_measurement_catalog",
        entityId: categoryId,
        message: `La catégorie ${categoryId} n'a pas de catalogue de mesures vêtement.`
      });
    }
    if (!ontologyBundle.garments.categoryMeasurementPriorityDetails.some((entry) => entry.category_id === categoryId)) {
      diagnostics.push({
        severity: "warning",
        code: "missing_priority_details",
        entityId: categoryId,
        message: `La catégorie ${categoryId} n'a pas de priorité de mesures détaillée.`
      });
    }
    if (!ontologyBundle.garments.transformationRules.some((entry) => entry.category_id === categoryId)) {
      diagnostics.push({
        severity: "warning",
        code: "missing_transformation_rules",
        entityId: categoryId,
        message: `La catégorie ${categoryId} n'a pas de règles symboliques corps -> vêtement.`
      });
    }
  }

  if (diagnostics.length === 0) {
    diagnostics.push({
      severity: "info",
      code: "ontology_valid",
      message: "Ontologie menswear v1 validée et branchée sur la taxonomie moteur."
    });
  }
  return diagnostics;
}

export function exportOntologyBundleJson() {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      format: "size-intelligence-studio.ontology-bundle.v1",
      bundle: ontologyBundle,
      diagnostics: validateOntologyIntegration()
    },
    null,
    2
  );
}
