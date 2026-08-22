"use client";

import { useRouter } from "next/navigation";
import { FolderKanban } from "lucide-react";
import { CreateProjectForm } from "@/components/CreateProjectForm";
import { EmptyState } from "@/components/EmptyState";
import { Logo } from "@/components/Logo";
import { ProjectCard } from "@/components/ProjectCard";
import { useProjects } from "@/lib/storage/useProjects";

export default function DashboardPage() {
  const { projects, createProject } = useProjects();
  const router = useRouter();

  function handleCreate(name: string) {
    const project = createProject(name);
    router.push(`/proyecto/${project.id}`);
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <Logo />
        <p className="max-w-xl font-mono text-xs text-text-tertiary">
          De la evidencia a la decisión, sin perder el porqué.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h1 className="font-sans text-xl font-semibold text-text-primary">Tus proyectos</h1>
        <CreateProjectForm onCreate={handleCreate} />
      </section>

      <section>
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FolderKanban size={28} className="text-accent-magenta" />}
            title="Todavía no tenés proyectos"
            description="Creá tu primer proyecto para empezar a analizar investigación en la etapa de Empatizar."
          />
        )}
      </section>
    </main>
  );
}
