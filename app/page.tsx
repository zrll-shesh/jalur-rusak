"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import HeroMap from "@/components/HeroMap";
import TransportTable from "@/components/TransportTable";
import { useApp, useStored } from "@/lib/i18n";
import { site, team } from "@/lib/content/site";
import { problems } from "@/lib/content/problems";
import { solve } from "@/lib/solver";
import { Check } from "@/components/Icons";

export default function Home() {
  const { t } = useApp();
  const reduce = useReducedMotion();
  const [read] = useStored<string[]>("jr-read", []);
  const [quizBest] = useStored<number>("jr-quiz-best", 0);
  const [gamesPlayed] = useStored<Record<string, number>>("jr-games", {});

  const main = problems.find((p) => p.slug === "jembatan-putus")!;
  const sol = useMemo(() => solve(main, "lcm", "modi"), [main]);
  const initialSnap = sol.steps.find((s) => s.phase === "cost")!.snap;
  const finalSnap = sol.steps[sol.steps.length - 1].snap;

  const path = [
    {
      href: "/materi",
      title: { id: "Pahami konsepnya", en: "Understand the concept" },
      text: { id: "Model transportasi, kenapa jalur rusak diberi biaya M, dan aturan berhitung dengan M.", en: "The transportation model, why broken routes get cost M, and how to calculate with M." },
      done: read.length >= 7,
      meta: { id: `${read.length} dari 10 bab dibaca`, en: `${read.length} of 10 chapters read` },
    },
    {
      href: "/metode",
      title: { id: "Kenali lima metodenya", en: "Meet the five methods" },
      text: { id: "NWC, Least Cost, dan VAM untuk solusi awal. MODI dan Stepping Stone untuk menguji optimalitas.", en: "NWC, Least Cost, and VAM for the start. MODI and Stepping Stone to test optimality." },
      done: false,
      meta: null,
    },
    {
      href: "/contoh",
      title: { id: "Ikuti contoh langkah demi langkah", en: "Follow worked examples step by step" },
      text: { id: `${problems.length} soal, dari pemanasan sampai kasus tidak layak. Setiap tabel dan hitungan ditampilkan.`, en: `${problems.length} problems, from warm-ups to infeasible cases. Every table and calculation is shown.` },
      done: false,
      meta: null,
    },
    {
      href: "/kalkulator",
      title: { id: "Coba soalmu sendiri", en: "Try your own problem" },
      text: { id: "Masukkan biaya, tandai jalan yang rusak, dan lihat penyelesaiannya.", en: "Enter costs, mark the broken roads, and watch the solution unfold." },
      done: false,
      meta: null,
    },
    {
      href: "/games",
      title: { id: "Latih refleks lewat games", en: "Train your reflexes with games" },
      text: { id: "Duel aritmetika M, tebak langkah VAM berikutnya, dan berburu loop.", en: "M arithmetic duels, guess the next VAM move, and loop hunting." },
      done: Object.keys(gamesPlayed).length >= 3,
      meta: Object.keys(gamesPlayed).length ? { id: `${Object.keys(gamesPlayed).length} dari 3 game dimainkan`, en: `${Object.keys(gamesPlayed).length} of 3 games played` } : null,
    },
    {
      href: "/kuis",
      title: { id: "Uji pemahaman", en: "Check your understanding" },
      text: { id: "30 soal pilihan ganda dengan pembahasan.", en: "30 multiple-choice questions with explanations." },
      done: quizBest >= 80,
      meta: quizBest ? { id: `Skor terbaik ${quizBest}`, en: `Best score ${quizBest}` } : null,
    },
  ];

  return (
    <>
      {/* HERO */}
      <section className="mx-auto max-w-[1240px] px-5 pb-16 pt-10 md:px-8 md:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.12fr] lg:gap-14">
          <div>
            <motion.p
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[15px] font-semibold text-muted"
            >
              {t(site.group)}, {t(site.course)}
            </motion.p>
            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
              className="mt-3 text-[clamp(3.6rem,10vw,7.8rem)] font-black leading-[0.86] tracking-[-0.045em]"
            >
              {t({ id: "Jalur", en: "Broken" })}
              <br />
              {t({ id: "Rusak", en: "Routes" })}
            </motion.h1>
            <motion.div initial={reduce ? false : { scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.35, duration: 0.5 }} className="hazard-bar mt-6 h-3 w-40 origin-left" aria-hidden="true" />
            <motion.p
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="mt-6 max-w-[34ch] text-[21px] leading-snug"
            >
              {t({
                id: "Satu jembatan putus bisa mengubah seluruh rencana distribusi. Di sini kamu belajar cara model transportasi menghindarinya dengan biaya M.",
                en: "One collapsed bridge can change an entire distribution plan. Here you learn how the transportation model avoids it with the cost M.",
              })}
            </motion.p>
            <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="mt-8 flex flex-wrap gap-3">
              <Link href="/materi" className="rounded-[3px] bg-ink px-5 py-3 text-[15px] font-bold text-paper transition-transform hover:-translate-y-0.5">
                {t({ id: "Mulai dari materi", en: "Start with the theory" })}
              </Link>
              <Link href="/contoh" className="rounded-[3px] border-2 border-ink px-5 py-[10px] text-[15px] font-bold transition-colors hover:bg-ink hover:text-paper">
                {t({ id: "Lihat contoh soal", en: "See worked examples" })}
              </Link>
            </motion.div>
          </div>
          <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
            <HeroMap />
            <p className="mt-3 max-w-prose text-[14px] text-muted">
              {t({
                id: "Klik sebuah jalan untuk merusak atau memperbaikinya. Rute termurah dihitung ulang langsung dengan VAM dan MODI; tebal garis menunjukkan jumlah barang yang dikirim.",
                en: "Click a road to break or repair it. The cheapest plan is recomputed instantly with VAM and MODI; line thickness shows how much is shipped.",
              })}
            </p>
          </motion.div>
        </div>
      </section>

      {/* INTI */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-[1240px] px-5 py-16 md:px-8">
          <h2 className="max-w-[22ch] text-[clamp(1.9rem,4vw,3rem)] font-black leading-[1.02] tracking-[-0.03em]">
            {t({ id: "Rute yang tidak boleh dipakai diberi biaya M, sehingga solusi optimal menghindarinya sendiri.", en: "A route that must not be used gets cost M, so the optimal solution avoids it on its own." })}
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-0 md:divide-x md:divide-line">
            {[
              {
                h: { id: "M lebih besar dari angka apa pun", en: "M beats any number" },
                p: { id: "M bukan angka tertentu. Ia mewakili biaya yang begitu besar sehingga rute itu tidak akan pernah dipilih selama ada alternatif.", en: "M is not a specific number. It stands for a cost so large that the route is never chosen while an alternative exists." },
              },
              {
                h: { id: "Bandingkan koefisien M dulu", en: "Compare the M coefficient first" },
                p: { id: "8 − M itu negatif, M − 8 itu positif, dan 2M − 900 lebih besar dari M + 900. Konstanta hanya penentu bila koefisien M sama.", en: "8 − M is negative, M − 8 is positive, and 2M − 900 beats M + 900. Constants only decide when the M coefficients match." },
              },
              {
                h: { id: "M tersisa berarti tidak layak", en: "Leftover M means infeasible" },
                p: { id: "Kalau solusi optimal masih memakai sel M, tidak ada rencana yang memenuhi semua permintaan tanpa jalur rusak.", en: "If the optimum still uses an M cell, no plan meets every demand without the broken route." },
              },
            ].map((x, k) => (
              <div key={k} className="md:px-8 md:first:pl-0 md:last:pr-0">
                <h3 className="text-[19px] font-extrabold tracking-[-0.01em]">{t(x.h)}</h3>
                <p className="mt-2 text-[16px] text-ink/80">{t(x.p)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEBELUM SESUDAH */}
      <section className="mx-auto max-w-[1240px] px-5 py-20 md:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-[clamp(1.7rem,3.4vw,2.5rem)] font-black leading-[1.05] tracking-[-0.025em]">
              {t({ id: "Dari 430 + 10M menjadi 510 dalam satu iterasi", en: "From 430 + 10M to 510 in one iteration" })}
            </h2>
            <p className="mt-4 max-w-prose text-[17px] text-ink/85">
              {t({
                id: "Pada contoh utama, Least Cost terpaksa mengirim 10 karung lewat jembatan yang putus (S1D2). Uji MODI menemukan sel S1D1 dengan d = 8 − M, loop memindahkan 10 karung, dan jalur rusak kosong kembali.",
                en: "In the main example, Least Cost is forced to send 10 sacks over the collapsed bridge (S1D2). MODI finds cell S1D1 with d = 8 − M, the loop moves 10 sacks, and the broken route is empty again.",
              })}
            </p>
            <Link href="/contoh#jembatan-putus" className="mt-6 inline-block border-b-2 border-route pb-0.5 text-[16px] font-bold text-route hover:border-ink hover:text-ink">
              {t({ id: "Putar penyelesaian lengkapnya", en: "Play the full solution" })}
            </Link>
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <div>
              <p className="mb-2 text-[14px] font-bold">
                {t({ id: "Solusi awal (Least Cost)", en: "Initial solution (Least Cost)" })} <span className="num font-normal text-alert">430 + 10M</span>
              </p>
              <TransportTable data={sol} snap={{ ...initialSnap, focus: [{ r: 0, c: 1 }], focusKind: "warn" }} compact />
            </div>
            <div>
              <p className="mb-2 text-[14px] font-bold">
                {t({ id: "Solusi optimal (MODI)", en: "Optimal solution (MODI)" })} <span className="num font-normal text-route">510</span>
              </p>
              <TransportTable data={sol} snap={finalSnap} compact />
            </div>
          </div>
        </div>
      </section>

      {/* JALUR BELAJAR */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-[1240px] px-5 py-20 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-[clamp(1.7rem,3.4vw,2.5rem)] font-black tracking-[-0.025em]">{t({ id: "Urutan belajar yang disarankan", en: "Suggested learning order" })}</h2>
            <p className="text-[14px] text-muted">{t({ id: "Progres tersimpan di perangkat ini.", en: "Progress is saved on this device." })}</p>
          </div>
          <ol className="mt-10 border-t-2 border-ink">
            {path.map((p, k) => (
              <li key={p.href} className="border-b border-line">
                <Link href={p.href} className="group grid grid-cols-[3rem_1fr] items-baseline gap-x-4 py-6 md:grid-cols-[4.5rem_1fr_auto] md:py-7">
                  <span className="num text-[15px] text-muted">{String(k + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="block text-[clamp(1.25rem,2.4vw,1.7rem)] font-extrabold tracking-[-0.02em] transition-colors group-hover:text-route">{t(p.title)}</span>
                    <span className="mt-1 block max-w-prose text-[16px] text-ink/75">{t(p.text)}</span>
                  </span>
                  <span className="col-start-2 mt-2 flex items-center gap-2 text-[13px] text-muted md:col-start-3 md:mt-0">
                    {p.done && <Check className="h-4 w-4 text-route" />}
                    {p.meta ? t(p.meta) : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* TIM */}
      <section className="bg-sign text-white">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-16 md:grid-cols-[1fr_1.2fr] md:px-8">
          <div>
            <p className="text-[15px] text-white/70">{t(site.presentation)}</p>
            <h2 className="mt-2 text-[clamp(1.8rem,3.6vw,2.7rem)] font-black leading-[1.05] tracking-[-0.025em]">
              {t(site.group)}: {t({ id: "Jalur Rusak", en: "Broken Routes" })}
            </h2>
            <p className="mt-4 text-[16px] text-white/85">
              {t(site.course)}, {t(site.program)}, {site.university}.
              <br />
              {t({ id: "Dosen pengampu", en: "Lecturer" })}: {site.lecturer}
            </p>
            <Link href="/tentang" className="mt-6 inline-block border-b-2 border-hazard pb-0.5 font-bold text-hazard">
              {t({ id: "Tentang kelompok dan referensi", en: "About the group and references" })}
            </Link>
          </div>
          <ul className="grid gap-px self-center bg-white/20 sm:grid-cols-2">
            {team.map((m) => (
              <li key={m.name} className="flex items-center gap-4 bg-sign px-4 py-4">
                <span className="num grid h-11 w-11 shrink-0 place-items-center border-2 border-white/80 text-[14px] font-semibold">{m.initials}</span>
                <span className="text-[17px] font-bold">{m.name}</span>
              </li>
            ))}
            <li className="hazard-cell flex items-center bg-sign px-4 py-4 text-[14px] text-white/85">
              {t({ id: "Sains Data, Kelas International 24", en: "Data Science, International 24" })}
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
