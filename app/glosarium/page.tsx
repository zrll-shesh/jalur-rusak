"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/lib/i18n";
import { glossary } from "@/lib/content/faq";
import { Search } from "@/components/Icons";

export default function GlosariumPage() {
  const { t, lang } = useApp();
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return glossary
      .filter((g) => !s || `${g.term.id} ${g.term.en} ${g.def.id} ${g.def.en}`.toLowerCase().includes(s))
      .sort((a, b) => t(a.term).localeCompare(t(b.term), lang));
  }, [q, t, lang]);

  return (
    <div className="mx-auto max-w-[920px] px-5 py-12 md:px-8 md:py-16">
      <h1 className="text-[clamp(2.6rem,6vw,4.6rem)] font-black leading-[0.95] tracking-[-0.04em]">{t({ id: "Glosarium", en: "Glossary" })}</h1>
      <p className="mt-4 max-w-[60ch] text-[19px] text-ink/80">
        {t({ id: `${glossary.length} istilah penting beserta padanannya dalam bahasa Inggris.`, en: `${glossary.length} key terms with their Indonesian equivalents.` })}
      </p>
      <div className="mt-10 flex items-center gap-3 border-b-2 border-ink pb-2">
        <Search className="h-5 w-5 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t({ id: "Cari istilah", en: "Search terms" })} className="w-full bg-transparent py-2 text-[18px] outline-none placeholder:text-muted" aria-label={t({ id: "Cari", en: "Search" })} />
      </div>
      <dl className="mt-6">
        {list.map((g) => (
          <div key={g.term.id} className="grid gap-1 border-b border-line py-5 md:grid-cols-[260px_1fr] md:gap-8">
            <dt>
              <span className="block text-[18px] font-extrabold">{t(g.term)}</span>
              <span className="block text-[13.5px] italic text-muted">{lang === "id" ? g.term.en : g.term.id}</span>
            </dt>
            <dd className="text-[16.5px] text-ink/85">{t(g.def)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
