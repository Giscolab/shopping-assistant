import type { AppState } from "@/services/persistence/appState";
import { loadAppState, saveAppState } from "@/services/persistence/storage";

export interface AppStateRepository {
  load(): Promise<AppState>;
  save(state: AppState): Promise<void>;
}

export const appStateRepository: AppStateRepository = {
  load: loadAppState,
  save: saveAppState
};
