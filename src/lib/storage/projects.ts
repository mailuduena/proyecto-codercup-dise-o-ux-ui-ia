import { generateId } from "@/lib/id";
import type { Project, StageId } from "@/lib/types";

const STORAGE_KEY = "codercup:projects";
const INITIAL_STAGE: StageId = "empatizar";

/**
 * Contrato de persistencia de proyectos. La implementación actual usa
 * localStorage porque el MVP no tiene tiempo para levantar una base de
 * datos, pero cualquier componente que dependa de esta interfaz puede
 * seguir funcionando igual el día que la cambiemos por Supabase/Postgres.
 */
export interface ProjectRepository {
  list(): Project[];
  get(id: string): Project | undefined;
  create(name: string): Project;
}

const EMPTY_PROJECTS: Project[] = [];
let cache: Project[] = EMPTY_PROJECTS;
let hasLoadedFromStorage = false;
const listeners = new Set<() => void>();

function sortByNewest(projects: Project[]): Project[] {
  return [...projects].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
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
      cache = sortByNewest(parsed as Project[]);
    }
  } catch (err) {
    console.warn("No se pudo leer localStorage:", err);
  }
}

function getCache(): Project[] {
  return cache;
}

function setCache(projects: Project[]): void {
  hasLoadedFromStorage = true;
  cache = projects;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (err) {
      console.warn("No se pudo escribir en localStorage:", err);
    }
  }
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error("Error en listener de proyectos:", err);
    }
  });
}

export const localProjectRepository: ProjectRepository = {
  list() {
    return getCache();
  },

  get(id) {
    return getCache().find((project) => project.id === id);
  },

  create(name) {
    const project: Project = {
      id: generateId("proj"),
      name: name.trim(),
      createdAt: new Date().toISOString(),
      currentStage: INITIAL_STAGE,
    };
    setCache(sortByNewest([...getCache(), project]));
    return project;
  },
};

/** Permite a los hooks de React re-renderizar cuando cambian los proyectos. */
export function subscribeToProjects(listener: () => void): () => void {
  listeners.add(listener);
  // Cargar de storage en el cliente después de que React haya montado
  if (!hasLoadedFromStorage && typeof window !== "undefined") {
    ensureLoaded();
    if (cache.length > 0) {
      listener();
    }
  }
  return () => listeners.delete(listener);
}
