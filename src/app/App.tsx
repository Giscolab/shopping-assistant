import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { BodyProfilePage } from "@/features/body-profile/BodyProfilePage";
import { ComfortPreferencesPage } from "@/features/body-profile/ComfortPreferencesPage";
import { BrandGuidesPage } from "@/features/brand-guides/BrandGuidesPage";
import { RecommendationStudioPage } from "@/features/recommendation/RecommendationStudioPage";
import { HistoryPage } from "@/features/history/HistoryPage";
import { ComparisonPage } from "@/features/comparison/ComparisonPage";
import { SizeSystemsPage } from "@/features/reference/SizeSystemsPage";
import { GarmentCategoriesPage } from "@/features/reference/GarmentCategoriesPage";
import { ImportsExportsPage } from "@/features/import-export/ImportsExportsPage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { DiagnosticsPage } from "@/features/diagnostics/DiagnosticsPage";
import { DataModelPage } from "@/features/reference/DataModelPage";
import { SourcesPage } from "@/features/reference/SourcesPage";
import type { PageId } from "@/app/navigation";
import { useStudioStore } from "@/hooks/useStudioStore";

export function App() {
  const [activePage, setActivePage] = useState<PageId>("dashboard");
  const { state, loading, error, hydrate } = useStudioStore();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (loading || !state) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Chargement du studio local</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Initialisation de l’état applicatif, des guides illustratifs et de la couche de persistance.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <Alert className="max-w-xl border-destructive/40">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur de chargement</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const page = (() => {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage state={state} onNavigate={setActivePage} />;
      case "body-profile":
        return <BodyProfilePage state={state} />;
      case "comfort":
        return <ComfortPreferencesPage state={state} />;
      case "garment-categories":
        return <GarmentCategoriesPage />;
      case "brand-guides":
        return <BrandGuidesPage state={state} />;
      case "recommendation":
        return <RecommendationStudioPage state={state} />;
      case "comparison":
        return <ComparisonPage state={state} />;
      case "history":
        return <HistoryPage state={state} />;
      case "size-systems":
        return <SizeSystemsPage state={state} />;
      case "imports":
        return <ImportsExportsPage state={state} />;
      case "settings":
        return <SettingsPage state={state} />;
      case "diagnostics":
        return <DiagnosticsPage state={state} />;
      case "data-model":
        return <DataModelPage />;
      case "archive":
        return <SourcesPage />;
      default:
        return <DashboardPage state={state} onNavigate={setActivePage} />;
    }
  })();

  return (
    <AppShell activePage={activePage} onNavigate={setActivePage} state={state}>
      {page}
    </AppShell>
  );
}
