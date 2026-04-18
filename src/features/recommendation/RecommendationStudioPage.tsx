import { useMemo, useState } from "react";
import { AlertTriangle, BarChart3, CheckCircle2, Play } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AppState } from "@/services/persistence/appState";
import { garmentTaxonomy } from "@/domain/garments/taxonomy";
import {
  easePreferences,
  fitPreferences,
  garmentCategories,
  layeringIntents,
  type EasePreference,
  type FitPreference,
  type GarmentCategory,
  type LayeringIntent
} from "@/domain/shared/enums";
import { runRecommendation } from "@/services/recommendation/recommendationService";
import type { RecommendationRun } from "@/domain/recommendation/schema";
import { useStudioStore } from "@/hooks/useStudioStore";

interface RecommendationStudioPageProps {
  state: AppState;
}

export function RecommendationStudioPage({ state }: RecommendationStudioPageProps) {
  const { addRecommendationRun } = useStudioStore();
  const activeProfile = state.bodyProfiles.find((profile) => profile.id === state.settings.activeProfileId) ?? state.bodyProfiles[0];
  const [profileId, setProfileId] = useState(activeProfile?.id ?? "");
  const [category, setCategory] = useState<GarmentCategory>("tshirts");
  const guidesForCategory = useMemo(
    () => state.brandSizeGuides.filter((guide) => guide.garmentCategory === category),
    [category, state.brandSizeGuides]
  );
  const [guideId, setGuideId] = useState(guidesForCategory[0]?.id ?? state.brandSizeGuides[0]?.id ?? "");
  const [fitPreference, setFitPreference] = useState<FitPreference>("regular");
  const [easePreference, setEasePreference] = useState<EasePreference>("balanced");
  const [layeringIntent, setLayeringIntent] = useState<LayeringIntent>("single_layer");
  const [shrinkageRisk, setShrinkageRisk] = useState(0.2);
  const [currentRun, setCurrentRun] = useState<RecommendationRun | null>(null);

  const selectedProfile = state.bodyProfiles.find((profile) => profile.id === profileId);
  const selectedGuide = state.brandSizeGuides.find((guide) => guide.id === guideId) ?? guidesForCategory[0];

  function syncCategory(next: GarmentCategory) {
    setCategory(next);
    const guide = state.brandSizeGuides.find((candidate) => candidate.garmentCategory === next);
    if (guide) setGuideId(guide.id);
  }

  async function run() {
    if (!selectedProfile || !selectedGuide) return;
    const runResult = runRecommendation(selectedProfile, selectedGuide, {
      profileId: selectedProfile.id,
      guideId: selectedGuide.id,
      garmentCategory: category,
      fitPreference,
      easePreference,
      layeringIntent,
      shrinkageRisk,
      notes: ""
    });
    setCurrentRun(runResult);
    await addRecommendationRun(runResult);
  }

  return (
    <div>
      <PageHeader
        title="Recommendation Studio"
        description="Simulez une taille à partir d’un profil, d’un guide, d’une préférence de coupe et d’un comportement textile."
      />

      <div className="grid grid-cols-[0.85fr_1.15fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Paramètres de simulation</CardTitle>
            <CardDescription>Le moteur est déterministe et explique chaque signal dominant.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Profil</Label>
              <Select value={profileId} onChange={(event) => setProfileId(event.target.value)}>
                <option value="">Sélectionner</option>
                {state.bodyProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Catégorie</Label>
              <Select value={category} onChange={(event) => syncCategory(event.target.value as GarmentCategory)}>
                {garmentCategories.map((item) => (
                  <option key={item} value={item}>
                    {garmentTaxonomy[item].label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Guide</Label>
              <Select value={selectedGuide?.id ?? ""} onChange={(event) => setGuideId(event.target.value)}>
                {guidesForCategory.map((guide) => {
                  const brand = state.brands.find((candidate) => candidate.id === guide.brandId);
                  return (
                    <option key={guide.id} value={guide.id}>
                      {brand?.name} — {guide.name}
                    </option>
                  );
                })}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Coupe</Label>
                <Select value={fitPreference} onChange={(event) => setFitPreference(event.target.value as FitPreference)}>
                  {fitPreferences.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Aisance</Label>
                <Select value={easePreference} onChange={(event) => setEasePreference(event.target.value as EasePreference)}>
                  {easePreferences.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Layering</Label>
                <Select value={layeringIntent} onChange={(event) => setLayeringIntent(event.target.value as LayeringIntent)}>
                  {layeringIntents.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Risque rétrécissement</Label>
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={shrinkageRisk}
                  onChange={(event) => setShrinkageRisk(Number(event.target.value))}
                />
              </div>
            </div>
            <Button className="w-full" disabled={!selectedProfile || !selectedGuide} onClick={() => void run()}>
              <Play className="h-4 w-4" />
              Calculer et sauvegarder
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {currentRun ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle>Résultat recommandé</CardTitle>
                      <CardDescription>{currentRun.result.fitSummary}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-semibold">{currentRun.result.recommendedSize}</div>
                      <Badge variant={currentRun.result.confidenceScore >= 70 ? "success" : "warning"}>
                        {currentRun.result.confidenceScore}/100 confiance
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentRun.result.alternativeSizes.length > 0 ? (
                    <Alert>
                      <BarChart3 className="h-4 w-4" />
                      <AlertTitle>Alternatives proches</AlertTitle>
                      <AlertDescription>{currentRun.result.alternativeSizes.join(", ")}</AlertDescription>
                    </Alert>
                  ) : null}
                  {currentRun.result.warnings.map((warning) => (
                    <Alert key={warning} className="border-amber-500/35 bg-amber-500/10">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Attention</AlertTitle>
                      <AlertDescription>{warning}</AlertDescription>
                    </Alert>
                  ))}
                  {currentRun.result.warnings.length === 0 ? (
                    <Alert className="border-emerald-500/35 bg-emerald-500/10">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>Aucune alerte majeure</AlertTitle>
                      <AlertDescription>Les dimensions prioritaires sont suffisamment couvertes par le guide.</AlertDescription>
                    </Alert>
                  ) : null}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Breakdown dimensionnel</CardTitle>
                  <CardDescription>Chaque dimension expose cible, plage du guide et score local.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dimension</TableHead>
                        <TableHead>Corps</TableHead>
                        <TableHead>Cible</TableHead>
                        <TableHead>Guide</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Explication</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentRun.result.dimensionBreakdown.map((item) => (
                        <TableRow key={item.dimension}>
                          <TableCell className="font-medium">{item.label}</TableCell>
                          <TableCell>{item.bodyValue ?? "—"} {item.unit}</TableCell>
                          <TableCell>{item.targetValue ?? "—"} {item.unit}</TableCell>
                          <TableCell>
                            {item.rowRange ? `${item.rowRange.min ?? "?"}-${item.rowRange.max ?? "?"}` : "absent"}
                          </TableCell>
                          <TableCell>{item.score}/100</TableCell>
                          <TableCell>{item.explanation}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pourquoi cette taille</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="mb-2 font-medium">Signaux retenus</p>
                    <ul className="space-y-2">
                      {currentRun.result.whyThisSize.map((reason) => (
                        <li key={reason} className="rounded-md border p-2">
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-2 font-medium">Pourquoi pas les autres</p>
                    <ul className="space-y-2">
                      {currentRun.result.whyNotOtherSizes.map((reason) => (
                        <li key={reason} className="rounded-md border p-2">
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Aucune simulation courante</CardTitle>
                <CardDescription>Choisissez un profil et un guide puis lancez le calcul.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Le résultat affichera taille primaire, alternatives, score de confiance, alertes et explications détaillées.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
