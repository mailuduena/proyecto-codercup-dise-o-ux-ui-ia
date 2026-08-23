"use client";

import { useState } from "react";
import {
  Target,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Edit3,
  Trash2,
  HelpCircle,
  Link as LinkIcon,
  FileCheck,
  AlertCircle,
  Quote,
} from "lucide-react";
import { generateId } from "@/lib/id";
import { useAnalysis } from "@/lib/storage/useAnalysis";
import { useDefine } from "@/lib/storage/useDefine";
import type { DesignProblem, DefineResult, SupportLevel } from "@/lib/types";

interface DefineWorkspaceProps {
  projectId: string;
}

export function DefineWorkspace({ projectId }: DefineWorkspaceProps) {
  const { analyses, activeValidAnalysis } = useAnalysis(projectId);
  const { defineResult, isDefineValidated, saveDefineResult, setDefineStatus } = useDefine(projectId);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFeedback, setEditFeedback] = useState("");

  // Obtener estrictamente el análisis validado de Empatizar
  const validatedEmpathizeAnalysis = activeValidAnalysis?.estadoValidacion === "validado"
    ? activeValidAnalysis
    : [...analyses].reverse().find((a) => a.estadoValidacion === "validado") || null;

  async function handleGenerateProblems(feedback?: string) {
    if (!validatedEmpathizeAnalysis) {
      setError("No hay un análisis validado disponible de la etapa Empatizar.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/define", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumenInvestigacion: validatedEmpathizeAnalysis.resumenInvestigacion,
          patronesValidados: validatedEmpathizeAnalysis.patrones,
          observacionesAisladas: validatedEmpathizeAnalysis.observacionesAisladas,
          feedbackProfesional: feedback,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo generar la formulación de problemas de diseño.");
      }

      const data = await response.json();
      if (!data.problemas || !Array.isArray(data.problemas) || data.problemas.length === 0) {
        throw new Error("La IA no devolvió problemas válidos.");
      }

      const formattedProblems: DesignProblem[] = data.problemas.map(
        (p: {
          titulo: string;
          problema: string;
          necesidadUsuario: string;
          patronOrigen: string;
          evidenciasOrigen: string[];
          nivelRespaldo: SupportLevel;
          howMightWe: string;
        }) => ({
          id: generateId("prob"),
          titulo: p.titulo,
          problema: p.problema,
          necesidadUsuario: p.necesidadUsuario,
          patronOrigen: p.patronOrigen,
          evidenciasOrigen: Array.isArray(p.evidenciasOrigen) ? p.evidenciasOrigen : [],
          nivelRespaldo: p.nivelRespaldo || "Alto",
          howMightWe: p.howMightWe,
        })
      );

      const newResult: DefineResult = {
        id: defineResult?.id || generateId("def"),
        projectId,
        problemas: formattedProblems,
        estadoValidacion: "pendiente",
        createdAt: new Date().toISOString(),
      };

      saveDefineResult(newResult);
    } catch (err: unknown) {
      console.error("Error al generar problemas:", err);
      setError(err instanceof Error ? err.message : "Error al procesar la etapa Definir.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleAccept() {
    setDefineStatus("validado");
  }

  function handleDiscard() {
    setDefineStatus("descartado");
  }

  function handleOpenEdit() {
    setEditFeedback("");
    setIsEditModalOpen(true);
  }

  function handleApplyEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editFeedback.trim() || isGenerating) return;
    setIsEditModalOpen(false);
    handleGenerateProblems(editFeedback.trim());
  }

  return (
    <div id="define-workspace" className="flex flex-col gap-8">
      {/* 1. SECCIÓN: Entrada Validada desde Empatizar */}
      <section
        id="validated-empathize-input"
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
                  v0{validatedEmpathizeAnalysis?.version || 1} Validada
                </span>
              </div>
              <h2 className="font-sans text-base font-semibold text-text-primary">
                Entrada validada desde Empatizar
              </h2>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs text-text-tertiary">
              {validatedEmpathizeAnalysis?.patrones.length || 0} patrones validados disponibles
            </span>
          </div>
        </div>

        {validatedEmpathizeAnalysis ? (
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wide text-text-tertiary">
                Síntesis de Investigación
              </p>
              <p className="mt-1 font-sans text-sm leading-relaxed text-text-secondary">
                {validatedEmpathizeAnalysis.resumenInvestigacion}
              </p>
            </div>

            <div>
              <p className="font-mono text-[11px] uppercase tracking-wide text-text-tertiary mb-2">
                Patrones Recurrentes Validados
              </p>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {validatedEmpathizeAnalysis.patrones.map((patron) => (
                  <div
                    key={patron.id}
                    className="flex flex-col justify-between rounded-xl border border-border-subtle bg-surface-base p-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-sans text-xs font-semibold text-text-primary truncate">
                          {patron.nombre}
                        </h4>
                        <span className="shrink-0 rounded bg-accent-violet/10 px-1.5 py-0.2 font-mono text-[9px] text-accent-violet-soft">
                          {patron.cantidadEvidencias} evidencias
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-text-tertiary line-clamp-2">
                        {patron.descripcion}
                      </p>
                    </div>
                    <div className="mt-2.5 border-t border-border-subtle pt-2">
                      <p className="font-sans text-[10px] text-text-secondary">
                        <strong className="font-medium text-text-primary">Necesidad:</strong>{" "}
                        {patron.necesidadRelacionada}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-border-strong bg-surface-base p-4 text-center">
            <p className="text-xs text-text-tertiary">
              No se detectó un análisis validado en Empatizar. Valida la etapa 01 para alimentar la definición de problemas.
            </p>
          </div>
        )}
      </section>

      {/* 2. CABECERA DE LA ETAPA DEFINIR */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-accent-magenta">
                Etapa 02
              </span>
              <span className="text-text-tertiary">•</span>
              <span className="font-mono text-xs text-text-secondary">
                Formulación de Problemas
              </span>
            </div>
            <h2 className="mt-0.5 font-sans text-xl font-bold text-text-primary">
              Problemas de Diseño y Oportunidades
            </h2>
            <p className="mt-1 text-xs text-text-tertiary max-w-2xl">
              Transformación rigurosa de los patrones de investigación en problemas centrados en las necesidades de los usuarios. Sin proponer soluciones técnicas.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isDefineValidated ? (
              <div
                id="status-define-validated"
                className="inline-flex items-center gap-1.5 rounded-xl border border-state-validated/40 bg-state-validated/10 px-3.5 py-2 font-sans text-xs font-semibold text-state-validated"
              >
                <ShieldCheck size={15} />
                <span>Definición validada por el profesional</span>
              </div>
            ) : (
              <button
                id="btn-generate-problems"
                type="button"
                disabled={!validatedEmpathizeAnalysis || isGenerating}
                onClick={() => handleGenerateProblems()}
                className={[
                  "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-sans text-sm font-semibold transition-all",
                  validatedEmpathizeAnalysis && !isGenerating
                    ? "bg-accent-magenta text-surface-base hover:bg-accent-magenta-hover active:scale-[0.98] shadow-lg shadow-accent-magenta/10"
                    : "border border-border-strong bg-surface-overlay text-text-tertiary cursor-not-allowed",
                ].join(" ")}
              >
                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-surface-base border-t-transparent" />
                    Formulando problemas con IA...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    {defineResult ? "Re-formular problemas" : "Formular problemas con IA"}
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

      {/* 3. RESULTADO DE DEFINIR: LISTADO DE PROBLEMAS DE DISEÑO */}
      {defineResult && defineResult.problemas.length > 0 ? (
        <div className="flex flex-col gap-6">
          {/* BANNER DE VALIDACIÓN PROFESIONAL */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border-strong bg-surface-raised p-4">
            <div className="flex items-center gap-3">
              <span
                className={[
                  "flex h-7 w-7 items-center justify-center rounded-lg",
                  defineResult.estadoValidacion === "validado"
                    ? "bg-state-validated/20 text-state-validated"
                    : defineResult.estadoValidacion === "descartado"
                    ? "bg-surface-overlay text-text-tertiary"
                    : "bg-state-pending/20 text-state-pending",
                ].join(" ")}
              >
                <ShieldCheck size={16} />
              </span>
              <div>
                <p className="font-sans text-xs font-semibold text-text-primary">
                  {defineResult.estadoValidacion === "validado"
                    ? "Problemas de diseño validados por el profesional"
                    : defineResult.estadoValidacion === "descartado"
                    ? "Propuesta descartada"
                    : "Propuesta de problemas pendiente de validación"}
                </p>
                <p className="text-[11px] text-text-tertiary">
                  {defineResult.estadoValidacion === "validado"
                    ? "Etapa Definir completada. La etapa Idear queda desbloqueada."
                    : "Revisa la formulación de problemas y las preguntas How Might We antes de continuar."}
                </p>
              </div>
            </div>

            {defineResult.estadoValidacion !== "validado" && (
              <div className="flex items-center gap-2">
                <button
                  id="btn-accept-define"
                  type="button"
                  onClick={handleAccept}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-state-validated/40 bg-state-validated/10 px-3.5 py-1.5 font-sans text-xs font-medium text-state-validated hover:bg-state-validated/20 active:scale-[0.98]"
                >
                  <CheckCircle2 size={14} />
                  Aceptar
                </button>
                <button
                  id="btn-edit-define"
                  type="button"
                  onClick={handleOpenEdit}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-accent-violet/40 bg-accent-violet/10 px-3.5 py-1.5 font-sans text-xs font-medium text-accent-violet-soft hover:bg-accent-violet/20 active:scale-[0.98]"
                >
                  <Edit3 size={14} />
                  Editar
                </button>
                <button
                  id="btn-discard-define"
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

          {/* TARJETAS DE PROBLEMAS DE DISEÑO */}
          <div className="grid grid-cols-1 gap-6">
            {defineResult.problemas.map((prob, idx) => (
              <article
                key={prob.id}
                id={`design-problem-card-${idx + 1}`}
                className="flex flex-col gap-4 rounded-2xl border border-border-strong bg-surface-raised p-6 shadow-sm transition-all hover:border-border-hover"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-accent-magenta/15 font-mono text-xs font-bold text-accent-magenta">
                      0{idx + 1}
                    </span>
                    <h3 className="font-sans text-base font-semibold text-text-primary">
                      {prob.titulo}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 rounded-md border border-border-subtle bg-surface-base px-2 py-0.5 font-mono text-[10px] text-text-secondary">
                      <LinkIcon size={10} className="text-accent-violet" />
                      <span>Patrón: {prob.patronOrigen}</span>
                    </span>
                    <span className="rounded-md border border-state-validated/30 bg-state-validated/10 px-2 py-0.5 font-mono text-[10px] text-state-validated">
                      Respaldo {prob.nivelRespaldo}
                    </span>
                  </div>
                </div>

                {/* Declaración del problema y necesidad */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-border-subtle bg-surface-base p-4">
                    <p className="font-mono text-[11px] uppercase tracking-wide text-text-tertiary mb-1">
                      Declaración del Problema
                    </p>
                    <p className="font-sans text-xs leading-relaxed text-text-primary">
                      {prob.problema}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border-subtle bg-surface-base p-4">
                    <p className="font-mono text-[11px] uppercase tracking-wide text-text-tertiary mb-1">
                      Necesidad del Usuario
                    </p>
                    <p className="font-sans text-xs leading-relaxed text-text-secondary">
                      {prob.necesidadUsuario}
                    </p>
                  </div>
                </div>

                {/* How Might We */}
                <div className="rounded-xl border border-accent-magenta/30 bg-accent-magenta/5 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <HelpCircle size={15} className="text-accent-magenta" />
                    <p className="font-mono text-[11px] uppercase tracking-wide text-accent-magenta font-semibold">
                      How Might We (Oportunidad de Diseño)
                    </p>
                  </div>
                  <p className="font-sans text-sm font-medium leading-relaxed text-text-primary italic">
                    &ldquo;{prob.howMightWe}&rdquo;
                  </p>
                </div>

                {/* Evidencias de origen */}
                {prob.evidenciasOrigen && prob.evidenciasOrigen.length > 0 && (
                  <div className="rounded-xl border border-border-subtle/50 bg-surface-overlay/50 p-3">
                    <div className="flex items-center gap-1.5 mb-2 text-text-tertiary">
                      <Quote size={12} />
                      <span className="font-mono text-[10px] uppercase tracking-wider">
                        Evidencias directas de respaldo
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {prob.evidenciasOrigen.map((ev, evIdx) => (
                        <div
                          key={evIdx}
                          className="font-mono text-[11px] text-text-secondary border-l-2 border-accent-violet/40 pl-2 py-0.5"
                        >
                          &ldquo;{ev}&rdquo;
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      ) : (
        /* ESTADO INICIAL VACÍO DE DEFINIR */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface-raised/40 p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-magenta/10 text-accent-magenta mb-3">
            <Target size={24} />
          </div>
          <h3 className="font-sans text-base font-semibold text-text-primary">
            Listo para formular problemas de diseño
          </h3>
          <p className="mt-1 max-w-md text-xs leading-relaxed text-text-secondary">
            TraceUX tomará los patrones y necesidades validados en Empatizar para formular entre 1 y 3 problemas de diseño junto con sus preguntas How Might We.
          </p>
          <button
            type="button"
            disabled={!validatedEmpathizeAnalysis || isGenerating}
            onClick={() => handleGenerateProblems()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent-magenta px-4 py-2 font-sans text-xs font-semibold text-surface-base hover:bg-accent-magenta-hover transition-colors"
          >
            <Sparkles size={14} />
            <span>Generar Problemas de Diseño</span>
          </button>
        </div>
      )}

      {/* MODAL DE EDICIÓN / CORRECCIÓN PROFESIONAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-base/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border-strong bg-surface-raised p-6 shadow-2xl">
            <h3 className="font-sans text-base font-bold text-text-primary">
              Corregir Formulación de Problemas
            </h3>
            <p className="mt-1 text-xs text-text-secondary">
              Indícale a la IA qué aspecto ajustar en la formulación de los problemas o el enfoque de las preguntas How Might We.
            </p>

            <form onSubmit={handleApplyEdit} className="mt-4 flex flex-col gap-4">
              <textarea
                value={editFeedback}
                onChange={(e) => setEditFeedback(e.target.value)}
                placeholder="Ej: Centrar el problema 1 con mayor énfasis en la frustración por tiempos de espera..."
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
                  Re-formular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
