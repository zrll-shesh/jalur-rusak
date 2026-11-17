"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useApp, useStored } from "@/lib/i18n";
import { cmp, fmt, mv, type MV, ZERO } from "@/lib/mvalue";

type Q =
  | { kind: "compare"; a: MV; b: MV; answer: -1 | 0 | 1 }
  | { kind: "sign"; a: MV; answer: -1 | 0 | 1; expr: string; value: MV };

const rint = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

function randMV(): MV {
  const m = pick([-2, -1, 0, 1, 1, 2, 3]);
  const c = pick([rint(-20, 20), rint(-900, 900), rint(-99, 99) * 5]);
  return mv(c, m);
}

function makeQ(): Q {
  if (Math.random() < 0.55) {
    const a = randMV();
    let b = randMV();
    const r = Math.random();
    if (r < 0.35) b = mv(rint(-900, 900), a.m); // koefisien M sama
    else if (r < 0.45) b = { ...a };
    return { kind: "compare", a, b, answer: cmp(a, b) as -1 | 0 | 1 };
  }
  // tanda dari ekspresi c − u − v (mirip perhitungan d_ij)
  const cIsM = Math.random() < 0.3;
  const c = cIsM ? mv(0, 1) : mv(rint(1, 15));
  const u = Math.random() < 0.5 ? mv(rint(-6, 8), pick([0, 0, -1, 1])) : mv(rint(-6, 8));
  const v = mv(rint(-4, 12), pick([0, 0, 1, -1]));
  const value = mv(c.c - u.c - v.c, c.m - u.m - v.m);
  const p = (x: MV) => {
    const s = fmt(x);
    return x.m !== 0 && (x.c !== 0 || x.m < 0) ? `(${s})` : x.c < 0 && x.m === 0 ? `(${s})` : s;
  };
  return { kind: "sign", a: value, value, expr: `${fmt(c)} − ${p(u)} − ${p(v)}`, answer: cmp(value, ZERO) as -1 | 0 | 1 };
}

const ROUND = 60;

