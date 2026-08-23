"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Edit3,
  XCircle,
  FolderKanban,
  Sparkles,
  GitBranch,
  ShieldCheck,
  Compass,
  Lightbulb,
  Layers,
  FlaskConical,
  Search,
} from "lucide-react";
import { CreateProjectForm } from "@/components/CreateProjectForm";
import { EmptyState } from "@/components/EmptyState";
import { Logo } from "@/components/Logo";
import { ProjectCard } from "@/components/ProjectCard";
import { useProjects } from "@/lib/storage/useProjects";

const STAGES_OVERVIEW = [
  {
    number: "01",
    id: "empatizar",
    name: "Empatizar",
    description: "Organizá evidencia y detectá recurrencias reales.",
    icon: Search,
    color: "text-blue-400",
    badge: "Evidencia pura",
  },
  {
    number: "02",
    id: "definir",
    name: "Definir",
    description: "Transformá patrones validados en problemas de diseño y HMW.",
    icon: Compass,
    color: "text-cyan-400",
    badge: "Foco & HMW",
  },
  {
    number: "03",
    id: "idear",
    name: "Idear",
    description: "Explorá alternativas de solución sin perder el problema de origen.",
    icon: Lightbulb,
    color: "text-amber-400",
    badge: "Soluciones",
  },
  {
    number: "04",
    id: "prototipar",
    name: "Prototipar",
    description: "Convertí ideas validadas en flujos, pantallas e hipótesis.",
    icon: Layers,
    color: "text-accent-magenta",
    badge: "Flujos & UI",
  },
  {
    number: "05",
    id: "testear",
    name: "Testear",
    description: "Prepará un plan de prueba para evaluar hipótesis con evidencia real.",
    icon: FlaskConical,
    color: "text-emerald-400",
    badge: "Plan de test",
  },
];

const TRACEABILITY_STEPS = [
  { label: "Evidencia", tag: "Citas reales" },
  { label: "Patrón", tag: "Recurrencia" },
  { label: "Problema", tag: "Fricción UX" },
  { label: "HMW", tag: "Interrogante" },
  { label: "Idea", tag: "Alternativa" },
  { label: "Prototipo", tag: "Flujo & UI" },
  { label: "Hipótesis", tag: "Supuesto" },
  { label: "Test", tag: "Validación" },
];

