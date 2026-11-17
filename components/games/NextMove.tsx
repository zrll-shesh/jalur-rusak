"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import TransportTable from "@/components/TransportTable";
import { useApp, useStored } from "@/lib/i18n";
import { solve, type Cell, type Solution, type Snapshot } from "@/lib/solver";
import type { Cost } from "@/lib/mvalue";
import { fmt } from "@/lib/mvalue";

type Mode = "lcm" | "vam";

function shuffle<T>(a: T[]) {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function generate(mode: Mode): Solution {
  for (let tries = 0; tries < 400; tries++) {
    const m = 3;
    const n = Math.random() < 0.5 ? 3 : 4;
    const pool = shuffle(Array.from({ length: 22 }, (_, i) => i + 1)).slice(0, m * n);
    const costs: Cost[][] = Array.from({ length: m }, (_, r) => Array.from({ length: n }, (_, c) => pool[r * n + c]));
    const k = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < k; i++) costs[Math.floor(Math.random() * m)][Math.floor(Math.random() * n)] = "M";
    const supply = Array.from({ length: m }, () => 5 * (4 + Math.floor(Math.random() * 9)));
    const S = supply.reduce((a, b) => a + b, 0);
    const demand = Array(n).fill(5);
    let left = S - 5 * n;
    while (left > 0) {
      demand[Math.floor(Math.random() * n)] += 5;
      left -= 5;
    }
    const sol = solve({ costs, supply, demand }, mode, "modi", { initialOnly: true });
    const init = sol.steps.filter((s) => s.phase === "initial");
    if (init.some((s) => s.tie)) continue;
    if (sol.steps.some((s) => s.phase === "degenerate")) continue;
    if (init.length < 4) continue;
    return sol;
  }
  return solve({ costs: [[5, "M", 4], [3, 6, 8], [7, 4, 5]], supply: [50, 40, 30], demand: [30, 50, 40] }, mode, "modi", { initialOnly: true });
}

export default function NextMove() {
  const [mode, setMode] = useState<Mode>("lcm");
  const [sol, setSol] = useState<Solution | null>(null);
  const [round, setRound] = useState(0);
  useEffect(() => {
    setSol(generate("lcm"));
  }, []);
  const onNew = (m: Mode) => {
    setMode(m);
    setSol(generate(m));
    setRound((x) => x + 1);
  };
  if (!sol) return <div className="h-[420px] border border-line bg-surface" />;
  return <Board key={round} sol={sol} mode={mode} onNew={onNew} />;
}

