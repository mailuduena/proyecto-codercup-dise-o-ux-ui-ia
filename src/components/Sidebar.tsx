import Link from "next/link";
import { ArrowLeft, FolderKanban } from "lucide-react";
import { Logo } from "./Logo";
import { StageNavList } from "./StageNavList";
import type { Project, StageId } from "@/lib/types";

interface SidebarProps {
  project: Project;
  currentStage: StageId;
  onSelectStage?: (stageId: StageId) => void;
}

export function Sidebar({ project, currentStage, onSelectStage }: SidebarProps) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border-subtle bg-surface-raised px-4 py-6">
      <div className="flex flex-col gap-5">
        <Logo />

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-surface-base px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-overlay hover:text-text-primary"
        >
          <ArrowLeft size={14} />
          <span>Volver a proyectos</span>
        </Link>

        <div className="rounded-xl border border-border-subtle bg-surface-base p-3">
          <div className="flex items-center gap-2 text-accent-magenta">
            <FolderKanban size={15} />
            <p className="font-mono text-[11px] uppercase tracking-wide">Proyecto</p>
          </div>
          <h2 className="mt-1 font-sans text-sm font-semibold text-text-primary truncate">
            {project.name}
          </h2>
        </div>
      </div>

      <div className="mt-6 flex-1">
        <p className="mb-2.5 font-mono text-[11px] uppercase tracking-wide text-text-tertiary">
          Etapas del proceso
        </p>
        <StageNavList
          projectId={project.id}
          currentStage={currentStage}
          onSelectStage={onSelectStage}
        />
      </div>
    </aside>
  );
}
