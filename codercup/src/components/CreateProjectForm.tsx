"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";

interface CreateProjectFormProps {
  onCreate: (name: string) => void;
}

export function CreateProjectForm({ onCreate }: CreateProjectFormProps) {
  const [name, setName] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setName("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md items-center gap-2">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Nombre del proyecto"
        className="flex-1 rounded-xl border border-border-strong bg-surface-raised px-3.5 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent-magenta"
      />
      <button
        type="submit"
        disabled={!name.trim()}
        className="flex shrink-0 items-center gap-1.5 rounded-xl bg-accent-magenta px-4 py-2.5 text-sm font-medium text-surface-base transition-colors hover:bg-accent-magenta-hover disabled:opacity-40 disabled:hover:bg-accent-magenta"
      >
        <Plus size={15} strokeWidth={2.5} />
        Crear proyecto
      </button>
    </form>
  );
}
