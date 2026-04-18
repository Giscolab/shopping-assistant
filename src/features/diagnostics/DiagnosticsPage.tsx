import { Activity, AlertTriangle, Database } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AppState } from "@/services/persistence/appState";
import { DiagnosticViewerPanel } from "@/features/diagnostic-viewer/DiagnosticViewerPanel";

interface DiagnosticsPageProps {
  state: AppState;
}

export function DiagnosticsPage({ state }: DiagnosticsPageProps) {
  const incompleteGuides = state.brandSizeGuides.filter((guide) => !guide.isComplete);
  const failedImports = state.importJobs.filter((job) => job.status === "failed");
  return (
    <div>
      <PageHeader
        title="Diagnostics"
        description="Santé du schéma, données incomplètes, logs d’import et avertissements de qualité."
      />
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Schéma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">v{state.schemaVersion}</p>
            <p className="text-sm text-muted-foreground">Migration initiale SQLite/Drizzle.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Guides incomplets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{incompleteGuides.length}</p>
            <p className="text-sm text-muted-foreground">Nécessitent source ou dimensions supplémentaires.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Imports échoués</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{failedImports.length}</p>
            <p className="text-sm text-muted-foreground">À traiter avant exploitation.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Rapport de complétude des guides
          </CardTitle>
          <CardDescription>Les guides sample ou incomplets diminuent la confiance du moteur.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guide</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Lignes</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.brandSizeGuides.map((guide) => (
                <TableRow key={guide.id}>
                  <TableCell>{guide.name}</TableCell>
                  <TableCell>{guide.garmentCategory}</TableCell>
                  <TableCell>{guide.rows.length}</TableCell>
                  <TableCell>{guide.sourceName}</TableCell>
                  <TableCell>
                    <Badge variant={guide.isComplete ? "success" : "warning"}>
                      {guide.isComplete ? "complet" : "incomplet"}
                    </Badge>
                    {guide.isSample ? <Badge className="ml-2" variant="outline">sample</Badge> : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Logs d’import
          </CardTitle>
        </CardHeader>
        <CardContent>
          {state.importJobs.length > 0 ? (
            state.importJobs.map((job) => (
              <div key={job.id} className="mb-2 rounded-lg border p-3 text-sm">
                <p className="font-medium">{job.sourceName} · {job.status}</p>
                <p className="text-muted-foreground">{job.warnings.concat(job.errors).join(" · ") || "Aucun message"}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Aucun log d’import.</p>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <DiagnosticViewerPanel state={state} />
      </div>
    </div>
  );
}
