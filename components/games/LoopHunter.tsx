"use client";

import { useEffect, useState } from "react";
import TransportTable from "@/components/TransportTable";
import { useApp, useStored } from "@/lib/i18n";
import { solve, type Cell, type LoopCell, type Solution, type Step } from "@/lib/solver";
import type { Cost } from "@/lib/mvalue";
import { Check, Cross } from "@/components/Icons";

interface Round {
  sol: Solution;
  step: Step;
  loop: LoopCell[];
  theta: number;
}

function makeRound(): Round {
  for (let tries = 0; tries < 300; tries++) {
    const m = 3 + Math.floor(Math.random() * 2);
    const n = 3 + Math.floor(Math.random() * 2);
    const costs: Cost[][] = Array.from({ length: m }, () => Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 15)));
    if (Math.random() < 0.7) costs[Math.floor(Math.random() * m)][Math.floor(Math.random() * n)] = "M";
    const supply = Array.from({ length: m }, () => 10 * (2 + Math.floor(Math.random() * 6)));
    const S = supply.reduce((a, b) => a + b, 0);
    const demand = Array(n).fill(10);
    let left = S - 10 * n;
    while (left > 0) {
      demand[Math.floor(Math.random() * n)] += 10;
      left -= 10;
    }
    const sol = solve({ costs, supply, demand }, "nwc", "modi");
    const loops = sol.steps.filter((s) => s.phase === "loop" && s.snap.loop && s.snap.loop.length >= 4);
    if (!loops.length) continue;
    const longer = loops.filter((s) => s.snap.loop!.length >= 6);
    const pool = longer.length && Math.random() < 0.5 ? longer : loops;
    const step = pool[Math.floor(Math.random() * pool.length)];
    const loop = step.snap.loop!;
    const theta = Math.min(...loop.filter((x) => x.sign === "-").map((x) => step.snap.alloc[x.r][x.c] as number));
    return { sol, step, loop, theta };
  }
  const sol = solve({ costs: [[5, "M", 4], [3, 6, 8], [7, 4, 5]], supply: [50, 40, 30], demand: [30, 50, 40] }, "lcm", "modi");
  const step = sol.steps.find((s) => s.phase === "loop")!;
  return { sol, step, loop: step.snap.loop!, theta: 10 };
}

const ROUNDS = 5;

