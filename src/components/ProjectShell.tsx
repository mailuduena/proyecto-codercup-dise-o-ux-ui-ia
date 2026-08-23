"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { getStage } from "@/lib/stages";
import { useProject } from "@/lib/storage/useProjects";
import type { StageId } from "@/lib/types";
import { Sidebar } from "./Sidebar";
import { StageStepper } from "./StageStepper";
import { EmpathizeWorkspace } from "./EmpathizeWorkspace";
import { DefineWorkspace } from "./DefineWorkspace";
import { IdeateWorkspace } from "./IdeateWorkspace";
import { PrototypeWorkspace } from "./PrototypeWorkspace";
import { TestWorkspace } from "./TestWorkspace";

interface ProjectShellProps {
  projectId: string;
}

export function ProjectShell({ projectId }: ProjectShellProps) {
  const project = useProject(projectId);
  const [currentStage, setCurrentStage] = useState<StageId>("empatizar");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const stage = getStage(currentStage);

  return (
    <div className="flex min-h-screen flex-1 bg-surface-base text-text-primary">
      <Sidebar
        project={project}
        currentStage={currentStage}
        onSelectStage={(stageId) => setCurrentStage(stageId)}
        isOpenOnMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle bg-surface-base/80 px-4 py-3.5 sm:px-6 md:px-8 md:py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Abrir etapas del proyecto"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-strong bg-surface-raised text-text-secondary transition-colors hover:text-text-primary md:hidden"
            >
              <Menu size={18} />
            </button>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary sm:text-[11px]">
                Etapa actual
              </p>
              <h1 className="font-sans text-base font-semibold text-text-primary sm:text-lg">
                {stage.label}
              </h1>
            </div>
          </div>
          <StageStepper
            projectId={project.id}
            currentStage={currentStage}
            onSelectStage={(stageId) => setCurrentStage(stageId)}
          />
        </header>
        <div className="flex-1 px-4 py-6 sm:px-6 md:px-8 md:py-8">
          {currentStage === "empatizar" && (
            <EmpathizeWorkspace
              projectId={project.id}
              onContinueToDefine={() => setCurrentStage("definir")}
            />
          )}
          {currentStage === "definir" && (
            <DefineWorkspace
              projectId={project.id}
              onContinueToIdeate={() => setCurrentStage("idear")}
            />
          )}
          {currentStage === "idear" && (
            <IdeateWorkspace
              projectId={project.id}
              onContinueToPrototype={() => setCurrentStage("prototipar")}
            />
          )}
          {currentStage === "prototipar" && (
            <PrototypeWorkspace
              projectId={project.id}
              onContinueToTest={() => setCurrentStage("testear")}
            />
          )}
          {currentStage === "testear" && (
            <TestWorkspace projectId={project.id} />
          )}
        </div>
      </div>
    </div>
  );
}
