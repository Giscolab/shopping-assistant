import { useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FileUp, Save, UserRound } from "lucide-react";
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
import { parseBodyProfileHtml, type BodyProfileImportPreview } from "@/services/import/htmlBodyProfileImporter";
import { createId, nowIso } from "@/domain/shared/ids";
import type { BodyProfile } from "@/domain/body-profile/schema";
import { bodyProfileSchema } from "@/domain/body-profile/schema";
import { profileModes, type BodyMeasurementKey } from "@/domain/shared/enums";
import { useStudioStore } from "@/hooks/useStudioStore";
import { formatCm, formatKg } from "@/lib/utils";

const numericNullable = z.preprocess((value) => {
  if (value === "" || value === null || typeof value === "undefined") return null;
  if (typeof value === "number") return value;
  if (typeof value !== "string") return value;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : value;
}, z.number().positive("La valeur doit être positive.").nullable());

const profileFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis."),
  profileMode: z.enum(profileModes).nullable(),
  heightCm: numericNullable,
  weightKg: numericNullable,
  bodyFatPercent: numericNullable,
  chestCm: numericNullable,
  waistCm: numericNullable,
  stomachCm: numericNullable,
  seatHipsCm: numericNullable,
  leftBicepsCm: numericNullable,
  rightBicepsCm: numericNullable,
  leftForearmCm: numericNullable,
  rightForearmCm: numericNullable,
  leftThighCm: numericNullable,
  rightThighCm: numericNullable,
  leftCalfCm: numericNullable,
  rightCalfCm: numericNullable,
  footLengthMm: numericNullable,
  notes: z.string().default("")
});

type ProfileFormInput = z.input<typeof profileFormSchema>;
type ProfileFormValues = z.output<typeof profileFormSchema>;

const fields: Array<{ key: keyof ProfileFormValues; label: string; unit: string }> = [
  { key: "heightCm", label: "Taille corporelle", unit: "cm" },
  { key: "weightKg", label: "Poids", unit: "kg" },
  { key: "bodyFatPercent", label: "Masse grasse", unit: "%" },
  { key: "chestCm", label: "Poitrine", unit: "cm" },
  { key: "stomachCm", label: "Ventre", unit: "cm" },
  { key: "waistCm", label: "Taille", unit: "cm" },
  { key: "seatHipsCm", label: "Bassin / fessiers", unit: "cm" },
  { key: "leftBicepsCm", label: "Biceps gauche", unit: "cm" },
  { key: "rightBicepsCm", label: "Biceps droit", unit: "cm" },
  { key: "leftForearmCm", label: "Avant-bras gauche", unit: "cm" },
  { key: "rightForearmCm", label: "Avant-bras droit", unit: "cm" },
  { key: "leftThighCm", label: "Cuisse gauche", unit: "cm" },
  { key: "rightThighCm", label: "Cuisse droite", unit: "cm" },
  { key: "leftCalfCm", label: "Mollet gauche", unit: "cm" },
  { key: "rightCalfCm", label: "Mollet droit", unit: "cm" },
  { key: "footLengthMm", label: "Longueur de pied", unit: "mm" }
];

function valuesFromProfile(profile: BodyProfile | undefined): ProfileFormValues {
  return {
    name: profile?.name ?? "Profil manuel",
    profileMode: profile?.profileMode ?? "unisex",
    heightCm: profile?.heightCm ?? null,
    weightKg: profile?.weightKg ?? null,
    bodyFatPercent: profile?.bodyFatPercent ?? null,
    chestCm: profile?.chestCm ?? null,
    waistCm: profile?.waistCm ?? null,
    stomachCm: profile?.stomachCm ?? null,
    seatHipsCm: profile?.seatHipsCm ?? null,
    leftBicepsCm: profile?.leftBicepsCm ?? null,
    rightBicepsCm: profile?.rightBicepsCm ?? null,
    leftForearmCm: profile?.leftForearmCm ?? null,
    rightForearmCm: profile?.rightForearmCm ?? null,
    leftThighCm: profile?.leftThighCm ?? null,
    rightThighCm: profile?.rightThighCm ?? null,
    leftCalfCm: profile?.leftCalfCm ?? null,
    rightCalfCm: profile?.rightCalfCm ?? null,
    footLengthMm: profile?.footLengthMm ?? null,
    notes: profile?.notes ?? ""
  };
}

interface BodyProfilePageProps {
  state: AppState;
}

