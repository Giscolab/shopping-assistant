import type { SizeSystemReference } from "@/domain/sizing/schema";

export const defaultSizeSystemReferences: SizeSystemReference[] = [
  {
    id: "size_system_fr",
    code: "FR",
    label: "France",
    description: "Système de tailles français, à interpréter via les guides de marque.",
    uncertaintyNote: "Les correspondances génériques FR/EU/IT ne sont pas exactes et ne remplacent pas un guide de marque.",
    isApproximate: true,
    provenance: "Modèle de référence interne; aucune donnée officielle embarquée."
  },
  {
    id: "size_system_eu",
    code: "EU",
    label: "Europe",
    description: "Système européen générique, séparé des guides de marque.",
    uncertaintyNote: "La coupe, le pays et la marque créent des écarts importants.",
    isApproximate: true,
    provenance: "Modèle de référence interne; aucune donnée officielle embarquée."
  },
  {
    id: "size_system_int",
    code: "INT",
    label: "International alpha",
    description: "Tailles XXS à 5XL utilisées pour les simulations et guides importés.",
    uncertaintyNote: "Un M international peut couvrir des plages très différentes selon la marque.",
    isApproximate: true,
    provenance: "Modèle de référence interne; labels uniquement."
  },
  {
    id: "size_system_waist_inseam",
    code: "WAIST_INSEAM",
    label: "Waist/Inseam",
    description: "Système W/L pour denim et pantalons.",
    uncertaintyNote: "Le W/L indique souvent une taille nominale, pas une mesure corporelle fiable.",
    isApproximate: true,
    provenance: "Modèle de référence interne; aucune conversion officielle embarquée."
  },
  {
    id: "size_system_sock",
    code: "SOCK",
    label: "Chaussettes",
    description: "Références par longueur de pied ou pointure, quand disponibles dans le guide.",
    uncertaintyNote: "Les plages de pointures doivent être fournies par la source importée.",
    isApproximate: true,
    provenance: "Modèle de référence interne; labels uniquement."
  }
];
