"use client";

import { ArrowRight, Clock3, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, Panel, ScreenHeader } from "@/components/ui";
import { loyaltyTemplate, traders } from "@/lib/mock";
import type { Trader } from "@/lib/types";

const defaultTraderId = "prapor";

export function TradersScreen() {
  const [traderId, setTraderId] = useState(defaultTraderId);
  const selectedTrader = useMemo(
    () => traders.find((trader) => trader.id === traderId) ?? traders[0],
    [traderId],
  );

  return (
    <section className="space-y-[16px]">
      <ScreenHeader title="TRADERS" subtitle="dealers" />

      <div className="grid gap-[12px] min-[860px]:grid-cols-[230px_1fr]">
        <TraderRoster
          activeTraderId={selectedTrader.id}
          onSelectTrader={setTraderId}
        />
        <TraderDetail trader={selectedTrader} />
      </div>
    </section>
  );
}

interface TraderRosterProps {
  activeTraderId: string;
  onSelectTrader: (id: string) => void;
}

function TraderRoster({ activeTraderId, onSelectTrader }: TraderRosterProps) {
  return (
    <Panel padded={false} className="overflow-hidden">
      <div className="divide-y divide-border-subtle">
        {traders.map((trader) => {
          const active = trader.id === activeTraderId;

          return (
            <button
              key={trader.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelectTrader(trader.id)}
              className={[
                "group flex w-full items-center gap-[11px] border-l-[3px] px-[12px] py-[9px] text-left transition-colors hover:bg-hover",
                active
                  ? "border-l-accent bg-active"
                  : "border-l-transparent bg-transparent",
              ].join(" ")}
            >
              <Monogram trader={trader} active={active} size="sm" />
              <span className="min-w-0 flex-1">
                <span
                  className={[
                    "block truncate font-sans text-name font-semibold",
                    active ? "text-fg" : "text-fg-2",
                  ].join(" ")}
                >
                  {trader.name}
                </span>
                <span className="mt-[2px] block truncate font-mono text-meta text-muted">
                  {trader.role}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

function TraderDetail({ trader }: { trader: Trader }) {
  return (
    <Panel padded={false} className="overflow-hidden">
      <div className="flex flex-col gap-[14px] border-b border-border px-[14px] py-[14px] min-[720px]:flex-row min-[720px]:items-center min-[720px]:gap-[14px]">
        <div className="flex min-w-0 flex-1 items-center gap-[14px]">
          <Monogram trader={trader} active size="lg" />
          <div className="min-w-0">
            <h2 className="truncate font-display text-heading font-semibold uppercase tracking-[0.06em] text-fg">
              {trader.name}
            </h2>
            <p className="mt-[2px] truncate font-mono text-body text-muted">
              {trader.role} · currency {trader.currency}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-[12px] min-[520px]:flex min-[520px]:items-center">
          <div className="text-left min-[520px]:text-right">
            <div className="flex items-center gap-[5px] text-accent min-[520px]:justify-end">
              <Star className="size-[14px] fill-current" strokeWidth={0} />
              <span className="font-mono text-stat font-bold text-fg">
                {trader.rep}
              </span>
            </div>
            <div className="font-mono text-meta text-dim">reputation</div>
          </div>

          <div className="border-l border-border pl-[12px] text-left min-[520px]:text-right">
            <div className="flex items-center gap-[5px] text-muted min-[520px]:justify-end">
              <Clock3 className="size-[13px]" strokeWidth={2} />
              <span className="font-mono text-stat font-semibold text-fg">
                {trader.reset}
              </span>
            </div>
            <div className="font-mono text-meta text-dim">restock</div>
          </div>
        </div>
      </div>

      <div className="space-y-[16px] p-[14px]">
        <section>
          <div className="mb-[8px] font-display text-label uppercase tracking-[0.18em] text-muted">
            Loyalty
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[480px]">
              <div className="grid grid-cols-[60px_1fr_1fr_90px] border border-border bg-surface-2">
                <LoyaltyHead>LL</LoyaltyHead>
                <LoyaltyHead>REP REQ</LoyaltyHead>
                <LoyaltyHead>SALES REQ</LoyaltyHead>
                <LoyaltyHead align="right">COMM</LoyaltyHead>
              </div>
              {loyaltyTemplate.map((level, index) => {
                const highlighted = index === 2;

                return (
                  <div
                    key={level.ll}
                    className={[
                      "grid grid-cols-[60px_1fr_1fr_90px] border-x border-b border-border",
                      highlighted ? "bg-active text-accent" : "bg-bg text-fg",
                    ].join(" ")}
                  >
                    <LoyaltyCell className="font-semibold text-current">
                      {level.ll}
                    </LoyaltyCell>
                    <LoyaltyCell>{level.rep}</LoyaltyCell>
                    <LoyaltyCell>{level.sales}</LoyaltyCell>
                    <LoyaltyCell align="right" className="text-muted">
                      {level.comm}
                    </LoyaltyCell>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-[8px] flex items-center justify-between gap-[10px]">
            <div className="font-display text-label uppercase tracking-[0.18em] text-muted">
              Barters
            </div>
            <Badge variant="soon">mock</Badge>
          </div>
          <div className="space-y-[6px]">
            {trader.barters.map((barter) => (
              <div
                key={`${barter.give}-${barter.get}`}
                className="flex items-center gap-[10px] border border-border bg-surface-2 px-[10px] py-[8px]"
              >
                <span className="min-w-0 flex-1 truncate font-sans text-name text-fg-2">
                  {barter.give}
                </span>
                <ArrowRight
                  className="size-[14px] shrink-0 text-accent"
                  strokeWidth={2}
                />
                <span className="min-w-0 flex-1 truncate text-right font-sans text-name font-semibold text-fg">
                  {barter.get}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Panel>
  );
}

interface MonogramProps {
  trader: Pick<Trader, "initial">;
  active: boolean;
  size: "sm" | "lg";
}

function Monogram({ trader, active, size }: MonogramProps) {
  return (
    <span
      className={[
        "flex shrink-0 items-center justify-center border border-border-strong bg-bg font-display font-bold",
        active ? "text-accent" : "text-muted",
        size === "lg" ? "size-[52px] text-[22px]" : "size-[32px] text-[13px]",
      ].join(" ")}
    >
      {trader.initial}
    </span>
  );
}

interface LoyaltyTextProps {
  children: string;
  align?: "left" | "right";
  className?: string;
}

function LoyaltyHead({ children, align = "left" }: LoyaltyTextProps) {
  return (
    <div
      className={[
        "px-[10px] py-[6px] font-display text-badge uppercase tracking-[0.12em] text-dim",
        align === "right" ? "text-right" : "text-left",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function LoyaltyCell({
  children,
  align = "left",
  className,
}: LoyaltyTextProps) {
  return (
    <div
      className={[
        "px-[10px] py-[7px] font-mono text-body text-fg-2",
        align === "right" ? "text-right" : "text-left",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
