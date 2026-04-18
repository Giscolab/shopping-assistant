import { Moon, Settings, Sun } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AppState } from "@/services/persistence/appState";
import { useStudioStore } from "@/hooks/useStudioStore";

interface SettingsPageProps {
  state: AppState;
}

export function SettingsPage({ state }: SettingsPageProps) {
  const { setTheme } = useStudioStore();
  return (
    <div>
      <PageHeader title="Settings" description="Préférences locales de l’application et confidentialité." />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Préférences
          </CardTitle>
          <CardDescription>Les paramètres sont persistés localement avec le reste de l’état.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Thème</p>
              <p className="text-sm text-muted-foreground">Mode actuel: {state.settings.theme}</p>
            </div>
            <div className="flex gap-2">
              <Button variant={state.settings.theme === "light" ? "default" : "outline"} onClick={() => void setTheme("light")}>
                <Sun className="h-4 w-4" />
                Clair
              </Button>
              <Button variant={state.settings.theme === "dark" ? "default" : "outline"} onClick={() => void setTheme("dark")}>
                <Moon className="h-4 w-4" />
                Sombre
              </Button>
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <p className="font-medium">Confidentialité</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Le mode disponible est <Badge variant="outline">local_only</Badge>. Aucun backend serveur n’est utilisé.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
