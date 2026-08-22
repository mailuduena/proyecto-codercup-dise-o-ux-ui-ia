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

// Cache en memoria: mantiene una referencia estable entre renders para
// que useSyncExternalStore no dispare un loop (getSnapshot debe devolver
// la misma referencia si los datos no cambiaron).
let cache: Project[] | null = null;
const listeners = new Set<() => void>();

function sortByNewest(projects: Project[]): Project[] {
  return [...projects].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function readFromStorage(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? sortByNewest(parsed as Project[]) : [];
  } catch {
    // localStorage corrupto o inaccesible: degradamos a "sin proyectos"
    // en vez de romper la app.
    return [];
  }
}

function getCache(): Project[] {
  if (cache === null) {
    cache = readFromStorage();
  }
  return cache;
}

function setCache(projects: Project[]): void {
  cache = projects;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }
  listeners.forEach((listener) => listener());
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
  return () => listeners.delete(listener);
}
