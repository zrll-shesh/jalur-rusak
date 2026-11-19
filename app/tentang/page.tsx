"use client";

import { useApp } from "@/lib/i18n";
import { site, team, otherGroups, references } from "@/lib/content/site";

export default function TentangPage() {
  const { t } = useApp();
  return (
    <div className="mx-auto max-w-[1240px] px-5 py-12 md:px-8 md:py-16">
      <h1 className="text-[clamp(2.6rem,6vw,4.6rem)] font-black leading-[0.95] tracking-[-0.04em]">{t({ id: "Tentang", en: "About" })}</h1>
      <div className="mt-10 grid gap-12 lg:grid-cols-[1.1fr_1fr]">
        <section>
          <p className="max-w-[60ch] text-[19px] leading-relaxed">
            {t({
              id: "Website ini dibuat oleh Kelompok 1 sebagai media pembelajaran untuk presentasi materi Jalur Rusak pada mata kuliah Teknik Optimasi. Semua perhitungan di website dikerjakan oleh solver yang kami tulis sendiri dan sudah kami cocokkan dengan solver program linear pada ratusan soal acak.",
              en: "This site was built by Group 1 as learning material for our presentation on Broken Routes in the Optimization Techniques course. Every calculation is done by a solver we wrote ourselves and checked against a linear-programming solver on hundreds of random problems.",
            })}
          </p>
          <dl className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2">
            {[
              [t({ id: "Mata kuliah", en: "Course" }), t(site.course)],
              [t({ id: "Program studi", en: "Programme" }), t(site.program)],
              [t({ id: "Universitas", en: "University" }), site.university],
              [t({ id: "Dosen pengampu", en: "Lecturer" }), site.lecturer],
            ].map(([k, v]) => (
              <div key={k} className="bg-surface px-5 py-4">
                <dt className="text-[13px] text-muted">{k}</dt>
                <dd className="mt-0.5 text-[17px] font-bold">{v}</dd>
              </div>
            ))}
          </dl>
          <h2 className="mt-12 text-[24px] font-black tracking-[-0.02em]">{t({ id: "Anggota kelompok", en: "Group members" })}</h2>
          <ul className="mt-4 border-t-2 border-ink">
            {team.map((m) => (
              <li key={m.name} className="flex items-center gap-4 border-b border-line py-4">
                <span className="num grid h-11 w-11 place-items-center bg-sign text-[14px] font-semibold text-white">{m.initials}</span>
                <span className="text-[18px] font-bold">{m.name}</span>
              </li>
            ))}
          </ul>
          <h2 className="mt-12 text-[24px] font-black tracking-[-0.02em]">{t({ id: "Topik kelompok lain", en: "Other groups’ topics" })}</h2>
          <ul className="mt-4 space-y-2 text-[17px]">
            {otherGroups.map((g) => (
              <li key={g.no}>
                <span className="num mr-3 text-muted">{t({ id: "Kelompok", en: "Group" })} {g.no}</span>
                {t(g.topic)}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-[24px] font-black tracking-[-0.02em]">{t({ id: "Daftar pustaka", en: "References" })}</h2>
          <ol className="mt-4 space-y-3 text-[15px] leading-relaxed">
            {references.map((r) => (
              <li key={r.key} className="border-b border-line pb-3">
                {r.text}{" "}
                {r.url && (
                  <a href={r.url} target="_blank" rel="noreferrer" className="break-all text-route underline underline-offset-2">
                    {r.url.replace("https://", "")}
                  </a>
                )}
              </li>
            ))}
          </ol>
          <h2 className="mt-12 text-[24px] font-black tracking-[-0.02em]">{t({ id: "Pengembangan website", en: "Website development" })}</h2>
          <p className="mt-3 text-[16.5px] text-ink/85">
            {t({
              id: "Website ini dirancang dan dikembangkan bersama oleh seluruh anggota Kelompok 1: Nazril Ravi Pratama, Rizki Piji Fathoni, Faisal Muflih, Mylovia Mahesa Ayu, dan Syafira Najema. Setiap anggota berkontribusi dalam penyusunan materi, pembuatan dan pemeriksaan soal, pengembangan website, serta persiapan presentasi.",
              en: "This website was designed and developed together by all members of Group 1: Nazril Ravi Pratama, Rizki Piji Fathoni, Faisal Muflih, Mylovia Mahesa Ayu, and Syafira Najema. Every member contributed to the material, creating and checking the problems, building the website, and preparing the presentation.",
            })}
          </p>
          <h2 className="mt-12 text-[24px] font-black tracking-[-0.02em]">{t({ id: "Teknologi", en: "Technology" })}</h2>
          <p className="mt-3 text-[16.5px] text-ink/85">
            {t({
              id: "Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion untuk animasi, dan KaTeX untuk rumus. Huruf Overpass dipilih karena terinspirasi dari huruf rambu jalan raya.",
              en: "Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion for animation, and KaTeX for formulas. The Overpass typeface was chosen because it is inspired by highway signage lettering.",
            })}
          </p>
        </section>
      </div>
    </div>
  );
}
