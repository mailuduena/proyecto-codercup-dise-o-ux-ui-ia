"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Project } from "@/lib/types";
import { localProjectRepository, subscribeToProjects } from "./projects";

const EMPTY_PROJECTS: Project[] = [];

function getSnapshot(): Project[] {
  return localProjectRepository.list();
}

function getServerSnapshot(): Project[] {
  return EMPTY_PROJECTS;
}

/**
 * Lista de proyectos para el dashboard, sincronizada con localStorage vía
 * useSyncExternalStore (evita el patrón effect+setState y el flash de
 * "cargando" que tendría un useEffect normal tras la hidratación).
 */
export function useProjects() {
  const projects = useSyncExternalStore(subscribeToProjects, getSnapshot, getServerSnapshot);

  const createProject = useCallback((name: string) => {
    return localProjectRepository.create(name);
  }, []);

  return { projects, createProject };
}

/** Proyecto individual para el shell. undefined = no existe (todavía) o no se cargó. */
export function useProject(projectId: string): Project | null {
  const projects = useSyncExternalStore(subscribeToProjects, getSnapshot, getServerSnapshot);
  return projects.find((project) => project.id === projectId) ?? null;
}
