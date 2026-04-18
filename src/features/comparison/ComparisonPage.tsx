import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AppState } from "@/services/persistence/appState";
import { garmentTaxonomy } from "@/domain/garments/taxonomy";
import { garmentCategories, type GarmentCategory } from "@/domain/shared/enums";
import { recommendSize } from "@/domain/recommendation/engine";

interface ComparisonPageProps {
  state: AppState;
}

export function ComparisonPage({ state }: ComparisonPageProps) {
  const activeProfile = state.bodyProfiles.find((profile) => profile.id === state.settings.activeProfileId) ?? state.bodyProfiles[0];
  const [category, setCategory] = useState<GarmentCategory>("tshirts");
  const comparisons = useMemo(() => {
    if (!activeProfile) return [];
    return state.brandSizeGuides
      .filter((guide) => guide.garmentCategory === category)
      .map((guide) => {
        const result = recommendSize(activeProfile, guide, {
          profileId: activeProfile.id,
          guideId: guide.id,
          garmentCategory: category,
          fitPreference: "regular",
          easePreference: "balanced",
          layeringIntent: garmentTaxonomy[category].defaultLayering,
          shrinkageRisk: 0.2,
          notes: ""
        });
        return { guide, result, brand: state.brands.find((brand) => brand.id === guide.brandId) };
      })
      .sort((a, b) => b.result.confidenceScore - a.result.confidenceScore);
  }, [activeProfile, category, state.brandSizeGuides, state.brands]);

  return (
    <div>
      <PageHeader
        title="Comparaison"
        description="Comparez les résultats entre marques/guides pour une même catégorie avec paramètres constants."
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Comparateur par catégorie
          </CardTitle>
          <CardDescription>Mode régulier, aisance équilibrée, layering par défaut de la catégorie.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={category} onChange={(event) => setCategory(event.target.value as GarmentCategory)}>
            {garmentCategories.map((item) => (
              <option key={item} value={item}>
                {garmentTaxonomy[item].label}
              </option>
            ))}
          </Select>
          {activeProfile ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Marque</TableHead>
                  <TableHead>Guide</TableHead>
                  <TableHead>Taille</TableHead>
                  <TableHead>Alternatives</TableHead>
                  <TableHead>Confiance</TableHead>
                  <TableHead>Alertes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisons.map(({ guide, result, brand }) => (
                  <TableRow key={guide.id}>
                    <TableCell>{brand?.name ?? "Marque"}</TableCell>
                    <TableCell>{guide.name}</TableCell>
                    <TableCell className="font-semibold">{result.recommendedSize}</TableCell>
                    <TableCell>{result.alternativeSizes.join(", ") || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={result.confidenceScore >= 70 ? "success" : "warning"}>
                        {result.confidenceScore}/100
                      </Badge>
                    </TableCell>
                    <TableCell>{result.warnings.length}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="rounded-lg border border-dashed p-8 text-sm text-muted-foreground">
              Importez ou créez un profil pour comparer les guides.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
