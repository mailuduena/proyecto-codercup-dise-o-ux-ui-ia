import Link from "next/link";
import { ArrowLeft, FolderKanban } from "lucide-react";
import { Logo } from "./Logo";
import { StageNavList } from "./StageNavList";
import type { Project, StageId } from "@/lib/types";

interface SidebarProps {
  project: Project;
  currentStage: StageId;
  onSelectStage?: (stageId: StageId) => void;
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  project,
  currentStage,
  onSelectStage,
  isOpenOnMobile = false,
  onCloseMobile,
}: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpenOnMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] shrink-0 flex-col border-r border-border-subtle bg-surface-raised px-4 py-6 transition-transform duration-200 ease-in-out md:static md:w-64 md:translate-x-0 ${
          isOpenOnMobile ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <Logo />
          </div>

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

        <div className="mt-6 flex-1 overflow-y-auto">
          <p className="mb-2.5 font-mono text-[11px] uppercase tracking-wide text-text-tertiary">
            Etapas del proceso
          </p>
          <StageNavList
            projectId={project.id}
            currentStage={currentStage}
            onSelectStage={(stageId) => {
              onSelectStage?.(stageId);
              onCloseMobile?.();
            }}
          />
        </div>
      </aside>
    </>
  );
}
