import { Archive } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SourcesPage() {
  return (
    <div>
      <PageHeader
        title="Sources et vérité des données"
        description="L’application sépare strictement architecture, données importées, et données illustratives."
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Politique de source
          </CardTitle>
          <CardDescription>Règles appliquées dans le moteur et la persistance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>Les mesures corporelles sont importées depuis le HTML uniquement vers le schéma canonique; le HTML n’est pas requis à l’exécution.</p>
          <p>Les guides de marque réels doivent être importés via CSV/JSON ou saisis manuellement avec métadonnées de source.</p>
          <p>Les guides embarqués sont illustratifs, marqués sample et pénalisent le score de confiance.</p>
          <p>Les conversions FR/EU/US/UK/IT/INT ne sont jamais présentées comme exactes sans source spécifique.</p>
        </CardContent>
      </Card>
    </div>
  );
}
