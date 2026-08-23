import { Trash2, FileText, Calendar } from "lucide-react";
import type { ResearchSource } from "@/lib/types";

interface ResearchSourceListProps {
  sources: ResearchSource[];
  onRemove: (sourceId: string) => void;
}

export function ResearchSourceList({ sources, onRemove }: ResearchSourceListProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-sans text-sm font-semibold text-text-primary">
          Fuentes cargadas ({sources.length})
        </h3>
      </div>

      <div className="flex flex-col gap-2.5">
        {sources.map((source, index) => {
          const date = new Date(source.createdAt).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
          });

          return (
            <div
              key={source.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-border-subtle bg-surface-base p-4 transition-colors hover:border-border-strong"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <FileText size={15} className="shrink-0 text-accent-magenta" />
                  <span className="font-sans text-sm font-semibold text-text-primary">
                    Fuente {index + 1}
                  </span>
                  <span className="rounded-md bg-surface-overlay px-2 py-0.5 font-mono text-[10px] text-text-secondary">
                    {source.id}
                  </span>
                </div>

                <p className="line-clamp-2 font-sans text-xs text-text-secondary">
                  {source.content}
                </p>

                <div className="flex items-center gap-1 font-mono text-[10px] text-text-tertiary">
                  <Calendar size={11} />
                  <span>{date}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onRemove(source.id)}
                title="Eliminar fuente"
                className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-state-error-subtle hover:text-state-error"
              >
                <Trash2 size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
