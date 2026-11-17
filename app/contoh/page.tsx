"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import StepPlayer from "@/components/StepPlayer";
import { useApp } from "@/lib/i18n";
import { problems, levelName, type Level } from "@/lib/content/problems";
import { solve, methodName, type Method, type Optimality } from "@/lib/solver";
import { fmt } from "@/lib/mvalue";
import { Check, Cross } from "@/components/Icons";

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[−–]/g, "-")
    .replace(/[.,](?=\d{3}\b)/g, "")
    .replace(/^\+/, "");

export default function ContohPage() {
  const { t } = useApp();
  const [slug, setSlug] = useState(problems[1].slug);
  const [level, setLevel] = useState<Level | "all">("all");
  const [method, setMethod] = useState<Method>(problems[1].method);
  const [opt, setOpt] = useState<Optimality>("modi");
  const [guess, setGuess] = useState("");
  const [checked, setChecked] = useState<null | boolean>(null);

  useEffect(() => {
    const apply = () => {
      const h = decodeURIComponent(window.location.hash.slice(1));
      const p = problems.find((x) => x.slug === h);
      if (p) {
        setSlug(p.slug);
        setMethod(p.method);
      }
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  const prob = problems.find((p) => p.slug === slug)!;
  const sol = useMemo(() => solve(prob, method, opt), [prob, method, opt]);

  const pick = (s: string) => {
    const p = problems.find((x) => x.slug === s)!;
    setSlug(s);
    setMethod(p.method);
    setGuess("");
    setChecked(null);
    history.replaceState(null, "", `#${s}`);
    document.getElementById("detail")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const list = problems.filter((p) => level === "all" || p.level === level);
  const answer = fmt(sol.totalCost);
  const alt = (() => {
    // Terima juga bentuk "20M + 130"
    const z = sol.totalCost;
    if (!z.m) return [answer];
    const mt = z.m === 1 ? "M" : `${z.m}M`;
    return [answer, `${mt} + ${z.c}`, `${z.c} + ${mt}`];
  })();

  const seg = (on: boolean) => `px-3 py-2 text-[13.5px] font-bold transition-colors ${on ? "bg-ink text-paper" : "text-ink/70 hover:text-ink"}`;

  return (
    <div className="mx-auto max-w-[1240px] px-5 py-12 md:px-8 md:py-16">
      <header className="max-w-[62ch]">
        <h1 className="text-[clamp(2.6rem,6vw,4.6rem)] font-black leading-[0.95] tracking-[-0.04em]">{t({ id: "Contoh Soal", en: "Worked Examples" })}</h1>
        <p className="mt-4 text-[19px] text-ink/80">
          {t({
            id: `${problems.length} soal dengan pembahasan lengkap. Setiap langkah menampilkan tabel, sel yang berubah, dan perhitungannya. Ganti metode kapan saja untuk membandingkan jalannya penyelesaian.`,
            en: `${problems.length} problems with full solutions. Each step shows the table, the cells that change, and the calculation. Switch methods at any time to compare.`,
          })}
        </p>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside>
          <div className="flex overflow-hidden rounded-[3px] border border-ink/25" role="group" aria-label={t({ id: "Tingkat", en: "Level" })}>
            {(["all", "dasar", "menengah", "lanjut"] as const).map((l) => (
              <button key={l} type="button" onClick={() => setLevel(l)} className={`flex-1 ${seg(level === l)}`} aria-pressed={level === l}>
                {l === "all" ? t({ id: "Semua", en: "All" }) : t(levelName[l])}
              </button>
            ))}
          </div>
          <ol className="mt-4 border-t border-line">
            {list.map((p) => {
              const idx = problems.indexOf(p) + 1;
              const on = p.slug === slug;
              return (
                <li key={p.slug} className="border-b border-line">
                  <button type="button" onClick={() => pick(p.slug)} className={`group grid w-full grid-cols-[2.25rem_1fr] gap-2 py-3.5 text-left ${on ? "" : "hover:bg-surface"}`} aria-current={on}>
                    <span className={`num pt-0.5 text-[13px] ${on ? "font-semibold text-route" : "text-muted"}`}>{String(idx).padStart(2, "0")}</span>
                    <span>
                      <span className={`block text-[15.5px] font-bold leading-snug ${on ? "text-route" : ""}`}>{t(p.title)}</span>
                      <span className="mt-1 block text-[12.5px] text-muted">
                        {t(levelName[p.level])}
                        {p.tags.length ? `, ${p.tags.map((x) => t(x).toLowerCase()).join(", ")}` : ""}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        <section id="detail" className="min-w-0 scroll-mt-24">
          <motion.div key={slug} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            <p className="text-[14px] font-semibold text-muted">
              {t({ id: "Soal", en: "Problem" })} {problems.indexOf(prob) + 1}, {t(levelName[prob.level])}
            </p>
            <h2 className="mt-1 text-[clamp(1.7rem,3.2vw,2.5rem)] font-black leading-tight tracking-[-0.025em]">{t(prob.title)}</h2>
            <p className="mt-4 max-w-[68ch] text-[17px] leading-relaxed">{t(prob.story)}</p>
            <p className="mt-2 text-[14px] text-muted">
              {t({ id: "Satuan biaya", en: "Cost unit" })}: {t(prob.unit)}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <div>
                <p className="mb-1 text-[12px] font-bold text-muted">{t({ id: "Metode solusi awal", en: "Initial method" })}</p>
                <div className="flex overflow-hidden rounded-[3px] border border-ink/25" role="group">
                  {(["nwc", "lcm", "vam"] as Method[]).map((m) => (
                    <button key={m} type="button" onClick={() => setMethod(m)} className={seg(method === m)} aria-pressed={method === m}>
                      {m === "nwc" ? "NWC" : m === "lcm" ? "Least Cost" : "VAM"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1 text-[12px] font-bold text-muted">{t({ id: "Uji optimalitas", en: "Optimality test" })}</p>
                <div className="flex overflow-hidden rounded-[3px] border border-ink/25" role="group">
                  {(["modi", "stepping"] as Optimality[]).map((o) => (
                    <button key={o} type="button" onClick={() => setOpt(o)} className={seg(opt === o)} aria-pressed={opt === o}>
                      {o === "modi" ? "MODI" : "Stepping Stone"}
                    </button>
                  ))}
                </div>
              </div>
              {method !== prob.method && (
                <p className="text-[13px] text-muted">
                  {t({ id: "Disarankan", en: "Recommended" })}: {t(methodName[prob.method])}
                </p>
              )}
            </div>

            <form
              className="mt-6 flex flex-wrap items-center gap-3 border border-dashed border-ink/30 px-4 py-3"
              onSubmit={(e) => {
                e.preventDefault();
                setChecked(alt.some((a) => norm(a) === norm(guess)));
              }}
            >
              <label htmlFor="guess" className="text-[14.5px] font-semibold">
                {t({ id: "Kerjakan dulu: berapa biaya optimalnya?", en: "Try first: what is the optimal cost?" })}
              </label>
              <input
                id="guess"
                value={guess}
                onChange={(e) => {
                  setGuess(e.target.value);
                  setChecked(null);
                }}
                placeholder={t({ id: "contoh: 510 atau 130 + 20M", en: "e.g. 510 or 130 + 20M" })}
                className="num w-48 rounded-[3px] border border-ink/30 bg-surface px-3 py-1.5 text-[14px]"
              />
              <button type="submit" className="rounded-[3px] bg-ink px-3 py-1.5 text-[14px] font-bold text-paper">
                {t({ id: "Periksa", en: "Check" })}
              </button>
              {checked !== null && (
                <span className={`flex items-center gap-1.5 text-[14px] font-semibold ${checked ? "text-route" : "text-alert"}`} role="status">
                  {checked ? <Check className="h-4 w-4" /> : <Cross className="h-4 w-4" />}
                  {checked ? t({ id: "Tepat!", en: "Correct!" }) : t({ id: "Belum tepat. Ikuti langkahnya di bawah.", en: "Not yet. Follow the steps below." })}
                </span>
              )}
            </form>

            <div className="mt-6">
              <StepPlayer sol={sol} />
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-[1.4fr_1fr]">
              <div className="border-l-[5px] border-route bg-routeSoft/40 p-5">
                <h3 className="text-[16px] font-extrabold">{t({ id: "Pelajaran dari soal ini", en: "What this problem teaches" })}</h3>
                <p className="mt-2 text-[16px] leading-relaxed">{t(prob.insight)}</p>
              </div>
              <dl className="grid content-start gap-px bg-line text-[14.5px]">
                {[
                  [t({ id: "Ukuran tabel", en: "Table size" }), `${prob.supply.length} × ${prob.demand.length}${sol.dummyCol || sol.dummyRow ? ` (+ dummy)` : ""}`],
                  [t({ id: "Jalur rusak", en: "Broken routes" }), String(sol.brokenCells.length)],
                  [t({ id: "Sel basis (m + n − 1)", en: "Basic cells (m + n − 1)" }), String(sol.m + sol.n - 1)],
                  [t({ id: "Status akhir", en: "Final status" }), sol.feasible ? t({ id: "Layak, optimal", en: "Feasible, optimal" }) : t({ id: "Tidak layak", en: "Infeasible" })],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 bg-paper px-4 py-2.5">
                    <dt className="text-muted">{k}</dt>
                    <dd className="num font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
