import { describe, expect, it } from "vitest";
import { parseBodyProfileHtml } from "@/services/import/htmlBodyProfileImporter";
import { createSampleGuides } from "@/domain/sizing/sampleGuides";
import { recommendSize } from "@/domain/recommendation/engine";
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

describe("recommendSize", () => {
  it("produit une recommandation déterministe avec explications", () => {
    const profile = importFixtureProfile();
    const guide = createSampleGuides().find((candidate) => candidate.garmentCategory === "tshirts");
    expect(guide).toBeDefined();

    const result = recommendSize(profile, guide!, {
      profileId: profile.id,
      guideId: guide!.id,
      garmentCategory: "tshirts",
      fitPreference: "regular",
      easePreference: "balanced",
      layeringIntent: "single_layer",
      shrinkageRisk: 0.2,
      notes: ""
    });

    expect(result.recommendedSize).not.toBe("Indéterminé");
    expect(result.confidenceScore).toBeGreaterThan(40);
    expect(result.dimensionBreakdown.length).toBeGreaterThan(0);
    expect(result.whyThisSize.length).toBeGreaterThan(0);
    expect(result.warnings.join(" ")).toMatch(/illustratif/i);
  });
});
