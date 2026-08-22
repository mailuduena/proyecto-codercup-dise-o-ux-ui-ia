export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-magenta font-mono text-sm font-bold text-surface-base">
        C
      </span>
      <span className="font-sans text-base font-semibold tracking-tight text-text-primary">
        CoderCup
      </span>
    </div>
  );
}
