import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "./Logo";
import { StageNavList } from "./StageNavList";
import type { Project } from "@/lib/types";

export function Sidebar({ project }: { project: Project }) {
  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col overflow-y-auto border-r border-border-subtle bg-surface-sunken px-4 py-5">
      <Logo />

      <Link
        href="/"
        className="mt-6 flex w-fit items-center gap-1.5 text-xs text-text-tertiary transition-colors hover:text-text-secondary"
      >
        <ArrowLeft size={13} />
        Todos los proyectos
      </Link>

      <div className="mt-4 rounded-xl border border-border-subtle bg-surface-raised px-3 py-3">
        <p className="font-mono text-[11px] uppercase tracking-wide text-text-tertiary">
          Proyecto actual
        </p>
        <p className="mt-1 truncate font-sans text-sm font-semibold text-text-primary">
          {project.name}
        </p>
      </div>

      <p className="mb-2 mt-6 px-1 font-mono text-[11px] uppercase tracking-wide text-text-tertiary">
        Proceso de Design Thinking
      </p>
      <nav>
        <StageNavList projectId={project.id} currentStage={project.currentStage} />
      </nav>

      <div className="mt-auto pt-6">
        <div className="rounded-xl border border-border-subtle bg-surface-raised px-3 py-2.5">
          <p className="text-xs leading-snug text-text-secondary">
            <span className="font-medium text-accent-magenta">La IA propone.</span> Vos decidís en
            cada etapa.
          </p>
        </div>
      </div>
    </aside>
  );
}
