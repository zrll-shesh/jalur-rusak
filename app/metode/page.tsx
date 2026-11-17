"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import StepPlayer from "@/components/StepPlayer";
import Tex from "@/components/Tex";
import { useApp } from "@/lib/i18n";
import { problems } from "@/lib/content/problems";
import { solve, type Bi, type Method, type Optimality } from "@/lib/solver";
import { fmt, hasM } from "@/lib/mvalue";

type Tab = "nwc" | "lcm" | "vam" | "modi" | "stepping";

const info: Record<Tab, { name: Bi; group: Bi; origin: Bi; steps: Bi[]; withM: Bi; plus: Bi; minus: Bi; formula?: string }> = {
  nwc: {
    name: { id: "Pojok Barat Laut (NWC)", en: "North-West Corner (NWC)" },
    group: { id: "Solusi awal", en: "Initial solution" },
    origin: {
      id: "Metode paling sederhana untuk solusi awal. Taha (2017) menyebutnya tidak mempertimbangkan biaya sama sekali, sehingga hasilnya biasanya jauh dari optimal.",
      en: "The simplest starting method. Taha (2017) notes it ignores cost entirely, so its result is usually far from optimal.",
    },
    steps: [
      { id: "Mulai dari sel pojok kiri atas tabel.", en: "Start at the top-left cell of the table." },
      { id: "Isi sel itu sebanyak min(sisa supply baris, sisa demand kolom).", en: "Fill it with min(remaining row supply, remaining column demand)." },
      { id: "Coret baris atau kolom yang sudah habis.", en: "Cross out the row or column that is used up." },
      { id: "Pindah ke kanan bila kolom habis, atau ke bawah bila baris habis.", en: "Move right if the column is used up, or down if the row is used up." },
      { id: "Ulangi sampai seluruh supply dan demand terpenuhi.", en: "Repeat until all supply and demand are met." },
    ],
    withM: {
      id: "NWC tidak melihat biaya, jadi sel M diperlakukan sama dengan sel lain. Kalau jalur rusak ada di sepanjang “tangga” dari kiri atas ke kanan bawah, NWC pasti mengisinya. Hasilnya total biaya awal hampir selalu mengandung M dan butuh beberapa iterasi untuk dibersihkan.",
      en: "NWC never looks at cost, so an M cell is treated like any other. If a broken route lies on the ‘staircase’ from top-left to bottom-right, NWC will fill it. The initial cost almost always contains M and needs several iterations to clean up.",
    },
    plus: { id: "Paling cepat dan mudah dihitung manual.", en: "Fastest and easiest by hand." },
    minus: { id: "Paling sering memakai jalur rusak, iterasi MODI jadi lebih banyak.", en: "Most likely to use broken routes, so MODI needs more iterations." },
  },
  lcm: {
    name: { id: "Biaya Terkecil (Least Cost)", en: "Least Cost Method" },
    group: { id: "Solusi awal", en: "Initial solution" },
    origin: {
      id: "Mengisi sel termurah lebih dulu. Fitriani (2026) di MATHunesa memakai Least Cost, VAM, dan MODI untuk optimasi biaya pengiriman beras dan menegaskan bahwa pilihan metode awal sangat menentukan efektivitas proses optimasi.",
      en: "Fills the cheapest cell first. Fitriani (2026) in MATHunesa used Least Cost, VAM, and MODI to optimise rice shipping costs and stressed that the choice of starting method strongly affects how efficient the optimisation is.",
    },
    steps: [
      { id: "Cari sel dengan biaya terkecil di antara sel yang belum dicoret. Sel dummy diisi paling akhir.", en: "Find the cheapest cell among those not crossed out. Dummy cells come last." },
      { id: "Jika ada beberapa biaya terkecil yang sama, pilih yang bisa menampung alokasi terbesar.", en: "If several cells tie, choose the one that can take the largest allocation." },
      { id: "Isi sel itu sebanyak min(sisa supply, sisa demand).", en: "Fill it with min(remaining supply, remaining demand)." },
      { id: "Coret baris atau kolom yang habis.", en: "Cross out the row or column that is used up." },
      { id: "Ulangi sampai semua terpenuhi.", en: "Repeat until everything is met." },
    ],
    withM: {
      id: "Sel M pasti dipilih paling akhir karena biayanya terbesar. Tetapi kalau di akhir proses hanya sel M yang tersisa, Least Cost terpaksa mengisinya. Ini terjadi pada contoh utama kami: 10 karung masuk ke S1D2.",
      en: "M cells are always picked last because they cost the most. But if only M cells remain at the end, Least Cost must fill them. This happens in our main example: 10 sacks end up in S1D2.",
    },
    plus: { id: "Sederhana dan sudah memperhatikan biaya.", en: "Simple and cost-aware." },
    minus: { id: "Bisa terjebak mengisi sel M di langkah terakhir.", en: "Can get stuck filling an M cell at the very end." },
  },
  vam: {
    name: { id: "Aproksimasi Vogel (VAM)", en: "Vogel’s Approximation (VAM)" },
    group: { id: "Solusi awal", en: "Initial solution" },
    origin: {
      id: "Diperkenalkan Reinfeld & Vogel (1958). Darojatun dkk. (2026) mencatat VAM populer karena hasilnya mendekati optimal atau bahkan optimal.",
      en: "Introduced by Reinfeld & Vogel (1958). Darojatun et al. (2026) note VAM is popular because it gives near-optimal or even optimal results.",
    },
    steps: [
      { id: "Untuk setiap baris dan kolom aktif, hitung penalti = biaya terkecil kedua − biaya terkecil.", en: "For every active row and column, compute penalty = second-smallest cost − smallest cost." },
      { id: "Pilih baris atau kolom dengan penalti terbesar.", en: "Pick the row or column with the largest penalty." },
      { id: "Isi sel termurah di baris atau kolom itu sebanyak min(sisa supply, sisa demand).", en: "Fill the cheapest cell on that line with min(remaining supply, remaining demand)." },
      { id: "Coret yang habis, lalu hitung ulang penalti.", en: "Cross out what is used up, then recompute penalties." },
      { id: "Jika tinggal satu baris atau kolom, isi sisa sel secara langsung.", en: "When only one row or column is left, fill the remaining cells directly." },
    ],
    withM: {
      id: "Inilah keunggulan VAM. Kalau biaya terkecil kedua di suatu baris adalah M, penaltinya menjadi M − c, pasti terbesar. VAM langsung mengamankan sel termurah baris itu sebelum terpaksa memakai jalur rusak. Pada soal “VAM langsung menghindari M”, VAM optimal tanpa iterasi sementara NWC butuh dua.",
      en: "This is where VAM shines. If the second-smallest cost on a line is M, the penalty becomes M − c, certainly the largest. VAM secures that line’s cheapest cell before it could be forced onto a broken route. In ‘VAM avoids M right away’, VAM is optimal with no iterations while NWC needs two.",
    },
    plus: { id: "Paling dekat ke optimal, paling jarang memakai sel M.", en: "Closest to optimal, rarely uses M cells." },
    minus: { id: "Perhitungan penalti lebih panjang.", en: "Penalty calculations take longer." },
  },
  modi: {
    name: { id: "MODI (Modified Distribution)", en: "MODI (Modified Distribution)" },
    group: { id: "Uji optimalitas", en: "Optimality test" },
    origin: {
      id: "Juga disebut metode u–v. Nilai u_i dan v_j sebenarnya adalah variabel dual dari model program linear, sehingga d_ij adalah biaya tereduksi (Hillier & Lieberman, 2015).",
      en: "Also called the u–v method. u_i and v_j are the dual variables of the linear program, so d_ij is the reduced cost (Hillier & Lieberman, 2015).",
    },
    formula: "u_i + v_j = c_{ij}\\;\\;(\\text{basis}), \\qquad d_{ij} = c_{ij} - u_i - v_j\\;\\;(\\text{non-basis})",
    steps: [
      { id: "Tetapkan u₁ = 0.", en: "Set u₁ = 0." },
      { id: "Untuk setiap sel basis, selesaikan u_i + v_j = c_ij secara berantai sampai semua u dan v diketahui.", en: "For every basic cell, solve u_i + v_j = c_ij in a chain until all u and v are known." },
      { id: "Hitung d_ij = c_ij − u_i − v_j untuk setiap sel kosong.", en: "Compute d_ij = c_ij − u_i − v_j for every empty cell." },
      { id: "Jika semua d_ij ≥ 0, solusi optimal. Jika tidak, sel dengan d_ij paling negatif masuk basis.", en: "If every d_ij ≥ 0 the solution is optimal. Otherwise the most negative d_ij enters." },
      { id: "Bentuk loop, θ = alokasi terkecil di sel (−), perbarui tabel, ulangi.", en: "Build the loop, θ = smallest allocation on a (−) cell, update, repeat." },
    ],
    withM: {
      id: "Selama ada sel M di basis, beberapa u atau v ikut mengandung M. Contoh: v₂ = M, u₂ = 6 − M. Lalu d₁₁ = 5 − 0 − (M − 3) = 8 − M, negatif, sehingga sel itu masuk dan mengusir sel M. Setelah sel M keluar, u dan v kembali berupa angka biasa.",
      en: "While an M cell is in the basis, some u or v also contain M. Example: v₂ = M, u₂ = 6 − M. Then d₁₁ = 5 − 0 − (M − 3) = 8 − M, negative, so that cell enters and pushes the M cell out. Afterwards u and v are ordinary numbers again.",
    },
    plus: { id: "Cepat: u dan v dihitung sekali per iterasi.", en: "Fast: u and v are computed once per iteration." },
    minus: { id: "Butuh tepat m + n − 1 sel basis (perlu ε bila merosot).", en: "Needs exactly m + n − 1 basic cells (ε if degenerate)." },
  },
  stepping: {
    name: { id: "Stepping Stone", en: "Stepping Stone" },
    group: { id: "Uji optimalitas", en: "Optimality test" },
    origin: {
      id: "Dijelaskan secara sistematis oleh Charnes & Cooper (1954). Setiap sel kosong diuji dengan “melompat” dari batu ke batu, yaitu dari sel basis ke sel basis.",
      en: "Systematised by Charnes & Cooper (1954). Each empty cell is tested by ‘stepping’ from stone to stone, i.e. from basic cell to basic cell.",
    },
    steps: [
      { id: "Pilih satu sel kosong, beri tanda +.", en: "Pick an empty cell and mark it +." },
      { id: "Bentuk loop tertutup yang berbelok hanya di sel basis, dengan tanda bergantian −, +, −, …", en: "Build a closed loop turning only at basic cells, alternating −, +, −, …" },
      { id: "Jumlahkan biaya sel-sel loop sesuai tandanya. Itulah nilai perubahan biaya sel itu.", en: "Add the loop costs with their signs. That is the cell’s cost change." },
      { id: "Ulangi untuk semua sel kosong. Pilih nilai paling negatif.", en: "Repeat for all empty cells. Pick the most negative value." },
      { id: "Pindahkan θ sepanjang loop sel terpilih, lalu ulangi pengujian.", en: "Shift θ along that cell’s loop, then test again." },
    ],
    withM: {
      id: "Loop untuk sel yang berada di baris atau kolom jalur rusak bisa melewati sel M bertanda (−). Penjumlahannya menghasilkan nilai seperti 5 − 3 + 6 − M = 8 − M. Aturan pembandingnya sama dengan MODI.",
      en: "A loop through a broken route’s row or column may pass an M cell marked (−). The sum gives values like 5 − 3 + 6 − M = 8 − M. The comparison rule is the same as MODI.",
    },
    plus: { id: "Sangat intuitif, cocok untuk memahami arti d_ij.", en: "Very intuitive, great for understanding what d_ij means." },
    minus: { id: "Lambat untuk soal besar karena setiap sel butuh loop sendiri.", en: "Slow on large problems since every cell needs its own loop." },
  },
};

