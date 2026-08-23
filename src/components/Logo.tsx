import Link from "next/link";

interface LogoProps {
  href?: string;
  className?: string;
}

export function Logo({ href = "/", className = "" }: LogoProps) {
  const content = (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-magenta font-mono text-sm font-bold text-surface-base">
        T
      </span>
      <span className="font-sans text-base font-semibold tracking-tight text-text-primary">
        TraceUX
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