function Board({ sol, mode, onNew }: { sol: Solution; mode: Mode; onNew: (m: Mode) => void }) {
  const { t } = useApp();
  const [k, setK] = useState(0);
  const [wrong, setWrong] = useState<Cell[]>([]);
  const [misses, setMisses] = useState(0);
  const [firstTry, setFirstTry] = useState(0);
  const [stepMiss, setStepMiss] = useState(0);
  const [hint, setHint] = useState(false);
  const [games, setGames] = useStored<Record<string, number>>("jr-games", {});

  const init = useMemo(() => sol.steps.filter((s) => s.phase === "initial"), [sol]);
  const balance = sol.steps.find((s) => s.phase === "balance")!;
  const done = k >= init.length;
  const cur = init[Math.min(k, init.length - 1)];
  const prev: Snapshot = k === 0 ? { ...balance.snap, rowDone: Array(sol.m).fill(false), colDone: Array(sol.n).fill(false) } : init[k - 1].snap;
  const target = cur.snap.focus![0];

  const snap: Snapshot = done
    ? { ...init[init.length - 1].snap, focus: undefined }
    : {
        ...prev,
        focus: stepMiss >= 2 ? [target] : undefined,
        focusKind: "alloc",
        rowPen: mode === "vam" && hint ? cur.snap.rowPen : undefined,
        colPen: mode === "vam" && hint ? cur.snap.colPen : undefined,
        penPick: undefined,
      };

  const newGame = (m: Mode = mode) => onNew(m);

  const click = (r: number, c: number) => {
    if (done) return;
    if (r === target.r && c === target.c) {
      if (stepMiss === 0) setFirstTry((x) => x + 1);
      setStepMiss(0);
      setWrong([]);
      const nk = k + 1;
      setK(nk);
      if (nk >= init.length) {
        const acc = Math.round(((firstTry + (stepMiss === 0 ? 1 : 0)) / init.length) * 100);
        setGames((g) => ({ ...g, nextmove: Math.max(g.nextmove ?? 0, acc) }));
      }
    } else {
      setWrong([{ r, c }]);
      setMisses((x) => x + 1);
      setStepMiss((x) => x + 1);
    }
  };

  const total = sol.steps.find((s) => s.phase === "cost");
  const seg = (on: boolean) => `px-3 py-2 text-[13.5px] font-bold transition-colors ${on ? "bg-ink text-paper" : "text-ink/70 hover:text-ink"}`;

  return (
    <div className="border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-3 text-[14px]">
        <div className="flex overflow-hidden rounded-[3px] border border-ink/25" role="group">
          <button type="button" className={seg(mode === "lcm")} onClick={() => newGame("lcm")} aria-pressed={mode === "lcm"}>
            Least Cost
          </button>
          <button type="button" className={seg(mode === "vam")} onClick={() => newGame("vam")} aria-pressed={mode === "vam"}>
            VAM
          </button>
        </div>
        <span>
          {t({ id: "Langkah", en: "Move" })} <strong className="num">{Math.min(k + 1, init.length)}</strong>/<span className="num">{init.length}</span>
        </span>
        <span>
          {t({ id: "Tepat sekali coba", en: "First-try hits" })} <strong className="num">{firstTry}</strong>
        </span>
        <span>
          {t({ id: "Akurasi terbaik", en: "Best accuracy" })} <strong className="num">{games.nextmove ?? 0}%</strong>
        </span>
      </div>
      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <TransportTable data={sol} snap={snap} onCellClick={done ? undefined : click} wrong={wrong} showReduced={false} />
        </div>
        <div>
          {!done ? (
            <>
              <p className="text-[17px] font-bold">
                {mode === "lcm"
                  ? t({ id: "Sel mana yang diisi Least Cost berikutnya?", en: "Which cell does Least Cost fill next?" })
                  : t({ id: "Sel mana yang diisi VAM berikutnya?", en: "Which cell does VAM fill next?" })}
              </p>
              <p className="mt-2 text-[15px] text-ink/80">
                {mode === "lcm"
                  ? t({ id: "Pilih sel termurah di antara sel yang belum dicoret. Sel M hanya diisi bila tidak ada pilihan lain.", en: "Pick the cheapest cell not yet crossed out. M cells are filled only when nothing else is left." })
                  : t({ id: "Hitung penalti tiap baris dan kolom aktif, ambil yang terbesar, lalu isi sel termurah di garis itu.", en: "Compute each active row and column penalty, take the largest, then fill the cheapest cell on that line." })}
              </p>
              {mode === "vam" && (
                <button type="button" onClick={() => setHint((h) => !h)} className="mt-3 text-[14px] font-semibold text-route underline underline-offset-4">
                  {hint ? t({ id: "Sembunyikan penalti", en: "Hide penalties" }) : t({ id: "Tampilkan penalti", en: "Show penalties" })}
                </button>
              )}
              {stepMiss > 0 && (
                <motion.p key={misses} initial={{ x: -6 }} animate={{ x: 0 }} className="mt-4 text-[14.5px] font-semibold text-alert" role="status">
                  {stepMiss >= 2 ? t({ id: "Jawabannya ditandai di tabel. Klik sel itu untuk lanjut.", en: "The answer is marked in the table. Click it to continue." }) : t({ id: "Belum tepat, coba lagi.", en: "Not that one, try again." })}
                </motion.p>
              )}
              <p className="mt-6 text-[13px] text-muted">{t({ id: "Soal diacak setiap permainan dan dijamin tanpa nilai seri.", en: "Problems are random each game and guaranteed free of ties." })}</p>
            </>
          ) : (
            <div>
              <p className="text-[14px] text-muted">{t({ id: "Solusi awal selesai", en: "Initial solution complete" })}</p>
              <p className="num mt-1 text-[40px] font-semibold leading-none">{Math.round((firstTry / init.length) * 100)}%</p>
              <p className="mt-2 text-[15px]">
                {firstTry}/{init.length} {t({ id: "langkah benar pada percobaan pertama.", en: "moves right on the first try." })}
              </p>
              {total && (
                <p className="mt-3 text-[15px]">
                  {t({ id: "Biaya awal", en: "Initial cost" })}: <span className="num font-semibold">{fmt(sol.initialCost)}</span>
                </p>
              )}
              <button type="button" onClick={() => newGame()} className="mt-6 rounded-[3px] bg-route px-5 py-2.5 font-bold text-white">
                {t({ id: "Soal baru", en: "New problem" })}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
