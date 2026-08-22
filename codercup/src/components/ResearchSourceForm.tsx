"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";

interface ResearchSourceFormProps {
  onAdd: (content: string) => void;
}

export function ResearchSourceForm({ onAdd }: ResearchSourceFormProps) {
  const [content, setContent] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setContent("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Pegá una entrevista, encuesta abierta, nota de research o feedback…"
        rows={5}
        className="w-full resize-y rounded-xl border border-border-strong bg-surface-base px-3.5 py-3 font-mono text-sm leading-relaxed text-text-primary outline-none placeholder:font-sans placeholder:text-text-tertiary focus:border-accent-magenta"
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-text-tertiary">
          Cada vez que agregás investigación queda guardada como una fuente separada.
        </p>
        <button
          type="submit"
          disabled={!content.trim()}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-accent-magenta px-4 py-2.5 text-sm font-medium text-surface-base transition-colors hover:bg-accent-magenta-hover disabled:opacity-40 disabled:hover:bg-accent-magenta"
        >
          <Plus size={15} strokeWidth={2.5} />
          Agregar investigación
        </button>
      </div>
    </form>
  );
}
