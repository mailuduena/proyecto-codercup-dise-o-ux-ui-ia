import type { PrototypeResult, ValidationStatus } from "@/lib/types";

const STORAGE_KEY = "codercup:prototype_results";

export interface PrototypeRepository {
  listAll(): PrototypeResult[];
  getByProject(projectId: string): PrototypeResult | null;
  save(result: PrototypeResult): void;
  updateStatus(projectId: string, status: ValidationStatus): PrototypeResult | null;
  removeByProject(projectId: string): void;
}

const EMPTY_RESULTS: PrototypeResult[] = [];
let cache: PrototypeResult[] = EMPTY_RESULTS;
let hasLoadedFromStorage = false;
const listeners = new Set<() => void>();

function ensureLoaded(): void {
  if (hasLoadedFromStorage) return;
  hasLoadedFromStorage = true;
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      cache = parsed as PrototypeResult[];
    }
  } catch (err) {
    console.warn("No se pudo leer localStorage para prototype_results:", err);
  }
}

function setCache(results: PrototypeResult[]): void {
  hasLoadedFromStorage = true;
  cache = results;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    } catch (err) {
      console.warn("No se pudo escribir en localStorage para prototype_results:", err);
    }
  }
  notify();
}

function notify(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error("Error en listener de prototype_results:", err);
    }
  });
}

export const localPrototypeRepository: PrototypeRepository = {
  listAll(): PrototypeResult[] {
    ensureLoaded();
    return cache;
  },

  getByProject(projectId: string): PrototypeResult | null {
    ensureLoaded();
    return cache.find((r) => r.projectId === projectId) || null;
  },

  save(result: PrototypeResult): void {
    ensureLoaded();
    const existingIndex = cache.findIndex((r) => r.projectId === result.projectId);
    if (existingIndex >= 0) {
      const next = [...cache];
      next[existingIndex] = result;
      setCache(next);
    } else {
      setCache([...cache, result]);
    }
  },

  updateStatus(projectId: string, status: ValidationStatus): PrototypeResult | null {
    ensureLoaded();
    const existingIndex = cache.findIndex((r) => r.projectId === projectId);
    if (existingIndex === -1) return null;

    const current = cache[existingIndex];
    const updated: PrototypeResult = {
      ...current,
      estadoValidacion: status,
    };

    const next = [...cache];
    next[existingIndex] = updated;
    setCache(next);
    return updated;
  },

  removeByProject(projectId: string): void {
    ensureLoaded();
    setCache(cache.filter((r) => r.projectId !== projectId));
  },
};

export function subscribePrototypeResults(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
