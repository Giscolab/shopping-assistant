import { AlertTriangle, CheckCircle2, FilePlus2, Gauge, Ruler, Shirt } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { MetricCard } from "@/components/MetricCard";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PageId } from "@/app/navigation";
import type { AppState } from "@/services/persistence/appState";
import { formatCm, formatKg } from "@/lib/utils";
import { garmentTaxonomy } from "@/domain/garments/taxonomy";

interface DashboardPageProps {
  state: AppState;
  onNavigate: (page: PageId) => void;
}

export function DashboardPage({ state, onNavigate }: DashboardPageProps) {
  const activeProfile = state.bodyProfiles.find((profile) => profile.id === state.settings.activeProfileId);
  const completeGuides = state.brandSizeGuides.filter((guide) => guide.isComplete).length;
  const recentRuns = state.recommendationRuns.slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Vue opérationnelle du profil corporel, de la couverture des guides et des recommandations récentes."
        actions={
          <>
            <Button variant="outline" onClick={() => onNavigate("imports")}>
              <FilePlus2 className="h-4 w-4" />
              Importer
            </Button>
            <Button onClick={() => onNavigate("recommendation")}>
              <Gauge className="h-4 w-4" />
              Lancer une simulation
            </Button>
          </>
        }
      />

      <div className="metric-grid">
        <MetricCard
          label="Profil actif"
          value={activeProfile?.name ?? "Aucun"}
          detail={activeProfile ? `${formatCm(activeProfile.chestCm)} poitrine · ${formatKg(activeProfile.weightKg)}` : "Importer ou créer un profil"}
        />
        <MetricCard
          label="Guides de tailles"
          value={state.brandSizeGuides.length}
          detail={`${completeGuides} complets · ${state.brandSizeGuides.filter((guide) => guide.isSample).length} illustratifs`}
        />
        <MetricCard
          label="Recommandations"
          value={state.recommendationRuns.length}
          detail={state.recommendationRuns[0] ? `Dernière ${formatDistanceToNow(new Date(state.recommendationRuns[0].createdAt), { addSuffix: true, locale: fr })}` : "Aucune simulation enregistrée"}
        />
        <MetricCard
          label="Mode confidentialité"
          value="Local"
          detail="Aucun service cloud requis pour les mesures sensibles"
        />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Profil courant
            </CardTitle>
            <CardDescription>Les recommandations sont plus fiables quand poitrine, taille, bassin et membres sont renseignés.</CardDescription>
          </CardHeader>
          <CardContent>
            {activeProfile ? (
              <div className="grid grid-cols-4 gap-3 text-sm">
                {[
                  ["Poids", formatKg(activeProfile.weightKg)],
                  ["Taille", formatCm(activeProfile.heightCm)],
                  ["Poitrine", formatCm(activeProfile.chestCm)],
                  ["Ventre", formatCm(activeProfile.stomachCm)],
                  ["Taille", formatCm(activeProfile.waistCm)],
                  ["Bassin", formatCm(activeProfile.seatHipsCm)],
                  ["Cuisse G/D", `${formatCm(activeProfile.leftThighCm)} / ${formatCm(activeProfile.rightThighCm)}`],
                  ["Mollet G/D", `${formatCm(activeProfile.leftCalfCm)} / ${formatCm(activeProfile.rightCalfCm)}`]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border bg-muted/35 p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-1 font-medium">{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm font-medium">Aucun profil importé</p>
                <p className="mt-1 text-sm text-muted-foreground">Utilisez le fichier HTML fourni ou créez un profil manuel.</p>
                <Button className="mt-4" onClick={() => onNavigate("body-profile")}>
                  Ouvrir Body Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shirt className="h-4 w-4" />
              Couverture guides
            </CardTitle>
            <CardDescription>Statut par catégorie minimale.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.values(garmentTaxonomy).map((category) => {
              const count = state.brandSizeGuides.filter((guide) => guide.garmentCategory === category.id).length;
              return (
                <div key={category.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <span>{category.label}</span>
                  <Badge variant={count > 0 ? "success" : "warning"}>{count > 0 ? `${count} guide(s)` : "manquant"}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recommandations récentes</CardTitle>
          <CardDescription>Historique local des dernières simulations sauvegardées.</CardDescription>
        </CardHeader>
        <CardContent>
          {recentRuns.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Guide</TableHead>
                  <TableHead>Résultat</TableHead>
                  <TableHead>Confiance</TableHead>
                  <TableHead>Alertes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRuns.map((run) => {
                  const guide = state.brandSizeGuides.find((item) => item.id === run.input.guideId);
                  return (
                    <TableRow key={run.id}>
                      <TableCell>{new Date(run.createdAt).toLocaleString("fr-FR")}</TableCell>
                      <TableCell>{garmentTaxonomy[run.input.garmentCategory].label}</TableCell>
                      <TableCell>{guide?.name ?? "Guide supprimé"}</TableCell>
                      <TableCell className="font-medium">{run.result.recommendedSize}</TableCell>
                      <TableCell>{run.result.confidenceScore}/100</TableCell>
                      <TableCell>
                        {run.result.warnings.length > 0 ? (
                          <Badge variant="warning">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            {run.result.warnings.length}
                          </Badge>
                        ) : (
                          <Badge variant="success">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            OK
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              Aucune recommandation pour l’instant. Lancez une simulation depuis le studio.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
