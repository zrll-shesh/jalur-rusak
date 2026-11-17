"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/lib/i18n";
import MDuel from "@/components/games/MDuel";
import NextMove from "@/components/games/NextMove";
import LoopHunter from "@/components/games/LoopHunter";
import type { Bi } from "@/lib/solver";

type G = "mduel" | "nextmove" | "loophunter";
const games: { id: G; name: Bi; skill: Bi; text: Bi }[] = [
  {
    id: "mduel",
    name: { id: "Duel M", en: "M Duel" },
    skill: { id: "Aritmetika M", en: "M arithmetic" },
    text: { id: "Bandingkan ekspresi M secepat mungkin dalam 60 detik.", en: "Compare M expressions as fast as you can in 60 seconds." },
  },
  {
    id: "nextmove",
    name: { id: "Langkah Berikutnya", en: "Next Move" },
    skill: { id: "Least Cost dan VAM", en: "Least Cost and VAM" },
    text: { id: "Tebak sel yang diisi metode berikutnya pada soal acak dengan jalur rusak.", en: "Guess the next cell the method fills on a random problem with broken routes." },
  },
  {
    id: "loophunter",
    name: { id: "Pemburu Loop", en: "Loop Hunter" },
    skill: { id: "Loop dan θ", en: "Loops and θ" },
    text: { id: "Temukan loop tertutup dari sel masuk, lalu hitung θ. Lima ronde.", en: "Find the closed loop from the entering cell, then compute θ. Five rounds." },
  },
];

export default function GamesPage() {
  const { t } = useApp();
  const [g, setG] = useState<G>("mduel");
  return (
    <div className="mx-auto max-w-[1240px] px-5 py-12 md:px-8 md:py-16">
      <header className="max-w-[62ch]">
        <h1 className="text-[clamp(2.6rem,6vw,4.6rem)] font-black leading-[0.95] tracking-[-0.04em]">Games</h1>
        <p className="mt-4 text-[19px] text-ink/80">
          {t({
            id: "Tiga permainan singkat untuk melatih bagian yang paling sering bikin salah: membandingkan M, memilih sel di solusi awal, dan membentuk loop. Skor tertinggi tersimpan di perangkatmu.",
            en: "Three short games that train the parts people get wrong most: comparing M, choosing cells for the initial solution, and building loops. Best scores are saved on your device.",
          })}
        </p>
      </header>

      <div className="mt-10 grid gap-px border border-line bg-line md:grid-cols-3" role="tablist">
        {games.map((x) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={g === x.id}
            onClick={() => setG(x.id)}
            className={`relative px-5 py-5 text-left transition-colors ${g === x.id ? "bg-surface" : "bg-paper hover:bg-surface/60"}`}
          >
            {g === x.id && <motion.span layoutId="game-tab" className="absolute inset-x-0 top-0 h-[5px] bg-route" />}
            <span className="block text-[12.5px] font-semibold text-muted">{t(x.skill)}</span>
            <span className="mt-1 block text-[22px] font-black tracking-[-0.02em]">{t(x.name)}</span>
            <span className="mt-1 block text-[14.5px] text-ink/75">{t(x.text)}</span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        {g === "mduel" && <MDuel />}
        {g === "nextmove" && <NextMove />}
        {g === "loophunter" && <LoopHunter />}
      </div>
    </div>
  );
}
