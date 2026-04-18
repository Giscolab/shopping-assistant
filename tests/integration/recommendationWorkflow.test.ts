import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseBodyProfileHtml } from "@/services/import/htmlBodyProfileImporter";
import { createDefaultAppState, validateState } from "@/services/persistence/appState";
import { runRecommendation } from "@/services/recommendation/recommendationService";

describe("workflow import + recommandation", () => {
  it("importe un profil, sélectionne un guide et sauvegarde un run dans l’état validé", () => {
    const file = readdirSync(process.cwd()).find(
      (name) => name.toLowerCase().includes("rapport") && name.toLowerCase().endsWith(".html")
    );
    if (!file) throw new Error("HTML fixture not found");
    const html = readFileSync(join(process.cwd(), file), "utf8");
    const imported = parseBodyProfileHtml(html, { fileName: file, importedAt: "2026-04-18T12:00:00.000Z" });
    const state = createDefaultAppState();
    const guide = state.brandSizeGuides.find((candidate) => candidate.garmentCategory === "tshirts");
    if (!guide) throw new Error("sample guide missing");
    const run = runRecommendation(imported.profile, guide, {
      profileId: imported.profile.id,
      guideId: guide.id,
      garmentCategory: "tshirts",
      fitPreference: "regular",
      easePreference: "balanced",
      layeringIntent: "single_layer",
      shrinkageRisk: 0.2,
      notes: ""
    });
    const next = validateState({
      ...state,
      bodyProfiles: [imported.profile],
      recommendationRuns: [run],
      settings: { ...state.settings, activeProfileId: imported.profile.id }
    });

    expect(next.bodyProfiles).toHaveLength(1);
    expect(next.recommendationRuns[0].result.recommendedSize).toBe(run.result.recommendedSize);
  });
});
