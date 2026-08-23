"use client";

import { useState } from "react";
import {
  Lightbulb,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Edit3,
  Trash2,
  HelpCircle,
  FileCheck,
  AlertCircle,
  TrendingUp,
  Zap,
  Target,
  ArrowRight,
} from "lucide-react";
import { generateId } from "@/lib/id";
import { useDefine } from "@/lib/storage/useDefine";
import { useIdeate } from "@/lib/storage/useIdeate";
import type { DesignIdea, IdeateResult, ImpactEffortLevel } from "@/lib/types";

interface IdeateWorkspaceProps {
  projectId: string;
  onContinueToPrototype?: () => void;
}

export function IdeateWorkspace({ projectId, onContinueToPrototype }: IdeateWorkspaceProps) {
  const { defineResult, isDefineValidated } = useDefine(projectId);
  const { ideateResult, isIdeateValidated, saveIdeateResult, setIdeateStatus } = useIdeate(projectId);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFeedback, setEditFeedback] = useState("");

  // Obtener estrictamente los problemas de Definir validados
  const validatedProblems = isDefineValidated && defineResult?.problemas ? defineResult.problemas : [];

  async function handleGenerateIdeas(feedback?: string) {
    if (validatedProblems.length === 0) {
      setError("No hay problemas de diseño validados en la etapa Definir.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/ideate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemasValidados: validatedProblems,
          feedbackProfesional: feedback,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo generar la propuesta de ideas con IA.");
      }

      const data = await response.json();
      if (!data.ideas || !Array.isArray(data.ideas) || data.ideas.length === 0) {
        throw new Error("La IA no devolvió ideas válidas.");
      }

      const formattedIdeas: DesignIdea[] = data.ideas.map(
        (idea: {
          titulo: string;
          descripcion: string;
          problemaOrigen: string;
          howMightWeOrigen: string;
          porQuePodriaAyudar: string;
          impactoEstimado: ImpactEffortLevel;
          esfuerzoEstimado: ImpactEffortLevel;
        }) => ({
          id: generateId("idea"),
          titulo: idea.titulo,
          descripcion: idea.descripcion,
          problemaOrigen: idea.problemaOrigen,
          howMightWeOrigen: idea.howMightWeOrigen,
          porQuePodriaAyudar: idea.porQuePodriaAyudar,
          impactoEstimado: idea.impactoEstimado || "Medio",
          esfuerzoEstimado: idea.esfuerzoEstimado || "Medio",
        })
      );

      const newResult: IdeateResult = {
        id: ideateResult?.id || generateId("ideat"),
        projectId,
        ideas: formattedIdeas,
        estadoValidacion: "pendiente",
        createdAt: new Date().toISOString(),
      };

      saveIdeateResult(newResult);
    } catch (err: unknown) {
      console.error("Error al generar ideas:", err);
      setError(err instanceof Error ? err.message : "Error al procesar la etapa Idear.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleAccept() {
    setIdeateStatus("validado");
  }

  function handleDiscard() {
    setIdeateStatus("descartado");
  }

  function handleOpenEdit() {
    setEditFeedback("");
    setIsEditModalOpen(true);
  }

  function handleApplyEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editFeedback.trim() || isGenerating) return;
    setIsEditModalOpen(false);
    handleGenerateIdeas(editFeedback.trim());
  }

  function getImpactBadgeClass(level: ImpactEffortLevel) {
    switch (level) {
      case "Alto":
        return "border-state-validated/40 bg-state-validated/10 text-state-validated";
      case "Medio":
        return "border-accent-violet/40 bg-accent-violet/10 text-accent-violet-soft";
      case "Bajo":
      default:
        return "border-border-subtle bg-surface-base text-text-tertiary";
    }
  }

  function getEffortBadgeClass(level: ImpactEffortLevel) {
    switch (level) {
      case "Bajo":
        return "border-state-validated/40 bg-state-validated/10 text-state-validated";
      case "Medio":
        return "border-state-pending/40 bg-state-pending/10 text-state-pending";
      case "Alto":
      default:
        return "border-accent-magenta/30 bg-accent-magenta/10 text-accent-magenta";
    }
  }

  return (
    <div id="ideate-workspace" className="flex flex-col gap-8">
      {/* 1. SECCIÓN: Entrada Validada desde Definir */}
      <section
        id="validated-define-input"
        className="rounded-2xl border border-state-validated/30 bg-surface-raised/80 p-6 shadow-sm backdrop-blur"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-state-validated/15 text-state-validated">
              <FileCheck size={18} strokeWidth={2.2} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-state-validated">
                  Trazabilidad de Origen
                </span>
                <span className="rounded bg-state-validated/20 px-1.5 py-0.2 font-mono text-[9px] text-state-validated">
                  Definición Validada
                </span>
              </div>
              <h2 className="font-sans text-base font-semibold text-text-primary">
                Entrada validada desde Definir
              </h2>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs text-text-tertiary">
              {validatedProblems.length} problemas de diseño validados
            </span>
          </div>
        </div>

        {validatedProblems.length > 0 ? (
          <div className="mt-4 flex flex-col gap-4">
            <p className="font-mono text-[11px] uppercase tracking-wide text-text-tertiary">
              Problemas de Diseño y Oportunidades (How Might We)
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {validatedProblems.map((prob, idx) => (
                <div
                  key={prob.id}
                  className="flex flex-col justify-between rounded-xl border border-border-subtle bg-surface-base p-3.5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-[10px] font-bold text-accent-magenta">
                        Problema 0{idx + 1}
                      </span>
                      <span className="rounded bg-surface-overlay px-1.5 py-0.2 font-mono text-[9px] text-text-secondary">
                        Patrón: {prob.patronOrigen}
                      </span>
                    </div>
                    <h4 className="font-sans text-xs font-semibold text-text-primary">
                      {prob.titulo}
                    </h4>
                    <p className="mt-1 text-[11px] text-text-secondary line-clamp-2">
                      {prob.problema}
                    </p>
                  </div>

                  <div className="mt-3 border-t border-border-subtle pt-2">
                    <p className="font-mono text-[10px] text-accent-magenta italic">
                      HMW: &ldquo;{prob.howMightWe}&rdquo;
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-border-strong bg-surface-base p-4 text-center">
            <p className="text-xs text-text-tertiary">
              No se detectaron problemas validados en la etapa Definir. Valida la etapa 02 para alimentar la generación de ideas.
            </p>
          </div>
        )}
      </section>

      {/* 2. CABECERA DE LA ETAPA IDEAR */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-accent-magenta">
                Etapa 03
              </span>
              <span className="text-text-tertiary">•</span>
              <span className="font-mono text-xs text-text-secondary">
                Generación de Alternativas
              </span>
            </div>
            <h2 className="mt-0.5 font-sans text-xl font-bold text-text-primary">
              Propuestas y Conceptos de Solución
            </h2>
            <p className="mt-1 text-xs text-text-tertiary max-w-2xl">
              Exploración divergente de alternativas de diseño enfocadas en mitigar los dolores validados. La IA propone alternativas; el profesional evalúa y valida.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isIdeateValidated ? (
              <div
                id="status-ideate-validated"
                className="inline-flex items-center gap-1.5 rounded-xl border border-state-validated/40 bg-state-validated/10 px-3.5 py-2 font-sans text-xs font-semibold text-state-validated"
              >
                <ShieldCheck size={15} />
                <span>Ideas validadas por el profesional</span>
              </div>
            ) : (
              <button
                id="btn-generate-ideas"
                type="button"
                disabled={validatedProblems.length === 0 || isGenerating}
                onClick={() => handleGenerateIdeas()}
                className={[
                  "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-sans text-sm font-semibold transition-all",
                  validatedProblems.length > 0 && !isGenerating
                    ? "bg-accent-magenta text-surface-base hover:bg-accent-magenta-hover active:scale-[0.98] shadow-lg shadow-accent-magenta/10"
                    : "border border-border-strong bg-surface-overlay text-text-tertiary cursor-not-allowed",
                ].join(" ")}
              >
                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-surface-base border-t-transparent" />
                    Generando alternativas de solución...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    {ideateResult ? "Re-generar ideas" : "Generar ideas con IA"}
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-state-error/40 bg-state-error/10 p-3 text-xs text-state-error">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}
      </section>

      {/* 3. RESULTADO DE IDEAR: LISTADO DE IDEAS */}
      {ideateResult && ideateResult.ideas.length > 0 ? (
        <div className="flex flex-col gap-6">
          {/* BANNER DE VALIDACIÓN PROFESIONAL */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border-strong bg-surface-raised p-4">
            <div className="flex items-center gap-3">
              <span
                className={[
                  "flex h-7 w-7 items-center justify-center rounded-lg",
                  ideateResult.estadoValidacion === "validado"
                    ? "bg-state-validated/20 text-state-validated"
                    : ideateResult.estadoValidacion === "descartado"
                    ? "bg-surface-overlay text-text-tertiary"
                    : "bg-state-pending/20 text-state-pending",
                ].join(" ")}
              >
                <ShieldCheck size={16} />
              </span>
              <div>
                <p className="font-sans text-xs font-semibold text-text-primary">
                  {ideateResult.estadoValidacion === "validado"
                    ? "Ideas validadas por el profesional"
                    : ideateResult.estadoValidacion === "descartado"
                    ? "Propuesta descartada"
                    : "Propuesta de ideas pendiente de validación"}
                </p>
                <p className="text-[11px] text-text-tertiary">
                  {ideateResult.estadoValidacion === "validado"
                    ? "Etapa Idear completada. La etapa Prototipar queda desbloqueada."
                    : "Revisa las alternativas generadas y evalúa su viabilidad respecto al problema."}
                </p>
              </div>
            </div>

            {ideateResult.estadoValidacion === "validado" ? (
              onContinueToPrototype && (
                <button
                  id="btn-continue-to-prototype"
                  type="button"
                  onClick={onContinueToPrototype}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent-magenta px-4 py-2 font-sans text-xs font-semibold text-surface-base shadow-lg shadow-accent-magenta/10 hover:bg-accent-magenta-hover active:scale-[0.98] transition-all"
                >
                  <span>Continuar a Prototipar</span>
                  <ArrowRight size={14} />
                </button>
              )
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="btn-accept-ideate"
                  type="button"
                  onClick={handleAccept}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-state-validated/40 bg-state-validated/10 px-3.5 py-1.5 font-sans text-xs font-medium text-state-validated hover:bg-state-validated/20 active:scale-[0.98]"
                >
                  <CheckCircle2 size={14} />
                  Aceptar
                </button>
                <button
                  id="btn-edit-ideate"
                  type="button"
                  onClick={handleOpenEdit}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-accent-violet/40 bg-accent-violet/10 px-3.5 py-1.5 font-sans text-xs font-medium text-accent-violet-soft hover:bg-accent-violet/20 active:scale-[0.98]"
                >
                  <Edit3 size={14} />
                  Editar
                </button>
                <button
                  id="btn-discard-ideate"
                  type="button"
                  onClick={handleDiscard}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-base px-3 py-1.5 font-sans text-xs font-medium text-text-tertiary hover:border-state-error/40 hover:bg-state-error/10 hover:text-state-error active:scale-[0.98]"
                >
                  <Trash2 size={13} />
                  Descartar
                </button>
              </div>
            )}
          </div>

          {/* GRID DE CARDS DE IDEAS */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {ideateResult.ideas.map((idea, idx) => (
              <article
                key={idea.id}
                id={`design-idea-card-${idx + 1}`}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-border-strong bg-surface-raised p-6 shadow-sm transition-all hover:border-border-hover"
              >
                <div className="flex flex-col gap-3">
                  {/* Cabecera de la tarjeta */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded bg-accent-magenta/15 font-mono text-xs font-bold text-accent-magenta">
                        0{idx + 1}
                      </span>
                      <h3 className="font-sans text-base font-semibold text-text-primary">
                        {idea.titulo}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px] ${getImpactBadgeClass(
                          idea.impactoEstimado
                        )}`}
                        title="Impacto estimado"
                      >
                        <TrendingUp size={10} />
                        Impacto {idea.impactoEstimado}
                      </span>
                      <span
                        className={`flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px] ${getEffortBadgeClass(
                          idea.esfuerzoEstimado
                        )}`}
                        title="Esfuerzo estimado"
                      >
                        <Zap size={10} />
                        Esfuerzo {idea.esfuerzoEstimado}
                      </span>
                    </div>
                  </div>

                  {/* Descripción conceptual */}
                  <div>
                    <p className="font-sans text-xs leading-relaxed text-text-primary">
                      {idea.descripcion}
                    </p>
                  </div>

                  {/* Justificación de valor */}
                  <div className="rounded-xl border border-border-subtle bg-surface-base p-3">
                    <p className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary mb-1">
                      ¿Por qué podría ayudar?
                    </p>
                    <p className="font-sans text-xs text-text-secondary leading-relaxed">
                      {idea.porQuePodriaAyudar}
                    </p>
                  </div>
                </div>

                {/* Trazabilidad: Problema y HMW de origen */}
                <div className="border-t border-border-subtle pt-3 flex flex-col gap-1.5 text-[11px]">
                  <div className="flex items-center gap-1.5 text-text-tertiary font-mono text-[10px]">
                    <Target size={11} className="text-accent-magenta" />
                    <span className="truncate">
                      <strong>Problema:</strong> {idea.problemaOrigen}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-accent-violet-soft font-mono text-[10px]">
                    <HelpCircle size={11} />
                    <span className="truncate italic">
                      HMW: &ldquo;{idea.howMightWeOrigen}&rdquo;
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        /* ESTADO INICIAL VACÍO DE IDEAR */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface-raised/40 p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-magenta/10 text-accent-magenta mb-3">
            <Lightbulb size={24} />
          </div>
          <h3 className="font-sans text-base font-semibold text-text-primary">
            Listo para generar alternativas de solución
          </h3>
          <p className="mt-1 max-w-md text-xs leading-relaxed text-text-secondary">
            TraceUX explorará entre 3 y 5 ideas y conceptos de solución estructurados y vinculados a los problemas y preguntas How Might We de Definir.
          </p>
          <button
            type="button"
            disabled={validatedProblems.length === 0 || isGenerating}
            onClick={() => handleGenerateIdeas()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent-magenta px-4 py-2 font-sans text-xs font-semibold text-surface-base hover:bg-accent-magenta-hover transition-colors"
          >
            <Sparkles size={14} />
            <span>Generar Ideas de Solución</span>
          </button>
        </div>
      )}

      {/* MODAL DE EDICIÓN / CORRECCIÓN PROFESIONAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-base/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border-strong bg-surface-raised p-6 shadow-2xl">
            <h3 className="font-sans text-base font-bold text-text-primary">
              Ajustar Propuestas de Solución
            </h3>
            <p className="mt-1 text-xs text-text-secondary">
              Indícale a la IA qué dirección explorar, qué tipo de ideas priorizar o qué restricciones metodológicas considerar.
            </p>

            <form onSubmit={handleApplyEdit} className="mt-4 flex flex-col gap-4">
              <textarea
                value={editFeedback}
                onChange={(e) => setEditFeedback(e.target.value)}
                placeholder="Ej: Explorar soluciones orientadas a la autogestión y reducir el esfuerzo en mobile..."
                rows={4}
                className="w-full rounded-xl border border-border-strong bg-surface-base p-3 text-xs text-text-primary placeholder:text-text-tertiary focus:border-accent-magenta focus:outline-none"
                autoFocus
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-lg border border-border-subtle px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-overlay"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!editFeedback.trim() || isGenerating}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-accent-magenta px-4 py-1.5 text-xs font-semibold text-surface-base hover:bg-accent-magenta-hover disabled:opacity-50"
                >
                  <Sparkles size={13} />
                  Re-generar ideas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
