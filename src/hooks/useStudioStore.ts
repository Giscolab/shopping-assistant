import { create } from "zustand";
import type { BodyProfile, BodyProfileVersion, ComfortPreference } from "@/domain/body-profile/schema";
import type { Brand, BrandSizeGuide } from "@/domain/sizing/schema";
import type { RecommendationRun } from "@/domain/recommendation/schema";
import type { AppState, ImportJob } from "@/services/persistence/appState";
import { createDefaultComfortPreferences, upsertById, validateState } from "@/services/persistence/appState";
import { loadAppState, saveAppState } from "@/services/persistence/storage";
import { nowIso, createId } from "@/domain/shared/ids";

interface StudioStore {
  state: AppState | null;
  loading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  persist: (next: AppState) => Promise<void>;
  setTheme: (theme: "light" | "dark") => Promise<void>;
  upsertProfile: (profile: BodyProfile, reason?: string) => Promise<void>;
  setActiveProfile: (profileId: string | null) => Promise<void>;
  updateComfortPreference: (preference: ComfortPreference) => Promise<void>;
  upsertBrandGuide: (brand: Brand, guide: BrandSizeGuide) => Promise<void>;
  addRecommendationRun: (run: RecommendationRun) => Promise<void>;
  addImportJob: (job: ImportJob) => Promise<void>;
}

function createVersion(profile: BodyProfile, reason: string): BodyProfileVersion {
  return {
    id: createId("version"),
    profileId: profile.id,
    version: profile.version,
    snapshot: profile,
    reason,
    createdAt: nowIso()
  };
}

export const useStudioStore = create<StudioStore>((set, get) => ({
  state: null,
  loading: true,
  error: null,
  hydrate: async () => {
    set({ loading: true, error: null });
    try {
      const state = await loadAppState();
      set({ state, loading: false });
      document.documentElement.classList.toggle("dark", state.settings.theme === "dark");
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : "Échec du chargement local." });
    }
  },
  persist: async (next) => {
    const validated = validateState(next);
    await saveAppState(validated);
    set({ state: validated });
    document.documentElement.classList.toggle("dark", validated.settings.theme === "dark");
  },
  setTheme: async (theme) => {
    const current = get().state;
    if (!current) return;
    await get().persist({ ...current, settings: { ...current.settings, theme } });
  },
  upsertProfile: async (profile, reason = "Mise à jour du profil") => {
    const current = get().state;
    if (!current) return;
    const exists = current.bodyProfiles.some((candidate) => candidate.id === profile.id);
    const updatedProfile = exists
      ? { ...profile, version: profile.version + 1, updatedAt: nowIso() }
      : { ...profile, version: 1 };
    const profileVersions = exists
      ? [...current.bodyProfileVersions, createVersion(updatedProfile, reason)]
      : current.bodyProfileVersions;
    const comfortPreferences = exists
      ? current.comfortPreferences
      : [...current.comfortPreferences, ...createDefaultComfortPreferences(updatedProfile.id)];
    await get().persist({
      ...current,
      bodyProfiles: upsertById(current.bodyProfiles, updatedProfile),
      bodyProfileVersions: profileVersions,
      comfortPreferences,
      settings: { ...current.settings, activeProfileId: updatedProfile.id }
    });
  },
  setActiveProfile: async (profileId) => {
    const current = get().state;
    if (!current) return;
    await get().persist({ ...current, settings: { ...current.settings, activeProfileId: profileId } });
  },
  updateComfortPreference: async (preference) => {
    const current = get().state;
    if (!current) return;
    await get().persist({
      ...current,
      comfortPreferences: upsertById(current.comfortPreferences, { ...preference, updatedAt: nowIso() })
    });
  },
  upsertBrandGuide: async (brand, guide) => {
    const current = get().state;
    if (!current) return;
    await get().persist({
      ...current,
      brands: upsertById(current.brands, brand),
      brandSizeGuides: upsertById(current.brandSizeGuides, guide)
    });
  },
  addRecommendationRun: async (run) => {
    const current = get().state;
    if (!current) return;
    await get().persist({ ...current, recommendationRuns: [run, ...current.recommendationRuns].slice(0, 100) });
  },
  addImportJob: async (job) => {
    const current = get().state;
    if (!current) return;
    await get().persist({ ...current, importJobs: [job, ...current.importJobs].slice(0, 100) });
  }
}));

export function useLoadedStudioState() {
  const { state, loading, error } = useStudioStore();
  return { state, loading, error };
}