export default function HomePage() {
  const { projects, createProject } = useProjects();
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  function handleCreate(name: string) {
    try {
      setIsCreating(true);
      const project = createProject(name);
      if (project?.id) {
        router.push(`/proyecto/${project.id}`);
      }
    } catch (error) {
      console.error("Error al crear proyecto:", error);
    } finally {
      setIsCreating(false);
    }
  }

  function scrollToCreator() {
    const el = document.getElementById("crear-proyecto");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      const input = document.getElementById("project-name-input");
      if (input) input.focus();
    }
  }

  return (
    <div className="min-h-screen bg-surface-base text-text-primary selection:bg-accent-magenta/30 selection:text-white">
      {/* Top Bar / Header */}
      <header className="sticky top-0 z-40 border-b border-border-subtle/80 bg-surface-base/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-4">
            <button
              onClick={scrollToCreator}
              className="inline-flex items-center gap-2 rounded-xl bg-accent-magenta/15 px-3.5 py-1.5 font-mono text-xs font-semibold text-accent-magenta transition-all hover:bg-accent-magenta hover:text-white"
            >
              <span>+ Nuevo proyecto</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-24 px-6 py-12 md:py-16">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION */}
        {/* ========================================================================= */}
        <section className="relative flex flex-col items-start gap-8 pt-4 md:pt-8">
          {/* Subtle background glow element */}
          <div className="pointer-events-none absolute -top-12 left-1/4 h-72 w-72 rounded-full bg-accent-magenta/10 blur-3xl" />
          <div className="pointer-events-none absolute -top-8 right-1/4 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl" />

          {/* Methodological Tag */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface-raised/90 px-3.5 py-1.5 font-mono text-xs text-text-secondary shadow-sm">
            <span className="h-2 w-2 rounded-full bg-accent-magenta animate-pulse" />
            <span className="text-text-primary font-medium">Design Thinking con Trazabilidad Estricta</span>
          </div>

          {/* Main Claims */}
          <div className="flex flex-col gap-4 max-w-3xl">
            <h1 className="font-sans text-3xl font-bold tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
              De la evidencia a la decisión,{" "}
              <span className="text-accent-magenta">sin perder el porqué.</span>
            </h1>
            <p className="font-sans text-base leading-relaxed text-text-secondary sm:text-lg">
              TraceUX acompaña el proceso de Design Thinking y conecta cada decisión con la evidencia que la originó. La IA ayuda a organizar, proponer y estructurar; el criterio profesional define qué avanza.
            </p>
          </div>

          {/* Central Principle Highlight */}
          <div className="w-full max-w-2xl rounded-2xl border border-accent-magenta/30 bg-accent-magenta/5 p-4 sm:p-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={20} className="text-accent-magenta shrink-0" />
                <span className="font-mono text-xs uppercase tracking-wider text-accent-magenta font-semibold">
                  Principio de Validación
                </span>
              </div>
              <span className="font-sans text-base font-bold text-text-primary sm:text-lg">
                “La IA propone. El profesional decide.”
              </span>
            </div>
          </div>

          {/* Quick Create Project in Hero */}
          <div id="crear-proyecto" className="w-full max-w-xl flex flex-col gap-2 pt-2">
            <span className="font-mono text-xs uppercase tracking-wide text-text-tertiary">
              Empezar ahora
            </span>
            <CreateProjectForm
              onCreate={handleCreate}
              isSubmitting={isCreating}
              inputPlaceholder="Escribí el nombre de tu proyecto (ej: Rediseño Onboarding)"
            />
          </div>
        </section>

        {/* ========================================================================= */}
        {/* PROYECTOS EXISTENTES (si los hay) */}
        {/* ========================================================================= */}
        <section className="flex flex-col gap-5 border-t border-border-subtle pt-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FolderKanban size={20} className="text-accent-magenta" />
              <h2 className="font-sans text-xl font-bold text-text-primary">Tus proyectos</h2>
            </div>
            <span className="font-mono text-xs text-text-tertiary">
              {projects.length} {projects.length === 1 ? "proyecto" : "proyectos"}
            </span>
          </div>

          {projects.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<FolderKanban size={28} className="text-accent-magenta" />}
              title="Todavía no tenés proyectos"
              description="Creá tu primer proyecto arriba para empezar a estructurar investigación en la etapa de Empatizar."
            />
          )}
        </section>

        {/* ========================================================================= */}
        {/* 2. QUÉ ES TRACEUX */}
        {/* ========================================================================= */}
        <section className="flex flex-col gap-8 rounded-3xl border border-border-strong bg-surface-raised/60 p-8 md:p-12 relative overflow-hidden">
          <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-surface-overlay/80 to-transparent opacity-60" />

          <div className="flex flex-col gap-3 max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-widest text-accent-magenta font-semibold">
              El desafío de la trazabilidad
            </span>
            <h2 className="font-sans text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              ¿Qué es TraceUX?
            </h2>
          </div>

          <p className="font-sans text-base leading-relaxed text-text-secondary sm:text-lg max-w-3xl">
            Durante un proceso UX, entrevistas, hallazgos, problemas, ideas y decisiones pueden quedar dispersos entre distintas herramientas. TraceUX busca mantener conectado el porqué de cada decisión y conservar la trazabilidad durante todo el proceso.
          </p>

          <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-3">
            <div className="flex flex-col gap-2 rounded-2xl border border-border-subtle bg-surface-base p-5">
              <span className="font-mono text-xs text-blue-400 font-semibold">01. Centralización</span>
              <h3 className="font-sans text-sm font-semibold text-text-primary">Sin pérdida de contexto</h3>
              <p className="font-sans text-xs text-text-tertiary leading-relaxed">
                Todas las fuentes de entrevistas y datos cualitativos se conservan vinculadas a cada conclusión.
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-2xl border border-border-subtle bg-surface-base p-5">
              <span className="font-mono text-xs text-accent-magenta font-semibold">02. Rigor metodológico</span>
              <h3 className="font-sans text-sm font-semibold text-text-primary">Sin invención de datos</h3>
              <p className="font-sans text-xs text-text-tertiary leading-relaxed">
                La IA solo agrupa evidencias reales provistas; no genera métricas, citas ni usuarios ficticios.
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-2xl border border-border-subtle bg-surface-base p-5">
              <span className="font-mono text-xs text-emerald-400 font-semibold">03. Control humano</span>
              <h3 className="font-sans text-sm font-semibold text-text-primary">Validación explícita</h3>
              <p className="font-sans text-xs text-text-tertiary leading-relaxed">
                Nada pasa a la siguiente fase sin ser revisado, editado o aceptado por el profesional.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. LAS 5 ETAPAS */}
        {/* ========================================================================= */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-accent-magenta font-semibold">
              Estructura secuencial
            </span>
            <h2 className="font-sans text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              Las 5 etapas de Design Thinking
            </h2>
            <p className="font-sans text-sm text-text-secondary max-w-xl">
              Cada fase se desbloquea secuencialmente alimentándose únicamente de lo validado en la etapa anterior.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {STAGES_OVERVIEW.map((stage, idx) => {
              const IconComp = stage.icon;
              return (
                <div
                  key={stage.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-border-strong bg-surface-raised p-5 transition-all duration-200 hover:border-accent-magenta/40 hover:bg-surface-overlay"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-text-tertiary group-hover:text-accent-magenta">
                        {stage.number}
                      </span>
                      <div className="rounded-lg bg-surface-base p-2 border border-border-subtle">
                        <IconComp size={16} className={stage.color} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-sans text-base font-bold text-text-primary">{stage.name}</h3>
                      <span className="font-mono text-[10px] uppercase text-text-tertiary tracking-wider">
                        {stage.badge}
                      </span>
                    </div>
                    <p className="font-sans text-xs leading-relaxed text-text-secondary">
                      {stage.description}
                    </p>
                  </div>

                  {idx < STAGES_OVERVIEW.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-border-strong">
                      <ArrowRight size={14} className="text-text-tertiary" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. TRAZABILIDAD */}
        {/* ========================================================================= */}
        <section className="flex flex-col gap-8 rounded-3xl border border-border-strong bg-surface-raised p-8 md:p-12 relative overflow-hidden">
          <div className="flex flex-col gap-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-accent-magenta font-mono text-xs font-semibold uppercase tracking-wider">
              <GitBranch size={16} />
              <span>Conexión de extremo a extremo</span>
            </div>
            <h2 className="font-sans text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              Trazabilidad Continua
            </h2>
            <p className="font-sans text-sm text-text-secondary sm:text-base">
              Cada decisión conserva su origen para que el equipo pueda entender no solo qué se decidió, sino por qué.
            </p>
          </div>

          {/* Traceability Flow Diagram / Steps */}
          <div className="w-full overflow-x-auto pb-4">
            <div className="flex min-w-[720px] items-center justify-between gap-2 py-4">
              {TRACEABILITY_STEPS.map((step, idx) => (
                <div key={step.label} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border-strong bg-surface-base px-3.5 py-2.5 shadow-sm">
                    <span className="font-sans text-xs font-bold text-text-primary">
                      {step.label}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-accent-magenta">
                      {step.tag}
                    </span>
                  </div>
                  {idx < TRACEABILITY_STEPS.length - 1 && (
                    <ArrowRight size={14} className="text-border-strong shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-surface-base p-4 text-xs font-mono text-text-tertiary">
            <span className="text-accent-magenta font-semibold">Regla del sistema:</span> Ninguna pantalla de prototipo o criterio de test nace de la nada; todo elemento tiene un identificador trazable que conecta directamente con la necesidad detectada en Empatizar.
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. VALIDACIÓN HUMANA */}
        {/* ========================================================================= */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-accent-magenta font-semibold">
              Criterio Profesional
            </span>
            <h2 className="font-sans text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              Validación Humana en el Centro
            </h2>
            <p className="font-sans text-sm text-text-secondary sm:text-base max-w-2xl">
              Toda salida de IA nace pendiente de validación profesional. La herramienta propone estructuras claras, pero el criterio y la responsabilidad siempre pertenecen a la persona.
            </p>
          </div>

          {/* Action Cards (Aceptar, Editar, Descartar) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Aceptar */}
            <div className="flex flex-col gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 p-6">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 size={20} />
                <h3 className="font-sans text-base font-bold">Aceptar</h3>
              </div>
              <p className="font-sans text-xs leading-relaxed text-text-secondary">
                Valida formalmente la propuesta. Queda sellada como base verificada para desbloquear la siguiente etapa del proceso.
              </p>
              <span className="mt-auto inline-flex items-center font-mono text-[10px] text-emerald-400 font-semibold">
                Estado: Validado
              </span>
            </div>

            {/* Editar */}
            <div className="flex flex-col gap-3 rounded-2xl border border-blue-500/30 bg-blue-950/10 p-6">
              <div className="flex items-center gap-2 text-blue-400">
                <Edit3 size={20} />
                <h3 className="font-sans text-base font-bold">Editar</h3>
              </div>
              <p className="font-sans text-xs leading-relaxed text-text-secondary">
                Permite afinar redacciones, ajustar prioridades o reordenar elementos con feedback profesional para generar una versión corregida.
              </p>
              <span className="mt-auto inline-flex items-center font-mono text-[10px] text-blue-400 font-semibold">
                Estado: Versión N+1
              </span>
            </div>

            {/* Descartar */}
            <div className="flex flex-col gap-3 rounded-2xl border border-rose-500/30 bg-rose-950/10 p-6">
              <div className="flex items-center gap-2 text-rose-400">
                <XCircle size={20} />
                <h3 className="font-sans text-base font-bold">Descartar</h3>
              </div>
              <p className="font-sans text-xs leading-relaxed text-text-secondary">
                Descarta la propuesta con justificación obligatoria para conservar en el historial por qué no se consideró adecuada.
              </p>
              <span className="mt-auto inline-flex items-center font-mono text-[10px] text-rose-400 font-semibold">
                Estado: Descartado
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-accent-magenta/20 bg-accent-magenta/5 p-4 text-center font-sans text-sm font-medium text-text-primary">
            “Solo lo aceptado se considera validado y puede alimentar la siguiente etapa.”
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. CTA FINAL */}
        {/* ========================================================================= */}
        <section className="flex flex-col items-center gap-6 rounded-3xl border border-border-strong bg-gradient-to-b from-surface-raised to-surface-overlay p-8 sm:p-14 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-magenta/15 text-accent-magenta">
            <Sparkles size={24} />
          </div>

          <div className="flex flex-col gap-2 max-w-xl">
            <h2 className="font-sans text-2xl font-bold tracking-tight text-text-primary sm:text-4xl">
              Empezá desde la evidencia.
            </h2>
            <p className="font-sans text-sm text-text-secondary sm:text-base">
              Creá un proyecto y recorré las cinco etapas manteniendo trazabilidad entre investigación, decisiones y soluciones.
            </p>
          </div>

          <div className="w-full max-w-md pt-2">
            <CreateProjectForm
              onCreate={handleCreate}
              isSubmitting={isCreating}
              inputPlaceholder="Nombre de tu nuevo proyecto"
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-8 text-center font-mono text-xs text-text-tertiary">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>TraceUX — De la evidencia a la decisión, sin perder el porqué.</span>
          <span className="text-text-tertiary/70">Design Thinking asistido por IA con validación profesional.</span>
        </div>
      </footer>
    </div>
  );
}
