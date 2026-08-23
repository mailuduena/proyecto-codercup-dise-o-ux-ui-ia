import { Check, Lock } from "lucide-react";
import { STAGES } from "@/lib/stages";
import { useAnalysis } from "@/lib/storage/useAnalysis";
import { useDefine } from "@/lib/storage/useDefine";
import { useIdeate } from "@/lib/storage/useIdeate";
import { usePrototype } from "@/lib/storage/usePrototype";
import { useTest } from "@/lib/storage/useTest";
import type { StageId } from "@/lib/types";

interface StageNavListProps {
  projectId: string;
  currentStage: StageId;
  onSelectStage?: (stageId: StageId) => void;
}

export function StageNavList({ projectId, currentStage, onSelectStage }: StageNavListProps) {
  const { isValidated } = useAnalysis(projectId);
  const { isDefineValidated } = useDefine(projectId);
  const { isIdeateValidated } = useIdeate(projectId);
  const { isPrototypeValidated } = usePrototype(projectId);
  const { isTestValidated } = useTest(projectId);

  return (
    <ol id="stage-nav-list" className="flex flex-col gap-1">
      {STAGES.map((stage) => {
        const isCurrent = stage.id === currentStage;
        const Icon = stage.icon;

        // Desbloqueo reactivo:
        // - "empatizar": siempre desbloqueada
        // - "definir": si Empatizar está validada
        // - "idear": si Definir está validada
        // - "prototipar": si Idear está validada
        // - "testear": si Prototipar está validada
        const isUnlocked =
          stage.id === "empatizar"
            ? true
            : stage.id === "definir"
            ? isValidated
            : stage.id === "idear"
            ? isDefineValidated
            : stage.id === "prototipar"
            ? isIdeateValidated
            : stage.id === "testear"
            ? isPrototypeValidated
            : false;

        const isCompleted =
          stage.id === "empatizar"
            ? isValidated
            : stage.id === "definir"
            ? isDefineValidated
            : stage.id === "idear"
            ? isIdeateValidated
            : stage.id === "prototipar"
            ? isPrototypeValidated
            : stage.id === "testear"
            ? isTestValidated
            : false;

        const row = (
          <div
            onClick={() => {
              if (isUnlocked && onSelectStage) {
                onSelectStage(stage.id);
              }
            }}
            className={[
              "flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors",
              isCurrent
                ? "border-accent-magenta/40 bg-accent-magenta/10"
                : isUnlocked
                ? "border-transparent hover:border-border-strong hover:bg-surface-overlay cursor-pointer"
                : "border-transparent opacity-60 cursor-not-allowed",
            ].join(" ")}
          >
            <span
              className={[
                "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                isCurrent
                  ? "bg-accent-magenta text-surface-base"
                  : isCompleted
                  ? "bg-state-validated/15 text-state-validated"
                  : isUnlocked
                  ? "bg-accent-magenta/15 text-accent-magenta"
                  : "bg-surface-overlay text-text-tertiary",
              ].join(" ")}
            >
              <Icon size={15} strokeWidth={2.25} />
            </span>

            <span className="flex min-w-0 flex-1 flex-col">
              <span className="flex items-center gap-1.5">
                <span
                  className={`font-mono text-[11px] tracking-wide ${
                    isCurrent
                      ? "text-accent-magenta"
                      : isCompleted
                      ? "text-state-validated"
                      : isUnlocked
                      ? "text-text-primary"
                      : "text-text-tertiary"
                  }`}
                >
                  0{stage.order}
                </span>
                <span
                  className={`font-sans text-sm font-medium ${
                    isCurrent
                      ? "text-text-primary"
                      : isCompleted || isUnlocked
                      ? "text-text-primary"
                      : "text-text-secondary"
                  }`}
                >
                  {stage.label}
                </span>
                {isCompleted && (
                  <Check size={13} strokeWidth={3} className="text-state-validated" />
                )}
                {stage.id === "definir" && isUnlocked && !isCurrent && !isCompleted && (
                  <span className="rounded bg-state-validated/20 px-1.5 py-0.2 font-mono text-[9px] text-state-validated">
                    Desbloqueada
                  </span>
                )}
                {stage.id === "idear" && isUnlocked && !isCurrent && !isCompleted && (
                  <span className="rounded bg-state-validated/20 px-1.5 py-0.2 font-mono text-[9px] text-state-validated">
                    Desbloqueada
                  </span>
                )}
                {stage.id === "prototipar" && isUnlocked && !isCurrent && !isCompleted && (
                  <span className="rounded bg-state-validated/20 px-1.5 py-0.2 font-mono text-[9px] text-state-validated">
                    Desbloqueada
                  </span>
                )}
                {stage.id === "testear" && isUnlocked && !isCurrent && !isCompleted && (
                  <span className="rounded bg-state-validated/20 px-1.5 py-0.2 font-mono text-[9px] text-state-validated">
                    Desbloqueada
                  </span>
                )}
                {!isUnlocked && (
                  <Lock size={12} strokeWidth={2.5} className="text-text-tertiary" />
                )}
              </span>

              {!isUnlocked && stage.unlockHint && (
                <span className="mt-0.5 text-xs leading-snug text-text-tertiary">
                  {stage.unlockHint}
                </span>
              )}
            </span>
          </div>
        );

        if (!isUnlocked) {
          return (
            <li key={stage.id} title={stage.unlockHint}>
              {row}
            </li>
          );
        }

        return (
          <li key={stage.id}>
            {row}
          </li>
        );
      })}
    </ol>
  );
}