const tabs: Tab[] = ["nwc", "lcm", "vam", "modi", "stepping"];

export default function MetodePage() {
  const { t } = useApp();
  const [tab, setTab] = useState<Tab>("vam");
  const [slug, setSlug] = useState("vam-menghindar");
  const prob = problems.find((p) => p.slug === slug)!;
  const isInit = tab === "nwc" || tab === "lcm" || tab === "vam";
  const method: Method = isInit ? (tab as Method) : "lcm";
  const opt: Optimality = tab === "stepping" ? "stepping" : "modi";
  const sol = useMemo(() => solve(prob, method, opt), [prob, method, opt]);
  const I = info[tab];

  const table = useMemo(
    () =>
      problems.map((p) => ({
        p,
        r: (["nwc", "lcm", "vam"] as Method[]).map((m) => solve(p, m, "modi")),
      })),
    []
  );

  return (
    <div className="mx-auto max-w-[1240px] px-5 py-12 md:px-8 md:py-16">
      <header className="max-w-[62ch]">
        <h1 className="text-[clamp(2.6rem,6vw,4.6rem)] font-black leading-[0.95] tracking-[-0.04em]">{t({ id: "Metode", en: "Methods" })}</h1>
        <p className="mt-4 text-[19px] text-ink/80">
          {t({
            id: "Tiga metode mencari solusi awal, dua metode menguji dan memperbaikinya. Pilih satu metode untuk melihat langkahnya, perilakunya terhadap sel M, dan simulasinya.",
            en: "Three methods find a starting solution, two test and improve it. Choose one to see its steps, how it treats M cells, and a live run.",
          })}
        </p>
      </header>

      <div className="mt-10 flex flex-wrap gap-0 border-b-2 border-ink" role="tablist">
        {tabs.map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            type="button"
            onClick={() => setTab(k)}
            className={`relative px-4 py-3 text-[15px] font-bold transition-colors md:px-6 ${tab === k ? "text-ink" : "text-muted hover:text-ink"}`}
          >
            <span className="block text-[11px] font-semibold text-muted">{t(info[k].group)}</span>
            {k === "nwc" ? "NWC" : k === "lcm" ? "Least Cost" : k === "vam" ? "VAM" : k === "modi" ? "MODI" : "Stepping Stone"}
            {tab === k && <motion.span layoutId="method-tab" className="absolute inset-x-0 -bottom-[2px] h-[5px] bg-route" />}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <h2 className="text-[clamp(1.7rem,3vw,2.3rem)] font-black leading-tight tracking-[-0.025em]">{t(I.name)}</h2>
          <p className="mt-3 max-w-[60ch] text-[17px] text-ink/85">{t(I.origin)}</p>
          {I.formula && <Tex block>{I.formula}</Tex>}
          <h3 className="mt-8 text-[17px] font-extrabold">{t({ id: "Langkah-langkah", en: "Steps" })}</h3>
          <ol className="mt-3 space-y-3">
            {I.steps.map((s, k) => (
              <li key={k} className="grid grid-cols-[2rem_1fr] gap-3 text-[16.5px]">
                <span className="num grid h-7 w-7 place-items-center border-2 border-ink text-[13px] font-semibold">{k + 1}</span>
                <span className="pt-0.5">{t(s)}</span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <div className="border-l-[5px] border-hazard bg-hazard/10 p-5">
            <h3 className="text-[17px] font-extrabold">{t({ id: "Perilakunya terhadap jalur rusak", en: "How it treats broken routes" })}</h3>
            <p className="mt-2 text-[16.5px]">{t(I.withM)}</p>
          </div>
          <dl className="mt-6 grid gap-px bg-line sm:grid-cols-2">
            <div className="bg-paper p-4">
              <dt className="text-[13px] font-bold text-route">{t({ id: "Kelebihan", en: "Strength" })}</dt>
              <dd className="mt-1 text-[16px]">{t(I.plus)}</dd>
            </div>
            <div className="bg-paper p-4">
              <dt className="text-[13px] font-bold text-alert">{t({ id: "Kekurangan", en: "Weakness" })}</dt>
              <dd className="mt-1 text-[16px]">{t(I.minus)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-[clamp(1.5rem,2.6vw,2rem)] font-black tracking-[-0.02em]">
            {t({ id: "Simulasi", en: "Live run" })}: {isInit ? t(I.name) : `Least Cost + ${t(I.name)}`}
          </h2>
          <label className="flex items-center gap-2 text-[14px]">
            <span className="text-muted">{t({ id: "Soal", en: "Problem" })}</span>
            <select value={slug} onChange={(e) => setSlug(e.target.value)} className="max-w-[280px] rounded-[3px] border border-ink/30 bg-surface px-3 py-2 font-semibold">
              {problems.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {t(p.title)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-5">
          <StepPlayer sol={sol} />
        </div>
      </section>

      <section className="mt-20">
        <h2 className="text-[clamp(1.5rem,2.6vw,2rem)] font-black tracking-[-0.02em]">{t({ id: "Perbandingan pada seluruh bank soal", en: "Comparison across the whole problem bank" })}</h2>
        <p className="mt-3 max-w-[70ch] text-[16.5px] text-ink/80">
          {t({
            id: "Biaya solusi awal setiap metode dan jumlah iterasi MODI sampai optimal, dihitung langsung oleh solver. Nilai merah berarti solusi awal masih memakai jalur rusak.",
            en: "Each method’s initial cost and the MODI iterations needed to reach the optimum, computed live by the solver. Red values mean the initial solution still uses a broken route.",
          })}
        </p>
        <div className="scroll-x mt-6">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-ink text-[13px]">
                <th className="py-2 pr-4 font-bold">{t({ id: "Soal", en: "Problem" })}</th>
                {["NWC", "Least Cost", "VAM"].map((h) => (
                  <th key={h} className="px-3 py-2 font-bold">
                    {h}
                  </th>
                ))}
                <th className="px-3 py-2 font-bold">{t({ id: "Optimal", en: "Optimal" })}</th>
              </tr>
            </thead>
            <tbody>
              {table.map(({ p, r }) => {
                const best = Math.min(...r.map((x) => x.iterations));
                return (
                  <tr key={p.slug} className="border-b border-line align-top">
                    <td className="py-3 pr-4">
                      <Link href={`/contoh#${p.slug}`} className="text-[15px] font-semibold hover:text-route">
                        {t(p.title)}
                      </Link>
                    </td>
                    {r.map((x, k) => (
                      <td key={k} className="num px-3 py-3 text-[14px]">
                        <span className={hasM(x.initialCost) ? "text-alert" : ""}>{fmt(x.initialCost)}</span>
                        <span className={`block text-[12px] ${x.iterations === best ? "font-semibold text-route" : "text-muted"}`}>
                          {x.iterations} {t({ id: "iterasi", en: "iter." })}
                        </span>
                      </td>
                    ))}
                    <td className={`num px-3 py-3 text-[14px] font-semibold ${r[0].feasible ? "" : "text-alert"}`}>
                      {fmt(r[0].totalCost)}
                      {!r[0].feasible && <span className="block font-sans text-[12px] font-normal">{t({ id: "tidak layak", en: "infeasible" })}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
