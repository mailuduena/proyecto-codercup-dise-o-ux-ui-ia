import { CheckCircle2, Edit3, Trash2, Clock, AlertTriangle, ShieldCheck } from "lucide-react";
import type { ValidationStatus } from "@/lib/types";

interface ValidationBannerProps {
  status: ValidationStatus;
  version: number;
  onAccept: () => void;
  onEdit: () => void;
  onDiscard: () => void;
  disabled?: boolean;
}

export function ValidationBanner({
  status,
  version,
  onAccept,
  onEdit,
  onDiscard,
  disabled = false,
}: ValidationBannerProps) {
  const isPending = status === "pendiente";
  const isValidated = status === "validado";
  const isDiscarded = status === "descartado";

  return (
    <section
      id="validation-banner"
      className={[
        "flex flex-col gap-4 rounded-xl border p-4 transition-all sm:flex-row sm:items-center sm:justify-between",
        isPending
          ? "border-state-pending/40 bg-state-pending/5"
          : isValidated
          ? "border-state-validated/40 bg-state-validated/5"
          : "border-border-subtle bg-surface-raised opacity-90",
      ].join(" ")}
    >
      {/* Estado descriptivo */}
      <div className="flex items-start gap-3">
        <div
          className={[
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
            isPending
              ? "border-state-pending/40 bg-state-pending/10 text-state-pending"
              : isValidated
              ? "border-state-validated/40 bg-state-validated/10 text-state-validated"
              : "border-border-strong bg-surface-overlay text-text-tertiary",
          ].join(" ")}
        >
          {isPending && <Clock size={16} />}
          {isValidated && <ShieldCheck size={16} />}
          {isDiscarded && <AlertTriangle size={16} />}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wide text-text-tertiary">
              Versión 0{version}
            </span>
            <span className="text-text-tertiary">•</span>
            <span
              className={[
                "font-mono text-xs font-semibold uppercase tracking-wide",
                isPending
                  ? "text-state-pending"
                  : isValidated
                  ? "text-state-validated"
                  : "text-text-tertiary",
              ].join(" ")}
            >
              {isPending && "Pendiente de validación profesional"}
              {isValidated && "Validado por el profesional"}
              {isDiscarded && "Descartado por el profesional"}
            </span>
          </div>

          <p className="font-sans text-xs text-text-secondary mt-0.5">
            {isPending &&
              "La IA propone esta síntesis. Revisá las evidencias y decidí si aceptás, modificás o descartás."}
            {isValidated &&
              "Análisis verificado y aprobado por el profesional. La etapa 'Definir' ha sido desbloqueada."}
            {isDiscarded &&
              "Este análisis fue descartado. No alimentará las siguientes etapas del proceso."}
          </p>
        </div>
      </div>

      {/* Botones de acción profesional */}
      <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
        {/* ACEPTAR */}
        <button
          id="btn-accept-analysis"
          type="button"
          disabled={disabled || isValidated}
          onClick={onAccept}
          className={[
            "inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 font-sans text-xs font-medium transition-all",
            isValidated
              ? "border-state-validated/50 bg-state-validated/20 text-state-validated cursor-default"
              : "border-state-validated/40 bg-state-validated/10 text-state-validated hover:bg-state-validated/20 hover:border-state-validated active:scale-[0.98]",
            disabled && !isValidated ? "opacity-50 cursor-not-allowed" : "",
          ].join(" ")}
        >
          <CheckCircle2 size={14} />
          {isValidated ? "Validado" : "Aceptar"}
        </button>

        {/* EDITAR */}
        <button
          id="btn-edit-analysis"
          type="button"
          disabled={disabled}
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-lg border border-accent-violet/40 bg-accent-violet/10 px-3.5 py-1.5 font-sans text-xs font-medium text-accent-violet-soft transition-all hover:border-accent-violet hover:bg-accent-violet/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Edit3 size={14} />
          Editar
        </button>

        {/* DESCARTAR */}
        <button
          id="btn-discard-analysis"
          type="button"
          disabled={disabled || isDiscarded}
          onClick={onDiscard}
          className={[
            "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-sans text-xs font-medium transition-all",
            isDiscarded
              ? "border-border-strong bg-surface-overlay text-text-tertiary cursor-default"
              : "border-border-subtle bg-surface-base text-text-tertiary hover:border-state-error/40 hover:bg-state-error/10 hover:text-state-error active:scale-[0.98]",
            disabled && !isDiscarded ? "opacity-50 cursor-not-allowed" : "",
          ].join(" ")}
        >
          <Trash2 size={13} />
          {isDiscarded ? "Descartado" : "Descartar"}
        </button>
      </div>
    </section>
  );
}
