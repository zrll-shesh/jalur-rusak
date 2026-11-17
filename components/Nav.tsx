"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "@/lib/i18n";
import { nav, ui } from "@/lib/content/ui";
import Logo from "./Logo";
import { Menu, Close, Sun, Moon } from "./Icons";

export function LangSwitch() {
  const { lang, setLang, t } = useApp();
  return (
    <div role="group" aria-label={t(ui.language)} className="flex overflow-hidden rounded-[3px] border border-ink/25 text-[13px] font-bold">
      {(["id", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`px-2.5 py-1 transition-colors ${lang === l ? "bg-ink text-paper" : "text-ink/70 hover:text-ink"}`}
        >
          {l === "id" ? "ID" : "EN"}
        </button>
      ))}
    </div>
  );
}

export function ThemeSwitch() {
  const { theme, toggleTheme, t } = useApp();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="grid h-8 w-8 place-items-center rounded-[3px] border border-ink/25 text-ink/80 hover:text-ink"
      aria-label={theme === "dark" ? t(ui.themeLight) : t(ui.themeDark)}
      title={theme === "dark" ? t(ui.themeLight) : t(ui.themeDark)}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-md supports-[backdrop-filter]:bg-paper/75" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-6 px-5 md:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label={t(ui.home)}>
          <Logo className="h-8 w-auto" />
          <span className="text-[19px] font-black leading-none tracking-[-0.02em]">Jalur Rusak</span>
        </Link>
        <nav className="ml-auto hidden lg:block" aria-label="Utama">
          <ul className="flex items-center gap-1">
            {nav
              .filter((n) => n.main)
              .map((n) => {
                const active = pathname === n.href;
                return (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      className={`relative px-3 py-2 text-[15px] font-semibold transition-colors ${active ? "text-ink" : "text-ink/65 hover:text-ink"}`}
                      aria-current={active ? "page" : undefined}
                    >
                      {t(n.label)}
                      {active && <motion.span layoutId="nav-underline" className="absolute inset-x-3 -bottom-[13px] h-[3px] bg-route" />}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <LangSwitch />
          <ThemeSwitch />
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-[3px] border border-ink/25 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? t(ui.close) : t(ui.menu)}
          >
            {open ? <Close className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-x-0 top-full h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-paper lg:hidden"
            aria-label="Menu"
          >
            <ul className="mx-auto max-w-[1240px] px-5 py-4">
              {nav.map((n, i) => (
                <li key={n.href} className="border-b border-line">
                  <Link href={n.href} className="flex items-baseline justify-between py-4 text-2xl font-extrabold tracking-[-0.02em]">
                    {t(n.label)}
                    <span className="num text-sm font-normal text-muted">{String(i + 1).padStart(2, "0")}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