export function BodyProfilePage({ state }: BodyProfilePageProps) {
  const { upsertProfile, setActiveProfile, addImportJob } = useStudioStore();
  const activeProfile = state.bodyProfiles.find((profile) => profile.id === state.settings.activeProfileId);
  const [selectedProfileId, setSelectedProfileId] = useState(activeProfile?.id ?? "new");
  const selectedProfile = useMemo(
    () => state.bodyProfiles.find((profile) => profile.id === selectedProfileId),
    [selectedProfileId, state.bodyProfiles]
  );
  const [preview, setPreview] = useState<BodyProfileImportPreview | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const form = useForm<ProfileFormInput, unknown, ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    values: valuesFromProfile(selectedProfile)
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const timestamp = nowIso();
    const profile = bodyProfileSchema.parse({
      ...(selectedProfile ?? {
        id: createId("profile"),
        version: 1,
        provenance: {},
        shoeSizeRefs: [],
        createdAt: timestamp
      }),
      ...values,
      updatedAt: timestamp
    });
    await upsertProfile(profile, selectedProfile ? "Édition manuelle" : "Création manuelle");
    setSelectedProfileId(profile.id);
  });

  async function importHtmlFile(file: File | null) {
    setImportError(null);
    setPreview(null);
    if (!file) return;
    try {
      const html = await file.text();
      const parsed = parseBodyProfileHtml(html, {
        fileName: file.name,
        byteSize: file.size,
        importedAt: nowIso()
      });
      setPreview(parsed);
      await addImportJob({
        id: createId("import"),
        type: "body_profile_html",
        sourceName: file.name,
        status: "previewed",
        warnings: parsed.warnings,
        errors: [],
        createdAt: nowIso()
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Import impossible.";
      setImportError(message);
      await addImportJob({
        id: createId("import"),
        type: "body_profile_html",
        sourceName: file.name,
        status: "failed",
        warnings: [],
        errors: [message],
        createdAt: nowIso()
      });
    }
  }

  async function savePreview() {
    if (!preview) return;
    await upsertProfile(preview.profile, "Import HTML");
    await addImportJob({
      id: createId("import"),
      type: "body_profile_html",
      sourceName: preview.profile.provenance.weightKg?.sourceName ?? "HTML",
      status: "completed",
      warnings: preview.warnings,
      errors: [],
      createdAt: nowIso()
    });
    setSelectedProfileId(preview.profile.id);
    setPreview(null);
  }

  return (
    <div>
      <PageHeader
        title="Body Profile"
        description="Importez le HTML de référence, contrôlez la provenance puis complétez ou versionnez manuellement les mesures."
      />

      <div className="grid grid-cols-[1.15fr_0.85fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-4 w-4" />
              Éditeur de profil
            </CardTitle>
            <CardDescription>Les valeurs restent en unités métriques canoniques.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid grid-cols-3 gap-3">
              <div>
                <Label>Profil</Label>
                <Select
                  value={selectedProfileId}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSelectedProfileId(value);
                    void setActiveProfile(value === "new" ? null : value);
                  }}
                >
                  <option value="new">Nouveau profil</option>
                  {state.bodyProfiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Nom</Label>
                <Input {...form.register("name")} />
                {form.formState.errors.name ? <p className="mt-1 text-xs text-destructive">{form.formState.errors.name.message}</p> : null}
              </div>
              <div>
                <Label>Mode profil</Label>
                <Select {...form.register("profileMode")}>
                  {profileModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <form onSubmit={(event) => void onSubmit(event)} className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                {fields.map((field) => (
                  <div key={field.key}>
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <Input
                        id={field.key}
                        inputMode="decimal"
                        type="number"
                        step="0.1"
                        {...form.register(field.key)}
                      />
                      <span className="w-8 text-xs text-muted-foreground">{field.unit}</span>
                    </div>
                    {form.formState.errors[field.key] ? (
                      <p className="mt-1 text-xs text-destructive">{String(form.formState.errors[field.key]?.message)}</p>
                    ) : null}
                  </div>
                ))}
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea {...form.register("notes")} />
              </div>
              <Button type="submit">
                <Save className="h-4 w-4" />
                Enregistrer le profil
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileUp className="h-4 w-4" />
                Import HTML de mesures
              </CardTitle>
              <CardDescription>Le HTML est parsé une fois puis normalisé en schéma interne.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                aria-label="Importer un fichier HTML de mesures"
                type="file"
                accept=".html,text/html"
                onChange={(event) => void importHtmlFile(event.target.files?.[0] ?? null)}
              />
              {importError ? <p className="rounded-md border border-destructive/40 p-3 text-sm text-destructive">{importError}</p> : null}
              {preview ? (
                <div className="space-y-3 rounded-lg border bg-muted/35 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{preview.profile.name}</p>
                    <Badge variant="warning">{preview.warnings.length} alerte(s)</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span>Poitrine: {formatCm(preview.profile.chestCm)}</span>
                    <span>Poids: {formatKg(preview.profile.weightKg)}</span>
                    <span>Taille: {formatCm(preview.profile.waistCm)}</span>
                    <span>Bassin: {formatCm(preview.profile.seatHipsCm)}</span>
                  </div>
                  {preview.warnings.map((warning) => (
                    <p key={warning} className="text-xs text-muted-foreground">
                      {warning}
                    </p>
                  ))}
                  <Button onClick={() => void savePreview()}>Valider et persister</Button>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Provenance</CardTitle>
              <CardDescription>Traçabilité par mesure du profil sélectionné.</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedProfile ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mesure</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Confiance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(selectedProfile.provenance).map(([key, provenance]) => (
                      <TableRow key={key}>
                        <TableCell>{key as BodyMeasurementKey}</TableCell>
                        <TableCell>{provenance.sourceName}</TableCell>
                        <TableCell>{Math.round(provenance.confidence * 100)} %</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">Aucune provenance tant qu’un profil n’est pas importé ou sélectionné.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
