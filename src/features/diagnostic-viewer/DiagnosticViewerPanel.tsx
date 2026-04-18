import { useEffect, useState } from "react";
import { Activity, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AppState } from "@/services/persistence/appState";
import {
  buildDiagnosticEvents,
  buildGuideCoverageDiagnostics,
  loadDatabaseDiagnostics,
  type DatabaseDiagnostics
} from "@/services/diagnostics/ontologyDiagnostics";

interface DiagnosticViewerPanelProps {
  state: AppState;
}

export function DiagnosticViewerPanel({ state }: DiagnosticViewerPanelProps) {
  const [databaseDiagnostics, setDatabaseDiagnostics] = useState<DatabaseDiagnostics | null>(null);
  const events = buildDiagnosticEvents(state);
  const coverage = buildGuideCoverageDiagnostics(state);

  useEffect(() => {
    void loadDatabaseDiagnostics(state).then(setDatabaseDiagnostics);
  }, [state]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Diagnostic ontologie et règles
          </CardTitle>
          <CardDescription>Contrôle que les catégories v1 sont reliées à la taxonomie, aux guides et aux mappings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sévérité</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Entité</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event, index) => (
                <TableRow key={`${event.code}-${event.entityId ?? "global"}-${index}`}>
                  <TableCell>
                    <Badge variant={event.severity === "error" ? "destructive" : event.severity === "warning" ? "warning" : "success"}>
                      {event.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{event.code}</TableCell>
                  <TableCell>{event.entityId ?? "global"}</TableCell>
                  <TableCell>{event.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Couverture des guides par catégorie v1</CardTitle>
          <CardDescription>Les dimensions manquantes sont utiles pour prioriser les imports de guides réels.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Catégorie</TableHead>
                <TableHead>Guides</TableHead>
                <TableHead>Complets</TableHead>
                <TableHead>Sample only</TableHead>
                <TableHead>Dimensions guide manquantes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coverage.map((row) => (
                <TableRow key={row.categoryId}>
                  <TableCell>{row.label}</TableCell>
                  <TableCell>{row.guideCount}</TableCell>
                  <TableCell>{row.completeGuideCount}</TableCell>
                  <TableCell>{row.hasSampleOnly ? "oui" : "non"}</TableCell>
                  <TableCell>{row.missingRequiredGuideDimensions.join(", ") || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Runtime persistance
          </CardTitle>
          <CardDescription>Diagnostic Tauri si disponible, fallback navigateur en web-dev.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          {databaseDiagnostics ? (
            <div className="space-y-2">
              <p>
                Runtime: <Badge variant="outline">{databaseDiagnostics.runtime}</Badge>
              </p>
              <p>Database: {databaseDiagnostics.databasePath ?? "localStorage navigateur"}</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
                {Object.entries(databaseDiagnostics.tableCounts).map(([table, count]) => (
                  <div key={table} className="rounded-md border p-2">
                    <p className="font-mono text-xs text-muted-foreground">{table}</p>
                    <p className="text-lg font-semibold">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Chargement du diagnostic de persistance...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
