"use client";

import { useState } from "react";
import {
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Edit3,
  Trash2,
  FileCheck,
  AlertCircle,
  TrendingUp,
  Zap,
  Target,
  ArrowRight,
  HelpCircle,
  Smartphone,
  Compass,
  CheckSquare,
  MousePointerClick,
} from "lucide-react";
import { generateId } from "@/lib/id";
import { useIdeate } from "@/lib/storage/useIdeate";
import { usePrototype } from "@/lib/storage/usePrototype";
import type {
  PrototypeResult,
  PrototypeScreen,
  DesignHypothesis,
} from "@/lib/types";

interface PrototypeWorkspaceProps {
  projectId: string;
  onContinueToTest?: () => void;
}

export function PrototypeWorkspace({
  projectId,
  onContinueToTest,
}: PrototypeWorkspaceProps) {
  const { ideateResult, isIdeateValidated } = useIdeate(projectId);
  const {
    prototypeResult,
    isPrototypeValidated,
    savePrototypeResult,
    setPrototypeStatus,
  } = usePrototype(projectId);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFeedback, setEditFeedback] = useState("");

  // Consumir únicamente ideas validadas de Idear
  const validatedIdeas =
    isIdeateValidated && ideateResult?.ideas ? ideateResult.ideas : [];

  async function handleGeneratePrototype(feedback?: string) {
    if (validatedIdeas.length === 0) {
      setError("No hay ideas de diseño validadas en la etapa Idear.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/prototype", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideasValidadas: validatedIdeas,
          feedbackProfesional: feedback,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo generar la propuesta de prototipo con IA.");
      }

      const data = await response.json();
      if (!data.pantallas || !Array.isArray(data.pantallas)) {
        throw new Error("La IA no devolvió una estructura de prototipo válida.");
      }

      const formattedScreens: PrototypeScreen[] = data.pantallas.map(
        (screen: {
          orden: number;
          nombre: string;
          descripcionEstado: string;
          elementosClave: string[];
          interaccionesCriticas: string[];
        }) => ({
          id: generateId("screen"),
          orden: screen.orden,
          nombre: screen.nombre,
          descripcionEstado: screen.descripcionEstado,
          elementosClave: screen.elementosClave || [],
          interaccionesCriticas: screen.interaccionesCriticas || [],
        })
      );

      const formattedHypotheses: DesignHypothesis[] = (data.hipotesis || []).map(
        (h: { enunciado: string; criterioValidacion: string }) => ({
          id: generateId("hyp"),
          enunciado: h.enunciado,
          criterioValidacion: h.criterioValidacion,
        })
      );

      const newResult: PrototypeResult = {
        id: prototypeResult?.id || generateId("proto"),
        projectId,
        concepto: data.concepto || "Prototipo interactivo basado en ideas validadas",
        objetivo: data.objetivo || "Validar la experiencia con usuarios finales",
        flujoPrincipal: data.flujoPrincipal || "Flujo de extremo a extremo",
        pantallas: formattedScreens,
        hipotesis: formattedHypotheses,
        estadoValidacion: "pendiente",
        createdAt: new Date().toISOString(),
      };

      savePrototypeResult(newResult);
    } catch (err: unknown) {
      console.error("Error al generar prototipo:", err);
      setError(
        err instanceof Error ? err.message : "Error al procesar la etapa Prototipar."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function handleAccept() {
    setPrototypeStatus("validado");
  }

  function handleDiscard() {
    setPrototypeStatus("descartado");
  }

  function handleOpenEdit() {
    setEditFeedback("");
    setIsEditModalOpen(true);
  }

  function handleApplyEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editFeedback.trim() || isGenerating) return;
    setIsEditModalOpen(false);
    handleGeneratePrototype(editFeedback.trim());
  }

  return (
    <div id="prototype-workspace" className="flex flex-col gap-8">
      {/* 1. SECCIÓN: Entrada Validada desde Idear */}
      <section
        id="validated-ideate-input"
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
                  Idear Validado
                </span>
              </div>
              <h2 className="font-sans text-base font-semibold text-text-primary">
                Entrada validada desde Idear
              </h2>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs text-text-tertiary">
              {validatedIdeas.length} ideas de solución validadas
            </span>
          </div>
        </div>

        {validatedIdeas.length > 0 ? (
          <div className="mt-4 flex flex-col gap-4">
            <p className="font-mono text-[11px] uppercase tracking-wide text-text-tertiary">
              Alternativas de Solución y Trazabilidad Metodológica
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {validatedIdeas.map((idea, idx) => (
                <div
                  key={idea.id}
                  className="flex flex-col justify-between rounded-xl border border-border-subtle bg-surface-base p-3.5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-[10px] font-bold text-accent-magenta">
                        Idea 0{idx + 1}
                      </span>
                      <div className="flex items-center gap-1.5 font-mono text-[9px] text-text-tertiary">
                        <span className="flex items-center gap-0.5">
                          <TrendingUp size={9} /> {idea.impactoEstimado}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Zap size={9} /> {idea.esfuerzoEstimado}
                        </span>
                      </div>
                    </div>
                    <h4 className="font-sans text-xs font-semibold text-text-primary">
                      {idea.titulo}
                    </h4>
                    <p className="mt-1 text-[11px] text-text-secondary line-clamp-2">
                      {idea.descripcion}
                    </p>
                  </div>

                  <div className="mt-3 border-t border-border-subtle pt-2 flex flex-col gap-1 text-[10px] text-text-tertiary font-mono">
                    <div className="flex items-center gap-1 truncate">
                      <Target size={10} className="text-accent-magenta shrink-0" />
                      <span className="truncate">{idea.problemaOrigen}</span>
                    </div>
                    <div className="flex items-center gap-1 truncate text-accent-violet-soft">
                      <HelpCircle size={10} className="shrink-0" />
                      <span className="truncate italic">&ldquo;{idea.howMightWeOrigen}&rdquo;</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-border-strong bg-surface-base p-4 text-center">
            <p className="text-xs text-text-tertiary">
              No se detectaron ideas validadas en la etapa Idear. Valida la etapa 03 para estructurar el prototipo.
            </p>
          </div>
        )}
      </section>

      {/* 2. CABECERA DE LA ETAPA PROTOTIPAR */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-accent-magenta">
                Etapa 04
              </span>
              <span className="text-text-tertiary">•</span>
              <span className="font-mono text-xs text-text-secondary">
                Estructuración y Flujo de Interacción
              </span>
            </div>
            <h2 className="mt-0.5 font-sans text-xl font-bold text-text-primary">
              Propuesta de Prototipo e Hipótesis
            </h2>
            <p className="mt-1 text-xs text-text-tertiary max-w-2xl">
              Materialización del flujo, pantallas críticas e hipótesis a testear. El prototipo es un instrumento para validar con usuarios, no una solución definitiva declarada.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isPrototypeValidated ? (
              <div
                id="status-prototype-validated"
                className="inline-flex items-center gap-1.5 rounded-xl border border-state-validated/40 bg-state-validated/10 px-3.5 py-2 font-sans text-xs font-semibold text-state-validated"
              >
                <ShieldCheck size={15} />
                <span>Prototipo validado por el profesional</span>
              </div>
            ) : (
              <button
                id="btn-generate-prototype"
                type="button"
                disabled={validatedIdeas.length === 0 || isGenerating}
                onClick={() => handleGeneratePrototype()}
                className={[
                  "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-sans text-sm font-semibold transition-all",
                  validatedIdeas.length > 0 && !isGenerating
                    ? "bg-accent-magenta text-surface-base hover:bg-accent-magenta-hover active:scale-[0.98] shadow-lg shadow-accent-magenta/10"
                    : "border border-border-strong bg-surface-overlay text-text-tertiary cursor-not-allowed",
                ].join(" ")}
              >
                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-surface-base border-t-transparent" />
                    Estructurando prototipo con IA...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    {prototypeResult ? "Re-estructurar prototipo" : "Estructurar prototipo con IA"}
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

      {/* 3. RESULTADO DE PROTOTIPAR */}
      {prototypeResult && prototypeResult.pantallas.length > 0 ? (
        <div className="flex flex-col gap-6">
          {/* BANNER DE VALIDACIÓN PROFESIONAL */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border-strong bg-surface-raised p-4">
            <div className="flex items-center gap-3">
              <span
                className={[
                  "flex h-7 w-7 items-center justify-center rounded-lg",
                  prototypeResult.estadoValidacion === "validado"
                    ? "bg-state-validated/20 text-state-validated"
                    : prototypeResult.estadoValidacion === "descartado"
                    ? "bg-surface-overlay text-text-tertiary"
                    : "bg-state-pending/20 text-state-pending",
                ].join(" ")}
              >
                <ShieldCheck size={16} />
              </span>
              <div>
                <p className="font-sans text-xs font-semibold text-text-primary">
                  {prototypeResult.estadoValidacion === "validado"
                    ? "Prototipo validado por el profesional"
                    : prototypeResult.estadoValidacion === "descartado"
                    ? "Propuesta de prototipo descartada"
                    : "Propuesta de prototipo pendiente de validación"}
                </p>
                <p className="text-[11px] text-text-tertiary">
                  {prototypeResult.estadoValidacion === "validado"
                    ? "Etapa Prototipar completada. La etapa Testear queda desbloqueada."
                    : "Evalúa el flujo propuesto, los estados clave y las hipótesis formuladas."}
                </p>
              </div>
            </div>

            {prototypeResult.estadoValidacion === "validado" ? (
              onContinueToTest && (
                <button
                  id="btn-continue-to-test"
                  type="button"
                  onClick={onContinueToTest}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent-magenta px-4 py-2 font-sans text-xs font-semibold text-surface-base shadow-lg shadow-accent-magenta/10 hover:bg-accent-magenta-hover active:scale-[0.98] transition-all"
                >
                  <span>Continuar a Testear</span>
                  <ArrowRight size={14} />
                </button>
              )
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="btn-accept-prototype"
                  type="button"
                  onClick={handleAccept}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-state-validated/40 bg-state-validated/10 px-3.5 py-1.5 font-sans text-xs font-medium text-state-validated hover:bg-state-validated/20 active:scale-[0.98]"
                >
                  <CheckCircle2 size={14} />
                  Aceptar
                </button>
                <button
                  id="btn-edit-prototype"
                  type="button"
                  onClick={handleOpenEdit}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-accent-violet/40 bg-accent-violet/10 px-3.5 py-1.5 font-sans text-xs font-medium text-accent-violet-soft hover:bg-accent-violet/20 active:scale-[0.98]"
                >
                  <Edit3 size={14} />
                  Editar
                </button>
                <button
                  id="btn-discard-prototype"
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

          {/* SÍNTESIS DEL CONCEPTO, OBJETIVO Y FLUJO */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border-strong bg-surface-raised p-5">
              <div className="flex items-center gap-2 text-accent-magenta font-mono text-[10px] uppercase font-bold mb-2">
                <Compass size={14} />
                <span>Concepto del Prototipo</span>
              </div>
              <p className="font-sans text-xs text-text-primary leading-relaxed">
                {prototypeResult.concepto}
              </p>
            </div>

            <div className="rounded-2xl border border-border-strong bg-surface-raised p-5">
              <div className="flex items-center gap-2 text-accent-violet-soft font-mono text-[10px] uppercase font-bold mb-2">
                <Target size={14} />
                <span>Objetivo de Validación</span>
              </div>
              <p className="font-sans text-xs text-text-primary leading-relaxed">
                {prototypeResult.objetivo}
              </p>
            </div>

            <div className="rounded-2xl border border-border-strong bg-surface-raised p-5">
              <div className="flex items-center gap-2 text-state-validated font-mono text-[10px] uppercase font-bold mb-2">
                <Smartphone size={14} />
                <span>Flujo Principal</span>
              </div>
              <p className="font-sans text-xs text-text-primary leading-relaxed">
                {prototypeResult.flujoPrincipal}
              </p>
            </div>
          </div>

          {/* LISTADO DE PANTALLAS / ESTADOS CLAVE */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-sans text-sm font-semibold text-text-primary">
                Pantallas y Estados del Recorrido ({prototypeResult.pantallas.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 md:grid-cols-2">
              {prototypeResult.pantallas.map((screen) => (
                <article
                  key={screen.id}
                  id={`prototype-screen-card-${screen.orden}`}
                  className="flex flex-col justify-between rounded-2xl border border-border-strong bg-surface-raised p-5 shadow-sm hover:border-border-hover transition-all"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent-magenta/15 font-mono text-xs font-bold text-accent-magenta">
                          {screen.orden}
                        </span>
                        <h4 className="font-sans text-sm font-semibold text-text-primary">
                          {screen.nombre}
                        </h4>
                      </div>
                    </div>

                    <p className="font-sans text-xs text-text-secondary leading-relaxed">
                      {screen.descripcionEstado}
                    </p>

                    {/* Elementos Clave */}
                    <div className="rounded-xl border border-border-subtle bg-surface-base p-3">
                      <p className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary mb-1.5 flex items-center gap-1">
                        <CheckSquare size={11} className="text-accent-magenta" />
                        <span>Elementos Clave</span>
                      </p>
                      <ul className="flex flex-col gap-1 text-[11px] text-text-primary">
                        {screen.elementosClave.map((elem, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-accent-magenta">•</span>
                            <span>{elem}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Interacciones Críticas */}
                    <div className="rounded-xl border border-border-subtle bg-surface-base p-3">
                      <p className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary mb-1.5 flex items-center gap-1">
                        <MousePointerClick size={11} className="text-accent-violet-soft" />
                        <span>Interacciones Críticas</span>
                      </p>
                      <ul className="flex flex-col gap-1 text-[11px] text-text-secondary">
                        {screen.interaccionesCriticas.map((inter, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-accent-violet-soft">→</span>
                            <span>{inter}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* HIPÓTESIS DE DISEÑO A VALIDAR */}
          {prototypeResult.hipotesis && prototypeResult.hipotesis.length > 0 && (
            <div className="rounded-2xl border border-border-strong bg-surface-raised p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border-subtle pb-3 mb-4">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent-violet/15 text-accent-violet-soft">
                  <Target size={14} />
                </span>
                <div>
                  <h3 className="font-sans text-sm font-semibold text-text-primary">
                    Hipótesis de Diseño a Testear
                  </h3>
                  <p className="text-[11px] text-text-tertiary">
                    Supuestos metodológicos que este prototipo pondrá a prueba en la etapa de Testeo.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {prototypeResult.hipotesis.map((hyp, idx) => (
                  <div
                    key={hyp.id}
                    className="flex flex-col justify-between rounded-xl border border-border-subtle bg-surface-base p-4"
                  >
                    <div>
                      <span className="font-mono text-[10px] font-bold text-accent-violet-soft mb-1 block">
                        Hipótesis H0{idx + 1}
                      </span>
                      <p className="font-sans text-xs text-text-primary leading-relaxed font-medium">
                        &ldquo;{hyp.enunciado}&rdquo;
                      </p>
                    </div>
                    <div className="mt-3 border-t border-border-subtle pt-2">
                      <p className="font-mono text-[10px] text-text-tertiary uppercase mb-0.5">
                        Criterio de Validación
                      </p>
                      <p className="font-sans text-[11px] text-text-secondary">
                        {hyp.criterioValidacion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ESTADO INICIAL VACÍO DE PROTOTIPAR */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface-raised/40 p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-magenta/10 text-accent-magenta mb-3">
            <Layers size={24} />
          </div>
          <h3 className="font-sans text-base font-semibold text-text-primary">
            Listo para estructurar el prototipo interactivo
          </h3>
          <p className="mt-1 max-w-md text-xs leading-relaxed text-text-secondary">
            TraceUX traducirá las ideas validadas en un flujo estructurado con pantallas clave, interacciones críticas e hipótesis de usabilidad medibles.
          </p>
          <button
            type="button"
            disabled={validatedIdeas.length === 0 || isGenerating}
            onClick={() => handleGeneratePrototype()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent-magenta px-4 py-2 font-sans text-xs font-semibold text-surface-base hover:bg-accent-magenta-hover transition-colors"
          >
            <Sparkles size={14} />
            <span>Estructurar Prototipo</span>
          </button>
        </div>
      )}

      {/* MODAL DE EDICIÓN / CORRECCIÓN PROFESIONAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-base/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border-strong bg-surface-raised p-6 shadow-2xl">
            <h3 className="font-sans text-base font-bold text-text-primary">
              Ajustar Propuesta de Prototipo
            </h3>
            <p className="mt-1 text-xs text-text-secondary">
              Indícale a la IA qué pantallas enfatizar, qué interacciones modificar o qué hipótesis incorporar.
            </p>

            <form onSubmit={handleApplyEdit} className="mt-4 flex flex-col gap-4">
              <textarea
                value={editFeedback}
                onChange={(e) => setEditFeedback(e.target.value)}
                placeholder="Ej: Simplificar a 3 pantallas clave y añadir una pantalla específica de recuperación de error..."
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
                  Re-estructurar prototipo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
