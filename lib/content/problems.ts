import type { Bi, Method, ProblemInput } from "../solver";

export type Level = "dasar" | "menengah" | "lanjut";

export interface BankProblem extends ProblemInput {
  slug: string;
  title: Bi;
  story: Bi;
  insight: Bi;
  tags: Bi[];
  level: Level;
  method: Method;
  unit: Bi;
}

const M = "M" as const;

const T = {
  balanced: { id: "Setimbang", en: "Balanced" },
  unbalanced: { id: "Tak setimbang", en: "Unbalanced" },
  infeasible: { id: "Tidak layak", en: "Infeasible" },
  degenerate: { id: "Kemerosotan", en: "Degeneracy" },
  multi: { id: "Banyak jalur rusak", en: "Several broken routes" },
  real: { id: "Kasus nyata", en: "Real-world case" },
} satisfies Record<string, Bi>;

export const levelName: Record<Level, Bi> = {
  dasar: { id: "Dasar", en: "Basic" },
  menengah: { id: "Menengah", en: "Intermediate" },
  lanjut: { id: "Lanjut", en: "Advanced" },
};

export const problems: BankProblem[] = [
  {
    slug: "pemanasan",
    title: { id: "Pemanasan: dua gudang, tiga toko", en: "Warm-up: two warehouses, three stores" },
    story: {
      id: "Sebuah usaha air minum punya dua depot (S1, S2) yang memasok tiga toko (D1, D2, D3). Jalan dari S1 ke D2 sedang dicor ulang, dan jembatan menuju D3 dari S2 ditutup. Biaya dalam ribu rupiah per galon.",
      en: "A water business has two depots (S1, S2) supplying three stores (D1, D2, D3). The road from S1 to D2 is being repaved and the bridge from S2 to D3 is closed. Costs are in thousand rupiah per gallon.",
    },
    insight: {
      id: "Soal kecil yang bagus untuk melatih aritmetika M. Bandingkan NWC dan VAM: VAM langsung menghindari kedua jalur rusak, sedangkan NWC butuh dua iterasi untuk membuangnya.",
      en: "A small problem that is great for practising M arithmetic. Compare NWC and VAM: VAM avoids both broken routes immediately, while NWC needs two iterations to remove them.",
    },
    tags: [T.balanced, T.multi],
    level: "dasar",
    method: "vam",
    unit: { id: "ribu Rp/galon", en: "thousand Rp/gallon" },
    costs: [
      [6, M, 3],
      [4, 5, M],
    ],
    supply: [25, 35],
    demand: [20, 25, 15],
  },
  {
    slug: "jembatan-putus",
    title: { id: "Jembatan putus di rute S1 ke D2", en: "Collapsed bridge on route S1 to D2" },
    story: {
      id: "Distributor beras memiliki tiga gudang (S1, S2, S3) dan tiga agen (D1, D2, D3). Jembatan di rute S1 ke D2 putus, sehingga truk dari S1 tidak bisa mencapai D2. Biaya dalam ribu rupiah per karung.",
      en: "A rice distributor has three warehouses (S1, S2, S3) and three agents (D1, D2, D3). The bridge on route S1 to D2 has collapsed, so trucks from S1 cannot reach D2. Costs are in thousand rupiah per sack.",
    },
    insight: {
      id: "Ini contoh utama presentasi kami. Least Cost terpaksa mengisi sel M karena hanya itu yang tersisa. MODI menemukan d = 8 − M (negatif), lalu loop mengusir jalur rusak keluar dari basis dalam satu iterasi. Biaya turun dari 430 + 10M menjadi 510.",
      en: "This is the main example of our presentation. Least Cost is forced into the M cell because nothing else is left. MODI finds d = 8 − M (negative), and the loop pushes the broken route out of the basis in a single iteration. Cost drops from 430 + 10M to 510.",
    },
    tags: [T.balanced],
    level: "dasar",
    method: "lcm",
    unit: { id: "ribu Rp/karung", en: "thousand Rp/sack" },
    costs: [
      [5, M, 4],
      [3, 6, 8],
      [7, 4, 5],
    ],
    supply: [50, 40, 30],
    demand: [30, 50, 40],
  },
  {
    slug: "vam-menghindar",
    title: { id: "VAM langsung menghindari M", en: "VAM avoids M right away" },
    story: {
      id: "Tiga pabrik (S1, S2, S3) mengirim produk ke tiga kota (D1, D2, D3). Ruas jalan S2 ke D2 terkena banjir dan ditutup. Biaya dalam ribu rupiah per unit.",
      en: "Three factories (S1, S2, S3) ship products to three cities (D1, D2, D3). The road from S2 to D2 is flooded and closed. Costs are in thousand rupiah per unit.",
    },
    insight: {
      id: "Coba ketiga metode pada soal ini. NWC memasukkan 60 unit ke jalur rusak (60M + 420) dan butuh dua iterasi. Least Cost memasukkan 20 unit (20M + 500). VAM langsung menghasilkan 640 tanpa iterasi, karena penalti baris yang memuat M melonjak (misalnya M − 5) sehingga sel termurahnya diisi lebih dulu.",
      en: "Try all three methods here. NWC puts 60 units on the broken route (60M + 420) and needs two iterations. Least Cost puts 20 units there (20M + 500). VAM reaches 640 directly with no iterations, because the penalty of a row containing M jumps (for example to M − 5), so its cheapest cell is filled first.",
    },
    tags: [T.balanced],
    level: "dasar",
    method: "vam",
    unit: { id: "ribu Rp/unit", en: "thousand Rp/unit" },
    costs: [
      [4, 6, 8],
      [5, M, 3],
      [7, 4, 5],
    ],
    supply: [50, 60, 40],
    demand: [40, 70, 40],
  },
  {
    slug: "tidak-layak",
    title: { id: "Kasus tidak layak", en: "Infeasible case" },
    story: {
      id: "Pabrik S1 tidak bisa mengirim ke D2 karena akses jalan tertutup longsor. D2 butuh 40 unit, padahal sumber lain (S2) hanya punya 20 unit.",
      en: "Factory S1 cannot ship to D2 because a landslide has blocked the access road. D2 needs 40 units, but the only other source (S2) has just 20.",
    },
    insight: {
      id: "Sekalipun sudah optimal, 20 unit tetap lewat jalur rusak (Z = 130 + 20M). Ini bukan kesalahan hitung. Artinya tidak ada rencana layak tanpa memakai jalur rusak, sehingga keputusan harus diambil di luar model: perbaiki jalan, cari rute transit, atau terima kekurangan 20 unit.",
      en: "Even at the optimum, 20 units still use the broken route (Z = 130 + 20M). This is not a calculation error. No feasible plan exists without that route, so the decision must be made outside the model: repair the road, find a transit route, or accept a 20-unit shortage.",
    },
    tags: [T.infeasible],
    level: "dasar",
    method: "vam",
    unit: { id: "ribu Rp/unit", en: "thousand Rp/unit" },
    costs: [
      [3, M],
      [5, 2],
    ],
    supply: [50, 20],
    demand: [30, 40],
  },
  {
    slug: "rusak-dan-dummy",
    title: { id: "Jalur rusak dan supply berlebih", en: "Broken routes with excess supply" },
    story: {
      id: "Dua gudang (S1, S2) melayani tiga toko. Rute S1 ke D2 dan S2 ke D3 tidak bisa dilalui. Total supply 110 sedangkan permintaan 100, jadi ada 10 unit yang tidak terkirim.",
      en: "Two warehouses (S1, S2) serve three stores. Routes S1 to D2 and S2 to D3 are unusable. Total supply is 110 while demand is 100, so 10 units will not be shipped.",
    },
    insight: {
      id: "Gabungan dua kasus khusus: jalur rusak diberi M, kelebihan supply ditampung kolom Dummy berbiaya 0. Hasil akhir: S1 menyimpan 10 unit, tidak ada jalur rusak yang terpakai, total 430.",
      en: "Two special cases combined: broken routes get M, and excess supply goes to a Dummy column with cost 0. Final result: S1 keeps 10 units, no broken route is used, total 430.",
    },
    tags: [T.unbalanced, T.multi],
    level: "menengah",
    method: "vam",
    unit: { id: "ribu Rp/unit", en: "thousand Rp/unit" },
    costs: [
      [6, M, 4],
      [5, 3, M],
    ],
    supply: [60, 50],
    demand: [40, 30, 30],
  },
  {
    slug: "jawa-timur",
    title: { id: "Distribusi pupuk di Jawa Timur", en: "Fertiliser distribution in East Java" },
    story: {
      id: "Gudang di Surabaya, Gresik, dan Sidoarjo memasok pupuk ke Malang, Kediri, Madiun, dan Jember. Ruas Gresik ke Madiun tertutup longsor, dan ruas Sidoarjo ke Jember terendam banjir. Biaya dalam ribu rupiah per ton. Angka ini ilustrasi untuk latihan.",
      en: "Warehouses in Surabaya, Gresik, and Sidoarjo supply fertiliser to Malang, Kediri, Madiun, and Jember. The Gresik–Madiun road is blocked by a landslide and the Sidoarjo–Jember road is flooded. Costs are in thousand rupiah per ton. Figures are illustrative.",
    },
    insight: {
      id: "Perbedaan metode awal terasa sekali di sini. NWC memasukkan 130 ton ke jalur rusak dan butuh 5 iterasi. VAM langsung optimal dengan biaya 5.750 (ribu Rp), yaitu Rp5,75 juta.",
      en: "The choice of starting method matters a lot here. NWC sends 130 tons along broken routes and needs 5 iterations. VAM is optimal immediately at 5,750 (thousand Rp), i.e. Rp5.75 million.",
    },
    tags: [T.balanced, T.multi, T.real],
    level: "menengah",
    method: "vam",
    unit: { id: "ribu Rp/ton", en: "thousand Rp/ton" },
    rowLabels: ["Surabaya", "Gresik", "Sidoarjo"],
    colLabels: ["Malang", "Kediri", "Madiun", "Jember"],
    costs: [
      [12, 18, 22, 25],
      [15, 16, M, 28],
      [10, 20, 24, M],
    ],
    supply: [120, 90, 100],
    demand: [80, 70, 90, 70],
  },
  {
    slug: "satu-pintu",
    title: { id: "Gudang dengan satu pintu keluar", en: "A warehouse with one way out" },
    story: {
      id: "Gudang S1 berada di kawasan yang dua aksesnya ditutup, sehingga hanya bisa mengirim ke D3. Gudang S2 dan S3 bebas mengirim ke mana saja.",
      en: "Warehouse S1 sits in an area where two accesses are closed, so it can only ship to D3. Warehouses S2 and S3 can ship anywhere.",
    },
    insight: {
      id: "Kalau satu baris hampir seluruhnya M, pilihan baris itu sudah dipaksa. Least Cost dan VAM langsung menemukan 500. NWC justru mengisi sel M S1D1 dengan 30 unit dan butuh dua iterasi.",
      en: "When a row is almost entirely M, its choice is already forced. Least Cost and VAM find 500 immediately. NWC instead puts 30 units on the broken cell S1D1 and needs two iterations.",
    },
    tags: [T.balanced, T.multi],
    level: "menengah",
    method: "lcm",
    unit: { id: "ribu Rp/unit", en: "thousand Rp/unit" },
    costs: [
      [M, M, 5],
      [4, 6, 8],
      [7, 3, 9],
    ],
    supply: [30, 50, 40],
    demand: [40, 45, 35],
  },
  {
    slug: "merosot",
    title: { id: "Jalur rusak yang memicu kemerosotan", en: "Broken routes that trigger degeneracy" },
    story: {
      id: "Tiga gudang dengan supply sama persis dengan demand tiga tujuan (30, 40, 30). Rute S1 ke D2 dan S3 ke D3 ditutup.",
      en: "Three warehouses whose supplies match three destinations’ demand exactly (30, 40, 30). Routes S1 to D2 and S3 to D3 are closed.",
    },
    insight: {
      id: "Supply dan demand habis bersamaan, sehingga sel basis hanya 3, padahal butuh m + n − 1 = 5. Solver menambahkan dua ε di sel murah yang tidak membentuk loop. NWC mengisi diagonal termasuk jalur rusak S3D3 (240 + 30M), lalu MODI membereskannya dalam satu iterasi menjadi 360.",
      en: "Supply and demand run out together, so there are only 3 basic cells instead of m + n − 1 = 5. The solver adds two ε cells that are cheap and do not close a loop. NWC fills the diagonal, including the broken route S3D3 (240 + 30M), and MODI fixes it in one iteration, reaching 360.",
    },
    tags: [T.balanced, T.degenerate],
    level: "lanjut",
    method: "nwc",
    unit: { id: "ribu Rp/unit", en: "thousand Rp/unit" },
    costs: [
      [4, M, 6],
      [7, 3, 5],
      [2, 8, M],
    ],
    supply: [30, 40, 30],
    demand: [30, 40, 30],
  },
  {
    slug: "permintaan-berlebih",
    title: { id: "Permintaan melebihi pasokan", en: "Demand exceeds supply" },
    story: {
      id: "Tiga pemasok (S1–S3) hanya punya 120 unit, sedangkan empat pelanggan butuh 140 unit. Tiga rute tidak bisa dipakai: S1 ke D3, S2 ke D2, dan S3 ke D4.",
      en: "Three suppliers (S1–S3) hold only 120 units while four customers need 140. Three routes are unusable: S1 to D3, S2 to D2, and S3 to D4.",
    },
    insight: {
      id: "Kekurangan 20 unit ditampung baris Dummy. Baris Dummy menunjukkan pelanggan mana yang paling “murah” untuk dikecewakan menurut model. Perhatikan juga kemerosotan yang muncul pada Least Cost dan VAM.",
      en: "The 20-unit shortage goes to a Dummy row. That row shows which customer is the ‘cheapest’ to leave short according to the model. Watch for the degeneracy that appears with Least Cost and VAM too.",
    },
    tags: [T.unbalanced, T.multi, T.degenerate],
    level: "lanjut",
    method: "lcm",
    unit: { id: "ribu Rp/unit", en: "thousand Rp/unit" },
    costs: [
      [8, 6, M, 10],
      [9, M, 7, 5],
      [6, 8, 9, M],
    ],
    supply: [40, 50, 30],
    demand: [30, 40, 35, 35],
  },
  {
    slug: "banyak-rusak",
    title: { id: "Empat jalur rusak sekaligus", en: "Four broken routes at once" },
    story: {
      id: "Setelah gempa, empat ruas jalan di jaringan distribusi tidak bisa dilalui. Tiga gudang (S1–S3) masih harus memenuhi empat posko (D1–D4).",
      en: "After an earthquake, four road segments in the network are unusable. Three warehouses (S1–S3) must still supply four relief posts (D1–D4).",
    },
    insight: {
      id: "Semakin banyak M, semakin penting urutan pengisian. Least Cost dan VAM masih memakai 5 unit jalur rusak di solusi awal (730 + 5M), lalu satu iterasi MODI membereskannya menjadi 775.",
      en: "The more M cells there are, the more the filling order matters. Least Cost and VAM still use 5 units of a broken route at first (730 + 5M), and one MODI iteration fixes it to 775.",
    },
    tags: [T.balanced, T.multi],
    level: "lanjut",
    method: "vam",
    unit: { id: "ribu Rp/unit", en: "thousand Rp/unit" },
    costs: [
      [3, M, 7, 4],
      [M, 6, 5, M],
      [8, 4, M, 6],
    ],
    supply: [70, 50, 60],
    demand: [50, 40, 55, 35],
  },
  {
    slug: "obat-puskesmas",
    title: { id: "Distribusi obat ke lima puskesmas", en: "Medicine distribution to five health centres" },
    story: {
      id: "Empat gudang farmasi (G1–G4) memasok lima puskesmas (P1–P5). Tiga rute tidak bisa dipakai karena kendaraan berpendingin tidak muat melewati jalan desa. Biaya dalam ribu rupiah per boks.",
      en: "Four pharmacy depots (G1–G4) supply five health centres (P1–P5). Three routes are unusable because refrigerated vans cannot fit through the village roads. Costs are in thousand rupiah per box.",
    },
    insight: {
      id: "Soal terbesar di bank soal (4 × 5, 8 sel basis). Least Cost dan VAM sama-sama menghasilkan 1.460, lalu MODI menemukan perbaikan menjadi 1.380. Dengan Least Cost atau VAM jalur rusak tidak pernah dipakai, tetapi tetap ikut dihitung di uji optimalitas.",
      en: "The largest problem in the bank (4 × 5, 8 basic cells). Least Cost and VAM both give 1,460, and MODI improves it to 1,380. With Least Cost or VAM the broken routes are never used, yet they still take part in the optimality test.",
    },
    tags: [T.balanced, T.multi, T.real],
    level: "lanjut",
    method: "vam",
    unit: { id: "ribu Rp/boks", en: "thousand Rp/box" },
    rowLabels: ["G1", "G2", "G3", "G4"],
    colLabels: ["P1", "P2", "P3", "P4", "P5"],
    costs: [
      [7, 12, M, 9, 14],
      [10, M, 6, 11, 8],
      [M, 5, 9, 7, 13],
      [6, 10, 12, M, 9],
    ],
    supply: [60, 45, 55, 40],
    demand: [35, 50, 40, 45, 30],
  },
];
