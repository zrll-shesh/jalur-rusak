"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Fragment, useMemo } from "react";
import type { Cell, Snapshot, Solution } from "@/lib/solver";
import { fmt, isNeg, isZero } from "@/lib/mvalue";
import { useApp } from "@/lib/i18n";

export type TableData = Pick<
  Solution,
  "costs" | "rawCosts" | "rowLabels" | "colLabels" | "supply" | "demand" | "dummyRow" | "dummyCol" | "m" | "n"
>;

interface Props {
  data: TableData;
  snap: Snapshot;
  compact?: boolean;
  onCellClick?: (r: number, c: number) => void;
  selected?: Cell[];
  wrong?: Cell[];
  hideAllocations?: boolean;
  caption?: string;
  showReduced?: boolean;
}

const has = (list: Cell[] | undefined, r: number, c: number) => !!list?.some((x) => x.r === r && x.c === c);

export default function TransportTable({
  data,
  snap,
  compact,
  onCellClick,
  selected,
  wrong,
  hideAllocations,
  caption,
  showReduced = true,
}: Props) {
  const { t } = useApp();
  const reduce = useReducedMotion();
  const { m, n, rowLabels, colLabels, costs, rawCosts, supply, demand, dummyRow, dummyCol } = data;

  const rows = useMemo(
    () => [...Array(m).keys()].filter((r) => !(snap.hideDummy && dummyRow && r === m - 1)),
    [m, snap.hideDummy, dummyRow]
  );
  const cols = useMemo(
    () => [...Array(n).keys()].filter((c) => !(snap.hideDummy && dummyCol && c === n - 1)),
    [n, snap.hideDummy, dummyCol]
  );

  const longLabels = rowLabels.some((l) => l.length > 4);
  const CW = compact ? 66 : longLabels ? 90 : 76;
  const CH = compact ? 56 : 70;
  const LW = longLabels ? 104 : 60;
  const HH = compact ? 38 : 42;
  const SW = 78;
  const XW = 74;
  const showU = !!snap.u;
  const showRowPen = !!snap.rowPen;
  const showV = !!snap.v;
  const showColPen = !!snap.colPen;

  const gridCols = [`${LW}px`, ...cols.map(() => `${CW}px`), `${SW}px`, ...(showU ? [`${XW}px`] : []), ...(showRowPen ? [`${XW + 6}px`] : [])].join(" ");
  const width = LW + cols.length * CW + SW + (showU ? XW : 0) + (showRowPen ? XW + 6 : 0);
  const height = HH + rows.length * CH + (compact ? 44 : 50) + (showV ? 40 : 0) + (showColPen ? 40 : 0);

  const colPos = (c: number) => LW + cols.indexOf(c) * CW + CW / 2;
  const rowPos = (r: number) => HH + rows.indexOf(r) * CH + CH / 2;

  const loopPath = useMemo(() => {
    if (!snap.loop || snap.loop.length < 4) return null;
    const pts = snap.loop.map((x) => [colPos(x.c), rowPos(x.r)]);
    pts.push(pts[0]);
    return "M " + pts.map((p) => `${p[0]} ${p[1]}`).join(" L ");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snap.loop, cols, rows, CW, CH, LW, HH]);

  const isDummyRow = (r: number) => dummyRow && r === m - 1;
  const isDummyCol = (c: number) => dummyCol && c === n - 1;
  const loopSign = (r: number, c: number) => snap.loop?.find((x) => x.r === r && x.c === c)?.sign;

  const headCls = "flex items-center justify-center border-b border-r border-line text-[13px] font-bold";

  return (
    <figure className="scroll-x -mx-1 px-1 pb-2">
      <div className="relative inline-block border-l border-t border-line bg-surface" style={{ width, minWidth: width }}>
        <div className="grid" style={{ gridTemplateColumns: gridCols }}>
          {/* Header */}
          <div className={`${headCls} text-muted`} style={{ height: HH }}>
            <span className="num text-[11px]">S \ D</span>
          </div>
          {cols.map((c) => (
            <div
              key={`h${c}`}
              className={`${headCls} ${snap.colDone?.[c] ? "text-muted line-through decoration-2" : ""} ${isDummyCol(c) ? "italic text-muted" : ""}`}
              style={{ height: HH }}
            >
              <span className="truncate px-1">{colLabels[c]}</span>
            </div>
          ))}
          <div className={`${headCls} text-muted`} style={{ height: HH }}>
            {t({ id: "Supply", en: "Supply" })}
          </div>
          {showU && (
            <div className={`${headCls} num bg-routeSoft/60 text-route`} style={{ height: HH }}>
              u<sub>i</sub>
            </div>
          )}
          {showRowPen && (
            <div className={`${headCls} bg-hazard/15`} style={{ height: HH }}>
              {t({ id: "Penalti", en: "Penalty" })}
            </div>
          )}

          {/* Body */}
          {rows.map((r) => (
            <Fragment key={`r${r}`}>
              <div
                className={`flex items-center border-b border-r border-line px-2 text-[14px] font-bold ${snap.rowDone?.[r] ? "text-muted line-through decoration-2" : ""} ${isDummyRow(r) ? "italic text-muted" : ""}`}
                style={{ height: CH }}
              >
                <span className="truncate">{rowLabels[r]}</span>
              </div>
              {cols.map((c) => {
                const a = snap.alloc[r]?.[c] ?? null;
                const broken = rawCosts[r][c] === "M";
                const crossed = (snap.rowDone?.[r] || snap.colDone?.[c]) && a === null;
                const focused = has(snap.focus, r, c);
                const sel = has(selected, r, c);
                const bad = has(wrong, r, c);
                const d = snap.reduced?.[r]?.[c];
                const sign = loopSign(r, c);
                const Tag = onCellClick ? "button" : "div";
                const focusColor =
                  snap.focusKind === "leave"
                    ? "border-alert"
                    : snap.focusKind === "warn"
                    ? "border-hazard"
                    : snap.focusKind === "epsilon"
                    ? "border-route"
                    : "border-route";
                return (
                  <Tag
                    key={`c${r}-${c}`}
                    {...(onCellClick
                      ? {
                          type: "button" as const,
                          onClick: () => onCellClick(r, c),
                          "aria-label": `${rowLabels[r]} ${colLabels[c]}, ${t({ id: "biaya", en: "cost" })} ${fmt(costs[r][c])}${a !== null ? `, ${t({ id: "alokasi", en: "allocation" })} ${a}` : ""}`,
                          "aria-pressed": sel,
                        }
                      : {})}
                    className={`relative border-b border-r border-line text-left ${broken ? "hazard-cell" : ""} ${isDummyRow(r) || isDummyCol(c) ? "bg-paper/60" : ""} ${crossed ? "opacity-40" : ""} ${onCellClick ? "cursor-pointer transition-colors hover:bg-routeSoft/50" : ""}`}
                    style={{ height: CH }}
                  >
                    {/* biaya */}
                    <span className="absolute right-0 top-0">
                      {broken ? (
                        <span className="num block bg-[#1C2321] px-1.5 py-[1px] text-[12px] font-semibold text-[#F5B700]">M</span>
                      ) : (
                        <span className="num block border-b border-l border-line px-1.5 py-[1px] text-[12px] text-muted">{fmt(costs[r][c])}</span>
                      )}
                    </span>
                    {/* tanda loop */}
                    {sign && (
                      <motion.span
                        initial={reduce ? false : { scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 22 }}
                        className={`num absolute left-1 top-1 z-[2] grid h-5 w-5 place-items-center rounded-full text-[13px] font-semibold text-white ${sign === "+" ? "bg-route" : "bg-alert"}`}
                      >
                        {sign === "+" ? "+" : "−"}
                      </motion.span>
                    )}
                    {/* alokasi */}
                    {!hideAllocations && a !== null && (
                      <motion.span
                        key={`${a}`}
                        initial={reduce ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className={`num absolute inset-0 z-[1] grid place-items-center pt-2 ${compact ? "text-[19px]" : "text-[22px]"} font-semibold ${broken ? "text-alert" : "text-ink"}`}
                      >
                        <span className={`${broken ? "bg-surface/85 px-1" : ""}`}>{a === 0 ? "ε" : a}</span>
                      </motion.span>
                    )}
                    {/* d_ij */}
                    {showReduced && d && a === null && (
                      <span
                        className={`num absolute bottom-1 left-1.5 z-[1] max-w-[calc(100%-8px)] truncate text-[11px] ${isNeg(d) ? "font-semibold text-alert" : isZero(d) ? "text-route" : "text-muted"}`}
                        title={`d = ${fmt(d)}`}
                      >
                        {fmt(d)}
                      </span>
                    )}
                    {focused && (
                      <motion.span
                        initial={reduce ? false : { opacity: 0, scale: 1.15 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25 }}
                        className={`pointer-events-none absolute inset-[3px] z-[3] border-[3px] ${focusColor} ${snap.focusKind === "enter" ? "border-dashed" : ""}`}
                      />
                    )}
                    {sel && <span className="pointer-events-none absolute inset-[3px] z-[3] border-[3px] border-route" />}
                    {bad && <span className="pointer-events-none absolute inset-[3px] z-[3] border-[3px] border-alert" />}
                  </Tag>
                );
              })}
              <div className="num flex flex-col items-center justify-center border-b border-r border-line text-[15px]" style={{ height: CH }}>
                {snap.supplyLeft && snap.supplyLeft[r] !== supply[r] ? (
                  <>
                    <span className="text-[12px] text-muted line-through">{supply[r]}</span>
                    <span className="font-semibold">{snap.supplyLeft[r]}</span>
                  </>
                ) : (
                  <span className="font-semibold">{supply[r]}</span>
                )}
              </div>
              {showU && (
                <div className="num flex items-center justify-center border-b border-r border-line bg-routeSoft/40 px-1 text-center text-[13px] font-semibold text-route" style={{ height: CH }}>
                  {snap.u![r] ? fmt(snap.u![r]!) : ""}
                </div>
              )}
              {showRowPen && (
                <div
                  className={`num flex items-center justify-center border-b border-r border-line px-1 text-center text-[13px] ${snap.penPick?.kind === "row" && snap.penPick.idx === r ? "bg-hazard font-semibold text-[#1C2321]" : "bg-hazard/10"}`}
                  style={{ height: CH }}
                >
                  {snap.rowPen![r] ? fmt(snap.rowPen![r]!) : "–"}
                </div>
              )}
            </Fragment>
          ))}

          {/* Demand */}
          <div className={`${headCls} justify-start px-2 text-muted`} style={{ height: compact ? 44 : 50 }}>
            {t({ id: "Demand", en: "Demand" })}
          </div>
          {cols.map((c) => (
            <div key={`d${c}`} className="num flex flex-col items-center justify-center border-b border-r border-line text-[15px]" style={{ height: compact ? 44 : 50 }}>
              {snap.demandLeft && snap.demandLeft[c] !== demand[c] ? (
                <>
                  <span className="text-[12px] text-muted line-through">{demand[c]}</span>
                  <span className="font-semibold">{snap.demandLeft[c]}</span>
                </>
              ) : (
                <span className="font-semibold">{demand[c]}</span>
              )}
            </div>
          ))}
          <div className="num flex items-center justify-center border-b border-r border-line text-[13px] text-muted" style={{ height: compact ? 44 : 50 }}>
            {(snap.hideDummy ? rows : [...Array(m).keys()]).reduce((s, r) => s + supply[r], 0)}
          </div>
          {showU && <div className="border-b border-r border-line bg-routeSoft/40" style={{ height: compact ? 44 : 50 }} />}
          {showRowPen && <div className="border-b border-r border-line bg-hazard/10" style={{ height: compact ? 44 : 50 }} />}

          {showV && (
            <>
              <div className={`${headCls} num bg-routeSoft/60 text-route`} style={{ height: 40 }}>
                v<sub>j</sub>
              </div>
              {cols.map((c) => (
                <div key={`v${c}`} className="num flex items-center justify-center border-b border-r border-line bg-routeSoft/40 px-1 text-center text-[13px] font-semibold text-route" style={{ height: 40 }}>
                  {snap.v![c] ? fmt(snap.v![c]!) : ""}
                </div>
              ))}
              <div className="border-b border-r border-line bg-routeSoft/40" style={{ height: 40 }} />
              {showU && <div className="border-b border-r border-line bg-routeSoft/40" style={{ height: 40 }} />}
              {showRowPen && <div className="border-b border-r border-line" style={{ height: 40 }} />}
            </>
          )}
          {showColPen && (
            <>
              <div className={`${headCls} bg-hazard/15 text-[12px]`} style={{ height: 40 }}>
                {t({ id: "Penalti", en: "Penalty" })}
              </div>
              {cols.map((c) => (
                <div
                  key={`p${c}`}
                  className={`num flex items-center justify-center border-b border-r border-line px-1 text-center text-[13px] ${snap.penPick?.kind === "col" && snap.penPick.idx === c ? "bg-hazard font-semibold text-[#1C2321]" : "bg-hazard/10"}`}
                  style={{ height: 40 }}
                >
                  {snap.colPen![c] ? fmt(snap.colPen![c]!) : "–"}
                </div>
              ))}
              <div className="border-b border-r border-line bg-hazard/10" style={{ height: 40 }} />
              {showU && <div className="border-b border-r border-line" style={{ height: 40 }} />}
              {showRowPen && <div className="border-b border-r border-line" style={{ height: 40 }} />}
            </>
          )}
        </div>

        {loopPath && (
          <svg className="pointer-events-none absolute left-0 top-0 z-[2]" width={width} height={height} aria-hidden="true">
            <motion.path
              key={loopPath}
              d={loopPath}
              fill="none"
              stroke="rgb(var(--route))"
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeOpacity={0.85}
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
            />
          </svg>
        )}
      </div>
      {caption && <figcaption className="mt-2 text-[13px] text-muted">{caption}</figcaption>}
    </figure>
  );
}
