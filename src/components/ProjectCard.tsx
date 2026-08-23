import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const formattedDate = new Date(project.createdAt).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Link
      href={`/proyecto/${project.id}`}
      className="group flex flex-col justify-between rounded-2xl border border-border-subtle bg-surface-raised p-5 transition-all duration-200 hover:border-accent-magenta/50 hover:bg-surface-overlay"
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-sans text-base font-semibold text-text-primary group-hover:text-accent-magenta">
            {project.name}
          </h2>
          <ArrowRight
            size={16}
            className="text-text-tertiary transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-accent-magenta"
          />
        </div>
      </div>
      <div className="mt-6 flex items-center gap-1.5 text-xs text-text-tertiary">
        <Calendar size={12} />
        <span>Creado el {formattedDate}</span>
      </div>
    </Link>
  );
}
