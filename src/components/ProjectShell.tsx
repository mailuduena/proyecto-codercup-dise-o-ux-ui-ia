"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { getStage } from "@/lib/stages";
import { useProject } from "@/lib/storage/useProjects";
import { Sidebar } from "./Sidebar";
import { StageStepper } from "./StageStepper";

interface ProjectShellProps {
  projectId: string;
  children: ReactNode;
}

export function ProjectShell({ projectId, children }: ProjectShellProps) {
  const project = useProject(projectId);

  if (!project) {
    return (
      <div id="project-not-found" className="flex min-h-screen flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="font-sans text-lg font-semibold text-text-primary">
          No encontramos este proyecto
        </p>
        <p className="max-w-sm text-sm text-text-secondary">
          El enlace puede ser incorrecto, o el proyecto se creó en otro navegador (por ahora se
          guarda localmente).
        </p>
        <Link
          id="back-to-projects-link"
          href="/"
          className="mt-2 text-sm font-medium text-accent-magenta hover:underline"
        >
          Volver a proyectos
        </Link>
      </div>
    );
  }

  const stage = getStage(project.currentStage);

  return (
    <div className="flex min-h-screen flex-1">
      <Sidebar project={project} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle bg-surface-base/80 px-8 py-4 backdrop-blur">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-text-tertiary">
              Etapa actual
            </p>
            <h1 className="font-sans text-lg font-semibold text-text-primary">{stage.label}</h1>
          </div>
          <StageStepper projectId={project.id} currentStage={project.currentStage} />
        </header>
        <div className="flex-1 px-8 py-8">{children}</div>
      </div>
    </div>
  );
}
