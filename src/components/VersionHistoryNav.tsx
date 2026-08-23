import { History, GitCommit } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";

interface VersionHistoryNavProps {
  analyses: AnalysisResult[];
  selectedVersionId: string;
  onSelectVersion: (analysis: AnalysisResult) => void;
}

export function VersionHistoryNav({
  analyses,
  selectedVersionId,
  onSelectVersion,
}: VersionHistoryNavProps) {
  if (analyses.length <= 1) return null;

  return (
    <div
      id="version-history-nav"
      className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-surface-sunken p-3.5"
    >
      <div className="flex items-center gap-2">
        <History size={14} className="text-accent-magenta" />
        <span className="font-mono text-xs uppercase tracking-wide text-text-tertiary">
          Historial de versiones y trazabilidad ({analyses.length})
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {analyses.map((a, idx) => {
          const isSelected = a.id === selectedVersionId;
          const isLatest = idx === analyses.length - 1;

          return (
            <button
              key={a.id}
              type="button"
              onClick={() => onSelectVersion(a)}
              className={[
                "flex items-center gap-1.5 rounded-lg border px-3 py-1 font-mono text-xs transition-all",
                isSelected
                  ? "border-accent-magenta bg-accent-magenta/10 text-accent-magenta font-semibold shadow-sm"
                  : "border-border-subtle bg-surface-base text-text-tertiary hover:border-border-strong hover:text-text-secondary",
              ].join(" ")}
            >
              <GitCommit size={12} />
              <span>v0{a.version}</span>
              {isLatest && (
                <span className="rounded bg-accent-magenta/20 px-1 py-0.2 text-[9px] text-accent-magenta">
                  Actual
                </span>
              )}
              <span
                className={[
                  "text-[10px]",
                  a.estadoValidacion === "validado"
                    ? "text-state-validated"
                    : a.estadoValidacion === "descartado"
                    ? "text-text-tertiary"
                    : "text-state-pending",
                ].join(" ")}
              >
                ({a.estadoValidacion})
              </span>
            </button>
          );
        })}
      </div>

      {/* Si la versión seleccionada tiene una corrección profesional asociada */}
      {(() => {
        const current = analyses.find((a) => a.id === selectedVersionId);
        if (current?.correccionProfesional) {
          return (
            <div className="mt-1 flex items-start gap-2 rounded-lg border border-accent-violet/20 bg-surface-base/80 p-2.5 text-xs text-text-secondary">
              <span className="font-mono text-[11px] font-semibold text-accent-violet shrink-0">
                Corrección profesional v{current.version}:
              </span>
              <p className="font-sans italic">&ldquo;{current.correccionProfesional}&rdquo;</p>
            </div>
          );
        }
        return null;
      })()}
    </div>
  );
}
