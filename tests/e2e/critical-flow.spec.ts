import { test, expect } from "@playwright/test";
import { readdirSync } from "node:fs";
import { join } from "node:path";

function htmlFixture() {
  const file = readdirSync(process.cwd()).find(
    (name) => name.toLowerCase().includes("rapport") && name.toLowerCase().endsWith(".html")
  );
  if (!file) throw new Error("HTML fixture not found");
  return join(process.cwd(), file);
}

test("importe un profil HTML puis lance une recommandation", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByRole("button", { name: "Body Profile", exact: true }).click();
  await page.locator('input[type="file"]').setInputFiles(htmlFixture());
  await expect(page.getByText("Profil importé")).toBeVisible();
  await page.getByRole("button", { name: "Valider et persister" }).click();
  await expect(page.getByRole("heading", { name: "Provenance" })).toBeVisible();

  await page.getByRole("button", { name: "Studio", exact: true }).click();
  await page.getByRole("button", { name: "Calculer et sauvegarder" }).click();
  await expect(page.getByText("Résultat recommandé")).toBeVisible();
  await expect(page.getByText(/\/100 confiance/i)).toBeVisible();

  await page.getByRole("button", { name: "Historique", exact: true }).click();
  await expect(page.getByText("Runs")).toBeVisible();
  await expect(page.getByRole("cell", { name: "T-shirts" })).toBeVisible();
});
