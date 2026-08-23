"use client";

import { useState } from "react";
import {
  FileText,
  Sparkles,
  Layers,
  Inbox,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { EmptyState } from "./EmptyState";
import { ResearchSourceForm } from "./ResearchSourceForm";
import { ResearchSourceList } from "./ResearchSourceList";
import { PatternCard } from "./PatternCard";
import { ValidationBanner } from "./ValidationBanner";
import { EditAnalysisModal } from "./EditAnalysisModal";
import { AnalysisSections } from "./AnalysisSections";
import { VersionHistoryNav } from "./VersionHistoryNav";
import { useResearchSources } from "@/lib/storage/useSources";
import { useAnalysis } from "@/lib/storage/useAnalysis";
import { mapApiAnalysisToResult } from "@/lib/storage/analysisMapper";
import type { AnalysisResult } from "@/lib/types";

interface EmpathizeWorkspaceProps {
  projectId: string;
  onContinueToDefine?: () => void;
}

export function EmpathizeWorkspace({
  projectId,
  onContinueToDefine,
}: EmpathizeWorkspaceProps) {
  const { sources, addSource, removeSource } = useResearchSources(projectId);
  const {
    analyses,
    activeValidAnalysis,
    latestAnalysis,
    isValidated,
    saveAnalysis,
    setStatus,
    createNextVersion,
  } = useAnalysis(projectId);

  // Estado para la versión actualmente visualizada en pantalla
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);

  // Estados de UI para ejecución y edición
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasSources = sources.length > 0;

  // Derivar la versión activa: si la seleccionada existe en el proyecto usarla, sino usar la vigente activa
  const activeAnalysis: AnalysisResult | null =
    (selectedAnalysisId && analyses.find((a) => a.id === selectedAnalysisId)) ||
    activeValidAnalysis ||
    latestAnalysis ||
    null;

  // Ejecutar el primer análisis
  async function handleAnalyze() {
    if (!hasSources || isAnalyzing) return;
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const payloadSources = sources.map((s) => ({
        id: s.id,
        content: s.content,
      }));

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources: payloadSources }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al comunicarse con el motor de IA.");
      }

      const { data } = await res.json();
      const newAnalysis = mapApiAnalysisToResult(
        data,
        projectId,
        sources.map((s) => s.id),
        1,
        null,
        null
      );

      saveAnalysis(newAnalysis);
      setSelectedAnalysisId(newAnalysis.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error inesperado al analizar.";
      setErrorMessage(msg);
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Aceptar el análisis actual
  function handleAccept() {
    if (!activeAnalysis) return;
    setStatus(activeAnalysis.id, "validado");
  }

  // Descartar el análisis actual (no elimina el historial)
  function handleDiscard() {
    if (!activeAnalysis) return;
    setStatus(activeAnalysis.id, "descartado");
  }

  // Continuar a la etapa siguiente (Definir)
  function handleContinueToDefine() {
    if (onContinueToDefine) {
      onContinueToDefine();
    } else {
      const defineNavElem = document.getElementById("stage-nav-list");
      if (defineNavElem) {
        defineNavElem.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  // Abrir modal de edición
  function handleOpenEdit() {
    setIsEditModalOpen(true);
  }

  // Ejecutar regeneración con corrección profesional -> crea versión N+1 en estado pendiente
  async function handleRegenerateWithFeedback(feedback: string) {
    if (!activeAnalysis || isRegenerating) return;
    setIsRegenerating(true);
    setErrorMessage(null);

    try {
      const payloadSources = sources.map((s) => ({
        id: s.id,
        content: s.content,
      }));

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sources: payloadSources,
          previousAnalysis: activeAnalysis,
          professionalFeedback: feedback,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al regenerar el análisis.");
      }

      const { data } = await res.json();
      const mappedNext = mapApiAnalysisToResult(
        data,
        projectId,
        sources.map((s) => s.id),
        activeAnalysis.version + 1,
        activeAnalysis.id,
        feedback
      );

      createNextVersion(activeAnalysis, {
        sourceIds: mappedNext.sourceIds,
        resumenInvestigacion: mappedNext.resumenInvestigacion,
        patrones: mappedNext.patrones,
        observacionesAisladas: mappedNext.observacionesAisladas,
        contradicciones: mappedNext.contradicciones,
        preguntasAbiertas: mappedNext.preguntasAbiertas,
        advertenciasMetodologicas: mappedNext.advertenciasMetodologicas,
        correccionProfesional: feedback,
      });

      // Seleccionar automáticamente la nueva versión generada
      setSelectedAnalysisId(mappedNext.id);
      setIsEditModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al procesar la nueva versión.";
      setErrorMessage(msg);
    } finally {
      setIsRegenerating(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Sección 1: Fuentes de información */}
      <section
        id="section-research-sources"
        className="rounded-2xl border border-border-subtle bg-surface-raised p-6"
      >
        <div className="flex items-center gap-2 text-accent-magenta">
          <FileText size={16} />
          <p className="font-mono text-xs uppercase tracking-wide">Sección 1</p>
        </div>
        <h2 className="mt-2 font-sans text-base font-semibold text-text-primary">
          Fuentes de información
        </h2>
        <p className="mt-1 max-w-lg text-sm text-text-secondary font-sans">
          Pegá entrevistas, encuestas abiertas, notas de research o feedback. Cada fuente queda
          guardada por separado para poder rastrear después de dónde salió cada evidencia.
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

      {/* Sección 2: Análisis generado por IA */}
      <section
        id="section-ai-analysis"
        className="rounded-2xl border border-border-subtle bg-surface-raised p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border-subtle pb-6">
          <div>
            <div className="flex items-center gap-2 text-accent-violet">
              <Sparkles size={16} />
              <p className="font-mono text-xs uppercase tracking-wide">Sección 2</p>
            </div>
            <h2 className="mt-2 font-sans text-base font-semibold text-text-primary">
              Análisis generado por IA
            </h2>
            <p className="mt-1 max-w-lg text-sm text-text-secondary font-sans">
              La IA identifica patrones respaldados por evidencia, observaciones aisladas y advertencias.
              El profesional valida, edita o descarta cada entrega.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isValidated ? (
              <div
                id="status-stage-validated"
                className="inline-flex items-center gap-1.5 rounded-xl border border-state-validated/40 bg-state-validated/10 px-3.5 py-2 font-sans text-xs font-semibold text-state-validated"
              >
                <ShieldCheck size={15} />
                <span>Etapa validada</span>
              </div>
            ) : (
              <button
                id="btn-analyze-ai"
                type="button"
                disabled={!hasSources || isAnalyzing || isRegenerating}
                onClick={handleAnalyze}
                className={[
                  "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-sans text-sm font-semibold transition-all",
                  hasSources && !isAnalyzing
                    ? "bg-accent-magenta text-surface-base hover:bg-accent-magenta-hover active:scale-[0.98] shadow-lg shadow-accent-magenta/10"
                    : "border border-border-strong bg-surface-overlay text-text-tertiary cursor-not-allowed",
                ].join(" ")}
              >
                {isAnalyzing ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-surface-base border-t-transparent" />
                    Analizando evidencia...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    {analyses.length > 0 ? "Re-analizar investigación" : "Analizar con IA"}
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mensajes de error en caso de fallo */}
        {errorMessage && (
          <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-state-error/40 bg-state-error/10 p-3.5 text-xs text-state-error">
            <AlertCircle size={16} className="shrink-0" />
            <p className="font-sans">{errorMessage}</p>
          </div>
        )}

        {/* Estado: Sin análisis previo */}
        {!activeAnalysis && !isAnalyzing && (
          <div className="mt-6">
            <EmptyState
              icon={<Layers size={24} className="text-text-tertiary" />}
              title="Aún no se ha ejecutado el análisis"
              description="Hacé clic en 'Analizar con IA' para que el motor procese tus fuentes de investigación."
            />
          </div>
        )}

        {/* Estado: Análisis activo disponible */}
        {activeAnalysis && (
          <div className="mt-6 flex flex-col gap-6">
            {/* Trazabilidad e historial de versiones */}
            <VersionHistoryNav
              analyses={analyses}
              selectedVersionId={activeAnalysis.id}
              onSelectVersion={(selected) => setSelectedAnalysisId(selected.id)}
            />

            {/* Banner de Validación Profesional (Aceptar / Editar / Descartar o Continuar a Definir) */}
            <ValidationBanner
              status={activeAnalysis.estadoValidacion}
              version={activeAnalysis.version}
              onAccept={handleAccept}
              onEdit={handleOpenEdit}
              onDiscard={handleDiscard}
              onContinueToDefine={handleContinueToDefine}
            />

            {/* Resumen objetivo de la investigación */}
            <div className="rounded-xl border border-border-subtle bg-surface-base/80 p-4">
              <p className="font-mono text-xs uppercase tracking-wide text-accent-magenta">
                Síntesis de investigación
              </p>
              <p className="mt-1 font-sans text-sm leading-relaxed text-text-primary">
                {activeAnalysis.resumenInvestigacion}
              </p>
            </div>

            {/* Grilla de Patrones Recurrentes */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-accent-magenta" />
                  <h3 className="font-sans text-sm font-semibold text-text-primary">
                    Patrones recurrentes identificados ({activeAnalysis.patrones.length})
                  </h3>
                </div>
                <span className="font-mono text-[11px] text-text-tertiary">
                  Mínimo 2 evidencias por patrón
                </span>
              </div>

              {activeAnalysis.patrones.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {activeAnalysis.patrones.map((pattern, idx) => (
                    <PatternCard key={pattern.id} pattern={pattern} index={idx} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-border-subtle bg-surface-base p-6 text-center">
                  <p className="font-mono text-xs text-text-tertiary">
                    No se identificaron patrones recurrentes con 2 o más evidencias directas.
                    Revisá las observaciones aisladas a continuación.
                  </p>
                </div>
              )}
            </div>

            {/* Secciones complementarias (Observaciones aisladas, contradicciones, preguntas, advertencias) */}
            <AnalysisSections
              observacionesAisladas={activeAnalysis.observacionesAisladas}
              contradicciones={activeAnalysis.contradicciones}
              preguntasAbiertas={activeAnalysis.preguntasAbiertas}
              advertenciasMetodologicas={activeAnalysis.advertenciasMetodologicas}
            />
          </div>
        )}
      </section>

      {/* Modal para ingresar la corrección profesional y generar nueva versión */}
      {activeAnalysis && (
        <EditAnalysisModal
          isOpen={isEditModalOpen}
          currentVersion={activeAnalysis.version}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleRegenerateWithFeedback}
          isLoading={isRegenerating}
        />
      )}
    </div>
  );
}
