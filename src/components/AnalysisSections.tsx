import { MessageSquare, AlertTriangle, HelpCircle, ShieldAlert } from "lucide-react";

interface AnalysisSectionsProps {
  observacionesAisladas: string[];
  contradicciones: string[];
  preguntasAbiertas: string[];
  advertenciasMetodologicas: string[];
}

export function AnalysisSections({
  observacionesAisladas,
  contradicciones,
  preguntasAbiertas,
  advertenciasMetodologicas,
}: AnalysisSectionsProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Observaciones Aisladas (Hallazgos únicos con 1 sola evidencia) */}
      <section
        id="section-observaciones-aisladas"
        className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface-raised p-5"
      >
        <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-state-pending" />
            <h3 className="font-sans text-sm font-semibold text-text-primary">
              Observaciones aisladas / Hallazgos únicos ({observacionesAisladas.length})
            </h3>
          </div>
          <span className="font-mono text-[11px] text-text-tertiary">
            Menciones con 1 sola evidencia
          </span>
        </div>

        {observacionesAisladas.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {observacionesAisladas.map((obs, idx) => (
              <li
                key={idx}
                className="rounded-lg border border-border-subtle/60 bg-surface-base/80 p-3 font-mono text-xs text-text-secondary leading-relaxed"
              >
                <span className="text-state-pending/80 mr-2 font-mono">•</span>
                {obs}
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-mono text-xs text-text-tertiary">
            No se registraron testimonios aislados fuera de los patrones identificados.
          </p>
        )}
      </section>

      {/* Contradicciones y Preguntas Abiertas en 2 columnas */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Contradicciones */}
        <section
          id="section-contradicciones"
          className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface-raised p-5"
        >
          <div className="flex items-center gap-2 border-b border-border-subtle pb-2.5">
            <AlertTriangle size={15} className="text-state-error" />
            <h3 className="font-sans text-sm font-semibold text-text-primary">
              Contradicciones ({contradicciones.length})
            </h3>
          </div>

          {contradicciones.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {contradicciones.map((item, idx) => (
                <li
                  key={idx}
                  className="rounded-lg border border-border-subtle/60 bg-surface-base/80 p-3 font-sans text-xs text-text-secondary"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-mono text-xs text-text-tertiary">
              No se detectaron testimonios contradictorios entre usuarios.
            </p>
          )}
        </section>

        {/* Preguntas Abiertas */}
        <section
          id="section-preguntas-abiertas"
          className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface-raised p-5"
        >
          <div className="flex items-center gap-2 border-b border-border-subtle pb-2.5">
            <HelpCircle size={15} className="text-accent-violet" />
            <h3 className="font-sans text-sm font-semibold text-text-primary">
              Preguntas abiertas ({preguntasAbiertas.length})
            </h3>
          </div>

          {preguntasAbiertas.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {preguntasAbiertas.map((item, idx) => (
                <li
                  key={idx}
                  className="rounded-lg border border-border-subtle/60 bg-surface-base/80 p-3 font-sans text-xs text-text-secondary"
                >
                  <span className="text-accent-violet mr-1.5 font-mono">?</span>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-mono text-xs text-text-tertiary">
              No hay preguntas abiertas pendientes de formulación.
            </p>
          )}
        </section>
      </div>

      {/* Advertencias Metodológicas */}
      <section
        id="section-advertencias-metodologicas"
        className="flex flex-col gap-3 rounded-xl border border-accent-violet/30 bg-accent-violet/5 p-5"
      >
        <div className="flex items-center gap-2 border-b border-accent-violet/20 pb-2.5">
          <ShieldAlert size={16} className="text-accent-violet" />
          <h3 className="font-sans text-sm font-semibold text-text-primary">
            Advertencias metodológicas para el equipo UX ({advertenciasMetodologicas.length})
          </h3>
        </div>

        {advertenciasMetodologicas.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {advertenciasMetodologicas.map((item, idx) => (
              <li
                key={idx}
                className="rounded-lg border border-border-subtle/60 bg-surface-base/60 p-3 font-sans text-xs leading-relaxed text-text-secondary"
              >
                <span className="text-accent-violet mr-2 font-mono">⚠</span>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-mono text-xs text-text-tertiary">
            Sin advertencias metodológicas registradas para esta versión.
          </p>
        )}
      </section>
    </div>
  );
}
