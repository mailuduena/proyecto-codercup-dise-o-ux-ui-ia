"use client";

import { FileText, Inbox, Sparkles } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { ResearchSourceForm } from "./ResearchSourceForm";
import { ResearchSourceList } from "./ResearchSourceList";
import { useResearchSources } from "@/lib/storage/useSources";

export function EmpathizeWorkspace({ projectId }: { projectId: string }) {
  const { sources, addSource, removeSource } = useResearchSources(projectId);
  const hasSources = sources.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Sección 1: Fuentes de información */}
      <section className="rounded-2xl border border-border-subtle bg-surface-raised p-6">
        <div className="flex items-center gap-2 text-accent-magenta">
          <FileText size={16} />
          <p className="font-mono text-xs uppercase tracking-wide">Sección 1</p>
        </div>
        <h2 className="mt-2 font-sans text-base font-semibold text-text-primary">
          Fuentes de información
        </h2>
        <p className="mt-1 max-w-lg text-sm text-text-secondary">
          Pegá entrevistas, encuestas abiertas, notas de research o feedback. Cada fuente queda
          guardada por separado para poder rastrear después de dónde salió cada patrón.
        </p>

        <div className="mt-5">
          <ResearchSourceForm onAdd={addSource} />
        </div>

        <div className="mt-5">
          {hasSources ? (
            <ResearchSourceList sources={sources} onRemove={removeSource} />
          ) : (
            <EmptyState
              icon={<Inbox size={24} className="text-text-tertiary" />}
              title="Sin investigación todavía"
              description="Agregá al menos una fuente para poder analizarla con IA."
            />
          )}
        </div>
      </section>

      {/* Sección 2: Análisis generado por IA — se conecta en el próximo bloque */}
      <section className="rounded-2xl border border-border-subtle bg-surface-raised p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-accent-violet">
              <Sparkles size={16} />
              <p className="font-mono text-xs uppercase tracking-wide">
                Sección 2 · próximo bloque
              </p>
            </div>
            <h2 className="mt-2 font-sans text-base font-semibold text-text-primary">
              Análisis generado por IA
            </h2>
            <p className="mt-1 max-w-lg text-sm text-text-secondary">
              Los patrones, la evidencia y el ciclo de validación profesional (Aceptar / Editar /
              Descartar) se conectan en el próximo bloque.
            </p>
          </div>
          <button
            type="button"
            disabled
            title="Se habilita en el próximo bloque"
            className="shrink-0 cursor-not-allowed rounded-xl border border-border-strong px-4 py-2.5 text-sm font-medium text-text-tertiary"
          >
            Analizar con IA
          </button>
        </div>
      </section>
    </div>
  );
}
