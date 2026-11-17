import type { Bi } from "../solver";
const b = (id: string, en: string): Bi => ({ id, en });

export const nav: { href: string; label: Bi; main: boolean }[] = [
  { href: "/materi", label: b("Materi", "Theory"), main: true },
  { href: "/metode", label: b("Metode", "Methods"), main: true },
  { href: "/contoh", label: b("Contoh Soal", "Examples"), main: true },
  { href: "/kalkulator", label: b("Kalkulator", "Calculator"), main: true },
  { href: "/games", label: b("Games", "Games"), main: true },
  { href: "/kuis", label: b("Kuis", "Quiz"), main: true },
  { href: "/qna", label: b("Tanya Jawab", "Q&A"), main: true },
  { href: "/glosarium", label: b("Glosarium", "Glossary"), main: false },
  { href: "/tentang", label: b("Tentang", "About"), main: false },
];

export const ui = {
  home: b("Beranda", "Home"),
  menu: b("Menu", "Menu"),
  close: b("Tutup", "Close"),
  themeDark: b("Mode gelap", "Dark mode"),
  themeLight: b("Mode terang", "Light mode"),
  language: b("Bahasa", "Language"),
  prev: b("Sebelumnya", "Previous"),
  next: b("Berikutnya", "Next"),
  first: b("Ke awal", "To start"),
  last: b("Ke akhir", "To end"),
  play: b("Putar otomatis", "Autoplay"),
  pause: b("Jeda", "Pause"),
  step: b("Langkah", "Step"),
  of: b("dari", "of"),
  calc: b("Perhitungan", "Calculation"),
  supply: b("Supply", "Supply"),
  demand: b("Demand", "Demand"),
  keyHint: b("Gunakan tombol panah kiri dan kanan untuk berpindah langkah.", "Use the left and right arrow keys to move between steps."),
  method: b("Metode solusi awal", "Initial method"),
  optimality: b("Uji optimalitas", "Optimality test"),
  totalCost: b("Total biaya", "Total cost"),
  feasible: b("Layak", "Feasible"),
  infeasible: b("Tidak layak", "Infeasible"),
};

export const phaseName: Record<string, Bi> = {
  setup: b("Soal", "Problem"),
  balance: b("Keseimbangan", "Balance"),
  initial: b("Solusi awal", "Initial solution"),
  degenerate: b("Kemerosotan", "Degeneracy"),
  cost: b("Biaya awal", "Initial cost"),
  uv: b("Nilai u, v", "u, v values"),
  reduced: b("Uji sel kosong", "Test empty cells"),
  loop: b("Loop & θ", "Loop & θ"),
  pivot: b("Perbaikan", "Update"),
  optimal: b("Optimal", "Optimal"),
  result: b("Hasil", "Result"),
};
