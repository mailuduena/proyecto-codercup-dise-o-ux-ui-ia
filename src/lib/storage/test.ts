import type { TestResult, ValidationStatus } from "@/lib/types";

const STORAGE_KEY = "codercup:test_results";

export interface TestRepository {
  listAll(): TestResult[];
  getByProject(projectId: string): TestResult | null;
  save(result: TestResult): void;
  updateStatus(projectId: string, status: ValidationStatus): TestResult | null;
  removeByProject(projectId: string): void;
}

const EMPTY_RESULTS: TestResult[] = [];
let cache: TestResult[] = EMPTY_RESULTS;
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
      cache = parsed as TestResult[];
    }
  } catch (err) {
    console.warn("No se pudo leer localStorage para test_results:", err);
  }
}

function setCache(results: TestResult[]): void {
  hasLoadedFromStorage = true;
  cache = results;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    } catch (err) {
      console.warn("No se pudo escribir en localStorage para test_results:", err);
    }
  }
  notify();
}

function notify(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error("Error en listener de test_results:", err);
    }
  });
}

export const localTestRepository: TestRepository = {
  listAll(): TestResult[] {
    ensureLoaded();
    return cache;
  },

  getByProject(projectId: string): TestResult | null {
    ensureLoaded();
    return cache.find((r) => r.projectId === projectId) || null;
  },

  save(result: TestResult): void {
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

  updateStatus(projectId: string, status: ValidationStatus): TestResult | null {
    ensureLoaded();
    const existingIndex = cache.findIndex((r) => r.projectId === projectId);
    if (existingIndex === -1) return null;

    const current = cache[existingIndex];
    const updated: TestResult = {
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

export function subscribeTestResults(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
