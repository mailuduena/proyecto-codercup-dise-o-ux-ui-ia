import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { STAGES } from "@/lib/stages";
import type { StageId } from "@/lib/types";

interface StageNavListProps {
  projectId: string;
  currentStage: StageId;
}

export function StageNavList({ projectId, currentStage }: StageNavListProps) {
  return (
    <ol className="flex flex-col gap-1">
      {STAGES.map((stage) => {
        const isCurrent = stage.id === currentStage;
        const Icon = stage.icon;

        const row = (
          <div
            className={[
              "flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors",
              isCurrent
                ? "border-accent-magenta/40 bg-accent-magenta/10"
                : stage.isAvailable
                  ? "border-transparent hover:border-border-strong hover:bg-surface-overlay"
                  : "border-transparent opacity-70",
            ].join(" ")}
          >
            <span
              className={[
                "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                isCurrent ? "bg-accent-magenta text-surface-base" : "bg-surface-overlay text-text-tertiary",
              ].join(" ")}
            >
              <Icon size={15} strokeWidth={2.25} />
            </span>

            <span className="flex min-w-0 flex-1 flex-col">
              <span className="flex items-center gap-1.5">
                <span
                  className={`font-mono text-[11px] tracking-wide ${
                    isCurrent ? "text-accent-magenta" : "text-text-tertiary"
                  }`}
                >
                  0{stage.order}
                </span>
                <span
                  className={`font-sans text-sm font-medium ${
                    isCurrent ? "text-text-primary" : "text-text-secondary"
                  }`}
                >
                  {stage.label}
                </span>
                {isCurrent && <Check size={13} strokeWidth={3} className="text-accent-magenta" />}
                {!stage.isAvailable && (
                  <Lock size={12} strokeWidth={2.5} className="text-text-tertiary" />
                )}
              </span>

              {!stage.isAvailable && stage.unlockHint && (
                <span className="mt-0.5 text-xs leading-snug text-text-tertiary">
                  {stage.unlockHint}
                </span>
              )}
            </span>
          </div>
        );

        if (!stage.isAvailable) {
          return (
            <li key={stage.id} title={stage.unlockHint}>
              {row}
            </li>
          );
        }

        return (
          <li key={stage.id}>
            <Link href={`/proyecto/${projectId}`}>{row}</Link>
          </li>
        );
      })}
    </ol>
  );
}
