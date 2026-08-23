import type { IdeateResult, ValidationStatus } from "@/lib/types";

const STORAGE_KEY = "codercup:ideate_results";

export interface IdeateRepository {
  listAll(): IdeateResult[];
  getByProject(projectId: string): IdeateResult | null;
  save(result: IdeateResult): void;
  updateStatus(projectId: string, status: ValidationStatus): IdeateResult | null;
  removeByProject(projectId: string): void;
}

const EMPTY_RESULTS: IdeateResult[] = [];
let cache: IdeateResult[] = EMPTY_RESULTS;
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
      cache = parsed as IdeateResult[];
    }
  } catch (err) {
    console.warn("No se pudo leer localStorage para ideate_results:", err);
  }
}

function setCache(results: IdeateResult[]): void {
  hasLoadedFromStorage = true;
  cache = results;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    } catch (err) {
      console.warn("No se pudo escribir en localStorage para ideate_results:", err);
    }
  }
  notify();
}

function notify(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error("Error en listener de ideate_results:", err);
    }
  });
}

export const localIdeateRepository: IdeateRepository = {
  listAll(): IdeateResult[] {
    ensureLoaded();
    return cache;
  },

  getByProject(projectId: string): IdeateResult | null {
    ensureLoaded();
    return cache.find((r) => r.projectId === projectId) || null;
  },

  save(result: IdeateResult): void {
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

  updateStatus(projectId: string, status: ValidationStatus): IdeateResult | null {
    ensureLoaded();
    const existingIndex = cache.findIndex((r) => r.projectId === projectId);
    if (existingIndex === -1) return null;

    const current = cache[existingIndex];
    const updated: IdeateResult = {
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

export function subscribeIdeateResults(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
