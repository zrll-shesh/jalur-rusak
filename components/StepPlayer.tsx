"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Solution } from "@/lib/solver";
import { methodName, optName } from "@/lib/solver";
import { fmt } from "@/lib/mvalue";
import { useApp } from "@/lib/i18n";
import { phaseName, ui } from "@/lib/content/ui";
import TransportTable from "./TransportTable";
import { ChevL, ChevR, Pause, Play, ToEnd, ToStart } from "./Icons";

const phaseTone: Record<string, string> = {
  setup: "bg-ink/30",
  balance: "bg-ink/45",
  initial: "bg-route/55",
  degenerate: "bg-hazard",
  cost: "bg-ink/60",
  uv: "bg-route/80",
  reduced: "bg-route",
  loop: "bg-alert/80",
  pivot: "bg-alert",
  optimal: "bg-route",
  result: "bg-ink",
};

export default function StepPlayer({ sol, globalKeys = true }: { sol: Solution; globalKeys?: boolean }) {
  const { t } = useApp();
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const total = sol.steps.length;
  const step = sol.steps[Math.min(i, total - 1)];
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setI(0);
    setPlaying(false);
  }, [sol]);

  const go = useCallback((k: number) => setI(Math.max(0, Math.min(total - 1, k))), [total]);

  useEffect(() => {
    if (!playing) return;
    if (i >= total - 1) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => setI((x) => x + 1), 3400);
    return () => clearTimeout(id);
  }, [playing, i, total]);

  useEffect(() => {
    if (!globalKeys) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setI((x) => Math.min(total - 1, x + 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setI((x) => Math.max(0, x - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [globalKeys, total]);

  const phases = useMemo(() => {
    // Kelompokkan langkah berurutan dengan fase yang sama untuk legenda
    const out: { phase: string; start: number; end: number }[] = [];
    sol.steps.forEach((s, k) => {
      const key = s.phase === "uv" || s.phase === "reduced" || s.phase === "loop" || s.phase === "pivot" ? `it${s.iteration}` : s.phase;
      const last = out[out.length - 1];
      if (last && last.phase === key) last.end = k;
      else out.push({ phase: key, start: k, end: k });
    });
    return out;
  }, [sol]);

  const btn = "grid h-10 w-10 place-items-center rounded-[3px] border border-ink/20 text-ink transition-colors hover:border-ink disabled:opacity-30 disabled:hover:border-ink/20";

  return (
    <div ref={rootRef} className="border border-line bg-surface">
      {/* Ringkasan */}
      <dl className="grid grid-cols-2 gap-px border-b border-line bg-line text-[14px] sm:grid-cols-4">
        {[
          [t(ui.method), t(methodName[sol.method])],
          [t({ id: "Biaya awal", en: "Initial cost" }), fmt(sol.initialCost)],
          [t({ id: "Biaya optimal", en: "Optimal cost" }), fmt(sol.totalCost)],
          [t({ id: "Iterasi", en: "Iterations" }), `${sol.iterations} (${t(optName[sol.optimality])})`],
        ].map(([k, v], idx) => (
          <div key={idx} className="bg-surface px-4 py-3">
            <dt className="text-[12px] text-muted">{k}</dt>
            <dd className={`mt-0.5 font-semibold ${idx > 0 ? "num" : ""} ${idx === 2 && !sol.feasible ? "text-alert" : ""}`}>{v}</dd>
          </div>
        ))}
      </dl>

      {/* Linimasa langkah */}
      <div className="border-b border-line px-4 py-3">
        <div className="flex h-3 w-full gap-[2px]" role="tablist" aria-label={t(ui.step)}>
          {sol.steps.map((s, k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={k === i}
              aria-label={`${t(ui.step)} ${k + 1}: ${t(s.title)}`}
              title={`${k + 1}. ${t(s.title)}`}
              onClick={() => go(k)}
              className={`relative h-full flex-1 transition-opacity ${phaseTone[s.phase]} ${k === i ? "opacity-100" : k < i ? "opacity-70" : "opacity-25 hover:opacity-60"}`}
            >
              {k === i && <motion.span layoutId={`tick-${sol.method}-${sol.optimality}`} className="absolute -bottom-[6px] left-1/2 h-[3px] w-full -translate-x-1/2 bg-ink" />}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted">
          {phases.map((p) => {
            const label = p.phase.startsWith("it") ? `${t({ id: "Iterasi", en: "Iteration" })} ${p.phase.slice(2)}` : t(phaseName[p.phase]);
            const active = i >= p.start && i <= p.end;
            return (
              <button key={p.phase + p.start} type="button" onClick={() => go(p.start)} className={`hover:text-ink ${active ? "font-bold text-ink" : ""}`}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 border-b border-line p-4 md:p-5 xl:border-b-0 xl:border-r">
          <TransportTable data={sol} snap={step.snap} />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button type="button" className={btn} onClick={() => go(0)} disabled={i === 0} aria-label={t(ui.first)} title={t(ui.first)}>
              <ToStart className="h-4 w-4" />
            </button>
            <button type="button" className={btn} onClick={() => go(i - 1)} disabled={i === 0} aria-label={t(ui.prev)} title={t(ui.prev)}>
              <ChevL className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (i >= total - 1) setI(0);
                setPlaying((p) => !p);
              }}
              className="flex h-10 items-center gap-2 rounded-[3px] bg-ink px-4 text-[14px] font-bold text-paper"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? t(ui.pause) : t(ui.play)}
            </button>
            <button type="button" className={btn} onClick={() => go(i + 1)} disabled={i >= total - 1} aria-label={t(ui.next)} title={t(ui.next)}>
              <ChevR className="h-4 w-4" />
            </button>
            <button type="button" className={btn} onClick={() => go(total - 1)} disabled={i >= total - 1} aria-label={t(ui.last)} title={t(ui.last)}>
              <ToEnd className="h-4 w-4" />
            </button>
            <span className="num ml-auto text-[14px] text-muted">
              {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </div>
          <p className="mt-3 hidden text-[12px] text-muted md:block">{t(ui.keyHint)}</p>
        </div>

        <div className="min-w-0 p-5 md:p-6" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${i}-${sol.method}`}
              initial={reduce ? false : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <p className="flex items-center gap-2 text-[13px] font-bold text-muted">
                <span className={`inline-block h-2.5 w-2.5 ${phaseTone[step.phase]}`} />
                {t(phaseName[step.phase])}
                {step.iteration ? <span className="font-normal">, {t({ id: "iterasi", en: "iteration" })} {step.iteration}</span> : null}
              </p>
              <h3 className="mt-2 text-[22px] font-extrabold leading-tight tracking-[-0.015em]">{t(step.title)}</h3>
              <div className="prose-body mt-4 text-[15.5px] leading-relaxed">
                {step.body.map((b, k) => (
                  <p key={k}>{t(b)}</p>
                ))}
              </div>
              {step.calc && step.calc.length > 0 && (
                <div className="mt-5">
                  <p className="text-[12px] font-bold text-muted">{t(ui.calc)}</p>
                  <div className="num mt-2 max-h-[340px] overflow-auto border-l-[3px] border-route bg-paper px-3 py-2.5 text-[13px] leading-[1.75]">
                    {step.calc.map((c, k) => {
                      const penPrefix = step.snap.penPick
                        ? `${step.snap.penPick.kind === "row" ? sol.rowLabels[step.snap.penPick.idx] : sol.colLabels[step.snap.penPick.idx]}:`
                        : null;
                      const isPickedPen = !!(penPrefix && c.startsWith(penPrefix));
                      return (
                        <div
                          key={k}
                          className={`whitespace-pre-wrap ${
                            c.includes("< 0")
                              ? "text-alert"
                              : isPickedPen
                              ? "-mx-1.5 rounded-[2px] bg-hazard/25 px-1.5 font-semibold text-ink"
                              : ""
                          }`}
                        >
                          {c}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
