"use client";

interface EmptyStateProps {
  label: string;
  hint?: string;
}

export function EmptyState({ label, hint }: EmptyStateProps) {
  return (
    <div className="flex min-h-[120px] flex-col items-center justify-center border border-border bg-bg px-[18px] text-center">
      <div className="font-mono text-mono uppercase tracking-[0.08em] text-dim">
        // {label}
      </div>
      {hint ? <div className="mt-[6px] text-body text-muted">{hint}</div> : null}
    </div>
  );
}