export default function MDuel() {
  const { t } = useApp();
  const [phase, setPhase] = useState<"ready" | "play" | "over">("ready");
  const [q, setQ] = useState<Q>(() => makeQ());
  const [time, setTime] = useState(ROUND);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [right, setRight] = useState(0);
  const [total, setTotal] = useState(0);
  const [flash, setFlash] = useState<null | { ok: boolean; text: string }>(null);
  const [games, setGames] = useStored<Record<string, number>>("jr-games", {});
  const best = games.mduel ?? 0;
  const [prevBest, setPrevBest] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase !== "play") return;
    timer.current = setInterval(() => setTime((x) => x - 1), 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [phase]);

  useEffect(() => {
    if (phase === "play" && time <= 0) {
      setPhase("over");
      setGames((g) => ({ ...g, mduel: Math.max(g.mduel ?? 0, score) }));
    }
  }, [time, phase, score, setGames]);

  const start = () => {
    setPrevBest(best);
    setScore(0);
    setStreak(0);
    setRight(0);
    setTotal(0);
    setTime(ROUND);
    setQ(makeQ());
    setFlash(null);
    setPhase("play");
  };

  const explain = useCallback(
    (qq: Q) => {
      if (qq.kind === "compare") {
        if (qq.a.m !== qq.b.m)
          return t({
            id: `Koefisien M berbeda (${qq.a.m} dan ${qq.b.m}), jadi yang koefisiennya lebih besar menang.`,
            en: `The M coefficients differ (${qq.a.m} and ${qq.b.m}), so the larger coefficient wins.`,
          });
        return t({ id: "Koefisien M sama, jadi bandingkan konstantanya.", en: "Same M coefficient, so compare the constants." });
      }
      return t({ id: `Hasilnya ${fmt(qq.value)}.`, en: `It evaluates to ${fmt(qq.value)}.` });
    },
    [t]
  );

  const answer = (k: -1 | 0 | 1) => {
    if (phase !== "play") return;
    const ok = k === q.answer;
    setTotal((x) => x + 1);
    if (ok) {
      const mult = 1 + Math.floor(streak / 3);
      setScore((s) => s + 10 * mult);
      setStreak((s) => s + 1);
      setRight((x) => x + 1);
      setFlash({ ok: true, text: mult > 1 ? `+${10 * mult}  ×${mult}` : "+10" });
    } else {
      setStreak(0);
      setFlash({ ok: false, text: explain(q) });
    }
    setQ(makeQ());
  };

  useEffect(() => {
    if (phase !== "play") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "1" || e.key === "ArrowLeft") answer(q.kind === "compare" ? 1 : -1);
      if (e.key === "2" || e.key === "ArrowDown") answer(0);
      if (e.key === "3" || e.key === "ArrowRight") answer(q.kind === "compare" ? -1 : 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const btn = "rounded-[3px] border-2 border-ink px-4 py-4 text-[16px] font-extrabold transition-colors hover:bg-ink hover:text-paper active:translate-y-[1px]";

  return (
    <div className="border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-3 text-[14px]">
        <span>
          {t({ id: "Skor", en: "Score" })} <strong className="num text-[18px]">{score}</strong>
        </span>
        <span>
          {t({ id: "Beruntun", en: "Streak" })} <strong className="num">{streak}</strong>
        </span>
        <span>
          {t({ id: "Terbaik", en: "Best" })} <strong className="num">{best}</strong>
        </span>
        <span className={`num font-semibold ${time <= 10 && phase === "play" ? "text-alert" : ""}`}>{phase === "play" ? `${time}s` : `${ROUND}s`}</span>
      </div>
      <div className="h-1 bg-line">
        <motion.div className="h-full bg-route" animate={{ width: phase === "play" ? `${(time / ROUND) * 100}%` : "100%" }} transition={{ duration: 0.4 }} />
      </div>

      <div className="grid min-h-[340px] place-items-center px-5 py-10">
        {phase === "ready" && (
          <div className="max-w-md text-center">
            <p className="text-[17px]">
              {t({
                id: "60 detik. Bandingkan dua ekspresi M atau tentukan tanda hasil d = c − u − v. Setiap 3 jawaban benar beruntun, poin berlipat.",
                en: "60 seconds. Compare two M expressions or decide the sign of d = c − u − v. Every 3 correct in a row multiplies your points.",
              })}
            </p>
            <p className="mt-2 text-[13px] text-muted">{t({ id: "Papan ketik: 1, 2, 3 atau panah kiri, bawah, kanan.", en: "Keyboard: 1, 2, 3 or left, down, right arrows." })}</p>
            <button type="button" onClick={start} className="mt-6 rounded-[3px] bg-route px-6 py-3 font-bold text-white">
              {t({ id: "Mulai duel", en: "Start duel" })}
            </button>
          </div>
        )}

        {phase === "play" && (
          <div className="w-full max-w-xl">
            <AnimatePresence mode="wait">
              <motion.div key={JSON.stringify(q)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }} className="text-center">
                {q.kind === "compare" ? (
                  <>
                    <p className="text-[14px] text-muted">{t({ id: "Mana yang lebih besar?", en: "Which is larger?" })}</p>
                    <div className="num mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-[clamp(1.5rem,4vw,2.3rem)] font-semibold">
                      <span>{fmt(q.a)}</span>
                      <span className="text-[16px] text-muted">vs</span>
                      <span>{fmt(q.b)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-[14px] text-muted">{t({ id: "Tanda dari d = c − u − v adalah…", en: "The sign of d = c − u − v is…" })}</p>
                    <p className="num mt-4 text-[clamp(1.3rem,3.5vw,2rem)] font-semibold">{q.expr}</p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {q.kind === "compare" ? (
                <>
                  <button type="button" className={btn} onClick={() => answer(1)}>
                    {t({ id: "Kiri", en: "Left" })}
                  </button>
                  <button type="button" className={btn} onClick={() => answer(0)}>
                    {t({ id: "Sama", en: "Equal" })}
                  </button>
                  <button type="button" className={btn} onClick={() => answer(-1)}>
                    {t({ id: "Kanan", en: "Right" })}
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className={btn} onClick={() => answer(-1)}>
                    {t({ id: "Negatif", en: "Negative" })}
                  </button>
                  <button type="button" className={btn} onClick={() => answer(0)}>
                    {t({ id: "Nol", en: "Zero" })}
                  </button>
                  <button type="button" className={btn} onClick={() => answer(1)}>
                    {t({ id: "Positif", en: "Positive" })}
                  </button>
                </>
              )}
            </div>
            <div className="mt-5 h-12 text-center" aria-live="polite">
              <AnimatePresence mode="wait">
                {flash && (
                  <motion.p key={flash.text + total} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`text-[14px] font-semibold ${flash.ok ? "num text-route" : "text-alert"}`}>
                    {flash.ok ? flash.text : `${t({ id: "Salah.", en: "Wrong." })} ${flash.text}`}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {phase === "over" && (
          <div className="text-center">
            <p className="text-[14px] text-muted">{t({ id: "Waktu habis", en: "Time’s up" })}</p>
            <p className="num mt-2 text-[56px] font-semibold leading-none">{score}</p>
            <p className="mt-3 text-[15px]">
              {right}/{total} {t({ id: "jawaban benar", en: "correct answers" })}
              {score > prevBest && score > 0 ? `, ${t({ id: "rekor baru", en: "new record" })}` : ""}
            </p>
            <button type="button" onClick={start} className="mt-6 rounded-[3px] bg-route px-6 py-3 font-bold text-white">
              {t({ id: "Main lagi", en: "Play again" })}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
