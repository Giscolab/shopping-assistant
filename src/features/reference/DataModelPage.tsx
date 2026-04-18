import { Database } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const tables = [
  "body_profiles",
  "body_measurements",
  "body_profile_versions",
  "comfort_preferences",
  "garment_categories",
  "garment_types",
  "size_systems",
  "size_labels",
  "brands",
  "brand_size_guides",
  "brand_size_guide_rows",
  "brand_size_guide_measurements",
  "fabric_profiles",
  "fit_profiles",
  "recommendation_runs",
  "recommendation_results",
  "import_jobs",
  "import_sources",
  "app_settings"
];

export function DataModelPage() {
  return (
    <div>
      <PageHeader
        title="Modèle de données"
        description="Vue synthétique du schéma SQLite/Drizzle et des limites de vérité des données."
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Tables minimales
          </CardTitle>
          <CardDescription>Les migrations SQL sont versionnées dans le dépôt et exécutées par le pont Tauri SQLite.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {tables.map((table) => (
              <div key={table} className="rounded-lg border bg-muted/35 p-3 font-mono text-xs">
                {table}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-lg border p-4 text-sm text-muted-foreground">
            Les guides de démonstration sont marqués <strong>sample</strong>. L’application ne contient pas de standards officiels
            inventés; les guides réels doivent être importés avec source et incertitude.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
