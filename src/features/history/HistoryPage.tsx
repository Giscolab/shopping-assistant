import { useState } from "react";
import { Download, History } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AppState } from "@/services/persistence/appState";
import { garmentTaxonomy } from "@/domain/garments/taxonomy";
import { downloadTextFile } from "@/lib/utils";
import { exportRecommendationRunJson, exportRecommendationRunsCsv } from "@/services/export/exporters";

interface HistoryPageProps {
  state: AppState;
}

export function HistoryPage({ state }: HistoryPageProps) {
  const [selectedRunId, setSelectedRunId] = useState(state.recommendationRuns[0]?.id ?? "");
  const selectedRun = state.recommendationRuns.find((run) => run.id === selectedRunId) ?? state.recommendationRuns[0];
  return (
    <div>
      <PageHeader
        title="Historique"
        description="Recommandations sauvegardées localement, exportables et réouvrables pour comparaison."
        actions={
          <Button
            variant="outline"
            disabled={state.recommendationRuns.length === 0}
            onClick={() => downloadTextFile("recommendations.csv", exportRecommendationRunsCsv(state.recommendationRuns), "text/csv")}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />
      <div className="grid grid-cols-[1fr_0.8fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Runs
            </CardTitle>
            <CardDescription>{state.recommendationRuns.length} simulation(s) enregistrée(s).</CardDescription>
          </CardHeader>
          <CardContent>
            {state.recommendationRuns.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Profil</TableHead>
                    <TableHead>Taille</TableHead>
                    <TableHead>Confiance</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.recommendationRuns.map((run) => {
                    const profile = state.bodyProfiles.find((item) => item.id === run.input.profileId);
                    return (
                      <TableRow key={run.id}>
                        <TableCell>{new Date(run.createdAt).toLocaleString("fr-FR")}</TableCell>
                        <TableCell>{garmentTaxonomy[run.input.garmentCategory].label}</TableCell>
                        <TableCell>{profile?.name ?? "Profil supprimé"}</TableCell>
                        <TableCell className="font-medium">{run.result.recommendedSize}</TableCell>
                        <TableCell>
                          <Badge variant={run.result.confidenceScore >= 70 ? "success" : "warning"}>
                            {run.result.confidenceScore}/100
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => setSelectedRunId(run.id)}>
                            Ouvrir
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="rounded-lg border border-dashed p-8 text-sm text-muted-foreground">Aucun run sauvegardé.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Détail</CardTitle>
            <CardDescription>Explication du run sélectionné.</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedRun ? (
              <div className="space-y-4 text-sm">
                <div className="rounded-lg border p-4">
                  <p className="text-muted-foreground">Taille recommandée</p>
                  <p className="mt-1 text-4xl font-semibold">{selectedRun.result.recommendedSize}</p>
                  <p className="mt-2">{selectedRun.result.fitSummary}</p>
                </div>
                <div>
                  <p className="mb-2 font-medium">Alertes</p>
                  {selectedRun.result.warnings.length > 0 ? (
                    selectedRun.result.warnings.map((warning) => (
                      <p key={warning} className="mb-2 rounded-md border border-amber-500/35 bg-amber-500/10 p-2">
                        {warning}
                      </p>
                    ))
                  ) : (
                    <p className="text-muted-foreground">Aucune alerte.</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    downloadTextFile(`recommendation-${selectedRun.id}.json`, exportRecommendationRunJson(selectedRun))
                  }
                >
                  <Download className="h-4 w-4" />
                  Export JSON
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sélectionnez un run.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
