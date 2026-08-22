"use client";

import { Trash2 } from "lucide-react";
import type { ResearchSource } from "@/lib/types";

interface ResearchSourceListProps {
  sources: ResearchSource[];
  onRemove: (sourceId: string) => void;
}

export function ResearchSourceList({ sources, onRemove }: ResearchSourceListProps) {
  return (
    <ul className="flex flex-col gap-2">
      {sources.map((source, index) => (
        <li
          key={source.id}
          className="group flex min-w-0 items-start justify-between gap-3 rounded-xl border border-border-subtle bg-surface-base px-3.5 py-3"
        >
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <span className="mt-0.5 shrink-0 rounded-full border border-border-strong px-2 py-0.5 font-mono text-[11px] text-text-tertiary">
              Fuente {index + 1}
            </span>
            <p className="min-w-0 flex-1 truncate font-mono text-xs text-text-secondary">
              {source.content}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(source.id)}
            aria-label={`Eliminar fuente ${index + 1}`}
            title="Eliminar fuente"
            className="shrink-0 rounded-lg p-1.5 text-text-tertiary opacity-0 transition-opacity hover:bg-surface-overlay hover:text-state-error group-hover:opacity-100 focus-visible:opacity-100"
          >
            <Trash2 size={14} />
          </button>
        </li>
      ))}
    </ul>
  );
}
