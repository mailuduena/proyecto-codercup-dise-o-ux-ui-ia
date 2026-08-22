import { Lock } from "lucide-react";
import { STAGES } from "@/lib/stages";
import type { StageId } from "@/lib/types";

export function StageStepper({ currentStage }: { currentStage: StageId }) {
  return (
    <div className="hidden items-center gap-2 md:flex">
      {STAGES.map((stage, index) => {
        const isCurrent = stage.id === currentStage;

        return (
          <div key={stage.id} className="flex items-center gap-2">
            <div
              className={[
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[11px]",
                isCurrent
                  ? "border-accent-magenta bg-accent-magenta/10 text-text-primary"
                  : "border-border-subtle text-text-tertiary",
              ].join(" ")}
            >
              {!stage.isAvailable && <Lock size={10} strokeWidth={2.5} />}
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
