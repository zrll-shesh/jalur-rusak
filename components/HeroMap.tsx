"use client";

import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { solve } from "@/lib/solver";
import type { Cost } from "@/lib/mvalue";
import { fmt } from "@/lib/mvalue";
import { useApp } from "@/lib/i18n";
import { Refresh } from "./Icons";

const BASE = [
  [5, 7, 4],
  [3, 6, 8],
  [7, 4, 5],
];
const SUPPLY = [50, 40, 30];
const DEMAND = [30, 50, 40];
const SX = 92;
const DX = 548;
const YS = [86, 220, 354];
const K = 190;

const bez = (sy: number, dy: number, tt: number) => {
  const a = (1 - tt) ** 3,
    b = 3 * (1 - tt) ** 2 * tt,
    c = 3 * (1 - tt) * tt ** 2,
    d = tt ** 3;
  return {
    x: a * SX + b * (SX + K) + c * (DX - K) + d * DX,
    y: a * sy + b * sy + c * dy + d * dy,
  };
};

const key = (r: number, c: number) => `${r}-${c}`;

export default function HeroMap() {
  const { t } = useApp();
  const reduce = useReducedMotion();
  const [broken, setBroken] = useState<Set<string>>(() => new Set(["0-1"]));
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null);

  const sol = useMemo(() => {
    const costs: Cost[][] = BASE.map((row, r) => row.map((v, c) => (broken.has(key(r, c)) ? "M" : v)));
    return solve({ costs, supply: SUPPLY, demand: DEMAND }, "vam", "modi");
  }, [broken]);

  const toggle = (r: number, c: number) =>
    setBroken((prev) => {
      const next = new Set(prev);
      if (next.has(key(r, c))) next.delete(key(r, c));
      else next.add(key(r, c));
      return next;
    });

  const maxQ = 50;
  const edges = [];
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) {
      const sy = YS[r],
        dy = YS[c];
      const d = `M ${SX} ${sy} C ${SX + K} ${sy}, ${DX - K} ${dy}, ${DX} ${dy}`;
      const q = sol.finalAlloc[r][c] ?? 0;
      const isBroken = broken.has(key(r, c));
      const bar = bez(sy, dy, 0.6);
      const ang = (() => {
        const p1 = bez(sy, dy, 0.58),
          p2 = bez(sy, dy, 0.62);
        return (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
      })();
      edges.push({ r, c, d, q, isBroken, bar, ang, order: r * 3 + c });
    }

  const hoverInfo = hover ? { ...hover, q: sol.finalAlloc[hover.r][hover.c] ?? 0, broken: broken.has(key(hover.r, hover.c)) } : null;

  return (
    <div className="relative">
      <div className="relative border border-line bg-surface">
        <div className="paper-grid absolute inset-0 opacity-60" aria-hidden="true" />
        <svg viewBox="0 0 640 440" className="relative block h-auto w-full" role="group" aria-label={t({ id: "Peta jaringan distribusi interaktif", en: "Interactive distribution network map" })}>
          <defs>
            <pattern id="hz" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="10" height="10" fill="rgb(var(--hazard))" />
              <rect width="5" height="10" fill="#1C2321" />
            </pattern>
          </defs>

          {/* Jalan tidak terpakai dan terpakai */}
          {edges.map((e) => (
            <g key={`e${e.r}${e.c}`}>
              {e.isBroken ? (
                <>
                  <motion.path
                    d={e.d}
                    fill="none"
                    stroke="#1C2321"
                    strokeWidth={6}
                    initial={reduce ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.7, delay: reduce ? 0 : 0.35 + e.order * 0.05 }}
                  />
                  <path d={e.d} fill="none" stroke="rgb(var(--hazard))" strokeWidth={6} strokeDasharray="9 9" />
                </>
              ) : (
                <motion.path
                  d={e.d}
                  fill="none"
                  stroke={e.q > 0 ? "rgb(var(--route))" : "rgb(var(--line))"}
                  strokeWidth={e.q > 0 ? 2.5 + (e.q / maxQ) * 9 : 1.5}
                  strokeLinecap="round"
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1, strokeWidth: e.q > 0 ? 2.5 + (e.q / maxQ) * 9 : 1.5 }}
                  transition={{ pathLength: { duration: 0.8, delay: reduce ? 0 : 0.35 + e.order * 0.05 }, strokeWidth: { duration: 0.4 } }}
                />
              )}
            </g>
          ))}

          {/* Truk bergerak di jalur terpakai */}
          {!reduce &&
            edges
              .filter((e) => e.q > 0 && !e.isBroken)
              .map((e) =>
                Array.from({ length: Math.max(1, Math.round(e.q / 15)) }).map((_, k, arr) => (
                  <rect key={`t${e.r}${e.c}${k}-${e.q}`} x={-5} y={-3.5} width={10} height={7} rx={1.5} fill="rgb(var(--ink))">
                    <animateMotion dur="4.2s" repeatCount="indefinite" begin={`${1.4 + (k * 4.2) / arr.length}s`} path={e.d} rotate="auto" />
                  </rect>
                ))
              )}
          {!reduce &&
            edges
              .filter((e) => e.q > 0 && e.isBroken)
              .map((e) => (
                <rect key={`tb${e.r}${e.c}`} x={-5} y={-3.5} width={10} height={7} rx={1.5} fill="rgb(var(--alert))">
                  <animateMotion dur="5s" repeatCount="indefinite" path={e.d} rotate="auto" />
                </rect>
              ))}

          {/* Penghalang di jalur rusak */}
          {edges
            .filter((e) => e.isBroken)
            .map((e) => (
              <g key={`b${e.r}${e.c}`} transform={`translate(${e.bar.x} ${e.bar.y}) rotate(${e.ang + 90})`}>
                <rect x={-16} y={-6} width={32} height={12} fill="url(#hz)" stroke="#1C2321" strokeWidth={1.5} />
              </g>
            ))}

          {/* Area klik */}
          {edges.map((e) => (
            <path
              key={`h${e.r}${e.c}`}
              d={e.d}
              fill="none"
              stroke="transparent"
              strokeWidth={18}
              className="cursor-pointer outline-none"
              role="button"
              tabIndex={0}
              aria-pressed={e.isBroken}
              aria-label={`S${e.r + 1} ${t({ id: "ke", en: "to" })} D${e.c + 1}: ${e.isBroken ? t({ id: "rusak, klik untuk memperbaiki", en: "broken, click to repair" }) : t({ id: "normal, klik untuk merusak", en: "open, click to break" })}`}
              onClick={() => toggle(e.r, e.c)}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" || ev.key === " ") {
                  ev.preventDefault();
                  toggle(e.r, e.c);
                }
              }}
              onMouseEnter={() => setHover({ r: e.r, c: e.c })}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover({ r: e.r, c: e.c })}
              onBlur={() => setHover(null)}
            />
          ))}
          {hover && (
            <path
              d={edges.find((e) => e.r === hover.r && e.c === hover.c)!.d}
              fill="none"
              stroke="rgb(var(--ink))"
              strokeWidth={1.5}
              strokeDasharray="3 4"
              pointerEvents="none"
            />
          )}

          {/* Simpul sumber */}
          {YS.map((y, r) => (
            <motion.g key={`s${r}`} initial={reduce ? false : { opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: reduce ? 0 : 0.15 + r * 0.06 }}>
              <rect x={SX - 62} y={y - 24} width={62} height={48} fill="rgb(var(--sign))" />
              <text x={SX - 31} y={y - 3} textAnchor="middle" fill="#fff" fontWeight={900} fontSize={17} fontFamily="Overpass, sans-serif">
                S{r + 1}
              </text>
              <text x={SX - 31} y={y + 15} textAnchor="middle" fill="#fff" fillOpacity={0.8} fontSize={12} fontFamily="Overpass Mono, monospace">
                {SUPPLY[r]}
              </text>
            </motion.g>
          ))}
          {/* Simpul tujuan */}
          {YS.map((y, c) => (
            <motion.g key={`d${c}`} initial={reduce ? false : { opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: reduce ? 0 : 0.15 + c * 0.06 }}>
              <circle cx={DX + 28} cy={y} r={28} fill="rgb(var(--surface))" stroke="rgb(var(--ink))" strokeWidth={2.5} />
              <text x={DX + 28} y={y - 2} textAnchor="middle" fill="rgb(var(--ink))" fontWeight={900} fontSize={16} fontFamily="Overpass, sans-serif">
                D{c + 1}
              </text>
              <text x={DX + 28} y={y + 14} textAnchor="middle" fill="rgb(var(--muted))" fontSize={11} fontFamily="Overpass Mono, monospace">
                {DEMAND[c]}
              </text>
            </motion.g>
          ))}
        </svg>

        {/* Tooltip */}
        <AnimatePresence>
          {hoverInfo && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="pointer-events-none absolute left-3 top-3 border border-ink bg-paper px-3 py-2 text-[13px] shadow-[3px_3px_0_rgb(var(--ink))]"
            >
              <p className="font-bold">
                S{hoverInfo.r + 1} → D{hoverInfo.c + 1}
              </p>
              <p className="num text-muted">
                c = {hoverInfo.broken ? "M" : BASE[hoverInfo.r][hoverInfo.c]}, x = {hoverInfo.q}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Panel hasil */}
      <div className="grid grid-cols-[1fr_auto] items-end gap-4 border-x border-b border-line bg-surface px-4 py-3">
        <div className="min-w-0">
          <p className="text-[12px] text-muted">{t({ id: "Biaya optimal saat ini", en: "Current optimal cost" })}</p>
          <p className={`num text-[28px] font-semibold leading-tight ${sol.feasible ? "" : "text-alert"}`}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={fmt(sol.totalCost)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="inline-block">
                {fmt(sol.totalCost)}
              </motion.span>
            </AnimatePresence>
          </p>
          <p className="mt-0.5 text-[13px] text-muted">
            {!sol.feasible
              ? t({ id: "Tidak layak: permintaan tak bisa dipenuhi tanpa jalur rusak.", en: "Infeasible: demand cannot be met without a broken route." })
              : broken.size === 0
              ? t({ id: "Semua jalan terbuka.", en: "All roads are open." })
              : t({ id: `${broken.size} jalan rusak, semuanya berhasil dihindari.`, en: `${broken.size} broken road${broken.size > 1 ? "s" : ""}, all avoided.` })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setBroken(new Set(["0-1"]))}
          className="flex items-center gap-1.5 rounded-[3px] border border-ink/25 px-3 py-2 text-[13px] font-semibold hover:border-ink"
        >
          <Refresh className="h-4 w-4" />
          {t({ id: "Atur ulang", en: "Reset" })}
        </button>
      </div>
    </div>
  );
}
