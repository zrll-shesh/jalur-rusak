"use client";

import Link from "next/link";
import { useApp } from "@/lib/i18n";
import { nav } from "@/lib/content/ui";
import { site, team } from "@/lib/content/site";

export default function Footer() {
  const { t } = useApp();
  return (
    <footer className="mt-24 border-t border-line">
      <div className="hazard-bar h-2" aria-hidden="true" />
      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-14 md:grid-cols-[1.3fr_1fr_1fr] md:px-8">
        <div>
          <p className="text-2xl font-black tracking-[-0.02em]">Jalur Rusak</p>
          <p className="mt-2 max-w-sm text-[15px] text-muted">{t(site.subtitle)}.</p>
          <p className="mt-6 text-[15px]">
            {t(site.course)}, {t(site.program)}
            <br />
            {site.university}
          </p>
          <p className="mt-1 text-[15px] text-muted">
            {t({ id: "Dosen pengampu", en: "Lecturer" })}: {site.lecturer}
          </p>
        </div>
        <div>
          <p className="text-sm font-bold text-muted">{t({ id: "Halaman", en: "Pages" })}</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[15px] md:grid-cols-1">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="hover:text-route hover:underline underline-offset-4">
                  {t(n.label)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold text-muted">{t(site.group)}</p>
          <ul className="mt-3 space-y-1.5 text-[15px]">
            {team.map((m) => (
              <li key={m.name}>{m.name}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1240px] flex-wrap justify-between gap-2 px-5 py-5 text-[13px] text-muted md:px-8" style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))" }}>
          <span>© 2026 {t(site.group)}, {t(site.course)}. {t({ id: "Dilarang menyalin atau mengubah tanpa izin.", en: "Do not copy or modify without permission." })}</span>
          <span>{team.map((m) => m.name).join(", ")}</span>
        </div>
      </div>
    </footer>
  );
}
