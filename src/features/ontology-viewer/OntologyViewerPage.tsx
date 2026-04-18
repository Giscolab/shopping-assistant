import { BookOpen, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ontologyBundle, validateOntologyIntegration } from "@/domain/ontology";
import type { AppState } from "@/services/persistence/appState";
import { buildGuideCoverageDiagnostics } from "@/services/diagnostics/ontologyDiagnostics";

interface OntologyViewerPageProps {
  state: AppState;
}

export function OntologyViewerPage({ state }: OntologyViewerPageProps) {
  const diagnostics = validateOntologyIntegration();
  const coverage = buildGuideCoverageDiagnostics(state);
  return (
    <div>
      <PageHeader
        title="Ontologie menswear v1"
        description="Modèle sizing-oriented: catégories calculables, mesures requises, priorités et hypothèses. Ce n’est pas une encyclopédie mode ni un standard officiel."
      />
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Version</p>
            <p className="mt-2 text-2xl font-semibold">{ontologyBundle.garments.version}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Familles</p>
            <p className="mt-2 text-2xl font-semibold">{ontologyBundle.garments.families.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Catégories</p>
            <p className="mt-2 text-2xl font-semibold">{ontologyBundle.garments.categories.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Diagnostics</p>
            <p className="mt-2 text-2xl font-semibold">{diagnostics.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 border-amber-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Vérité des données
          </CardTitle>
          <CardDescription>{ontologyBundle.garments.provenance.truthfulness}</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Catégories calculables
          </CardTitle>
          <CardDescription>Chaque ligne est reliée à la taxonomie moteur et à la couverture des guides locaux.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Catégorie</TableHead>
                <TableHead>Famille</TableHead>
                <TableHead>Mesures corps</TableHead>
                <TableHead>Mesures guide</TableHead>
                <TableHead>Priorités</TableHead>
                <TableHead>Guide local</TableHead>
                <TableHead>Sortie moteur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ontologyBundle.garments.categories.map((category) => {
                const row = coverage.find((item) => item.categoryId === category.id);
                return (
                  <TableRow key={category.id}>
                    <TableCell>
                      <p className="font-medium">{category.label}</p>
                      <p className="font-mono text-xs text-muted-foreground">{category.id}</p>
                    </TableCell>
                    <TableCell>{category.family}</TableCell>
                    <TableCell>{category.requiredBodyMeasurements.join(", ")}</TableCell>
                    <TableCell>{category.requiredGuideMeasurements.join(", ")}</TableCell>
                    <TableCell>
                      {category.priorityDimensions.map((dimension) => (
                        <Badge key={dimension.dimension} className="mr-1" variant="outline">
                          {dimension.dimension} {Math.round(dimension.weight * 100)} %
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={row && row.guideCount > 0 ? "success" : "warning"}>
                        {row?.guideCount ?? 0} guide(s)
                      </Badge>
                      {row?.hasSampleOnly ? (
                        <Badge className="ml-1" variant="outline">
                          sample only
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell>{category.expectedEngineOutput.join(", ")}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
