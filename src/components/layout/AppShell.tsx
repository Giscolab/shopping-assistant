import { Database, Lock, Search } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { navGroups, type PageId } from "@/app/navigation";
import { cn } from "@/lib/utils";
import type { AppState } from "@/services/persistence/appState";

interface AppShellProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  state: AppState;
  children: React.ReactNode;
}

export function AppShell({ activePage, onNavigate, state, children }: AppShellProps) {
  const activeProfile = state.bodyProfiles.find((profile) => profile.id === state.settings.activeProfileId);
  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-72 flex-col border-r bg-card/95 backdrop-blur">
        <div className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">Size Intelligence</p>
              <p className="text-xs text-muted-foreground">Studio local-first</p>
            </div>
          </div>
          <div className="mt-4 rounded-lg border bg-muted/45 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Profil actif</span>
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <p className="mt-1 truncate text-sm font-semibold">{activeProfile?.name ?? "Aucun profil"}</p>
            <p className="text-xs text-muted-foreground">Données locales par défaut</p>
          </div>
        </div>
        <Separator />
        <nav className="flex-1 overflow-y-auto p-3">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNavigate(item.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
      <div className="ml-72 flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/90 px-6 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="hidden h-9 w-80 items-center gap-2 rounded-lg border bg-card px-3 text-sm text-muted-foreground xl:flex">
              <Search className="h-4 w-4" />
              Recherche locale non indexée cloud
            </div>
            <Badge variant="outline">{state.brandSizeGuides.length} guides</Badge>
            <Badge variant={state.bodyProfiles.length > 0 ? "success" : "warning"}>
              {state.bodyProfiles.length > 0 ? "Profil prêt" : "Profil à importer"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onNavigate("imports")}>
              Importer
            </Button>
            <Button size="sm" onClick={() => onNavigate("recommendation")}>
              Recommander
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
