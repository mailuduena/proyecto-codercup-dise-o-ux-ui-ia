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

let cache: ResearchSource[] | null = null;
const listeners = new Set<() => void>();

function sortByOldest(sources: ResearchSource[]): ResearchSource[] {
  // La primera fuente agregada aparece primera: mantiene estable la
  // numeración "Fuente 1", "Fuente 2" que se usa para trazabilidad.
  return [...sources].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

function readFromStorage(): ResearchSource[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? sortByOldest(parsed as ResearchSource[]) : [];
  } catch {
    return [];
  }
}

function getCache(): ResearchSource[] {
  if (cache === null) {
    cache = readFromStorage();
  }
  return cache;
}

function setCache(sources: ResearchSource[]): void {
  cache = sources;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
  }
  listeners.forEach((listener) => listener());
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
  return () => listeners.delete(listener);
}
