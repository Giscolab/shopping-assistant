import { Shirt } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { garmentTaxonomy } from "@/domain/garments/taxonomy";

export function GarmentCategoriesPage() {
  return (
    <div>
      <PageHeader
        title="Catégories vêtements"
        description="Taxonomie métier: dimensions prioritaires, aisance par défaut, sensibilité au stretch et notes de coupe."
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shirt className="h-4 w-4" />
            Taxonomie
          </CardTitle>
          <CardDescription>Chaque catégorie pilote le moteur via une pondération explicite des dimensions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Catégorie</TableHead>
                <TableHead>Famille</TableHead>
                <TableHead>Dimensions prioritaires</TableHead>
                <TableHead>Stretch</TableHead>
                <TableHead>Layering</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.values(garmentTaxonomy).map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.label}</TableCell>
                  <TableCell>{category.family}</TableCell>
                  <TableCell>
                    {category.dimensionRules.map((rule) => (
                      <Badge key={rule.dimension} className="mr-1" variant="outline">
                        {rule.dimension} · {Math.round(rule.weight * 100)} %
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell>{category.defaultStretchSensitivity}</TableCell>
                  <TableCell>{category.defaultLayering}</TableCell>
                  <TableCell>{category.notes.join(" ")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
