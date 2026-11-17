import type { Bi } from "../solver";

export interface QuizItem {
  q: Bi;
  options: Bi[];
  answer: number;
  explain: Bi;
  topic: "konsep" | "aritmetika" | "metode" | "optimalitas" | "interpretasi";
}

const b = (id: string, en: string): Bi => ({ id, en });

export const quizTopics: Record<QuizItem["topic"], Bi> = {
  konsep: b("Konsep", "Concepts"),
  aritmetika: b("Aritmetika M", "M arithmetic"),
  metode: b("Solusi awal", "Initial solution"),
  optimalitas: b("Uji optimalitas", "Optimality test"),
  interpretasi: b("Interpretasi", "Interpretation"),
};

export const quiz: QuizItem[] = [
  {
    topic: "konsep",
    q: b("Apa yang dimaksud dengan jalur rusak dalam masalah transportasi?", "What is a broken route in a transportation problem?"),
    options: [
      b("Rute yang biayanya paling mahal", "The most expensive route"),
      b("Rute dari sumber ke tujuan yang tidak boleh atau tidak bisa dipakai", "A source-to-destination route that cannot or must not be used"),
      b("Rute yang alokasinya nol", "A route with zero allocation"),
      b("Rute menuju kolom dummy", "A route into the dummy column"),
    ],
    answer: 1,
    explain: b(
      "Jalur rusak (rute terlarang) adalah pasangan sumber–tujuan yang tidak dapat digunakan, misalnya karena jalan putus atau regulasi. Biayanya bisa saja murah di atas kertas, tetapi rute itu tetap tidak boleh dipakai.",
      "A broken (prohibited) route is a source–destination pair that cannot be used, for example because the road is cut or regulations forbid it. It may look cheap on paper but still must not be used."
    ),
  },
  {
    topic: "konsep",
    q: b("Bagaimana cara standar memasukkan jalur rusak ke tabel transportasi?", "What is the standard way to put a broken route into the transportation table?"),
    options: [
      b("Mengosongkan selnya", "Leave the cell blank"),
      b("Memberi biaya 0", "Give it cost 0"),
      b("Memberi biaya M, bilangan yang sangat besar", "Give it cost M, a very large number"),
      b("Menghapus baris sumbernya", "Delete the source row"),
    ],
    answer: 2,
    explain: b(
      "Sel diberi biaya M. Karena tujuan meminimumkan biaya, metode penyelesaian akan berusaha menghindari sel itu. Biaya 0 justru membuat rute terlihat paling menarik.",
      "The cell gets cost M. Because the goal is to minimise cost, the method will try to avoid it. A cost of 0 would make the route look the most attractive instead."
    ),
  },
  {
    topic: "konsep",
    q: b("Dalam formulasi program linear, jalur rusak dari sumber i ke tujuan j setara dengan kendala…", "In the linear programming model, a broken route from source i to destination j is equivalent to the constraint…"),
    options: [b("x_ij ≥ M", "x_ij ≥ M"), b("x_ij = 0", "x_ij = 0"), b("c_ij = 0", "c_ij = 0"), b("Σ x_ij = M", "Σ x_ij = M")],
    answer: 1,
    explain: b(
      "Rute yang tidak boleh dipakai berarti variabel pengirimannya harus nol. Teknik big-M adalah cara memaksakan x_ij = 0 di dalam tabel tanpa menambah kendala baru.",
      "A route that may not be used means its shipment variable must be zero. Big-M is a way to enforce x_ij = 0 inside the table without adding a new constraint."
    ),
  },
  {
    topic: "konsep",
    q: b("Kenapa tidak cukup memberi jalur rusak biaya 1000?", "Why is giving a broken route a cost of 1000 not always enough?"),
    options: [
      b("Karena 1000 terlalu kecil untuk komputer", "Because 1000 is too small for a computer"),
      b("Karena angka biasa belum tentu lebih besar dari seluruh kombinasi biaya lain di soal", "Because an ordinary number is not guaranteed to exceed every other cost combination in the problem"),
      b("Karena metode MODI tidak menerima angka di atas 100", "Because MODI cannot take numbers above 100"),
      b("Sebenarnya 1000 selalu lebih baik dari M", "1000 is actually always better than M"),
    ],
    answer: 1,
    explain: b(
      "Angka besar biasa boleh dipakai kalau benar-benar jauh di atas skala biaya. Simbol M menjamin hal itu untuk soal apa pun, sehingga hasilnya tidak bergantung pada pilihan angka.",
      "An ordinary large number works if it is far above the cost scale. The symbol M guarantees this for any problem, so the result does not depend on the chosen number."
    ),
  },
  {
    topic: "konsep",
    q: b("Berapa jumlah sel basis yang dibutuhkan pada tabel transportasi 3 × 4 yang setimbang?", "How many basic cells does a balanced 3 × 4 transportation table need?"),
    options: [b("7", "7"), b("6", "6"), b("12", "12"), b("5", "5")],
    answer: 1,
    explain: b("Syaratnya m + n − 1 = 3 + 4 − 1 = 6 sel basis.", "The requirement is m + n − 1 = 3 + 4 − 1 = 6 basic cells."),
  },
  {
    topic: "aritmetika",
    q: b("Mana yang bernilai negatif?", "Which one is negative?"),
    options: [b("M − 100", "M − 100"), b("2M − 50", "2M − 50"), b("40 − M", "40 − M"), b("M", "M")],
    answer: 2,
    explain: b(
      "Bandingkan koefisien M dulu. 40 − M memiliki koefisien M negatif (−1), jadi nilainya negatif berapa pun konstanta yang menyertainya.",
      "Compare the M coefficient first. 40 − M has a negative M coefficient (−1), so it is negative regardless of the constant."
    ),
  },
  {
    topic: "aritmetika",
    q: b("Mana yang lebih besar: M + 500 atau 2M − 500?", "Which is larger: M + 500 or 2M − 500?"),
    options: [b("M + 500", "M + 500"), b("2M − 500", "2M − 500"), b("Sama besar", "They are equal"), b("Tidak bisa ditentukan", "Cannot be determined")],
    answer: 1,
    explain: b(
      "Koefisien M pada 2M − 500 adalah 2, lebih besar dari 1. Karena M dianggap tak terhingga besar, konstanta 500 tidak berpengaruh.",
      "The M coefficient of 2M − 500 is 2, larger than 1. Since M is treated as arbitrarily large, the constant 500 does not matter."
    ),
  },
  {
    topic: "aritmetika",
    q: b("Hasil dari (M + 3) − (M − 4) adalah…", "(M + 3) − (M − 4) equals…"),
    options: [b("2M − 1", "2M − 1"), b("7", "7"), b("−1", "−1"), b("M + 7", "M + 7")],
    answer: 1,
    explain: b("M − M = 0 dan 3 − (−4) = 7. Hasilnya 7.", "M − M = 0 and 3 − (−4) = 7. The result is 7."),
  },
  {
    topic: "aritmetika",
    q: b("Jika u₁ = 0 dan sel basis S1D2 berbiaya M, berapakah v₂?", "If u₁ = 0 and the basic cell S1D2 costs M, what is v₂?"),
    options: [b("0", "0"), b("M", "M"), b("−M", "−M"), b("Tidak bisa dihitung", "It cannot be computed")],
    answer: 1,
    explain: b("u₁ + v₂ = c₁₂ sehingga v₂ = M − 0 = M. Nilai u dan v boleh mengandung M.", "u₁ + v₂ = c₁₂ so v₂ = M − 0 = M. The u and v values may contain M."),
  },
  {
    topic: "aritmetika",
    q: b("Total biaya solusi awal 430 + 10M. Apa artinya?", "The initial cost is 430 + 10M. What does that mean?"),
    options: [
      b("Ada 10 unit yang dikirim lewat jalur rusak", "10 units are shipped along a broken route"),
      b("Ada 10 jalur rusak", "There are 10 broken routes"),
      b("Biaya optimal adalah 440", "The optimal cost is 440"),
      b("Masalahnya tidak setimbang", "The problem is unbalanced"),
    ],
    answer: 0,
    explain: b(
      "Setiap unit di jalur rusak menyumbang M ke total biaya. Jadi koefisien M sama dengan jumlah unit yang lewat jalur rusak: di sini 10 unit.",
      "Each unit on a broken route adds M to the total. So the M coefficient equals the number of units on broken routes: here 10."
    ),
  },
  {
    topic: "metode",
    q: b("Metode solusi awal mana yang sama sekali tidak memperhatikan biaya?", "Which initial-solution method ignores costs completely?"),
    options: [b("Least Cost", "Least Cost"), b("VAM", "VAM"), b("North-West Corner", "North-West Corner"), b("MODI", "MODI")],
    answer: 2,
    explain: b(
      "NWC selalu mengisi sel pojok kiri atas yang tersisa. Akibatnya NWC paling sering mengisi jalur rusak.",
      "NWC always fills the remaining top-left cell. As a result, it is the method most likely to fill a broken route."
    ),
  },
  {
    topic: "metode",
    q: b("Mengapa VAM biasanya paling baik menghindari jalur rusak?", "Why does VAM usually avoid broken routes best?"),
    options: [
      b("Karena VAM mengisi sel M terakhir secara khusus", "Because VAM has a special rule to fill M cells last"),
      b("Karena penalti baris atau kolom yang memuat M menjadi sangat besar, sehingga sel termurahnya diisi lebih dulu", "Because the penalty of a row or column containing M becomes huge, so its cheapest cell is filled first"),
      b("Karena VAM menghapus jalur rusak dari tabel", "Because VAM deletes broken routes from the table"),
      b("Karena VAM selalu optimal", "Because VAM is always optimal"),
    ],
    answer: 1,
    explain: b(
      "Penalti adalah selisih dua biaya terkecil. Kalau biaya terkecil kedua adalah M, penaltinya menjadi M − c, yang pasti terbesar. VAM tidak dijamin optimal, hanya biasanya sangat dekat.",
      "A penalty is the gap between the two smallest costs. If the second smallest is M, the penalty becomes M − c, which is certainly the largest. VAM is not guaranteed optimal, only usually very close."
    ),
  },
  {
    topic: "metode",
    q: b("Pada Least Cost, sel dummy berbiaya 0 sebaiknya diisi…", "In Least Cost, dummy cells with cost 0 should be filled…"),
    options: [b("Paling awal", "First"), b("Paling akhir", "Last"), b("Bersamaan dengan sel M", "Together with M cells"), b("Tidak boleh diisi", "Never")],
    answer: 1,
    explain: b(
      "Biaya 0 di dummy hanyalah angka bantu, bukan biaya nyata. Mengisinya lebih dulu bisa mendorong barang nyata ke rute mahal, termasuk jalur rusak.",
      "The 0 in dummy cells is a placeholder, not a real cost. Filling it first can push real goods onto expensive routes, including broken ones."
    ),
  },
  {
    topic: "metode",
    q: b("Least Cost terpaksa mengisi sel M. Apa langkah yang benar berikutnya?", "Least Cost was forced to fill an M cell. What is the right next step?"),
    options: [
      b("Mengulang dari awal dengan NWC", "Start over with NWC"),
      b("Lanjutkan ke uji optimalitas (MODI atau Stepping Stone)", "Continue to the optimality test (MODI or Stepping Stone)"),
      b("Langsung menyimpulkan masalah tidak layak", "Conclude the problem is infeasible"),
      b("Menghapus sel M lalu menyeimbangkan ulang", "Delete the M cell and rebalance"),
    ],
    answer: 1,
    explain: b(
      "Solusi awal hanya titik mulai. Uji optimalitas akan menemukan d_ij bernilai negatif dan mengusir sel M keluar dari basis bila ada alternatif layak.",
      "The initial solution is only a starting point. The optimality test will find a negative d_ij and push the M cell out of the basis if a feasible alternative exists."
    ),
  },
  {
    topic: "metode",
    q: b("Pada VAM, penalti sebuah baris adalah…", "In VAM, the penalty of a row is…"),
    options: [
      b("Biaya terbesar dikurangi biaya terkecil", "Largest cost minus smallest cost"),
      b("Biaya terkecil kedua dikurangi biaya terkecil", "Second-smallest cost minus smallest cost"),
      b("Jumlah biaya di baris itu", "The sum of costs in that row"),
      b("Supply dikurangi demand", "Supply minus demand"),
    ],
    answer: 1,
    explain: b(
      "Penalti mengukur kerugian bila kita tidak memakai sel termurah dan harus pindah ke sel termurah kedua.",
      "The penalty measures the loss if we skip the cheapest cell and must use the second-cheapest instead."
    ),
  },
  {
    topic: "optimalitas",
    q: b("Dalam MODI, persamaan untuk sel basis adalah…", "In MODI, the equation for a basic cell is…"),
    options: [b("u_i − v_j = c_ij", "u_i − v_j = c_ij"), b("u_i + v_j = c_ij", "u_i + v_j = c_ij"), b("u_i × v_j = c_ij", "u_i × v_j = c_ij"), b("u_i + v_j = 0", "u_i + v_j = 0")],
    answer: 1,
    explain: b("Setiap sel basis memenuhi u_i + v_j = c_ij. Satu nilai ditetapkan (biasanya u₁ = 0) lalu yang lain diselesaikan berantai.", "Every basic cell satisfies u_i + v_j = c_ij. One value is fixed (usually u₁ = 0) and the rest are solved in a chain."),
  },
  {
    topic: "optimalitas",
    q: b("Nilai d_ij sebuah sel kosong adalah 8 − M. Kesimpulannya?", "An empty cell has d_ij = 8 − M. What follows?"),
    options: [
      b("Solusi sudah optimal", "The solution is optimal"),
      b("Sel itu kandidat sel masuk karena d_ij negatif", "That cell is a candidate to enter because d_ij is negative"),
      b("Sel itu harus diberi ε", "That cell must get ε"),
      b("Sel itu adalah jalur rusak", "That cell is a broken route"),
    ],
    answer: 1,
    explain: b(
      "8 − M negatif, jadi memasukkan sel itu ke basis akan menurunkan biaya. Biasanya ini tanda bahwa sebuah sel M di basis bisa diusir.",
      "8 − M is negative, so bringing that cell in lowers the cost. It usually signals that an M cell in the basis can be pushed out."
    ),
  },
  {
    topic: "optimalitas",
    q: b("Semua d_ij ≥ 0 dan ada satu sel kosong dengan d_ij = 0. Artinya…", "Every d_ij ≥ 0 and one empty cell has d_ij = 0. This means…"),
    options: [
      b("Solusi belum optimal", "The solution is not optimal yet"),
      b("Solusi optimal dan ada solusi optimal alternatif", "The solution is optimal and an alternative optimum exists"),
      b("Terjadi kemerosotan", "Degeneracy has occurred"),
      b("Masalah tidak layak", "The problem is infeasible"),
    ],
    answer: 1,
    explain: b(
      "Tidak ada d negatif berarti optimal. d = 0 berarti mengalihkan barang lewat sel itu tidak mengubah biaya, jadi ada pola lain yang sama murahnya.",
      "No negative d means optimal. d = 0 means rerouting through that cell does not change the cost, so another equally cheap pattern exists."
    ),
  },
  {
    topic: "optimalitas",
    q: b("Dalam loop Stepping Stone, sel masuk diberi tanda…", "In a Stepping Stone loop, the entering cell gets the sign…"),
    options: [b("−", "−"), b("+", "+"), b("ε", "ε"), b("M", "M")],
    answer: 1,
    explain: b("Sel masuk selalu +, lalu tanda bergantian −, +, −, … di setiap belokan loop.", "The entering cell is always +, then signs alternate −, +, −, … at each corner of the loop."),
  },
  {
    topic: "optimalitas",
    q: b("Nilai θ pada loop ditentukan dari…", "The θ value of a loop is…"),
    options: [
      b("Alokasi terbesar pada sel bertanda +", "The largest allocation on a + cell"),
      b("Alokasi terkecil pada sel bertanda −", "The smallest allocation on a − cell"),
      b("Biaya terkecil di loop", "The smallest cost on the loop"),
      b("Nilai d_ij sel masuk", "The d_ij of the entering cell"),
    ],
    answer: 1,
    explain: b(
      "θ adalah alokasi terkecil di sel (−), agar tidak ada alokasi yang menjadi negatif. Sel itu kemudian keluar dari basis.",
      "θ is the smallest allocation among the (−) cells, so no allocation turns negative. That cell then leaves the basis."
    ),
  },
  {
    topic: "optimalitas",
    q: b("Sebuah loop berisi sel M bertanda (−) dengan alokasi 10 dan sel biasa bertanda (−) dengan alokasi 30. Sel mana yang keluar?", "A loop has an M cell marked (−) holding 10 and a normal (−) cell holding 30. Which cell leaves?"),
    options: [b("Sel biasa (30)", "The normal cell (30)"), b("Sel M (10)", "The M cell (10)"), b("Keduanya", "Both"), b("Tidak ada", "Neither")],
    answer: 1,
    explain: b("θ = min(10, 30) = 10, jadi sel M yang berisi 10 keluar. Jalur rusak pun kosong.", "θ = min(10, 30) = 10, so the M cell holding 10 leaves. The broken route becomes empty."),
  },
  {
    topic: "optimalitas",
    q: b("Perubahan total biaya setelah satu iterasi sama dengan…", "The change in total cost after one iteration equals…"),
    options: [b("θ × d_ij sel masuk", "θ × d_ij of the entering cell"), b("θ + d_ij", "θ + d_ij"), b("u₁ + v₁", "u₁ + v₁"), b("Selalu M", "Always M")],
    answer: 0,
    explain: b(
      "ΔZ = θ × d_ij. Pada contoh utama, θ = 10 dan d = 8 − M sehingga ΔZ = 80 − 10M. Biaya turun dari 430 + 10M menjadi 510.",
      "ΔZ = θ × d_ij. In the main example, θ = 10 and d = 8 − M so ΔZ = 80 − 10M. Cost falls from 430 + 10M to 510."
    ),
  },
  {
    topic: "interpretasi",
    q: b("Solusi optimal masih memuat alokasi positif di sel M. Apa kesimpulannya?", "The optimal solution still has a positive allocation in an M cell. What is the conclusion?"),
    options: [
      b("Ada kesalahan hitung, ulangi", "There is a calculation error; redo it"),
      b("Tidak ada solusi layak tanpa melewati jalur rusak", "There is no feasible solution without using the broken route"),
      b("Solusi alternatif", "An alternative solution"),
      b("Perlu ditambah dummy", "A dummy is needed"),
    ],
    answer: 1,
    explain: b(
      "Kalau metode sudah optimal tetapi sel M tetap terisi, berarti kendala supply–demand tidak bisa dipenuhi tanpa rute itu. Keputusan diambil di luar model: perbaiki jalan, transit, atau terima kekurangan.",
      "If the method is optimal but the M cell is still used, supply–demand constraints cannot be met without that route. The decision must be made outside the model: repair, transit, or accept a shortage."
    ),
  },
  {
    topic: "interpretasi",
    q: b("Alokasi 10 unit pada kolom Dummy di baris S1 artinya…", "An allocation of 10 units in the Dummy column on row S1 means…"),
    options: [
      b("S1 mengirim 10 unit ke tujuan fiktif dan membayar ongkosnya", "S1 ships 10 units to a fictitious destination and pays for it"),
      b("10 unit tetap di gudang S1 dan tidak dikirim", "10 units stay in warehouse S1 and are not shipped"),
      b("S1 kekurangan 10 unit", "S1 is short by 10 units"),
      b("S1 memakai jalur rusak", "S1 uses a broken route"),
    ],
    answer: 1,
    explain: b("Kolom Dummy menampung kelebihan supply. Barang di sana tidak dikirim ke mana pun.", "The Dummy column absorbs excess supply. Goods there are not shipped anywhere."),
  },
  {
    topic: "interpretasi",
    q: b("Kenapa sel jalur rusak tetap dihitung d_ij-nya di MODI walau tidak pernah diisi?", "Why does MODI still compute d_ij for broken cells even though they are never filled?"),
    options: [
      b("Supaya tabel terlihat lengkap", "To make the table look complete"),
      b("Karena semua sel kosong harus diuji; nilainya pasti mengandung +M sehingga tidak akan pernah terpilih", "Because every empty cell must be tested; its value contains +M so it will never be chosen"),
      b("Karena MODI tidak bisa membedakan sel", "Because MODI cannot tell cells apart"),
      b("Itu kesalahan umum, seharusnya tidak dihitung", "That is a common mistake; it should be skipped"),
    ],
    answer: 1,
    explain: b(
      "Prosedurnya seragam: semua sel non-basis diuji. Untuk sel M, d_ij akan bernilai M + konstanta (positif) selama u dan v tidak mengandung M, jadi tidak akan masuk basis.",
      "The procedure is uniform: every non-basic cell is tested. For an M cell, d_ij comes out as M + a constant (positive) as long as u and v contain no M, so it never enters."
    ),
  },
  {
    topic: "konsep",
    q: b("Siapa yang pertama kali merumuskan masalah transportasi secara formal?", "Who first formulated the transportation problem formally?"),
    options: [b("F. L. Hitchcock (1941)", "F. L. Hitchcock (1941)"), b("W. R. Vogel (1958)", "W. R. Vogel (1958)"), b("H. A. Taha (2017)", "H. A. Taha (2017)"), b("A. Charnes (1954)", "A. Charnes (1954)")],
    answer: 0,
    explain: b(
      "Hitchcock (1941) menulis tentang distribusi produk dari beberapa sumber ke banyak lokasi, yang menjadi dasar model transportasi.",
      "Hitchcock (1941) wrote about distributing a product from several sources to many localities, the basis of the transportation model."
    ),
  },
  {
    topic: "metode",
    q: b("Pada soal “VAM langsung menghindari M”, NWC menghasilkan biaya awal 420 + 60M. Berapa unit yang lewat jalur rusak?", "In the ‘VAM avoids M right away’ problem, NWC gives an initial cost of 420 + 60M. How many units travel on the broken route?"),
    options: [b("6", "6"), b("60", "60"), b("420", "420"), b("Tidak ada", "None")],
    answer: 1,
    explain: b("Hanya ada satu jalur rusak dengan biaya M, jadi koefisien 60 berarti 60 unit di sel itu.", "There is only one broken route with cost M, so the coefficient 60 means 60 units sit in that cell."),
  },
  {
    topic: "konsep",
    q: b("Jalur rusak dan kemerosotan bisa terjadi pada soal yang sama?", "Can broken routes and degeneracy happen in the same problem?"),
    options: [
      b("Tidak, keduanya saling meniadakan", "No, they exclude each other"),
      b("Ya, dan keduanya ditangani terpisah: M untuk jalur rusak, ε untuk kemerosotan", "Yes, and they are handled separately: M for broken routes, ε for degeneracy"),
      b("Ya, dan ε diletakkan di sel M", "Yes, and ε is placed on the M cell"),
      b("Hanya pada soal tak setimbang", "Only in unbalanced problems"),
    ],
    answer: 1,
    explain: b(
      "Keduanya independen. Coba soal “Jalur rusak yang memicu kemerosotan” di halaman Contoh Soal untuk melihat keduanya muncul bersamaan.",
      "They are independent. Try the problem ‘Broken routes that trigger degeneracy’ on the Examples page to see both at once."
    ),
  },
  {
    topic: "interpretasi",
    q: b("Dari sudut pandang sains data, apa padanan big-M saat memakai solver seperti PuLP?", "From a data-science view, what is the big-M equivalent when using a solver such as PuLP?"),
    options: [
      b("Menambahkan kendala x_ij = 0 atau tidak membuat variabel untuk rute itu", "Add the constraint x_ij = 0 or skip creating a variable for that route"),
      b("Mengalikan seluruh biaya dengan M", "Multiply all costs by M"),
      b("Menormalisasi data biaya", "Normalise the cost data"),
      b("Mengisi nilai hilang dengan rata-rata", "Impute missing values with the mean"),
    ],
    answer: 0,
    explain: b(
      "Solver modern bisa langsung menerima kendala x_ij = 0, atau variabel untuk rute rusak tidak dibuat sama sekali. Big-M diperlukan terutama untuk perhitungan manual berbasis tabel.",
      "Modern solvers accept x_ij = 0 directly, or you simply don’t create a variable for the broken route. Big-M is mainly needed for manual table-based calculation."
    ),
  },
  {
    topic: "aritmetika",
    q: b("u₂ = 6 − M dan v₁ = M − 3. Berapa d₂₁ jika c₂₁ = 3? (sel kosong)", "u₂ = 6 − M and v₁ = M − 3. What is d₂₁ if c₂₁ = 3? (empty cell)"),
    options: [b("0", "0"), b("−M", "−M"), b("2M", "2M"), b("12 − 2M", "12 − 2M")],
    answer: 0,
    explain: b("d = 3 − (6 − M) − (M − 3) = 3 − 6 + M − M + 3 = 0.", "d = 3 − (6 − M) − (M − 3) = 3 − 6 + M − M + 3 = 0."),
  },
];