export default function LoopHunter() {
  const { t } = useApp();
  const [round, setRound] = useState<Round | null>(null);
  const [no, setNo] = useState(1);
  const [sel, setSel] = useState<Cell[]>([]);
  const [stage, setStage] = useState<"loop" | "theta" | "done">("loop");
  const [checks, setChecks] = useState(0);
  const [loopOk, setLoopOk] = useState<null | boolean>(null);
  const [theta, setTheta] = useState("");
  const [thetaOk, setThetaOk] = useState<null | boolean>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [games, setGames] = useStored<Record<string, number>>("jr-games", {});

  useEffect(() => setRound(makeRound()), []);

  if (!round) return <div className="h-[420px] border border-line bg-surface" />;

  const enter = round.loop[0];
  const expected = round.loop.slice(1);
  const sameSet = (a: Cell[], b: Cell[]) => a.length === b.length && a.every((x) => b.some((y) => y.r === x.r && y.c === x.c));

  const click = (r: number, c: number) => {
    if (stage !== "loop") return;
    if (r === enter.r && c === enter.c) return;
    setLoopOk(null);
    setSel((s) => (s.some((x) => x.r === r && x.c === c) ? s.filter((x) => !(x.r === r && x.c === c)) : [...s, { r, c }]));
  };

  const checkLoop = () => {
    const ok = sameSet(sel, expected);
    setLoopOk(ok);
    setChecks((x) => x + 1);
    if (ok) {
      setScore((s) => s + (checks === 0 ? 20 : 10));
      setStage("theta");
    } else if (checks >= 1) {
      setSel(expected);
      setStage("theta");
    }
  };

  const checkTheta = () => {
    const ok = Number(theta) === round.theta;
    setThetaOk(ok);
    if (ok) setScore((s) => s + 10);
    setStage("done");
  };

  const next = () => {
    if (no >= ROUNDS) {
      setFinished(true);
      setGames((g) => ({ ...g, loophunter: Math.max(g.loophunter ?? 0, score) }));
      return;
    }
    setNo((x) => x + 1);
    setRound(makeRound());
    setSel([]);
    setStage("loop");
    setChecks(0);
    setLoopOk(null);
    setTheta("");
    setThetaOk(null);
  };

  const restart = () => {
    setFinished(false);
    setNo(1);
    setScore(0);
    setRound(makeRound());
    setSel([]);
    setStage("loop");
    setChecks(0);
    setLoopOk(null);
    setTheta("");
    setThetaOk(null);
  };

  const snap = {
    ...round.step.snap,
    loop: stage === "loop" ? undefined : round.loop,
    focus: [enter],
    focusKind: "enter" as const,
  };

  const rl = round.sol.rowLabels;
  const cl = round.sol.colLabels;

  return (
    <div className="border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-3 text-[14px]">
        <span>
          {t({ id: "Ronde", en: "Round" })} <strong className="num">{Math.min(no, ROUNDS)}</strong>/<span className="num">{ROUNDS}</span>
        </span>
        <span>
          {t({ id: "Skor", en: "Score" })} <strong className="num text-[18px]">{score}</strong>
        </span>
        <span>
          {t({ id: "Terbaik", en: "Best" })} <strong className="num">{games.loophunter ?? 0}</strong>
        </span>
      </div>

      {finished ? (
        <div className="grid min-h-[360px] place-items-center p-8 text-center">
          <div>
            <p className="text-[14px] text-muted">{t({ id: "Perburuan selesai", en: "Hunt complete" })}</p>
            <p className="num mt-2 text-[56px] font-semibold leading-none">{score}</p>
            <p className="mt-2 text-[15px]">{t({ id: `dari maksimum ${ROUNDS * 30} poin`, en: `out of a possible ${ROUNDS * 30}` })}</p>
            <button type="button" onClick={restart} className="mt-6 rounded-[3px] bg-route px-6 py-3 font-bold text-white">
              {t({ id: "Main lagi", en: "Play again" })}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <TransportTable data={round.sol} snap={snap} onCellClick={stage === "loop" ? click : undefined} selected={stage === "loop" ? sel : []} showReduced={false} />
          </div>
          <div>
            {stage === "loop" && (
              <>
                <p className="text-[17px] font-bold">
                  {t({ id: `Sel masuk: ${rl[enter.r]}${cl[enter.c]} (garis putus-putus).`, en: `Entering cell: ${rl[enter.r]}${cl[enter.c]} (dashed outline).` })}
                </p>
                <p className="mt-2 text-[15px] text-ink/80">
                  {t({
                    id: "Klik semua sel basis yang menjadi sudut loop tertutup dari sel masuk. Loop bergerak lurus dan hanya berbelok di sel basis.",
                    en: "Click every basic cell that forms a corner of the closed loop from the entering cell. The loop moves straight and turns only at basic cells.",
                  })}
                </p>
                <p className="num mt-3 text-[13px] text-muted">
                  {t({ id: "Dipilih", en: "Selected" })}: {sel.length}
                </p>
                <button type="button" onClick={checkLoop} disabled={sel.length < 3} className="mt-4 rounded-[3px] bg-ink px-5 py-2.5 font-bold text-paper disabled:opacity-40">
                  {t({ id: "Periksa loop", en: "Check loop" })}
                </button>
                {loopOk === false && (
                  <p className="mt-3 flex items-center gap-1.5 text-[14.5px] font-semibold text-alert" role="status">
                    <Cross className="h-4 w-4" />
                    {t({ id: "Belum tepat. Satu kesempatan lagi.", en: "Not quite. One more try." })}
                  </p>
                )}
              </>
            )}
            {stage !== "loop" && (
              <>
                <p className={`flex items-center gap-1.5 text-[15px] font-semibold ${loopOk ? "text-route" : "text-alert"}`}>
                  {loopOk ? <Check className="h-4 w-4" /> : <Cross className="h-4 w-4" />}
                  {loopOk ? t({ id: "Loop tepat.", en: "Loop correct." }) : t({ id: "Ini loop yang benar.", en: "Here is the correct loop." })}
                </p>
                <p className="mt-4 text-[17px] font-bold">{t({ id: "Berapa nilai θ?", en: "What is θ?" })}</p>
                <p className="mt-1 text-[15px] text-ink/80">{t({ id: "θ = alokasi terkecil di antara sel bertanda (−).", en: "θ = the smallest allocation among the (−) cells." })}</p>
                <form
                  className="mt-3 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (stage === "theta") checkTheta();
                  }}
                >
                  <input value={theta} onChange={(e) => setTheta(e.target.value)} inputMode="numeric" disabled={stage === "done"} className="num w-28 rounded-[3px] border border-ink/30 bg-paper px-3 py-2" aria-label="θ" />
                  {stage === "theta" && (
                    <button type="submit" className="rounded-[3px] bg-ink px-4 py-2 font-bold text-paper">
                      {t({ id: "Jawab", en: "Answer" })}
                    </button>
                  )}
                </form>
                {stage === "done" && (
                  <>
                    <p className={`mt-3 text-[14.5px] font-semibold ${thetaOk ? "text-route" : "text-alert"}`} role="status">
                      {thetaOk ? t({ id: "Benar.", en: "Correct." }) : t({ id: `θ = ${round.theta}.`, en: `θ = ${round.theta}.` })}
                    </p>
                    <button type="button" onClick={next} className="mt-5 rounded-[3px] bg-route px-5 py-2.5 font-bold text-white">
                      {no >= ROUNDS ? t({ id: "Lihat skor", en: "See score" }) : t({ id: "Ronde berikutnya", en: "Next round" })}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
