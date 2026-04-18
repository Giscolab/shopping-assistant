import { Download, FileInput } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AppState } from "@/services/persistence/appState";
import { exportBodyProfileJson, exportRecommendationRunsCsv } from "@/services/export/exporters";
import { downloadTextFile } from "@/lib/utils";
import { exportOntologyBundleJson } from "@/domain/ontology";
import { exportDiagnosticsJson } from "@/services/diagnostics/ontologyDiagnostics";

interface ImportsExportsPageProps {
  state: AppState;
}

export function ImportsExportsPage({ state }: ImportsExportsPageProps) {
  const activeProfile = state.bodyProfiles.find((profile) => profile.id === state.settings.activeProfileId) ?? state.bodyProfiles[0];
  return (
    <div>
      <PageHeader
        title="Imports et Exports"
        description="Suivez les jobs d’import locaux et exportez les snapshots de profil ou les sessions de recommandation."
      />
      <div className="grid grid-cols-[0.8fr_1.2fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exports
            </CardTitle>
            <CardDescription>Fichiers générés dans le navigateur ou la WebView Tauri.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              disabled={!activeProfile}
              onClick={() =>
                activeProfile
                  ? downloadTextFile(`body-profile-${activeProfile.id}.json`, exportBodyProfileJson(activeProfile))
                  : undefined
              }
            >
              Exporter le profil actif JSON
            </Button>
            <Button
              variant="outline"
              disabled={state.recommendationRuns.length === 0}
              onClick={() => downloadTextFile("recommendation-runs.csv", exportRecommendationRunsCsv(state.recommendationRuns), "text/csv")}
            >
              Exporter les recommandations CSV
            </Button>
            <Button variant="outline" onClick={() => downloadTextFile("ontology-bundle.json", exportOntologyBundleJson())}>
              Exporter l’ontologie JSON
            </Button>
            <Button variant="outline" onClick={() => downloadTextFile("diagnostics.json", exportDiagnosticsJson(state))}>
              Exporter les diagnostics JSON
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileInput className="h-4 w-4" />
              Journal d’import
            </CardTitle>
            <CardDescription>Prévisualisations, succès et erreurs des imports locaux.</CardDescription>
          </CardHeader>
          <CardContent>
            {state.importJobs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Warnings</TableHead>
                    <TableHead>Erreurs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.importJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>{new Date(job.createdAt).toLocaleString("fr-FR")}</TableCell>
                      <TableCell>{job.type}</TableCell>
                      <TableCell>{job.sourceName}</TableCell>
                      <TableCell>{job.status}</TableCell>
                      <TableCell>{job.warnings.length}</TableCell>
                      <TableCell>{job.errors.join(" · ") || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="rounded-lg border border-dashed p-8 text-sm text-muted-foreground">
                Aucun import enregistré. Les imports HTML se font depuis Body Profile, les guides depuis Guides marques.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
