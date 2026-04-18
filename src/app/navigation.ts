import {
  Activity,
  Archive,
  BadgeCent,
  ClipboardList,
  Database,
  FileInput,
  Gauge,
  History,
  LayoutDashboard,
  Ruler,
  Settings,
  Shirt,
  SlidersHorizontal
} from "lucide-react";

export const navGroups = [
  {
    label: "Pilotage",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "recommendation", label: "Studio", icon: Gauge },
      { id: "comparison", label: "Comparaison", icon: SlidersHorizontal },
      { id: "history", label: "Historique", icon: History }
    ]
  },
  {
    label: "Données",
    items: [
      { id: "body-profile", label: "Body Profile", icon: Ruler },
      { id: "comfort", label: "Préférences confort", icon: ClipboardList },
      { id: "garment-categories", label: "Catégories", icon: Shirt },
      { id: "brand-guides", label: "Guides marques", icon: Shirt },
      { id: "size-systems", label: "Systèmes tailles", icon: BadgeCent },
      { id: "imports", label: "Imports / Exports", icon: FileInput }
    ]
  },
  {
    label: "Administration",
    items: [
      { id: "settings", label: "Settings", icon: Settings },
      { id: "diagnostics", label: "Diagnostics", icon: Activity },
      { id: "data-model", label: "Modèle", icon: Database },
      { id: "archive", label: "Sources", icon: Archive }
    ]
  }
] as const;

export type PageId = (typeof navGroups)[number]["items"][number]["id"];
