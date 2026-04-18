import { useMemo, useState } from "react";
import { Sigma } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { computeTargetDimension, shrinkageBiasCm } from "@/domain/sizing/ease";
import { dimensionLabels, scoreAgainstMeasurementRange } from "@/domain/sizing/rules";
import { ontologyBundle, getOntologyCut, getOntologyMaterialProfile } from "@/domain/ontology";
import { garmentTaxonomy } from "@/domain/garments/taxonomy";
import type { GarmentCategory, RecommendationDimension } from "@/domain/shared/enums";

export function RulesExplorerPage() {
  const [categoryId, setCategoryId] = useState<GarmentCategory>("tshirt");
  const [cutId, setCutId] = useState("regular");
  const category = ontologyBundle.garments.categories.find((item) => item.id === categoryId) ?? ontologyBundle.garments.categories[0];
  const taxonomy = garmentTaxonomy[category.canonicalCategory];
  const cut = getOntologyCut(cutId);
  const material = getOntologyMaterialProfile(category.defaultMaterialProfile);

  const rows = useMemo(() => {
    return taxonomy.dimensionRules.map((rule) => {
      const cutDelta = cut?.dimensionDeltasCm[rule.dimension] ?? 0;
      const target = computeTargetDimension({
        bodyValue: exampleBodyValue(rule.dimension),
        dimension: rule.dimension,
        baseEaseCm: rule.baseEaseCm,
        fitDeltaCm: cutDelta,
        easeDeltaCm: 0,
        layeringDeltaCm: category.usageConstraints.includes("winter_layering") ? 5 : category.usageConstraints.includes("over_layer") ? 1.2 : 0,
        stretchRelaxationCm: material?.stretchRelaxationCm ?? 0,
        shrinkageBiasCm: shrinkageBiasCm(material?.shrinkageRisk ?? 0)
      });
      const score = scoreAgainstMeasurementRange(target.targetValue, {
        min: target.targetValue === null ? null : target.targetValue - 3,
        max: target.targetValue === null ? null : target.targetValue + 3,
        target: null,
        unit: rule.dimension === "footLengthMm" ? "mm" : "cm",
        sourceNote: "Plage fictive locale pour explorer la formule, pas un guide officiel."
      });
      return { rule, target, score, cutDelta };
    });
  }, [category, cut, material, taxonomy.dimensionRules]);

  return (
    <div>
      <PageHeader
        title="Rules Explorer"
        description="Exploration lisible des règles déterministes: aisance, coupe, matière, pondération et confiance."
      />
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sigma className="h-4 w-4" />
            Paramètres
          </CardTitle>
          <CardDescription>Les valeurs d’exemple servent à vérifier les formules, pas à simuler un profil réel.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <label className="space-y-2 text-sm font-medium">
            Catégorie
            <Select value={categoryId} onChange={(event) => setCategoryId(event.target.value as GarmentCategory)}>
              {ontologyBundle.garments.categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-2 text-sm font-medium">
            Coupe
            <Select value={cutId} onChange={(event) => setCutId(event.target.value)}>
              {ontologyBundle.cuts.cuts.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </Select>
          </label>
          <div className="rounded-lg border bg-muted/35 p-3 text-sm">
            <p className="font-medium">{material?.label ?? "Matière inconnue"}</p>
            <p className="text-muted-foreground">
              stretch {material?.stretch ?? "?"} · shrinkage {Math.round((material?.shrinkageRisk ?? 0) * 100)} %
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{category.label}</CardTitle>
          <CardDescription>
            Profil aisance <Badge variant="outline">{category.easeProfile}</Badge> · coupe <Badge variant="outline">{cut?.label ?? cutId}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dimension</TableHead>
                <TableHead>Poids</TableHead>
                <TableHead>Corps exemple</TableHead>
                <TableHead>Aisance base</TableHead>
                <TableHead>Delta coupe</TableHead>
                <TableHead>Cible</TableHead>
                <TableHead>Score plage</TableHead>
                <TableHead>Formule</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ rule, target, score, cutDelta }) => (
                <TableRow key={rule.dimension}>
                  <TableCell className="font-medium">{dimensionLabels[rule.dimension]}</TableCell>
                  <TableCell>{Math.round(rule.weight * 100)} %</TableCell>
                  <TableCell>{exampleBodyValue(rule.dimension) ?? "—"}</TableCell>
                  <TableCell>{rule.baseEaseCm} cm</TableCell>
                  <TableCell>{cutDelta} cm</TableCell>
                  <TableCell>{target.targetValue ?? "—"}</TableCell>
                  <TableCell>{score.score}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{target.formula}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function exampleBodyValue(dimension: RecommendationDimension) {
  const examples: Record<RecommendationDimension, number | null> = {
    chestCm: 92,
    waistCm: 78,
    stomachCm: 84,
    seatHipsCm: 94,
    bicepsCm: 31,
    forearmCm: 25,
    thighCm: 52,
    calfCm: 36,
    footLengthMm: 265,
    heightCm: 178
  };
  return examples[dimension];
}
