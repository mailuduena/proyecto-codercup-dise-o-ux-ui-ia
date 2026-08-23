"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Project } from "@/lib/types";
import { localProjectRepository, subscribeToProjects } from "./projects";

function getSnapshot(): Project[] {
  return localProjectRepository.list();
}

function getServerSnapshot(): Project[] {
  return localProjectRepository.list();
}

/**
 * Lista de proyectos para el dashboard, sincronizada con localStorage vía
 * useSyncExternalStore. Notifica inmediatamente cuando se crea un proyecto.
 */
export function useProjects() {
  const projects = useSyncExternalStore(subscribeToProjects, getSnapshot, getServerSnapshot);

  const createProject = useCallback((name: string) => {
    return localProjectRepository.create(name);
  }, []);

  return { projects, createProject };
}

/**
 * Proyecto individual para el shell. Retorna el proyecto encontrado o null.
 */
export function useProject(projectId: string): Project | null {
  const projects = useSyncExternalStore(subscribeToProjects, getSnapshot, getServerSnapshot);
  return projects.find((p) => p.id === projectId) ?? null;
}

