import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseBodyProfileHtml } from "@/services/import/htmlBodyProfileImporter";

function bodyProfileHtmlPath() {
  const file = readdirSync(process.cwd()).find(
    (name) => name.toLowerCase().includes("rapport") && name.toLowerCase().endsWith(".html")
  );
  if (!file) throw new Error("HTML fixture not found");
  return join(process.cwd(), file);
}

describe("parseBodyProfileHtml", () => {
  it("normalise le HTML de mesures vers le profil canonique", () => {
    const html = readFileSync(bodyProfileHtmlPath(), "utf8");
    const preview = parseBodyProfileHtml(html, {
      fileName: "rapport.html",
      byteSize: html.length,
      importedAt: "2026-04-18T12:00:00.000Z"
    });

    expect(preview.profile.weightKg).toBe(60);
    expect(preview.profile.chestCm).toBe(87);
    expect(preview.profile.waistCm).toBe(77.1);
    expect(preview.profile.seatHipsCm).toBe(90.2);
    expect(preview.profile.leftThighCm).toBe(47.8);
    expect(preview.warnings).toContain("La taille corporelle n’est pas présente dans le HTML; elle reste à compléter manuellement.");
    expect(preview.mappedLabels.length).toBeGreaterThanOrEqual(12);
  });
});
