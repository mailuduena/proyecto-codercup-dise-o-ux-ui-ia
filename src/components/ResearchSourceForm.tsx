import { useState, type FormEvent } from "react";
import { Plus, Loader2 } from "lucide-react";

interface ResearchSourceFormProps {
  onAdd: (content: string) => void;
}

export function ResearchSourceForm({ onAdd }: ResearchSourceFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      onAdd(content.trim());
      setContent("");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isButtonDisabled = !content.trim() || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="source-content-input"
          className="font-sans text-xs font-semibold text-text-secondary"
        >
          Contenido de la investigación (transcripción de entrevista, notas o respuestas abiertas)
        </label>
        <textarea
          id="source-content-input"
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Pegá aquí el texto de una entrevista, observación o notas de research..."
          className="rounded-xl border border-border-strong bg-surface-base p-3.5 font-sans text-sm text-text-primary placeholder:text-text-disabled focus:border-border-focus focus:outline-none"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isButtonDisabled}
          className={[
            "inline-flex items-center gap-2 rounded-xl px-4 py-2 font-sans text-sm font-semibold transition-all",
            isButtonDisabled
              ? "border border-border-strong bg-surface-overlay text-text-tertiary cursor-not-allowed"
              : "bg-accent-magenta text-surface-base hover:bg-accent-magenta-hover active:scale-[0.98]",
          ].join(" ")}
        >
          {isSubmitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Plus size={16} />
          )}
          Guardar fuente
        </button>
      </div>
    </form>
  );
}
