import { invoke } from "@tauri-apps/api/core";
import { createDefaultAppState, validateState, type AppState } from "@/services/persistence/appState";
import { safeJsonParse } from "@/lib/utils";

const storageKey = "size-intelligence-studio.state.v1";

function isTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function loadAppState(): Promise<AppState> {
  if (isTauriRuntime()) {
    const response = await invoke<unknown>("load_app_state");
    if (!response || (typeof response === "object" && Object.keys(response).length === 0)) return createDefaultAppState();
    return validateState(response);
  }
  const raw = localStorage.getItem(storageKey);
  if (!raw) return createDefaultAppState();
  const parsed = safeJsonParse<unknown>(raw, null);
  if (!parsed) return createDefaultAppState();
  return validateState(parsed);
}

export async function saveAppState(state: AppState): Promise<void> {
  const validated = validateState(state);
  if (isTauriRuntime()) {
    await invoke("save_app_state", { state: validated });
    return;
  }
  localStorage.setItem(storageKey, JSON.stringify(validated));
}

export function resetBrowserState() {
  localStorage.removeItem(storageKey);
}
