import { useMemo, useState } from "react";
import { FileSpreadsheet, Plus, ShieldAlert, Shirt } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AppState } from "@/services/persistence/appState";
import { garmentTaxonomy } from "@/domain/garments/taxonomy";
import { garmentCategories, sizeSystems, stretchLevels, type GarmentCategory } from "@/domain/shared/enums";
import { createId, nowIso } from "@/domain/shared/ids";
import { brandSchema, brandSizeGuideSchema, type BrandSizeGuide } from "@/domain/sizing/schema";
import { importBrandGuideFromCsv, importBrandGuideFromJson } from "@/services/import/brandGuideImporter";
import { useStudioStore } from "@/hooks/useStudioStore";

interface BrandGuidesPageProps {
  state: AppState;
}

export function BrandGuidesPage({ state }: BrandGuidesPageProps) {
  const { upsertBrandGuide, addImportJob } = useStudioStore();
  const [selectedGuideId, setSelectedGuideId] = useState(state.brandSizeGuides[0]?.id ?? "");
  const selectedGuide = useMemo(
    () => state.brandSizeGuides.find((guide) => guide.id === selectedGuideId) ?? state.brandSizeGuides[0],
    [selectedGuideId, state.brandSizeGuides]
  );
  const selectedBrand = selectedGuide ? state.brands.find((brand) => brand.id === selectedGuide.brandId) : null;
  const [manual, setManual] = useState({
    brand: "",
    guideName: "",
    garmentCategory: "tshirts" as GarmentCategory,
    sizeSystem: "INT",
    fabricStretch: "low",
    rows: "S,88,96,80,90\nM,96,104,88,98\nL,104,112,96,108"
  });
  const [message, setMessage] = useState<string | null>(null);

  async function importFile(file: File | null) {
    if (!file) return;
    try {
      const content = await file.text();
      const result = file.name.toLowerCase().endsWith(".json")
        ? importBrandGuideFromJson(content, file.name)
        : importBrandGuideFromCsv(content, file.name);
      await upsertBrandGuide(result.brand, result.guide);
      await addImportJob({
        id: createId("import"),
        type: file.name.toLowerCase().endsWith(".json") ? "brand_guide_json" : "brand_guide_csv",
        sourceName: file.name,
        status: "completed",
        warnings: result.warnings,
        errors: [],
        createdAt: nowIso()
      });
      setSelectedGuideId(result.guide.id);
      setMessage(`Guide importé: ${result.guide.name}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Import impossible.";
      await addImportJob({
        id: createId("import"),
        type: file.name.toLowerCase().endsWith(".json") ? "brand_guide_json" : "brand_guide_csv",
        sourceName: file.name,
        status: "failed",
        warnings: [],
        errors: [errorMessage],
        createdAt: nowIso()
      });
      setMessage(errorMessage);
    }
  }

  async function createManualGuide() {
    const now = nowIso();
    const brand = brandSchema.parse({
      id: createId("brand"),
      name: manual.brand || "Marque locale",
      country: null,
      website: null,
      isSample: false,
      notes: "Saisie manuelle locale.",
      createdAt: now,
      updatedAt: now
    });
    const guideId = createId("guide");
    const rows = manual.rows
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const [label, chestMin, chestMax, waistMin, waistMax] = line.split(",").map((part) => part.trim());
        return {
          id: createId("row"),
          guideId,
          label: label || `Taille ${index + 1}`,
          sortOrder: index,
          dimensions: {
            chestCm: { min: Number(chestMin), max: Number(chestMax), target: null, unit: "cm" as const },
            waistCm: { min: Number(waistMin), max: Number(waistMax), target: null, unit: "cm" as const }
          },
          notes: ""
        };
      });
    const guide: BrandSizeGuide = brandSizeGuideSchema.parse({
      id: guideId,
      brandId: brand.id,
      name: manual.guideName || `${brand.name} - ${garmentTaxonomy[manual.garmentCategory].label}`,
      garmentCategory: manual.garmentCategory,
      sizeSystem: manual.sizeSystem,
      fabricStretch: manual.fabricStretch,
      fitNotes: "Guide saisi manuellement; vérifier contre la source d’origine.",
      fabricNotes: "",
      sourceType: "manual",
      sourceName: "Saisie locale",
      sourceUrl: null,
      isSample: false,
      isComplete: rows.length > 0,
      uncertainty: 0.18,
      rows,
      createdAt: now,
      updatedAt: now
    });
    await upsertBrandGuide(brand, guide);
    setSelectedGuideId(guide.id);
    setMessage("Guide manuel créé.");
  }

  return (
    <div>
      <PageHeader
        title="Guides marques"
        description="Créez ou importez des guides normalisés. Les données illustratives sont clairement séparées des sources réelles."
      />
      <div className="grid grid-cols-[0.9fr_1.1fr] gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Import CSV / JSON
              </CardTitle>
              <CardDescription>Colonnes CSV supportées: brand, guide_name, garment_category, size_label, chest_cm_min, chest_cm_max, waist_cm_min...</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input type="file" accept=".csv,.json,text/csv,application/json" onChange={(event) => void importFile(event.target.files?.[0] ?? null)} />
              {message ? <p className="rounded-md border bg-muted/35 p-3 text-sm">{message}</p> : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Saisie rapide
              </CardTitle>
              <CardDescription>Pour démarrer avec un guide local sans importer de fichier.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Marque</Label>
                  <Input value={manual.brand} onChange={(event) => setManual({ ...manual, brand: event.target.value })} />
                </div>
                <div>
                  <Label>Nom du guide</Label>
                  <Input value={manual.guideName} onChange={(event) => setManual({ ...manual, guideName: event.target.value })} />
                </div>
                <div>
                  <Label>Catégorie</Label>
                  <Select value={manual.garmentCategory} onChange={(event) => setManual({ ...manual, garmentCategory: event.target.value as GarmentCategory })}>
                    {garmentCategories.map((category) => (
                      <option key={category} value={category}>
                        {garmentTaxonomy[category].label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Système</Label>
                  <Select value={manual.sizeSystem} onChange={(event) => setManual({ ...manual, sizeSystem: event.target.value })}>
                    {sizeSystems.map((system) => (
                      <option key={system} value={system}>
                        {system}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Stretch tissu</Label>
                  <Select value={manual.fabricStretch} onChange={(event) => setManual({ ...manual, fabricStretch: event.target.value })}>
                    {stretchLevels.map((stretch) => (
                      <option key={stretch} value={stretch}>
                        {stretch}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div>
                <Label>Lignes: label,chest_min,chest_max,waist_min,waist_max</Label>
                <Textarea value={manual.rows} onChange={(event) => setManual({ ...manual, rows: event.target.value })} />
              </div>
              <Button onClick={() => void createManualGuide()}>Créer le guide</Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shirt className="h-4 w-4" />
              Catalogue local
            </CardTitle>
            <CardDescription>Guides disponibles et détails de la source.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedGuide?.id ?? ""} onChange={(event) => setSelectedGuideId(event.target.value)}>
              {state.brandSizeGuides.map((guide) => {
                const brand = state.brands.find((item) => item.id === guide.brandId);
                return (
                  <option key={guide.id} value={guide.id}>
                    {brand?.name ?? "Marque"} — {guide.name}
                  </option>
                );
              })}
            </Select>

            {selectedGuide ? (
              <>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div className="rounded-lg border p-3">
                    <p className="text-muted-foreground">Marque</p>
                    <p className="font-medium">{selectedBrand?.name}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-muted-foreground">Catégorie</p>
                    <p className="font-medium">{garmentTaxonomy[selectedGuide.garmentCategory].label}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-muted-foreground">Système</p>
                    <p className="font-medium">{selectedGuide.sizeSystem}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-muted-foreground">Statut</p>
                    <Badge variant={selectedGuide.isComplete ? "success" : "warning"}>
                      {selectedGuide.isComplete ? "complet" : "incomplet"}
                    </Badge>
                  </div>
                </div>
                {selectedGuide.isSample ? (
                  <div className="flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
                    <ShieldAlert className="mt-0.5 h-4 w-4" />
                    <p>Ce guide est illustratif et ne doit pas être présenté comme standard officiel.</p>
                  </div>
                ) : null}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Taille</TableHead>
                      <TableHead>Dimensions disponibles</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedGuide.rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.label}</TableCell>
                        <TableCell>
                          {Object.entries(row.dimensions)
                            .map(([dimension, range]) => `${dimension}: ${range.min ?? "?"}-${range.max ?? "?"}${range.unit}`)
                            .join(" · ")}
                        </TableCell>
                        <TableCell>{row.notes || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            ) : (
              <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">Aucun guide disponible.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
