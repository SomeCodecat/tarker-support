"use client";

import { Button } from "@/components/ui";

export default function AmmoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="space-y-[16px]">
      <div className="flex min-h-[160px] flex-col justify-center border border-danger bg-sold-bg px-[18px] py-[16px]">
        <div className="font-mono text-mono uppercase tracking-[0.08em] text-danger">
          {"// AMMO DATA UNAVAILABLE"}
        </div>
        <div className="mt-[6px] max-w-[620px] text-body text-muted">
          The live tarkov.dev ammo feed could not be loaded. Retry the request or use the cached fixture fallback once the route recovers.
        </div>
        {error.message ? (
          <div className="mt-[10px] font-mono text-meta text-dim">{error.message}</div>
        ) : null}
        <div className="mt-[14px]">
          <Button onClick={reset} type="button" variant="ghost">
            Retry
          </Button>
        </div>
      </div>
    </section>
  );
}
