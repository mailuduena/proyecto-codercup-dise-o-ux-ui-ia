import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getStage } from "@/lib/stages";
import type { Project } from "@/lib/types";

export function ProjectCard({ project }: { project: Project }) {
  const stage = getStage(project.currentStage);
  const createdLabel = new Date(project.createdAt).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <Link
      href={`/proyecto/${project.id}`}
      className="group flex flex-col justify-between rounded-2xl border border-border-subtle bg-surface-raised p-5 transition-colors hover:border-accent-magenta/40"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-sans text-base font-semibold text-text-primary">{project.name}</h3>
        <ArrowUpRight
          size={16}
          className="mt-0.5 shrink-0 text-text-tertiary transition-colors group-hover:text-accent-magenta"
        />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-magenta/30 bg-accent-magenta/10 px-2.5 py-1 font-mono text-[11px] text-accent-magenta">
          {stage.label}
        </span>
        <span className="font-mono text-[11px] text-text-tertiary">{createdLabel}</span>
      </div>
    </Link>
  );
}
