"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "@/lib/i18n";
import { faqs, faqCats, type FaqCat } from "@/lib/content/faq";
import { Search, Plus } from "@/components/Icons";

export default function QnaPage() {
  const { t } = useApp();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<FaqCat | "all">("all");
  const [open, setOpen] = useState<number | null>(0);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return faqs
      .map((f, i) => ({ f, i }))
      .filter(({ f }) => (cat === "all" || f.cat === cat) && (!s || `${f.q.id} ${f.q.en} ${f.a.id} ${f.a.en}`.toLowerCase().includes(s)));
  }, [q, cat]);

  return (
    <div className="mx-auto max-w-[920px] px-5 py-12 md:px-8 md:py-16">
      <header>
        <h1 className="text-[clamp(2.6rem,6vw,4.6rem)] font-black leading-[0.95] tracking-[-0.04em]">{t({ id: "Tanya Jawab", en: "Q&A" })}</h1>
        <p className="mt-4 max-w-[60ch] text-[19px] text-ink/80">
          {t({
            id: "Pertanyaan yang sering muncul saat belajar jalur rusak, termasuk pertanyaan yang mungkin diajukan saat sesi presentasi.",
            en: "Questions that often come up when studying broken routes, including ones likely to be asked during the presentation.",
          })}
        </p>
      </header>

      <div className="mt-10 flex items-center gap-3 border-b-2 border-ink pb-2">
        <Search className="h-5 w-5 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t({ id: "Cari pertanyaan, misalnya “θ” atau “tidak layak”", en: "Search, e.g. “θ” or “infeasible”" })}
          className="w-full bg-transparent py-2 text-[18px] outline-none placeholder:text-muted"
          aria-label={t({ id: "Cari", en: "Search" })}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(["all", ...Object.keys(faqCats)] as (FaqCat | "all")[]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            aria-pressed={cat === c}
            className={`rounded-[3px] px-3 py-1.5 text-[14px] font-semibold transition-colors ${cat === c ? "bg-ink text-paper" : "border border-ink/25 hover:border-ink"}`}
          >
            {c === "all" ? t({ id: "Semua", en: "All" }) : t(faqCats[c])}
          </button>
        ))}
      </div>

      <ul className="mt-8 border-t border-line">
        {list.map(({ f, i }) => {
          const isOpen = open === i;
          return (
            <li key={i} className="border-b border-line">
              <button type="button" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="grid w-full grid-cols-[1fr_auto] items-start gap-4 py-5 text-left">
                <span>
                  <span className="block text-[12.5px] font-semibold text-muted">{t(faqCats[f.cat])}</span>
                  <span className="mt-0.5 block text-[18px] font-bold leading-snug">{t(f.q)}</span>
                </span>
                <motion.span animate={{ rotate: isOpen ? 45 : 0 }} className="mt-4 text-ink/70">
                  <Plus className="h-5 w-5" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                    <p className="max-w-[68ch] pb-6 text-[16.5px] leading-relaxed text-ink/85">{t(f.a)}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
      {list.length === 0 && (
        <p className="mt-8 text-[16px] text-muted">
          {t({ id: "Tidak ada pertanyaan yang cocok. Coba kata lain atau pilih kategori Semua.", en: "No matching questions. Try another word or pick All." })}
        </p>
      )}
    </div>
  );
}
