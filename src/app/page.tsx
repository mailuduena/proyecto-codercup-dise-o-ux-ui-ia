"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderKanban } from "lucide-react";
import { CreateProjectForm } from "@/components/CreateProjectForm";
import { EmptyState } from "@/components/EmptyState";
import { Logo } from "@/components/Logo";
import { ProjectCard } from "@/components/ProjectCard";
import { useProjects } from "@/lib/storage/useProjects";

export default function DashboardPage() {
  const { projects, createProject } = useProjects();
  const [isCreating, setIsCreating] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const router = useRouter();

  function addDebug(msg: string) {
    setDebugLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);
  }

  function handleCreate(name: string) {
    try {
      addDebug("DEBUG 4: HANDLECREATE RECIBIDO");
      setIsCreating(true);
      const project = createProject(name);
      addDebug(`DEBUG 5: PROYECTO CREADO - ${project?.id || "SIN ID"}`);
      if (project?.id) {
        router.push(`/proyecto/${project.id}`);
      }
    } catch (error) {
      console.error("Error al crear proyecto:", error);
      addDebug(`ERROR EN HANDLECREATE: ${String(error)}`);
    } finally {
      setIsCreating(false);
    }
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
        <CreateProjectForm
          onCreate={handleCreate}
          isSubmitting={isCreating}
          onDebugLog={addDebug}
          debugLogs={debugLogs}
        />
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
