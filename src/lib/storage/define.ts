import type { DefineResult, ValidationStatus } from "@/lib/types";

const STORAGE_KEY = "codercup:define_results";

export interface DefineRepository {
  listAll(): DefineResult[];
  getByProject(projectId: string): DefineResult | null;
  save(result: DefineResult): void;
  updateStatus(projectId: string, status: ValidationStatus): DefineResult | null;
  removeByProject(projectId: string): void;
}

const EMPTY_RESULTS: DefineResult[] = [];
let cache: DefineResult[] = EMPTY_RESULTS;
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
      cache = parsed as DefineResult[];
    }
  } catch (err) {
    console.warn("No se pudo leer localStorage para define_results:", err);
  }
}

function setCache(results: DefineResult[]): void {
  hasLoadedFromStorage = true;
  cache = results;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    } catch (err) {
      console.warn("No se pudo escribir en localStorage para define_results:", err);
    }
  }
  notify();
}

function notify(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error("Error en listener de define_results:", err);
    }
  });
}

export const localDefineRepository: DefineRepository = {
  listAll(): DefineResult[] {
    ensureLoaded();
    return cache;
  },

  getByProject(projectId: string): DefineResult | null {
    ensureLoaded();
    return cache.find((r) => r.projectId === projectId) || null;
  },

  save(result: DefineResult): void {
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

  updateStatus(projectId: string, status: ValidationStatus): DefineResult | null {
    ensureLoaded();
    const existingIndex = cache.findIndex((r) => r.projectId === projectId);
    if (existingIndex === -1) return null;

    const current = cache[existingIndex];
    const updated: DefineResult = {
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

export function subscribeDefineResults(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
