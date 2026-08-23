"use client";

import { useState } from "react";
import { X, Sparkles, AlertCircle } from "lucide-react";

interface EditAnalysisModalProps {
  isOpen: boolean;
  currentVersion: number;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
  isLoading?: boolean;
}

function EditAnalysisDialog({
  currentVersion,
  onClose,
  onSubmit,
  isLoading = false,
}: Omit<EditAnalysisModalProps, "isOpen">) {
  const [feedback, setFeedback] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!feedback.trim() || isLoading) return;
    onSubmit(feedback.trim());
  }

  return (
    <div
      id="edit-analysis-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-sunken/80 p-4 backdrop-blur-sm"
    >
      <div
        id="edit-analysis-modal"
        className="flex w-full max-w-lg flex-col gap-5 rounded-2xl border border-border-strong bg-surface-raised p-6 shadow-2xl animate-in fade-in zoom-in-95"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border-subtle pb-4">
          <div className="flex flex-col">
            <span className="font-mono text-[11px] uppercase tracking-wide text-accent-magenta">
              Nueva versión (v{currentVersion + 1})
            </span>
            <h2 className="font-sans text-lg font-semibold text-text-primary">
              ¿Qué querés modificar del análisis?
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-surface-overlay hover:text-text-primary"
          >
            <X size={18} />
          </button>
        </div>

        {/* Explicación metodológica */}
        <div className="flex items-start gap-2.5 rounded-lg border border-accent-violet/30 bg-accent-violet/5 p-3 text-xs text-text-secondary">
          <AlertCircle size={15} className="mt-0.5 shrink-0 text-accent-violet" />
          <p className="leading-relaxed font-sans">
            La IA tomará la investigación original, el análisis de la v{currentVersion} y tu indicación profesional.
            No inventará evidencia y creará una nueva versión en estado <span className="font-mono text-state-pending">pendiente</span>.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="professional-feedback"
              className="font-mono text-xs text-text-tertiary"
            >
              Instrucción o corrección del profesional:
            </label>
            <textarea
              id="professional-feedback"
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Ej: Separar el problema de confirmación del turno del problema de progreso del proceso..."
              disabled={isLoading}
              className="w-full resize-y rounded-xl border border-border-subtle bg-surface-base p-3.5 font-sans text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-magenta focus:outline-none"
              autoFocus
            />
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-lg border border-border-subtle px-4 py-2 font-sans text-xs font-medium text-text-secondary hover:bg-surface-overlay hover:text-text-primary disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              id="btn-submit-regeneration"
              type="submit"
              disabled={!feedback.trim() || isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-accent-magenta px-4 py-2 font-sans text-xs font-semibold text-surface-base transition-all hover:bg-accent-magenta-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-surface-base border-t-transparent" />
                  Regenerando v{currentVersion + 1}...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Generar versión 0{currentVersion + 1}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EditAnalysisModal({
  isOpen,
  currentVersion,
  onClose,
  onSubmit,
  isLoading = false,
}: EditAnalysisModalProps) {
  if (!isOpen) return null;

  return (
    <EditAnalysisDialog
      currentVersion={currentVersion}
      onClose={onClose}
      onSubmit={onSubmit}
      isLoading={isLoading}
    />
  );
}
