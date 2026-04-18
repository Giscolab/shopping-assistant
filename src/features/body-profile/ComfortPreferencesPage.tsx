import { ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { AppState } from "@/services/persistence/appState";
import { easePreferences, fitPreferences, layeringIntents } from "@/domain/shared/enums";
import type { ComfortPreference } from "@/domain/body-profile/schema";
import { garmentTaxonomy } from "@/domain/garments/taxonomy";
import { useStudioStore } from "@/hooks/useStudioStore";

interface ComfortPreferencesPageProps {
  state: AppState;
}

export function ComfortPreferencesPage({ state }: ComfortPreferencesPageProps) {
  const { updateComfortPreference } = useStudioStore();
  const activeProfileId = state.settings.activeProfileId ?? state.bodyProfiles[0]?.id;
  const preferences = state.comfortPreferences.filter((preference) => preference.profileId === activeProfileId);

  function patchPreference(preference: ComfortPreference, patch: Partial<ComfortPreference>) {
    void updateComfortPreference({ ...preference, ...patch });
  }

  return (
    <div>
      <PageHeader
        title="Préférences confort"
        description="Ajustez la coupe, l’aisance, le layering et la tolérance textile par catégorie."
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Profil actif
          </CardTitle>
          <CardDescription>Les paramètres peuvent être utilisés comme base dans le studio de recommandation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {preferences.length > 0 ? (
            preferences.map((preference) => (
              <div key={preference.id} className="grid grid-cols-[1fr_repeat(6,150px)_90px] items-end gap-3 rounded-lg border p-3">
                <div>
                  <p className="font-medium">{garmentTaxonomy[preference.garmentCategory].label}</p>
                  <p className="text-xs text-muted-foreground">{garmentTaxonomy[preference.garmentCategory].description}</p>
                </div>
                <div>
                  <Label>Coupe</Label>
                  <Select
                    value={preference.fitPreference}
                    onChange={(event) => patchPreference(preference, { fitPreference: event.target.value as ComfortPreference["fitPreference"] })}
                  >
                    {fitPreferences.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Aisance</Label>
                  <Select
                    value={preference.easePreference}
                    onChange={(event) => patchPreference(preference, { easePreference: event.target.value as ComfortPreference["easePreference"] })}
                  >
                    {easePreferences.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Layering</Label>
                  <Select
                    value={preference.layeringIntent}
                    onChange={(event) => patchPreference(preference, { layeringIntent: event.target.value as ComfortPreference["layeringIntent"] })}
                  >
                    {layeringIntents.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Compression</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={preference.compressionTolerance ?? ""}
                    onChange={(event) => patchPreference(preference, { compressionTolerance: Number(event.target.value) })}
                  />
                </div>
                <div>
                  <Label>Sensibilité tissu</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={preference.fabricSensitivity ?? ""}
                    onChange={(event) => patchPreference(preference, { fabricSensitivity: Number(event.target.value) })}
                  />
                </div>
                <div>
                  <Label>Rétrécissement</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={preference.shrinkageRiskTolerance ?? ""}
                    onChange={(event) => patchPreference(preference, { shrinkageRiskTolerance: Number(event.target.value) })}
                  />
                </div>
                <Button variant="outline" onClick={() => void updateComfortPreference(preference)}>
                  Sauver
                </Button>
              </div>
            ))
          ) : (
            <p className="rounded-lg border border-dashed p-8 text-sm text-muted-foreground">
              Importez ou créez un profil pour générer les préférences par catégorie.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
