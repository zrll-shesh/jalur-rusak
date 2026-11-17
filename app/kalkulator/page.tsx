"use client";

import { useEffect, useMemo, useState } from "react";
import StepPlayer from "@/components/StepPlayer";
import { useApp } from "@/lib/i18n";
import { problems } from "@/lib/content/problems";
import { solve, type Method, type Optimality, type Solution } from "@/lib/solver";
import type { Cost } from "@/lib/mvalue";
import { Barrier, Minus, Plus, Refresh } from "@/components/Icons";

type Grid = string[][];

const blank = (m: number, n: number): Grid => Array.from({ length: m }, () => Array(n).fill(""));
const resize = (g: Grid, m: number, n: number): Grid => Array.from({ length: m }, (_, r) => Array.from({ length: n }, (_, c) => g[r]?.[c] ?? ""));
const resize1 = (a: string[], k: number) => Array.from({ length: k }, (_, i) => a[i] ?? "");

function randomProblem() {
  const m = 3 + Math.floor(Math.random() * 2);
  const n = 3 + Math.floor(Math.random() * 2);
  const costs: Grid = Array.from({ length: m }, () => Array.from({ length: n }, () => String(2 + Math.floor(Math.random() * 14))));
  const k = 1 + Math.floor(Math.random() * 2);
  for (let i = 0; i < k; i++) costs[Math.floor(Math.random() * m)][Math.floor(Math.random() * n)] = "M";
  const supply = Array.from({ length: m }, () => String(10 * (2 + Math.floor(Math.random() * 6))));
  const S = supply.reduce((s, x) => s + Number(x), 0);
  const demand = Array.from({ length: n }, () => 10);
  let left = S - 10 * n;
  while (left > 0) {
    demand[Math.floor(Math.random() * n)] += 10;
    left -= 10;
  }
  return { costs, supply, demand: demand.map(String) };
}

