import { describe, expect, it } from "vitest";
import { menswearV1CategoryIds, ontologyBundle, validateOntologyIntegration } from "@/domain/ontology";
import { guideProvenanceSchema } from "@/domain/schemas/guides";
import { ontologyBundleSchema } from "@/domain/schemas/ontology";
import { targetComputationSchema } from "@/domain/schemas/sizing";
import { createSampleGuides } from "@/domain/sizing/sampleGuides";
import { recommendSize } from "@/domain/recommendation/engine";
import { parseBodyProfileHtml } from "@/services/import/htmlBodyProfileImporter";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

function importFixtureProfile() {
  const file = readdirSync(process.cwd()).find(
    (name) => name.toLowerCase().includes("rapport") && name.toLowerCase().endsWith(".html")
  );
  if (!file) throw new Error("HTML fixture not found");
  const html = readFileSync(join(process.cwd(), file), "utf8");
  return parseBodyProfileHtml(html, {
    fileName: file,
    importedAt: "2026-04-18T12:00:00.000Z"
  }).profile;
}

describe("menswear ontology", () => {
  it("valide l'ontologie et couvre les catégories v1 demandées", () => {
    const ids = ontologyBundle.garments.categories.map((category) => category.id);
    expect(menswearV1CategoryIds.every((id) => ids.includes(id))).toBe(true);
    expect(() => ontologyBundleSchema.parse(ontologyBundle)).not.toThrow();
    expect(validateOntologyIntegration().some((diagnostic) => diagnostic.severity === "error")).toBe(false);
  });

  it("valide les schémas de frontière guides et sizing", () => {
    expect(() =>
      guideProvenanceSchema.parse({
        sourceType: "manual",
        sourceName: "Guide saisi localement",
        sourceUrl: null,
        uncertainty: 0.35,
        assumptions: ["mesures vêtement interprétées comme plages tolérées"]
      })
    ).not.toThrow();
    expect(() =>
      targetComputationSchema.parse({
        bodyValue: 92,
        dimension: "chestCm",
        baseEaseCm: 6,
        fitDeltaCm: 0,
        easeDeltaCm: 1,
        layeringDeltaCm: 0,
        stretchRelaxationCm: 0.5,
        shrinkageBiasCm: 0.25
      })
    ).not.toThrow();
  });

  it("permet une recommandation déterministe pour chaque catégorie menswear v1", () => {
    const profile = importFixtureProfile();
    const guides = createSampleGuides();

    for (const categoryId of menswearV1CategoryIds) {
      const guide = guides.find((candidate) => candidate.garmentCategory === categoryId);
      expect(guide, `guide missing for ${categoryId}`).toBeDefined();
      const result = recommendSize(profile, guide!, {
        profileId: profile.id,
        guideId: guide!.id,
        garmentCategory: categoryId,
        fitPreference: "regular",
        easePreference: "balanced",
        layeringIntent: "single_layer",
        shrinkageRisk: 0.2,
        notes: ""
      });
      expect(result.recommendedSize, categoryId).not.toBe("Indéterminé");
      expect(result.dimensionBreakdown.length, categoryId).toBeGreaterThan(0);
    }
  });
});
