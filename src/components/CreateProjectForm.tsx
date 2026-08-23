"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Loader2, Plus } from "lucide-react";

interface CreateProjectFormProps {
  onCreate: (name: string) => void | Promise<void>;
  isSubmitting?: boolean;
  onDebugLog?: (msg: string) => void;
  debugLogs?: string[];
}

export function CreateProjectForm({
  onCreate,
  isSubmitting = false,
  onDebugLog,
  debugLogs = [],
}: CreateProjectFormProps) {
  const [name, setName] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
    console.log("CREATE_PROJECT_FORM_MOUNTED");
  }, []);

  const isButtonDisabled = !name.trim() || isSubmitting;

  function handleButtonClick() {
    onDebugLog?.("DEBUG 1: CLICK RECIBIDO");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onDebugLog?.("DEBUG 2: HANDLESUBMIT EJECUTADO");

    const trimmed = name.trim();
    if (!trimmed || isSubmitting) return;

    try {
      onDebugLog?.("DEBUG 3: ONCREATE LLAMADO");
      await onCreate(trimmed);
      setName("");
    } catch (err) {
      onDebugLog?.(`ERROR EN ONCREATE: ${String(err)}`);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <form
        id="create-project-form"
        onSubmit={handleSubmit}
        className="flex w-full max-w-md items-center gap-2"
      >
        <input
          id="project-name-input"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nombre del proyecto"
          disabled={isSubmitting}
          aria-label="Nombre del nuevo proyecto"
          className="flex-1 rounded-xl border border-border-strong bg-surface-raised px-3.5 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent-magenta disabled:opacity-60"
        />
        <button
          id="create-project-submit-btn"
          type="submit"
          onClick={handleButtonClick}
          disabled={isButtonDisabled}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-accent-magenta px-4 py-2.5 text-sm font-medium text-surface-base transition-colors hover:bg-accent-magenta-hover disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-accent-magenta"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              <span>Creando...</span>
            </>
          ) : (
            <>
              <Plus size={15} strokeWidth={2.5} />
              <span>Crear proyecto</span>
            </>
          )}
        </button>
      </form>

      {/* Panel visual de DEBUG leyendo directamente del estado local `name` */}
      <div
        id="debug-panel"
        className="w-full max-w-md rounded-xl border border-yellow-500/50 bg-yellow-950/20 p-4 font-mono text-xs text-yellow-200"
      >
        <div className="flex items-center justify-between pb-2 border-b border-yellow-500/30">
          <span className="font-bold text-yellow-400">PANEL DE INSTRUMENTACIÓN DEBUG:</span>
          <span className="text-[10px] text-yellow-400/70">{debugLogs.length} eventos</span>
        </div>

        {/* Variables de estado en tiempo real */}
        <div className="my-2 space-y-1 rounded bg-black/40 p-2 text-xs border border-yellow-500/20">
          <div className="text-yellow-300 font-bold border-b border-yellow-500/20 pb-1">
            CLIENT DEBUG VERSION = 2
          </div>
          <div>
            <span className="text-yellow-400 font-semibold">hydrated</span> ={" "}
            <span className={hydrated ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
              {String(hydrated)}
            </span>
          </div>
          <div>
            <span className="text-yellow-400 font-semibold">name</span> ={" "}
            <span className="text-white font-mono">&quot;{name}&quot;</span>
          </div>
          <div>
            <span className="text-yellow-400 font-semibold">isCreating</span> ={" "}
            <span className={isSubmitting ? "text-red-400 font-bold" : "text-green-400"}>
              {String(isSubmitting)}
            </span>
          </div>
          <div>
            <span className="text-yellow-400 font-semibold">buttonDisabled</span> ={" "}
            <span
              className={
                isButtonDisabled
                  ? "text-red-400 font-bold"
                  : "text-green-400 font-bold"
              }
            >
              {String(isButtonDisabled)}
            </span>
          </div>
        </div>

        {debugLogs.length === 0 ? (
          <p className="pt-1 text-yellow-400/60 italic">
            Esperando interacción... Escribí un nombre y hacé clic en &quot;Crear proyecto&quot;.
          </p>
        ) : (
          <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-yellow-100">
            {debugLogs.map((log, index) => (
              <li key={index} className="font-mono">
                {log}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

