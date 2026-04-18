import { BadgeCent } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AppState } from "@/services/persistence/appState";

interface SizeSystemsPageProps {
  state: AppState;
}

export function SizeSystemsPage({ state }: SizeSystemsPageProps) {
  return (
    <div>
      <PageHeader
        title="Systèmes de tailles"
        description="Référentiel de labels et d’incertitudes. Les conversions génériques ne sont pas traitées comme exactes."
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BadgeCent className="h-4 w-4" />
            Références
          </CardTitle>
          <CardDescription>Modèle d’administration locale pour FR, EU, US, UK, IT, INT, W/L, chaussettes et footwear.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Incertitude</TableHead>
                <TableHead>Provenance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.sizeSystems.map((system) => (
                <TableRow key={system.id}>
                  <TableCell className="font-medium">{system.code}</TableCell>
                  <TableCell>{system.label}</TableCell>
                  <TableCell>{system.description}</TableCell>
                  <TableCell>
                    <Badge variant={system.isApproximate ? "warning" : "success"}>
                      {system.isApproximate ? "approximatif" : "spécifique"}
                    </Badge>
                    <p className="mt-1 text-xs text-muted-foreground">{system.uncertaintyNote}</p>
                  </TableCell>
                  <TableCell>{system.provenance}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
