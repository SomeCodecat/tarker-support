"use client";

import { Camera, Info, LoaderCircle, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Button,
  EmptyState,
  Money,
  Panel,
  ScreenHeader,
  Skeleton,
  TypeTile,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { useProgress, type ProgressState } from "@/lib/progress";
import type { ScanRow } from "@/lib/types";

type ScanStage = "empty" | "scanning" | "results";
type Horizon = "all" | "current" | "next";
type Verdict = "KEEP" | "PARTIAL" | "SELL";

const HORIZONS: { key: Horizon; label: string }[] = [
  { key: "all", label: "All future needs" },
  { key: "current", label: "Current tasks only" },
  { key: "next", label: "Next 5 levels" },
];

export function ScanScreen({
  degraded = false,
  scanRows,
}: {
  degraded?: boolean;
  scanRows: ScanRow[];
}) {
  const [stage, setStage] = useState<ScanStage>("empty");
  const [horizon, setHorizon] = useState<Horizon>("all");
  const [soldRows, setSoldRows] = useState<string[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { progress } = useProgress();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const rows = useMemo(
    () => buildScanRows(scanRows, horizon, soldRows, progress),
    [scanRows, horizon, soldRows, progress],
  );
  const surplusNames = rows.filter((row) => row.surplus > 0).map((row) => row.name);
  const surplusTotal = rows.reduce(
    (total, row) => total + (row.sold ? 0 : row.surplus * row.sell),
    0,
  );
  const surplusCount = rows.filter((row) => row.surplus > 0 && !row.sold).length;

  function startScan() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setSoldRows([]);
    setStage("scanning");
    timeoutRef.current = setTimeout(() => setStage("results"), 1600);
  }

  function resetScan() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStage("empty");
    setSoldRows([]);
  }

  function sellRow(name: string) {
    setSoldRows((current) => (current.includes(name) ? current : [...current, name]));
  }

  function sellAllSurplus() {
    setSoldRows(surplusNames);
  }

  return (
    <div className="mx-auto max-w-[1650px] space-y-[16px]">
      <ScreenHeader
        title="SCAN"
        subtitle={"keep \u00b7 sell"}
        right={
          <div className="flex items-center gap-[8px]">
            {degraded ? <Badge variant="sample" /> : null}
            <Badge variant="soon">PREVIEW</Badge>
          </div>
        }
      />

      <p className="font-name text-[13px] text-muted max-w-[680px] mb-[16px]">
        Drop a stash screenshot → per-item KEEP / PARTIAL / SELL verdicts
        computed live from tarkov.dev tasks, hideout and sell prices against
        your saved progression. Vision OCR isn&rsquo;t wired yet — run the demo scan
        to preview the flow with a fixed demo stash.
      </p>

      <div className="grid items-start gap-[14px] min-[860px]:grid-cols-[260px_1fr]">
        <div className="space-y-[12px]">
          {stage === "results" ? (
            <Panel>
              <div className="flex items-center gap-[10px]">
                <div className="flex size-[42px] shrink-0 items-center justify-center border border-border-strong bg-surface">
                  <Camera className="size-[20px] text-good" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-name font-semibold text-fg">
                    stash_2026-07-01.png
                  </div>
                  <div className="font-mono text-meta text-good">
                    {scanRows.length} items detected
                  </div>
                </div>
                <Button type="button" size="sm" onClick={resetScan}>
                  <RotateCcw className="size-[12px]" />
                  Rescan
                </Button>
              </div>
            </Panel>
          ) : null}

          {stage === "empty" ? <UploadPanel onStart={startScan} /> : null}
          {stage === "scanning" ? <ScanningPanel /> : null}

          <Panel title="Needs Horizon">
            <div className="space-y-[5px]">
              {HORIZONS.map((option) => {
                const active = option.key === horizon;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setHorizon(option.key)}
                    className={cn(
                      "w-full border px-[10px] py-[8px] text-left text-name font-semibold transition-colors",
                      active
                        ? "border-accent bg-active text-accent"
                        : "border-border-strong bg-bg text-muted hover:text-fg",
                    )}
                    aria-pressed={active}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </Panel>

          <div className="space-y-[5px] font-mono text-meta text-muted">
            <LegendItem color="bg-good" label="KEEP - needed by quest/hideout" />
            <LegendItem color="bg-accent" label="PARTIAL - keep some, sell rest" />
            <LegendItem color="bg-danger" label="SELL - surplus" />
          </div>
        </div>

        <div>
          {stage === "empty" ? (
            <EmptyState
              label="awaiting stash"
              hint="Drop a screenshot or run the demo scan. Each detected item gets a verdict against the selected needs horizon."
            />
          ) : null}

          {stage === "scanning" ? (
            <Panel padded={false}>
              <div className="p-[12px]">
                <Skeleton rows={6} />
              </div>
            </Panel>
          ) : null}

          {stage === "results" ? (
            <ResultsPanel
              rows={rows}
              surplusCount={surplusCount}
              surplusTotal={surplusTotal}
              onSellRow={sellRow}
              onSellAll={sellAllSurplus}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function UploadPanel({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-[10px] border-2 border-dashed border-border-strong bg-surface-2 px-[16px] py-[24px] text-center">
      <Camera className="size-[34px] text-muted" />
      <div className="text-name font-semibold text-fg">Drop stash screenshot</div>
      <div className="font-mono text-meta text-dim">PNG / JPG - vision OCR soon</div>
      <Button type="button" variant="primary" onClick={onStart}>
        Run Demo Scan
      </Button>
    </div>
  );
}

function ScanningPanel() {
  return (
    <div className="flex flex-col items-center justify-center gap-[10px] border border-border-strong bg-surface-2 px-[16px] py-[26px] text-center">
      <LoaderCircle
        className="size-[28px] text-accent"
        style={{ animation: "ts-spin 0.9s linear infinite" }}
      />
      <div className="text-name font-semibold text-fg">Reading stash grid...</div>
      <div className="font-mono text-meta text-dim">matching against RequirementsIndex</div>
    </div>
  );
}

function ResultsPanel({
  rows,
  surplusCount,
  surplusTotal,
  onSellRow,
  onSellAll,
}: {
  rows: BuiltScanRow[];
  surplusCount: number;
  surplusTotal: number;
  onSellRow: (name: string) => void;
  onSellAll: () => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-[10px] border border-border border-b-0 bg-surface px-[12px] py-[10px]">
        <div className="min-w-0 flex-1">
          <div className="font-display text-label uppercase tracking-[0.18em] text-muted">
            Surplus To Sell
          </div>
          <div className="mt-[2px] font-mono text-meta text-dim">
            {surplusCount} stacks remaining
          </div>
        </div>
        <Money value={surplusTotal} tone="good" className="text-[18px]" />
        <Button
          type="button"
          variant="primary"
          onClick={onSellAll}
          disabled={surplusCount === 0}
          className="border-good bg-good text-bg hover:bg-good"
        >
          Sell All Surplus
        </Button>
      </div>

      <Panel padded={false}>
        <div className="overflow-x-auto">
          <div className="min-w-[860px]">
            <div className="grid grid-cols-[40px_1fr_80px_116px_1fr_80px_88px] border-b border-border-strong bg-surface-2">
              <HeaderCell />
              <HeaderCell>Item</HeaderCell>
              <HeaderCell>Verdict</HeaderCell>
              <HeaderCell align="right">Own / Keep / Surplus</HeaderCell>
              <HeaderCell>Reason</HeaderCell>
              <HeaderCell align="right">Best Sell</HeaderCell>
              <HeaderCell align="center">Action</HeaderCell>
            </div>
            {rows.map((row, index) => (
              <ScanResultRow
                key={row.name}
                row={row}
                index={index}
                onSellRow={onSellRow}
              />
            ))}
            <div className="flex items-center gap-[8px] bg-[#1a1710] px-[12px] py-[8px] font-mono text-[10px]">
              <Info className="size-[14px] shrink-0 text-accent" />
              <span className="text-[#c9a24b]">
                Live tarkov.dev requirements — verdicts, keep/surplus counts,
                reasons and best sell prices recompute from your locally saved
                progression (PMC level, completed tasks, hideout levels — edit
                them on the Progression screen). Detection is a fixed demo stash
                (no vision pipeline yet).
              </span>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function HeaderCell({
  children,
  align = "left",
}: {
  children?: string;
  align?: "left" | "right" | "center";
}) {
  return (
    <div
      className={cn(
        "px-[10px] py-[8px] font-display text-label uppercase tracking-[0.12em] text-muted",
        align === "right" && "text-right",
        align === "center" && "text-center",
      )}
    >
      {children}
    </div>
  );
}

function ScanResultRow({
  row,
  index,
  onSellRow,
}: {
  row: BuiltScanRow;
  index: number;
  onSellRow: (name: string) => void;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[40px_1fr_80px_116px_1fr_80px_88px] items-center border-b border-l-[3px] border-b-border-subtle",
        index % 2 === 0 ? "bg-surface" : "bg-elevated",
        row.sold && "bg-sold-bg opacity-40",
      )}
      style={{ borderLeftColor: row.verdictColor }}
    >
      <div className="px-[8px] py-[7px]">
        <TypeTile short={row.short} color={row.tier} size={28} />
      </div>
      <div className="min-w-0 px-[10px] py-[7px]">
        <div className="truncate text-name font-semibold text-fg">{row.name}</div>
        <FirChip fir={row.fir} />
      </div>
      <div className="px-[10px] py-[7px]">
        <Badge variant={verdictVariant(row.verdict)}>{row.verdict}</Badge>
      </div>
      <div className="px-[10px] py-[7px] text-right font-mono text-mono text-fg-2">
        {row.own} / <span className="text-good">{row.keep}</span> /{" "}
        <span className="text-danger">{row.surplus}</span>
      </div>
      <div className="px-[10px] py-[7px] text-body text-muted">{row.reason}</div>
      <div className="px-[10px] py-[7px] text-right">
        <Money value={row.sell} tone="good" />
        <div className="mt-[2px] font-mono text-meta text-dim">{row.sellSrc}</div>
      </div>
      <div className="px-[8px] py-[7px] text-center">
        {row.surplus > 0 ? (
          <Button
            type="button"
            size="sm"
            variant="danger"
            onClick={() => onSellRow(row.name)}
            disabled={row.sold}
          >
            {row.sold ? "Sold" : "Sell"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function FirChip({ fir }: { fir: "yes" | "no" }) {
  if (fir === "yes") return <Badge variant="fir" />;
  return <span className="font-mono text-meta text-dim">any</span>;
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-[8px]">
      <span className={cn("size-[11px] shrink-0", color)} />
      <span>{label}</span>
    </div>
  );
}

interface BuiltScanRow extends ScanRow {
  keep: number;
  surplus: number;
  sold: boolean;
  verdict: Verdict;
  verdictColor: string;
  reason: string;
  fir: "yes" | "no";
}

function buildScanRows(
  sourceRows: ScanRow[],
  horizon: Horizon,
  soldRows: string[],
  progress: ProgressState,
): BuiltScanRow[] {
  return sourceRows.map((row) => {
    const remainingTasks = row.taskNeeds.filter(
      (need) => !progress.completed[need.taskId],
    );
    const remainingHideout = row.hideoutNeeds.filter(
      (need) => (progress.hideout[need.stationId] ?? 0) < need.level,
    );

    const levelCap =
      horizon === "current"
        ? progress.pmcLevel
        : horizon === "next"
          ? progress.pmcLevel + 5
          : null;
    const horizonTasks =
      levelCap === null
        ? remainingTasks
        : remainingTasks.filter((need) => need.minPlayerLevel <= levelCap);
    const horizonHideout = horizon === "current" ? [] : remainingHideout;

    const keep =
      horizonTasks.reduce((total, need) => total + need.count, 0) +
      horizonHideout.reduce((total, need) => total + need.count, 0);
    const surplus = Math.max(0, row.own - keep);
    const verdict = getVerdict(keep, surplus);

    const reasons: string[] = [];
    if (remainingHideout[0]) {
      reasons.push(`${remainingHideout[0].stationName} L${remainingHideout[0].level}`);
    }
    if (remainingTasks[0]) reasons.push(remainingTasks[0].taskName);

    return {
      ...row,
      keep,
      surplus,
      sold: soldRows.includes(row.name),
      verdict,
      verdictColor: getVerdictColor(verdict),
      reason: reasons.length > 0 ? reasons.join(" · ") : "No active requirements",
      fir: remainingTasks.some((need) => need.foundInRaid) ? "yes" : "no",
    };
  });
}

function getVerdict(keep: number, surplus: number): Verdict {
  if (keep <= 0) return "SELL";
  if (surplus > 0) return "PARTIAL";
  return "KEEP";
}

function getVerdictColor(verdict: Verdict) {
  if (verdict === "KEEP") return "#6ea862";
  if (verdict === "PARTIAL") return "var(--accent)";
  return "#c15b4e";
}

function verdictVariant(verdict: Verdict): "keep" | "partial" | "sell" {
  if (verdict === "KEEP") return "keep";
  if (verdict === "PARTIAL") return "partial";
  return "sell";
}
