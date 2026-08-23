import { generateId } from "@/lib/id";
import type { ResearchSource } from "@/lib/types";

const STORAGE_KEY = "codercup:sources";

/**
 * Contrato de persistencia de fuentes de investigación. Igual que con
 * Project, localStorage hoy, Supabase/Postgres el día de mañana sin
 * tocar componentes.
 */
export interface ResearchSourceRepository {
  listAll(): ResearchSource[];
  listByProject(projectId: string): ResearchSource[];
  add(projectId: string, content: string): ResearchSource;
  remove(sourceId: string): void;
}

const EMPTY_SOURCES: ResearchSource[] = [];
let cache: ResearchSource[] = EMPTY_SOURCES;
let hasLoadedFromStorage = false;
const listeners = new Set<() => void>();

function sortByOldest(sources: ResearchSource[]): ResearchSource[] {
  // La primera fuente agregada aparece primera: mantiene estable la
  // numeración "Fuente 1", "Fuente 2" que se usa para trazabilidad.
  return [...sources].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

function ensureLoaded(): void {
  if (hasLoadedFromStorage) return;
  hasLoadedFromStorage = true;
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      cache = sortByOldest(parsed as ResearchSource[]);
    }
  } catch (err) {
    console.warn("No se pudo leer localStorage para sources:", err);
  }
}

function getCache(): ResearchSource[] {
  return cache;
}

function setCache(sources: ResearchSource[]): void {
  hasLoadedFromStorage = true;
  cache = sources;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
    } catch (err) {
      console.warn("No se pudo escribir en localStorage para sources:", err);
    }
  }
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error("Error en listener de sources:", err);
    }
  });
}

export const localResearchSourceRepository: ResearchSourceRepository = {
  listAll() {
    return getCache();
  },

  listByProject(projectId) {
    return getCache().filter((source) => source.projectId === projectId);
  },

  add(projectId, content) {
    const source: ResearchSource = {
      id: generateId("src"),
      projectId,
      content: content.trim(),
      sourceType: "texto",
      createdAt: new Date().toISOString(),
    };
    setCache(sortByOldest([...getCache(), source]));
    return source;
  },

  remove(sourceId) {
    setCache(getCache().filter((source) => source.id !== sourceId));
  },
};

export function subscribeToSources(listener: () => void): () => void {
  listeners.add(listener);
  if (!hasLoadedFromStorage && typeof window !== "undefined") {
    ensureLoaded();
    if (cache.length > 0) {
      listener();
    }
  }
  return () => listeners.delete(listener);
}
