import { Quote, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Pattern } from "@/lib/types";

interface PatternCardProps {
  pattern: Pattern;
  index: number;
}

export function PatternCard({ pattern, index }: PatternCardProps) {
  const supportBadgeStyles = {
    Alto: "border-state-validated/30 bg-state-validated/10 text-state-validated",
    Medio: "border-state-pending/30 bg-state-pending/10 text-state-pending",
    Bajo: "border-border-strong bg-surface-overlay text-text-tertiary",
  }[pattern.nivelRespaldo] || "border-border-strong bg-surface-overlay text-text-tertiary";

  return (
    <article
      id={`pattern-card-${pattern.id}`}
      className="flex flex-col gap-4 rounded-xl border border-border-subtle bg-surface-raised p-5 transition-colors hover:border-border-strong"
    >
      {/* Header: Nivel de respaldo y contador de evidencias */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-accent-magenta/10 font-mono text-xs font-semibold text-accent-magenta">
            0{index + 1}
          </span>
          <span className="font-mono text-xs text-text-tertiary">Patrón recurrente</span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium ${supportBadgeStyles}`}
          >
            Respaldo {pattern.nivelRespaldo}
          </span>
          <span className="rounded-md border border-border-subtle bg-surface-base px-2 py-0.5 font-mono text-[11px] text-text-secondary">
            {pattern.cantidadEvidencias} {pattern.cantidadEvidencias === 1 ? "evidencia" : "evidencias"}
          </span>
        </div>
      </div>

      {/* Interpretación: Space Grotesk */}
      <div className="flex flex-col gap-2">
        <h3 className="font-sans text-base font-semibold text-text-primary">
          {pattern.nombre}
        </h3>
        <p className="font-sans text-sm leading-relaxed text-text-secondary">
          {pattern.descripcion}
        </p>
      </div>

      {/* Fricción / Necesidad (Interpretación estructurada) */}
      <div className="grid grid-cols-1 gap-3 rounded-lg border border-border-subtle bg-surface-base/60 p-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-text-tertiary">
            <AlertCircle size={12} className="text-state-pending" />
            Punto de dolor (Pain Point)
          </span>
          <p className="font-sans text-xs text-text-secondary">{pattern.painPoint}</p>
        </div>

        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-text-tertiary">
            <CheckCircle2 size={12} className="text-accent-violet" />
            Necesidad subyacente
          </span>
          <p className="font-sans text-xs text-text-secondary">{pattern.necesidadRelacionada}</p>
        </div>
      </div>

      {/* Evidencias Literales: JetBrains Mono */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
          <Quote size={12} className="text-accent-magenta" />
          <span>Evidencia textual literal ({pattern.evidencias.length})</span>
        </div>

        <div className="flex flex-col gap-2">
          {pattern.evidencias.map((ev, evIdx) => (
            <div
              key={evIdx}
              className="group relative rounded-lg border border-border-subtle/80 bg-surface-sunken p-3 font-mono text-xs leading-relaxed text-text-primary transition-colors hover:border-accent-magenta/30"
            >
              <div className="mb-1 flex items-center justify-between text-[10px] text-text-tertiary">
                <span className="text-accent-magenta/80">Cita #{evIdx + 1}</span>
                <span className="rounded bg-surface-raised px-1.5 py-0.5 text-text-tertiary font-mono">
                  Fuente: {ev.sourceId}
                </span>
              </div>
              <p className="font-mono text-text-primary">
                &ldquo;{ev.texto}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
