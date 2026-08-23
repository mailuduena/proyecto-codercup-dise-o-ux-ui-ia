"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Plus, Sparkles } from "lucide-react";

interface CreateProjectFormProps {
  onCreate: (name: string) => void | Promise<void>;
  isSubmitting?: boolean;
  inputPlaceholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export function CreateProjectForm({
  onCreate,
  isSubmitting = false,
  inputPlaceholder = "Nombre del proyecto (ej: Rediseño Onboarding Fintech)",
  autoFocus = false,
  className = "",
}: CreateProjectFormProps) {
  const [name, setName] = useState("");

  const isButtonDisabled = !name.trim() || isSubmitting;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || isSubmitting) return;

    try {
      await onCreate(trimmed);
      setName("");
    } catch (err) {
      console.error("Error al crear proyecto:", err);
    }
  }

  return (
    <form
      id="create-project-form"
      onSubmit={handleSubmit}
      className={`flex w-full flex-col gap-3 sm:flex-row sm:items-center ${className}`}
    >
      <div className="relative flex-1">
        <input
          id="project-name-input"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={inputPlaceholder}
          disabled={isSubmitting}
          autoFocus={autoFocus}
          aria-label="Nombre del nuevo proyecto"
          className="w-full rounded-xl border border-border-strong bg-surface-raised px-4 py-3 text-sm text-text-primary outline-none transition-all placeholder:text-text-tertiary focus:border-accent-magenta focus:ring-1 focus:ring-accent-magenta/30 disabled:opacity-60"
        />
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary">
          <Sparkles size={14} className="opacity-40" />
        </div>
      </div>
      <button
        id="create-project-submit-btn"
        type="submit"
        disabled={isButtonDisabled}
        className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-accent-magenta px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-accent-magenta-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-accent-magenta"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Creando proyecto...</span>
          </>
        ) : (
          <>
            <Plus size={16} strokeWidth={2.5} />
            <span>Crear proyecto</span>
          </>
        )}
      </button>
    </form>
  );
}


