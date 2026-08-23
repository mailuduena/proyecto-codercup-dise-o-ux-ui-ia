"use client";

import { useState } from "react";
import {
  ClipboardCheck,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Edit3,
  Trash2,
  FileCheck,
  AlertCircle,
  Target,
  Users,
  Compass,
  ListOrdered,
  Eye,
  MessageCircleQuestion,
  Scale,
  Smartphone,
  HelpCircle,
  Award,
} from "lucide-react";
import { generateId } from "@/lib/id";
import { usePrototype } from "@/lib/storage/usePrototype";
import { useTest } from "@/lib/storage/useTest";
import type {
  TestResult,
  TestTask,
  EvaluationCriterion,
} from "@/lib/types";

interface TestWorkspaceProps {
  projectId: string;
}

export function TestWorkspace({ projectId }: TestWorkspaceProps) {
  const { prototypeResult, isPrototypeValidated } = usePrototype(projectId);
  const {
    testResult,
    isTestValidated,
    saveTestResult,
    setTestStatus,
  } = useTest(projectId);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFeedback, setEditFeedback] = useState("");

  // Solo consumimos el prototipo si está explícitamente validado
  const validatedPrototype = isPrototypeValidated && prototypeResult ? prototypeResult : null;

  async function handleGeneratePlan(feedback?: string) {
    if (!validatedPrototype) {
      setError("No existe un prototipo validado en la etapa Prototipar.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prototipoValidado: validatedPrototype,
          feedbackProfesional: feedback,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo generar el plan de test con IA.");
      }

      const data = await response.json();
      if (!data.tareas || !Array.isArray(data.tareas)) {
        throw new Error("La IA no devolvió una estructura de tareas válida para el test.");
      }

      const formattedTasks: TestTask[] = data.tareas.map(
        (task: {
          orden: number;
          objetivo: string;
          instruccionNeutral: string;
          hipotesisRelacionada: string;
        }) => ({
          id: generateId("task"),
          orden: task.orden,
          objetivo: task.objetivo,
          instruccionNeutral: task.instruccionNeutral,
          hipotesisRelacionada: task.hipotesisRelacionada,
        })
      );

      const formattedCriteria: EvaluationCriterion[] = (data.criteriosEvaluacion || []).map(
        (crit: {
          hipotesis: string;
          evidenciaApoyaria: string;
          evidenciaCuestionaria: string;
        }) => ({
          id: generateId("crit"),
          hipotesis: crit.hipotesis,
          evidenciaApoyaria: crit.evidenciaApoyaria,
          evidenciaCuestionaria: crit.evidenciaCuestionaria,
        })
      );

      const newResult: TestResult = {
        id: testResult?.id || generateId("test"),
        projectId,
        objetivo: data.objetivo || "Evaluar la experiencia de interacción del prototipo",
        hipotesis: validatedPrototype.hipotesis || [],
        perfilParticipantes: data.perfilParticipantes || "Usuarios representativos del contexto del flujo",
        escenario: data.escenario || "Exploración libre del flujo propuesto",
        tareas: formattedTasks,
        preguntasPosteriores: data.preguntasPosteriores || [],
        queObservar: data.queObservar || [],
        criteriosEvaluacion: formattedCriteria,
        estadoValidacion: "pendiente",
        createdAt: new Date().toISOString(),
      };

      saveTestResult(newResult);
    } catch (err: unknown) {
      console.error("Error al generar plan de test:", err);
      setError(
        err instanceof Error ? err.message : "Error al procesar la etapa Testear."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function handleAccept() {
    setTestStatus("validado");
  }

  function handleDiscard() {
    setTestStatus("descartado");
  }

  function handleOpenEdit() {
    setEditFeedback("");
    setIsEditModalOpen(true);
  }

  function handleApplyEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editFeedback.trim() || isGenerating) return;
    setIsEditModalOpen(false);
    handleGeneratePlan(editFeedback.trim());
  }

  return (
    <div id="test-workspace" className="flex flex-col gap-8">
      {/* 1. SECCIÓN: Entrada Validada desde Prototipar */}
      <section
        id="validated-prototype-input"
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
                  Prototipar Validado
                </span>
              </div>
              <h2 className="font-sans text-base font-semibold text-text-primary">
                Entrada validada desde Prototipar
              </h2>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs text-text-tertiary">
              {validatedPrototype ? `${validatedPrototype.pantallas.length} pantallas • ${validatedPrototype.hipotesis.length} hipótesis` : "Sin prototipo validado"}
            </span>
          </div>
        </div>

        {validatedPrototype ? (
          <div className="mt-4 flex flex-col gap-4">
            {/* Síntesis del prototipo validado */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-border-subtle bg-surface-base p-3.5">
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-accent-magenta mb-1">
                  <Compass size={12} />
                  <span>Concepto</span>
                </div>
                <p className="font-sans text-xs text-text-primary">
                  {validatedPrototype.concepto}
                </p>
              </div>

              <div className="rounded-xl border border-border-subtle bg-surface-base p-3.5">
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-accent-violet-soft mb-1">
                  <Target size={12} />
                  <span>Objetivo de Validación</span>
                </div>
                <p className="font-sans text-xs text-text-primary">
                  {validatedPrototype.objetivo}
                </p>
              </div>

              <div className="rounded-xl border border-border-subtle bg-surface-base p-3.5">
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-state-validated mb-1">
                  <Smartphone size={12} />
                  <span>Flujo Principal</span>
                </div>
                <p className="font-sans text-xs text-text-primary">
                  {validatedPrototype.flujoPrincipal}
                </p>
              </div>
            </div>

            {/* Pantallas e Hipótesis heredadas */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Pantallas */}
              <div className="rounded-xl border border-border-subtle bg-surface-base p-3.5">
                <p className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary mb-2">
                  Pantallas y Estados del Recorrido
                </p>
                <div className="flex flex-col gap-1.5 text-[11px]">
                  {validatedPrototype.pantallas.map((p) => (
                    <div key={p.id} className="flex items-start gap-2">
                      <span className="font-mono text-[10px] font-bold text-accent-magenta shrink-0">
                        0{p.orden}.
                      </span>
                      <span className="font-semibold text-text-primary shrink-0">{p.nombre}:</span>
                      <span className="text-text-secondary truncate">{p.descripcionEstado}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hipótesis de partida */}
              <div className="rounded-xl border border-border-subtle bg-surface-base p-3.5">
                <p className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary mb-2">
                  Hipótesis Reales a Evaluar
                </p>
                <div className="flex flex-col gap-2 text-[11px]">
                  {validatedPrototype.hipotesis.map((h, idx) => (
                    <div key={h.id} className="flex items-start gap-2">
                      <span className="font-mono text-[10px] font-bold text-accent-violet-soft shrink-0">
                        H0{idx + 1}:
                      </span>
                      <span className="text-text-secondary italic">&ldquo;{h.enunciado}&rdquo;</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-border-strong bg-surface-base p-4 text-center">
            <p className="text-xs text-text-tertiary">
              No se detectó un prototipo validado en la etapa Prototipar. Valida la etapa 04 para estructurar el plan de test.
            </p>
          </div>
        )}
      </section>

      {/* 2. CABECERA DE LA ETAPA TESTEAR */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-accent-magenta">
                Etapa 05
              </span>
              <span className="text-text-tertiary">•</span>
              <span className="font-mono text-xs text-text-secondary">
                Pruebas de Usabilidad y Criterios Cualitativos
              </span>
            </div>
            <h2 className="mt-0.5 font-sans text-xl font-bold text-text-primary">
              Plan Estructurado de Test de Usabilidad
            </h2>
            <p className="mt-1 text-xs text-text-tertiary max-w-2xl">
              TraceUX transforma el prototipo validado en una guía metodológica neutral para la sesión con usuarios. No inventa resultados ni ejecuta pruebas ficticias.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isTestValidated ? (
              <div
                id="status-test-validated"
                className="inline-flex items-center gap-1.5 rounded-xl border border-state-validated/40 bg-state-validated/10 px-3.5 py-2 font-sans text-xs font-semibold text-state-validated"
              >
                <ShieldCheck size={15} />
                <span>Plan de test validado por el profesional</span>
              </div>
            ) : (
              <button
                id="btn-generate-test-plan"
                type="button"
                disabled={!validatedPrototype || isGenerating}
                onClick={() => handleGeneratePlan()}
                className={[
                  "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-sans text-sm font-semibold transition-all",
                  validatedPrototype && !isGenerating
                    ? "bg-accent-magenta text-surface-base hover:bg-accent-magenta-hover active:scale-[0.98] shadow-lg shadow-accent-magenta/10"
                    : "border border-border-strong bg-surface-overlay text-text-tertiary cursor-not-allowed",
                ].join(" ")}
              >
                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-surface-base border-t-transparent" />
                    Estructurando plan de test con IA...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    {testResult ? "Re-estructurar plan de test" : "Estructurar plan de test con IA"}
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

      {/* 3. RESULTADO DE TESTEAR */}
      {testResult && testResult.tareas.length > 0 ? (
        <div className="flex flex-col gap-6">
          {/* BANNER DE VALIDACIÓN PROFESIONAL */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border-strong bg-surface-raised p-4">
            <div className="flex items-center gap-3">
              <span
                className={[
                  "flex h-7 w-7 items-center justify-center rounded-lg",
                  testResult.estadoValidacion === "validado"
                    ? "bg-state-validated/20 text-state-validated"
                    : testResult.estadoValidacion === "descartado"
                    ? "bg-surface-overlay text-text-tertiary"
                    : "bg-state-pending/20 text-state-pending",
                ].join(" ")}
              >
                <ShieldCheck size={16} />
              </span>
              <div>
                <p className="font-sans text-xs font-semibold text-text-primary">
                  {testResult.estadoValidacion === "validado"
                    ? "Plan de test validado por el profesional"
                    : testResult.estadoValidacion === "descartado"
                    ? "Plan de test descartado"
                    : "Plan de test pendiente de validación profesional"}
                </p>
                <p className="text-[11px] text-text-tertiary">
                  {testResult.estadoValidacion === "validado"
                    ? "Proceso de Design Thinking preparado para ejecución del test."
                    : "Evalúa la neutralidad de las tareas, la formulación de preguntas y los criterios cualitativos."}
                </p>
              </div>
            </div>

            {testResult.estadoValidacion === "validado" ? (
              <div className="inline-flex items-center gap-2 rounded-xl border border-state-validated/30 bg-state-validated/10 px-3 py-1.5 font-sans text-xs font-medium text-state-validated">
                <Award size={14} />
                <span>Ciclo de 5 Etapas Completo</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="btn-accept-test"
                  type="button"
                  onClick={handleAccept}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-state-validated/40 bg-state-validated/10 px-3.5 py-1.5 font-sans text-xs font-medium text-state-validated hover:bg-state-validated/20 active:scale-[0.98]"
                >
                  <CheckCircle2 size={14} />
                  Aceptar
                </button>
                <button
                  id="btn-edit-test"
                  type="button"
                  onClick={handleOpenEdit}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-accent-violet/40 bg-accent-violet/10 px-3.5 py-1.5 font-sans text-xs font-medium text-accent-violet-soft hover:bg-accent-violet/20 active:scale-[0.98]"
                >
                  <Edit3 size={14} />
                  Editar
                </button>
                <button
                  id="btn-discard-test"
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

          {/* 1. OBJETIVO DEL TEST Y PERFIL DE PARTICIPANTES */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border-strong bg-surface-raised p-5 shadow-sm">
              <div className="flex items-center gap-2 text-accent-magenta font-mono text-[10px] uppercase font-bold mb-2">
                <Target size={14} />
                <span>1. Objetivo del Test</span>
              </div>
              <p className="font-sans text-xs text-text-primary leading-relaxed">
                {testResult.objetivo}
              </p>
            </div>

            <div className="rounded-2xl border border-border-strong bg-surface-raised p-5 shadow-sm">
              <div className="flex items-center gap-2 text-accent-violet-soft font-mono text-[10px] uppercase font-bold mb-2">
                <Users size={14} />
                <span>2. Perfil Cualitativo de Participantes</span>
              </div>
              <p className="font-sans text-xs text-text-primary leading-relaxed">
                {testResult.perfilParticipantes}
              </p>
            </div>
          </div>

          {/* 2. ESCENARIO NEUTRAL */}
          <div className="rounded-2xl border border-border-strong bg-surface-raised p-5 shadow-sm">
            <div className="flex items-center gap-2 text-state-validated font-mono text-[10px] uppercase font-bold mb-2">
              <Compass size={14} />
              <span>3. Escenario de Partida (Contexto para el Participante)</span>
            </div>
            <p className="font-sans text-xs text-text-primary leading-relaxed bg-surface-base p-3.5 rounded-xl border border-border-subtle italic">
              &ldquo;{testResult.escenario}&rdquo;
            </p>
          </div>

          {/* 3. TAREAS ESTRUCTURADAS */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-sans text-sm font-semibold text-text-primary flex items-center gap-2">
                <ListOrdered size={16} className="text-accent-magenta" />
                <span>4. Tareas Estructuradas ({testResult.tareas.length})</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {testResult.tareas.map((task) => (
                <article
                  key={task.id}
                  id={`test-task-card-${task.orden}`}
                  className="flex flex-col justify-between rounded-2xl border border-border-strong bg-surface-raised p-5 shadow-sm hover:border-border-hover transition-all"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent-magenta/15 font-mono text-xs font-bold text-accent-magenta">
                          {task.orden}
                        </span>
                        <h4 className="font-sans text-xs font-semibold text-text-primary">
                          Tarea 0{task.orden}
                        </h4>
                      </div>
                    </div>

                    <div>
                      <p className="font-mono text-[10px] uppercase text-text-tertiary mb-1">
                        Objetivo de la tarea
                      </p>
                      <p className="font-sans text-xs text-text-secondary">
                        {task.objetivo}
                      </p>
                    </div>

                    <div className="rounded-xl border border-border-subtle bg-surface-base p-3">
                      <p className="font-mono text-[10px] uppercase text-accent-magenta font-semibold mb-1">
                        Consigna Neutral para el Usuario
                      </p>
                      <p className="font-sans text-xs text-text-primary font-medium leading-relaxed">
                        &ldquo;{task.instruccionNeutral}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-border-subtle pt-2 flex items-center gap-1.5 text-[10px] font-mono text-accent-violet-soft">
                    <HelpCircle size={11} className="shrink-0" />
                    <span className="truncate">{task.hipotesisRelacionada}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* 4. QUÉ OBSERVAR Y PREGUNTAS POSTERIORES */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Qué observar */}
            <div className="rounded-2xl border border-border-strong bg-surface-raised p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border-subtle pb-3 mb-4">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent-magenta/15 text-accent-magenta">
                  <Eye size={14} />
                </span>
                <div>
                  <h3 className="font-sans text-sm font-semibold text-text-primary">
                    5. Aspectos a Observar durante la Sesión
                  </h3>
                  <p className="text-[11px] text-text-tertiary">
                    Comportamientos, silencios, titubeos y verbalizaciones a registrar.
                  </p>
                </div>
              </div>

              <ul className="flex flex-col gap-2 text-xs text-text-primary">
                {testResult.queObservar.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 rounded-xl border border-border-subtle bg-surface-base p-3"
                  >
                    <span className="font-mono text-[10px] font-bold text-accent-magenta shrink-0 mt-0.5">
                      0{idx + 1}
                    </span>
                    <span className="text-text-secondary leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Preguntas Posteriores */}
            <div className="rounded-2xl border border-border-strong bg-surface-raised p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border-subtle pb-3 mb-4">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent-violet/15 text-accent-violet-soft">
                  <MessageCircleQuestion size={14} />
                </span>
                <div>
                  <h3 className="font-sans text-sm font-semibold text-text-primary">
                    6. Preguntas Abiertas Posteriores
                  </h3>
                  <p className="text-[11px] text-text-tertiary">
                    Formulaciones neutrales para indagar la percepción sin inducir respuestas.
                  </p>
                </div>
              </div>

              <ul className="flex flex-col gap-2 text-xs text-text-primary">
                {testResult.preguntasPosteriores.map((preg, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 rounded-xl border border-border-subtle bg-surface-base p-3 italic text-text-primary"
                  >
                    <span className="font-mono text-[10px] font-bold text-accent-violet-soft shrink-0 not-italic mt-0.5">
                      P{idx + 1}
                    </span>
                    <span className="leading-relaxed">&ldquo;{preg}&rdquo;</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 5. CRITERIOS CUALITATIVOS DE EVALUACIÓN */}
          <div className="rounded-2xl border border-border-strong bg-surface-raised p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border-subtle pb-3 mb-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-state-validated/15 text-state-validated">
                <Scale size={14} />
              </span>
              <div>
                <h3 className="font-sans text-sm font-semibold text-text-primary">
                  7. Criterios Cualitativos de Evaluación por Hipótesis
                </h3>
                <p className="text-[11px] text-text-tertiary">
                  Qué observaciones reales de los usuarios apoyarían o cuestionarían cada hipótesis (sin umbrales inventados).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {testResult.criteriosEvaluacion.map((crit, idx) => (
                <div
                  key={crit.id}
                  className="flex flex-col justify-between rounded-xl border border-border-subtle bg-surface-base p-4"
                >
                  <div className="mb-3">
                    <span className="font-mono text-[10px] font-bold text-text-tertiary uppercase block mb-1">
                      Hipótesis H0{idx + 1}
                    </span>
                    <p className="font-sans text-xs font-semibold text-text-primary">
                      {crit.hipotesis}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2.5 border-t border-border-subtle pt-3">
                    <div className="rounded-lg bg-state-validated/5 border border-state-validated/20 p-2.5 text-[11px]">
                      <p className="font-mono text-[10px] font-bold text-state-validated uppercase mb-1">
                        ✓ Evidencia que apoyaría la hipótesis
                      </p>
                      <p className="text-text-secondary leading-relaxed">
                        {crit.evidenciaApoyaria}
                      </p>
                    </div>

                    <div className="rounded-lg bg-state-error/5 border border-state-error/20 p-2.5 text-[11px]">
                      <p className="font-mono text-[10px] font-bold text-state-error uppercase mb-1">
                        ✗ Evidencia que cuestionaría la hipótesis
                      </p>
                      <p className="text-text-secondary leading-relaxed">
                        {crit.evidenciaCuestionaria}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ESTADO INICIAL VACÍO DE TESTEAR */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface-raised/40 p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-magenta/10 text-accent-magenta mb-3">
            <ClipboardCheck size={24} />
          </div>
          <h3 className="font-sans text-base font-semibold text-text-primary">
            Listo para estructurar el plan de test de usabilidad
          </h3>
          <p className="mt-1 max-w-md text-xs leading-relaxed text-text-secondary">
            TraceUX tomará las pantallas e hipótesis del prototipo validado y generará una guía metodológica con tareas neutrales, aspectos a observar y criterios de evaluación.
          </p>
          <button
            type="button"
            disabled={!validatedPrototype || isGenerating}
            onClick={() => handleGeneratePlan()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent-magenta px-4 py-2 font-sans text-xs font-semibold text-surface-base hover:bg-accent-magenta-hover transition-colors"
          >
            <Sparkles size={14} />
            <span>Estructurar Plan de Test</span>
          </button>
        </div>
      )}

      {/* MODAL DE EDICIÓN / CORRECCIÓN PROFESIONAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-base/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border-strong bg-surface-raised p-6 shadow-2xl">
            <h3 className="font-sans text-base font-bold text-text-primary">
              Ajustar Plan de Test de Usabilidad
            </h3>
            <p className="mt-1 text-xs text-text-secondary">
              Indícale a la IA qué consignas de tareas modificar, qué preguntas añadir o qué aspectos conductuales enfatizar.
            </p>

            <form onSubmit={handleApplyEdit} className="mt-4 flex flex-col gap-4">
              <textarea
                value={editFeedback}
                onChange={(e) => setEditFeedback(e.target.value)}
                placeholder="Ej: Enfatizar la observación de dudas al revisar los datos finales y añadir una tarea sobre el manejo de errores..."
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
                  Re-estructurar plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
