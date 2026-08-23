import { Lock, Check } from "lucide-react";
import { STAGES } from "@/lib/stages";
import { useAnalysis } from "@/lib/storage/useAnalysis";
import type { StageId } from "@/lib/types";

interface StageStepperProps {
  projectId: string;
  currentStage: StageId;
}

export function StageStepper({ projectId, currentStage }: StageStepperProps) {
  const { isValidated } = useAnalysis(projectId);

  return (
    <div className="hidden items-center gap-2 md:flex">
      {STAGES.map((stage, index) => {
        const isCurrent = stage.id === currentStage;
        const isUnlocked =
          stage.id === "empatizar"
            ? true
            : stage.id === "definir"
            ? isValidated
            : false;

        return (
          <div key={stage.id} className="flex items-center gap-2">
            <div
              className={[
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[11px] transition-all",
                isCurrent
                  ? "border-accent-magenta bg-accent-magenta/10 text-text-primary"
                  : isUnlocked
                  ? "border-state-validated/40 bg-state-validated/5 text-state-validated"
                  : "border-border-subtle text-text-tertiary",
              ].join(" ")}
            >
              {!isUnlocked && <Lock size={10} strokeWidth={2.5} />}
              {isUnlocked && !isCurrent && <Check size={10} strokeWidth={2.5} />}
              {stage.label}
            </div>
            {index < STAGES.length - 1 && (
              <span aria-hidden="true" className="h-px w-4 bg-border-subtle" />
            )}
          </div>
        );
      })}
    </div>
  );
}
