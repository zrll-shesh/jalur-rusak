"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useApp, useStored } from "@/lib/i18n";
import { quiz, quizTopics, type QuizItem } from "@/lib/content/quiz";
import { Check, Cross } from "@/components/Icons";

type Mode = "10" | "all" | QuizItem["topic"];

function shuffle<T>(a: T[]) {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export default function KuisPage() {
  const { t } = useApp();
  const [items, setItems] = useState<QuizItem[] | null>(null);
  const [k, setK] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [best, setBest] = useStored<number>("jr-quiz-best", 0);
  const [mode, setMode] = useState<Mode>("10");

  const start = (m: Mode) => {
    setMode(m);
    const pool = m === "10" ? shuffle(quiz).slice(0, 10) : m === "all" ? shuffle(quiz) : shuffle(quiz.filter((q) => q.topic === m));
    setItems(pool);
    setK(0);
    setPicked(null);
    setAnswers([]);
  };

  const finished = items && k >= items.length;
  const correct = items ? answers.filter((a, i) => a === items[i].answer).length : 0;
  const pct = items && items.length ? Math.round((correct / items.length) * 100) : 0;

  const choose = (i: number) => {
    if (picked !== null || !items) return;
    setPicked(i);
    setAnswers((a) => [...a, i]);
  };
  const next = () => {
    if (!items) return;
    const nk = k + 1;
    setK(nk);
    setPicked(null);
    if (nk >= items.length) {
      const c = [...answers].filter((a, i) => a === items[i].answer).length;
      const p = Math.round((c / items.length) * 100);
      if (mode === "10" || mode === "all") setBest((b) => Math.max(b, p));
    }
  };

  const letters = ["A", "B", "C", "D"];

  return (
    <div className="mx-auto max-w-[920px] px-5 py-12 md:px-8 md:py-16">
      <header>
        <h1 className="text-[clamp(2.6rem,6vw,4.6rem)] font-black leading-[0.95] tracking-[-0.04em]">{t({ id: "Kuis", en: "Quiz" })}</h1>
        <p className="mt-4 max-w-[60ch] text-[19px] text-ink/80">
          {t({
            id: `${quiz.length} soal pilihan ganda tentang konsep, aritmetika M, metode, uji optimalitas, dan interpretasi. Pembahasan muncul setelah kamu menjawab.`,
            en: `${quiz.length} multiple-choice questions on concepts, M arithmetic, methods, optimality testing, and interpretation. Explanations appear after you answer.`,
          })}
        </p>
      </header>

      {!items && (
        <div className="mt-10">
          <p className="text-[14px] font-bold text-muted">{t({ id: "Pilih mode", en: "Choose a mode" })}</p>
          <div className="mt-3 grid gap-px border border-line bg-line sm:grid-cols-2">
            <button type="button" onClick={() => start("10")} className="bg-surface px-5 py-5 text-left hover:bg-routeSoft/40">
              <span className="block text-[20px] font-black">{t({ id: "10 soal acak", en: "10 random questions" })}</span>
              <span className="mt-1 block text-[14.5px] text-muted">{t({ id: "Sekitar 5 menit. Cocok untuk pemanasan sebelum presentasi.", en: "About 5 minutes. A good warm-up before the presentation." })}</span>
            </button>
            <button type="button" onClick={() => start("all")} className="bg-surface px-5 py-5 text-left hover:bg-routeSoft/40">
              <span className="block text-[20px] font-black">{t({ id: `Semua ${quiz.length} soal`, en: `All ${quiz.length} questions` })}</span>
              <span className="mt-1 block text-[14.5px] text-muted">{t({ id: "Latihan lengkap untuk menguasai seluruh materi.", en: "The full set for mastering everything." })}</span>
            </button>
          </div>
          <p className="mt-6 text-[14px] font-bold text-muted">{t({ id: "Atau per topik", en: "Or by topic" })}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(Object.keys(quizTopics) as QuizItem["topic"][]).map((tp) => (
              <button key={tp} type="button" onClick={() => start(tp)} className="rounded-[3px] border border-ink/25 px-3.5 py-2 text-[14px] font-semibold hover:border-ink">
                {t(quizTopics[tp])} <span className="num text-muted">({quiz.filter((q) => q.topic === tp).length})</span>
              </button>
            ))}
          </div>
          {best > 0 && (
            <p className="mt-8 text-[15px]">
              {t({ id: "Skor terbaikmu", en: "Your best score" })}: <span className="num font-semibold">{best}</span>
            </p>
          )}
        </div>
      )}

      {items && !finished && (
        <div className="mt-10">
          <div className="flex items-center justify-between text-[14px] text-muted">
            <span>
              {t({ id: "Soal", en: "Question" })} <span className="num font-semibold text-ink">{k + 1}</span>/<span className="num">{items.length}</span>
            </span>
            <span>{t(quizTopics[items[k].topic])}</span>
          </div>
          <div className="mt-2 h-1.5 bg-line">
            <motion.div className="h-full bg-route" animate={{ width: `${(k / items.length) * 100}%` }} />
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={k} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
              <h2 className="mt-8 text-[clamp(1.35rem,2.6vw,1.8rem)] font-extrabold leading-snug tracking-[-0.015em]">{t(items[k].q)}</h2>
              <ul className="mt-6 space-y-2.5">
                {items[k].options.map((o, i) => {
                  const isAns = i === items[k].answer;
                  const isPick = i === picked;
                  const state = picked === null ? "idle" : isAns ? "right" : isPick ? "wrong" : "dim";
                  return (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => choose(i)}
                        disabled={picked !== null}
                        className={`grid w-full grid-cols-[2.25rem_1fr_auto] items-center gap-3 border-2 px-4 py-3.5 text-left text-[16.5px] transition-colors ${
                          state === "idle" ? "border-line bg-surface hover:border-ink" : state === "right" ? "border-route bg-routeSoft/50" : state === "wrong" ? "border-alert bg-alert/10" : "border-line opacity-55"
                        }`}
                      >
                        <span className="num grid h-8 w-8 place-items-center border border-ink/30 text-[13px] font-semibold">{letters[i]}</span>
                        <span>{t(o)}</span>
                        {state === "right" && <Check className="h-5 w-5 text-route" />}
                        {state === "wrong" && <Cross className="h-5 w-5 text-alert" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {picked !== null && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 border-l-[4px] border-ink bg-surface px-5 py-4">
                  <p className={`text-[15px] font-bold ${picked === items[k].answer ? "text-route" : "text-alert"}`}>
                    {picked === items[k].answer ? t({ id: "Benar.", en: "Correct." }) : t({ id: "Kurang tepat.", en: "Not quite." })}
                  </p>
                  <p className="mt-1 text-[16px]">{t(items[k].explain)}</p>
                  <button type="button" onClick={next} className="mt-4 rounded-[3px] bg-ink px-5 py-2.5 font-bold text-paper">
                    {k + 1 >= items.length ? t({ id: "Lihat hasil", en: "See results" }) : t({ id: "Soal berikutnya", en: "Next question" })}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {items && finished && (
        <div className="mt-10">
          <div className="flex flex-wrap items-end gap-6 border-b-2 border-ink pb-6">
            <p className="num text-[clamp(4rem,12vw,7rem)] font-semibold leading-none">{pct}</p>
            <div className="pb-2">
              <p className="text-[18px] font-bold">
                {correct}/{items.length} {t({ id: "benar", en: "correct" })}
              </p>
              <p className="text-[15px] text-muted">
                {pct >= 80
                  ? t({ id: "Siap presentasi.", en: "Ready to present." })
                  : pct >= 60
                  ? t({ id: "Hampir. Ulangi bab yang masih salah.", en: "Almost. Revisit the chapters you missed." })
                  : t({ id: "Baca lagi materi dan contoh soal, lalu coba lagi.", en: "Reread the theory and examples, then try again." })}
              </p>
            </div>
            <div className="ml-auto flex gap-2 pb-2">
              <button type="button" onClick={() => start(mode)} className="rounded-[3px] bg-route px-5 py-2.5 font-bold text-white">
                {t({ id: "Ulangi", en: "Retry" })}
              </button>
              <button type="button" onClick={() => setItems(null)} className="rounded-[3px] border border-ink/25 px-5 py-2.5 font-bold hover:border-ink">
                {t({ id: "Ganti mode", en: "Change mode" })}
              </button>
            </div>
          </div>
          <h2 className="mt-10 text-[20px] font-extrabold">{t({ id: "Tinjauan jawaban", en: "Answer review" })}</h2>
          <ol className="mt-4 space-y-4">
            {items.map((q, i) => {
              const ok = answers[i] === q.answer;
              return (
                <li key={i} className={`border-l-[4px] pl-4 ${ok ? "border-route" : "border-alert"}`}>
                  <p className="text-[16px] font-bold">
                    <span className="num mr-2 text-muted">{i + 1}.</span>
                    {t(q.q)}
                  </p>
                  {!ok && (
                    <p className="mt-1 text-[15px] text-alert">
                      {t({ id: "Jawabanmu", en: "Your answer" })}: {t(q.options[answers[i]])}
                    </p>
                  )}
                  <p className="mt-1 text-[15px]">
                    <span className="font-semibold text-route">{t(q.options[q.answer])}</span>. <span className="text-ink/80">{t(q.explain)}</span>
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