export default function KalkulatorPage() {
  const { t } = useApp();
  const [m, setM] = useState(3);
  const [n, setN] = useState(3);
  const [costs, setCosts] = useState<Grid>(() => problems[1].costs.map((r) => r.map(String)));
  const [supply, setSupply] = useState<string[]>(problems[1].supply.map(String));
  const [demand, setDemand] = useState<string[]>(problems[1].demand.map(String));
  const [memo, setMemo] = useState<Record<string, string>>({});
  const [method, setMethod] = useState<Method>("vam");
  const [opt, setOpt] = useState<Optimality>("modi");
  const [result, setResult] = useState<Solution | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const h = window.location.hash;
      if (h.startsWith("#p=")) {
        const d = JSON.parse(decodeURIComponent(h.slice(3)));
        if (Array.isArray(d.c) && Array.isArray(d.s) && Array.isArray(d.d)) {
          setM(d.s.length);
          setN(d.d.length);
          setCosts(d.c.map((r: unknown[]) => r.map(String)));
          setSupply(d.s.map(String));
          setDemand(d.d.map(String));
        }
      }
    } catch {
      /* tautan rusak, abaikan */
    }
  }, []);

  const setSize = (mm: number, nn: number) => {
    mm = Math.max(2, Math.min(6, mm));
    nn = Math.max(2, Math.min(6, nn));
    setM(mm);
    setN(nn);
    setCosts((g) => resize(g, mm, nn));
    setSupply((a) => resize1(a, mm));
    setDemand((a) => resize1(a, nn));
    setResult(null);
  };

  const setCell = (r: number, c: number, v: string) => {
    setCosts((g) => g.map((row, i) => (i === r ? row.map((x, j) => (j === c ? v : x)) : row)));
    setResult(null);
  };
  const toggleBroken = (r: number, c: number) => {
    const k = `${r}-${c}`;
    const cur = costs[r][c].trim().toUpperCase();
    if (cur === "M") {
      setCell(r, c, memo[k] ?? "");
    } else {
      setMemo((mm) => ({ ...mm, [k]: costs[r][c] }));
      setCell(r, c, "M");
    }
  };

  const totals = useMemo(() => {
    const s = supply.reduce((a, x) => a + (Number(x) || 0), 0);
    const d = demand.reduce((a, x) => a + (Number(x) || 0), 0);
    return { s, d };
  }, [supply, demand]);

  const run = () => {
    const errs: string[] = [];
    const parsed: Cost[][] = costs.map((row, r) =>
      row.map((v, c) => {
        const x = v.trim().toUpperCase();
        if (x === "M") return "M";
        const num = Number(x.replace(",", "."));
        if (x === "" || !isFinite(num) || num < 0) errs.push(t({ id: `Biaya S${r + 1}D${c + 1} belum valid.`, en: `Cost S${r + 1}D${c + 1} is not valid.` }));
        return num;
      })
    );
    const sp = supply.map((v, i) => {
      const x = Number(v);
      if (!Number.isInteger(x) || x <= 0) errs.push(t({ id: `Supply S${i + 1} harus bilangan bulat positif.`, en: `Supply S${i + 1} must be a positive integer.` }));
      return x;
    });
    const dm = demand.map((v, i) => {
      const x = Number(v);
      if (!Number.isInteger(x) || x <= 0) errs.push(t({ id: `Demand D${i + 1} harus bilangan bulat positif.`, en: `Demand D${i + 1} must be a positive integer.` }));
      return x;
    });
    setErrors(errs.slice(0, 4));
    if (errs.length) {
      setResult(null);
      return;
    }
    const sol = solve({ costs: parsed, supply: sp, demand: dm }, method, opt);
    setResult(sol);
    const payload = encodeURIComponent(JSON.stringify({ c: parsed, s: sp, d: dm }));
    history.replaceState(null, "", `#p=${payload}`);
    setTimeout(() => document.getElementById("hasil")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const loadRandom = () => {
    const p = randomProblem();
    setM(p.supply.length);
    setN(p.demand.length);
    setCosts(p.costs);
    setSupply(p.supply);
    setDemand(p.demand);
    setResult(null);
    setErrors([]);
  };

  const loadBank = (slug: string) => {
    const p = problems.find((x) => x.slug === slug);
    if (!p) return;
    setM(p.supply.length);
    setN(p.demand.length);
    setCosts(p.costs.map((r) => r.map(String)));
    setSupply(p.supply.map(String));
    setDemand(p.demand.map(String));
    setResult(null);
    setErrors([]);
  };

  const inputCls = "num w-full bg-transparent px-2 py-2 text-center text-[15px] outline-none focus:bg-routeSoft/50";
  const stepBtn = "grid h-8 w-8 place-items-center rounded-[3px] border border-ink/25 hover:border-ink disabled:opacity-30";
  const seg = (on: boolean) => `px-3 py-2 text-[13.5px] font-bold transition-colors ${on ? "bg-ink text-paper" : "text-ink/70 hover:text-ink"}`;

  return (
    <div className="mx-auto max-w-[1240px] px-5 py-12 md:px-8 md:py-16">
      <header className="max-w-[62ch]">
        <h1 className="text-[clamp(2.6rem,6vw,4.6rem)] font-black leading-[0.95] tracking-[-0.04em]">{t({ id: "Kalkulator", en: "Calculator" })}</h1>
        <p className="mt-4 text-[19px] text-ink/80">
          {t({
            id: "Masukkan soalmu sendiri. Ketik M atau tekan tombol penghalang untuk menandai jalur rusak. Soal tak setimbang otomatis diberi dummy, dan kemerosotan otomatis diberi ε.",
            en: "Enter your own problem. Type M or press the barrier button to mark a broken route. Unbalanced problems get a dummy automatically, and degeneracy gets ε automatically.",
          })}
        </p>
      </header>

      <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold">{t({ id: "Sumber", en: "Sources" })}</span>
          <button type="button" className={stepBtn} onClick={() => setSize(m - 1, n)} disabled={m <= 2} aria-label={t({ id: "Kurangi sumber", en: "Fewer sources" })}>
            <Minus className="h-4 w-4" />
          </button>
          <span className="num w-6 text-center font-semibold">{m}</span>
          <button type="button" className={stepBtn} onClick={() => setSize(m + 1, n)} disabled={m >= 6} aria-label={t({ id: "Tambah sumber", en: "More sources" })}>
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold">{t({ id: "Tujuan", en: "Destinations" })}</span>
          <button type="button" className={stepBtn} onClick={() => setSize(m, n - 1)} disabled={n <= 2} aria-label={t({ id: "Kurangi tujuan", en: "Fewer destinations" })}>
            <Minus className="h-4 w-4" />
          </button>
          <span className="num w-6 text-center font-semibold">{n}</span>
          <button type="button" className={stepBtn} onClick={() => setSize(m, n + 1)} disabled={n >= 6} aria-label={t({ id: "Tambah tujuan", en: "More destinations" })}>
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={loadRandom} className="flex items-center gap-1.5 rounded-[3px] border border-ink/25 px-3 py-1.5 text-[14px] font-semibold hover:border-ink">
            <Refresh className="h-4 w-4" />
            {t({ id: "Acak soal", en: "Random problem" })}
          </button>
          <select onChange={(e) => loadBank(e.target.value)} value="" className="rounded-[3px] border border-ink/25 bg-surface px-3 py-1.5 text-[14px] font-semibold">
            <option value="" disabled>
              {t({ id: "Muat dari bank soal", en: "Load from problem bank" })}
            </option>
            {problems.map((p) => (
              <option key={p.slug} value={p.slug}>
                {t(p.title)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setCosts(blank(m, n));
              setSupply(Array(m).fill(""));
              setDemand(Array(n).fill(""));
              setResult(null);
            }}
            className="rounded-[3px] px-3 py-1.5 text-[14px] font-semibold text-muted hover:text-ink"
          >
            {t({ id: "Kosongkan", en: "Clear" })}
          </button>
        </div>
      </div>

      <div className="scroll-x mt-6">
        <table className="border-collapse border border-line bg-surface">
          <thead>
            <tr>
              <th className="num w-16 border border-line px-2 py-2 text-[12px] text-muted">S \ D</th>
              {Array.from({ length: n }, (_, c) => (
                <th key={c} className="w-[108px] border border-line px-2 py-2 text-[14px] font-bold">
                  D{c + 1}
                </th>
              ))}
              <th className="w-24 border border-line px-2 py-2 text-[13px] font-bold text-muted">Supply</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: m }, (_, r) => (
              <tr key={r}>
                <th className="border border-line px-2 text-[14px] font-bold">S{r + 1}</th>
                {Array.from({ length: n }, (_, c) => {
                  const broken = costs[r][c].trim().toUpperCase() === "M";
                  return (
                    <td key={c} className={`relative border border-line p-0 ${broken ? "hazard-cell" : ""}`}>
                      <div className="flex items-center">
                        <input
                          aria-label={`${t({ id: "Biaya", en: "Cost" })} S${r + 1}D${c + 1}`}
                          value={costs[r][c]}
                          inputMode="decimal"
                          onChange={(e) => setCell(r, c, e.target.value)}
                          className={`${inputCls} ${broken ? "font-bold text-alert" : ""}`}
                          placeholder="0"
                        />
                        <button
                          type="button"
                          onClick={() => toggleBroken(r, c)}
                          className={`mr-1 grid h-7 w-7 shrink-0 place-items-center rounded-[2px] ${broken ? "bg-[#1C2321] text-[#F5B700]" : "text-muted hover:text-ink"}`}
                          aria-pressed={broken}
                          title={broken ? t({ id: "Perbaiki jalur", en: "Repair route" }) : t({ id: "Tandai jalur rusak", en: "Mark as broken" })}
                          aria-label={broken ? t({ id: "Perbaiki jalur", en: "Repair route" }) : t({ id: "Tandai jalur rusak", en: "Mark as broken" })}
                        >
                          <Barrier className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  );
                })}
                <td className="border border-line p-0">
                  <input aria-label={`Supply S${r + 1}`} value={supply[r]} inputMode="numeric" onChange={(e) => setSupply((a) => a.map((x, i) => (i === r ? e.target.value : x)))} className={`${inputCls} font-semibold`} placeholder="0" />
                </td>
              </tr>
            ))}
            <tr>
              <th className="border border-line px-2 text-[13px] font-bold text-muted">Demand</th>
              {Array.from({ length: n }, (_, c) => (
                <td key={c} className="border border-line p-0">
                  <input aria-label={`Demand D${c + 1}`} value={demand[c]} inputMode="numeric" onChange={(e) => setDemand((a) => a.map((x, i) => (i === c ? e.target.value : x)))} className={`${inputCls} font-semibold`} placeholder="0" />
                </td>
              ))}
              <td className="num border border-line px-2 text-center text-[13px]">
                <span className={totals.s === totals.d ? "text-route" : "text-alert"}>
                  {totals.s} / {totals.d}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[13px] text-muted">
        {totals.s === totals.d
          ? t({ id: "Total supply / total demand: setimbang.", en: "Total supply / total demand: balanced." })
          : t({ id: "Total supply / total demand: tidak setimbang, dummy akan ditambahkan otomatis.", en: "Total supply / total demand: unbalanced, a dummy will be added automatically." })}
      </p>

      <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-4">
        <div>
          <p className="mb-1 text-[12px] font-bold text-muted">{t({ id: "Metode solusi awal", en: "Initial method" })}</p>
          <div className="flex overflow-hidden rounded-[3px] border border-ink/25">
            {(["nwc", "lcm", "vam"] as Method[]).map((x) => (
              <button key={x} type="button" onClick={() => setMethod(x)} className={seg(method === x)} aria-pressed={method === x}>
                {x === "nwc" ? "NWC" : x === "lcm" ? "Least Cost" : "VAM"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1 text-[12px] font-bold text-muted">{t({ id: "Uji optimalitas", en: "Optimality test" })}</p>
          <div className="flex overflow-hidden rounded-[3px] border border-ink/25">
            {(["modi", "stepping"] as Optimality[]).map((x) => (
              <button key={x} type="button" onClick={() => setOpt(x)} className={seg(opt === x)} aria-pressed={opt === x}>
                {x === "modi" ? "MODI" : "Stepping Stone"}
              </button>
            ))}
          </div>
        </div>
        <button type="button" onClick={run} className="rounded-[3px] bg-route px-6 py-2.5 text-[15px] font-bold text-white transition-transform hover:-translate-y-0.5">
          {t({ id: "Selesaikan", en: "Solve" })}
        </button>
        {result && (
          <button type="button" onClick={share} className="rounded-[3px] border border-ink/25 px-4 py-2.5 text-[14px] font-semibold hover:border-ink">
            {copied ? t({ id: "Tautan disalin", en: "Link copied" }) : t({ id: "Salin tautan soal", en: "Copy problem link" })}
          </button>
        )}
      </div>

      {errors.length > 0 && (
        <div className="mt-5 border-l-[4px] border-alert bg-alert/10 px-4 py-3 text-[14.5px]" role="alert">
          <p className="font-bold">{t({ id: "Periksa isian berikut:", en: "Check these entries:" })}</p>
          <ul className="mt-1 list-disc pl-5">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {result && (
        <section id="hasil" className="mt-12 scroll-mt-24">
          <h2 className="mb-5 text-[clamp(1.5rem,2.6vw,2rem)] font-black tracking-[-0.02em]">{t({ id: "Penyelesaian", en: "Solution" })}</h2>
          <StepPlayer sol={result} />
        </section>
      )}
    </div>
  );
}
