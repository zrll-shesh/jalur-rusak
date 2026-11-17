import type { Bi } from "../solver";

export const site = {
  title: { id: "Jalur Rusak", en: "Broken Routes" } as Bi,
  subtitle: {
    id: "Masalah transportasi ketika ada rute yang tidak bisa dilewati",
    en: "The transportation problem when some routes cannot be used",
  } as Bi,
  course: { id: "Teknik Optimasi", en: "Optimization Techniques" } as Bi,
  program: { id: "Sains Data, Kelas International 24", en: "Data Science, International 24" } as Bi,
  university: "Universitas Negeri Surabaya",
  lecturer: "Yuliani Puji Astuti, S.Si., M.Si.",
  group: { id: "Kelompok 1", en: "Group 1" } as Bi,
  presentation: { id: "Presentasi kelompok, 13 Oktober 2026", en: "Group presentation, 13 October 2026" } as Bi,
};

export const team = [
  { name: "Nazril Ravi Pratama", initials: "NR" },
  { name: "Rizki Piji Fathoni", initials: "RP" },
  { name: "Faisal Muflih", initials: "FM" },
  { name: "Mylovia Mahesa Ayu", initials: "MM" },
  { name: "Syafira Najema", initials: "SN" },
];

export const otherGroups: { no: number; topic: Bi }[] = [
  { no: 2, topic: { id: "Masalah tak setimbang", en: "Unbalanced problems" } },
  { no: 3, topic: { id: "Kemerosotan (degenerasi)", en: "Degeneracy" } },
  { no: 4, topic: { id: "Penyelesaian pola maksimum", en: "Maximization problems" } },
];

export interface Ref {
  key: string;
  text: string;
  url?: string;
}

/** Daftar pustaka. Format APA 7 */
export const references: Ref[] = [
  {
    key: "Hitchcock 1941",
    text: "Hitchcock, F. L. (1941). The distribution of a product from several sources to numerous localities. Journal of Mathematics and Physics, 20(1–4), 224–230.",
    url: "https://doi.org/10.1002/sapm1941201224",
  },
  {
    key: "Dantzig 1951",
    text: "Dantzig, G. B. (1951). Application of the simplex method to a transportation problem. In T. C. Koopmans (Ed.), Activity Analysis of Production and Allocation (pp. 359–373). Wiley.",
  },
  {
    key: "Charnes & Cooper 1954",
    text: "Charnes, A., & Cooper, W. W. (1954). The stepping stone method of explaining linear programming calculations in transportation problems. Management Science, 1(1), 49–69.",
    url: "https://doi.org/10.1287/mnsc.1.1.49",
  },
  {
    key: "Reinfeld & Vogel 1958",
    text: "Reinfeld, N. V., & Vogel, W. R. (1958). Mathematical Programming. Prentice-Hall.",
  },
  {
    key: "Dantzig & Thapa 1997",
    text: "Dantzig, G. B., & Thapa, M. N. (1997). Linear Programming 1: Introduction. Springer.",
  },
  {
    key: "Hillier & Lieberman 2015",
    text: "Hillier, F. S., & Lieberman, G. J. (2015). Introduction to Operations Research (10th ed.). McGraw-Hill Education.",
  },
  {
    key: "Taha 2017",
    text: "Taha, H. A. (2017). Operations Research: An Introduction (10th ed.). Pearson.",
  },
  {
    key: "Darojatun dkk. 2026",
    text: "Darojatun, I., Ahmad, M., & Hartono, B. P. (2026). Kombinasi Vogel’s Approximation Method (VAM) dengan algoritma Branch and Bound. Jurnal Riset dan Aplikasi Matematika (JRAM), 10(1), 189–201.",
    url: "https://doi.org/10.26740/jram.v10n1.p189-201",
  },
  {
    key: "Fitriani 2026",
    text: "Fitriani, A. (2026). Optimasi biaya pengiriman beras menggunakan model transportasi. MATHunesa: Jurnal Ilmiah Matematika, 14(1), 363–.",
    url: "https://ejournal.unesa.ac.id/index.php/mathunesa/article/view/73966",
  },
];
