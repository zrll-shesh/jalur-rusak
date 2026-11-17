import type { Bi } from "../solver";

const b = (id: string, en: string): Bi => ({ id, en });

export type FaqCat = "konsep" | "hitung" | "interpretasi" | "presentasi";
export const faqCats: Record<FaqCat, Bi> = {
  konsep: b("Konsep", "Concepts"),
  hitung: b("Perhitungan", "Calculation"),
  interpretasi: b("Interpretasi", "Interpretation"),
  presentasi: b("Persiapan tanya jawab", "Q&A preparation"),
};

export const faqs: { cat: FaqCat; q: Bi; a: Bi }[] = [
  {
    cat: "konsep",
    q: b("Apa bedanya jalur rusak dengan rute yang mahal?", "How is a broken route different from an expensive one?"),
    a: b(
      "Rute mahal masih boleh dipakai kalau memang menguntungkan secara keseluruhan. Jalur rusak sama sekali tidak boleh dipakai. Karena itu biayanya bukan sekadar angka besar, melainkan M yang mewakili “tak terhingga” dalam konteks soal.",
      "An expensive route may still be used if it helps overall. A broken route must not be used at all. That is why its cost is not just a big number but M, representing ‘infinity’ within the problem."
    ),
  },
  {
    cat: "konsep",
    q: b("Di buku lain istilahnya apa?", "What do other textbooks call it?"),
    a: b(
      "Rute terlarang, prohibited route, forbidden route, atau unacceptable route. Hillier & Lieberman menjelaskan bahwa alokasi yang tidak mungkin cukup diberi biaya satuan yang sangat besar (M) agar tidak pernah terpilih pada solusi optimal.",
      "Prohibited route, forbidden route, or unacceptable route. Hillier & Lieberman explain that an impossible allocation can simply be given a huge unit cost (M) so it never appears in an optimal solution."
    ),
  },
  {
    cat: "konsep",
    q: b("Apakah M sama dengan Big-M pada metode simpleks?", "Is this M the same as Big-M in the simplex method?"),
    a: b(
      "Idenya sama: bilangan sangat besar untuk “menghukum” sesuatu yang tidak diinginkan. Pada simpleks Big-M, M menghukum variabel buatan (artificial). Pada transportasi, M menghukum rute yang tidak boleh dipakai.",
      "Same idea: a huge number that ‘penalises’ something undesirable. In simplex Big-M it penalises artificial variables. In transportation it penalises routes that must not be used."
    ),
  },
  {
    cat: "konsep",
    q: b("Bolehkah sel jalur rusak dihapus saja dari tabel?", "Can the broken cell simply be removed from the table?"),
    a: b(
      "Secara model boleh, karena x_ij = 0. Namun pada perhitungan tabel manual, menghapus sel membuat struktur m × n tidak utuh dan loop menjadi membingungkan. Memberi biaya M membuat prosedur NWC, Least Cost, VAM, dan MODI tetap berjalan tanpa aturan tambahan.",
      "In the model, yes, since x_ij = 0. In manual table work, removing a cell breaks the m × n structure and makes loops confusing. Giving it cost M keeps NWC, Least Cost, VAM, and MODI working with no extra rules."
    ),
  },
  {
    cat: "hitung",
    q: b("Bagaimana cara membandingkan dua ekspresi yang mengandung M?", "How do I compare two expressions containing M?"),
    a: b(
      "Bandingkan koefisien M lebih dulu. Yang koefisiennya lebih besar adalah yang lebih besar. Hanya kalau koefisien M sama, baru konstanta dibandingkan. Contoh: 2M − 900 > M + 900, dan 5 − M < 0.",
      "Compare the M coefficients first; the larger coefficient wins. Only when they are equal do you compare the constants. Example: 2M − 900 > M + 900, and 5 − M < 0."
    ),
  },
  {
    cat: "hitung",
    q: b("Kenapa u dan v bisa mengandung M?", "Why can u and v contain M?"),
    a: b(
      "Kalau ada sel M di basis (misalnya karena Least Cost terpaksa mengisinya), persamaan u_i + v_j = M membuat salah satu nilai mengandung M. Itu normal. Setelah sel M keluar dari basis, u dan v kembali berupa angka biasa.",
      "If an M cell is in the basis (for example because Least Cost had to fill it), u_i + v_j = M makes one value contain M. That is normal. Once the M cell leaves the basis, u and v are plain numbers again."
    ),
  },
  {
    cat: "hitung",
    q: b("Metode awal mana yang sebaiknya dipakai untuk soal jalur rusak?", "Which starting method is best for broken-route problems?"),
    a: b(
      "VAM biasanya terbaik karena penalti yang mengandung M langsung menonjol. Least Cost cukup baik tetapi kadang terpaksa mengisi sel M di akhir. NWC paling buruk karena tidak melihat biaya; gunakan NWC hanya kalau soal memintanya.",
      "VAM is usually best because penalties containing M stand out immediately. Least Cost is decent but can be forced into an M cell at the end. NWC is worst because it ignores costs; use it only when the problem asks for it."
    ),
  },
  {
    cat: "hitung",
    q: b("Apa yang dilakukan kalau ada dua sel dengan d_ij paling negatif yang sama?", "What if two cells tie for the most negative d_ij?"),
    a: b(
      "Pilih salah satu. Hasil akhirnya tetap optimal; yang berbeda hanya jalur iterasinya. Di website ini dipilih sel pertama dari kiri atas.",
      "Pick either. The final result is still optimal; only the iteration path differs. This site picks the first one from the top-left."
    ),
  },
  {
    cat: "hitung",
    q: b("Kalau θ seri di beberapa sel (−), sel mana yang keluar?", "If θ ties across several (−) cells, which one leaves?"),
    a: b(
      "Hanya satu yang keluar, sisanya tetap di basis dengan alokasi 0 (ε) supaya jumlah sel basis tetap m + n − 1. Website ini memprioritaskan sel jalur rusak untuk keluar lebih dulu.",
      "Only one leaves; the others stay in the basis with allocation 0 (ε) so the count stays at m + n − 1. This site lets a broken-route cell leave first."
    ),
  },
  {
    cat: "hitung",
    q: b("Bolehkah ε diletakkan di sel jalur rusak?", "May ε be placed on a broken-route cell?"),
    a: b(
      "Secara teori boleh asalkan tidak membentuk loop, karena alokasinya 0. Namun lebih rapi memilih sel berbiaya kecil agar u dan v tidak mengandung M.",
      "In theory yes, as long as it does not form a loop, since the allocation is 0. It is cleaner to choose a cheap cell so u and v don’t contain M."
    ),
  },
  {
    cat: "interpretasi",
    q: b("Bagaimana kalau di solusi optimal sel M masih terisi?", "What if the optimal solution still uses an M cell?"),
    a: b(
      "Artinya tidak ada rencana layak tanpa jalur rusak. Laporkan sebagai temuan: kebutuhan tujuan itu tidak bisa dipenuhi oleh sumber lain. Rekomendasinya bisa berupa perbaikan jalan, rute transit (transshipment), atau menerima kekurangan pasokan.",
      "It means no feasible plan exists without the broken route. Report it as a finding: that destination’s demand cannot be met by other sources. Recommendations: repair the road, use a transit route (transshipment), or accept a shortage."
    ),
  },
  {
    cat: "interpretasi",
    q: b("Apakah total biaya akhir boleh ditulis dengan M?", "Can the final total cost be written with M?"),
    a: b(
      "Hanya untuk kasus tidak layak. Pada kasus layak, M pasti hilang dari total biaya optimal. Kalau masih ada M padahal masih ada rute alternatif, kemungkinan ada iterasi yang terlewat.",
      "Only in the infeasible case. When feasible, M always disappears from the optimal cost. If M remains even though alternatives exist, an iteration was probably missed."
    ),
  },
  {
    cat: "interpretasi",
    q: b("Apa hubungan topik ini dengan sains data?", "How does this topic relate to data science?"),
    a: b(
      "Data jaringan logistik nyata hampir selalu memiliki rute yang tidak tersedia, misalnya karena data jarak hilang, jalan ditutup, atau aturan bisnis. Di Python, rute seperti ini ditangani dengan kendala x_ij = 0 atau dengan tidak membuat variabelnya. Memahami big-M membantu membaca hasil solver dengan benar.",
      "Real logistics network data almost always has unavailable routes: missing distance data, closed roads, or business rules. In Python they are handled with x_ij = 0 or by not creating the variable. Understanding big-M helps you read solver output correctly."
    ),
  },
  {
    cat: "presentasi",
    q: b("Kenapa nilai M tidak ditentukan angkanya?", "Why isn’t M given a specific value?"),
    a: b(
      "Karena yang penting hanya sifatnya: lebih besar dari kombinasi biaya mana pun. Dengan tetap simbolik, perhitungan berlaku umum dan kita bisa membaca dari koefisien M berapa unit yang masih lewat jalur rusak.",
      "Because only its property matters: larger than any cost combination. Keeping it symbolic makes the calculation general, and the M coefficient tells how many units still use broken routes."
    ),
  },
  {
    cat: "presentasi",
    q: b("Apa bukti bahwa sel M tidak akan pernah masuk basis lagi setelah keluar?", "Why will an M cell never re-enter the basis after leaving?"),
    a: b(
      "Setelah semua sel M keluar, u dan v hanya berisi angka biasa. Maka d_ij untuk sel M = M − u_i − v_j, yang pasti positif. Sel dengan d positif tidak pernah dipilih sebagai sel masuk.",
      "Once every M cell has left, u and v contain only ordinary numbers. Then d_ij for an M cell = M − u_i − v_j, which is certainly positive. Cells with positive d are never chosen to enter."
    ),
  },
  {
    cat: "presentasi",
    q: b("Apakah jalur rusak membuat biaya optimal naik?", "Do broken routes make the optimal cost go up?"),
    a: b(
      "Tidak pernah turun. Menutup sebuah rute sama dengan menambah kendala, sehingga biaya optimal tetap atau naik. Biaya optimal hanya tetap kalau rute yang ditutup memang tidak dipakai di solusi optimal tanpa penutupan.",
      "It never goes down. Closing a route adds a constraint, so the optimal cost stays the same or rises. It only stays the same if that route was not used in the optimum anyway."
    ),
  },
  {
    cat: "presentasi",
    q: b("Bagaimana kalau semua rute dari satu sumber rusak?", "What if every route from one source is broken?"),
    a: b(
      "Sumber itu tidak bisa mengirim apa pun. Seluruh supply-nya akan berakhir di sel M, sehingga solusi tidak layak. Secara praktis sumber itu sebaiknya dikeluarkan dari model dan soal diseimbangkan ulang dengan dummy.",
      "That source cannot ship anything. All its supply ends up in M cells, so the solution is infeasible. In practice, remove that source from the model and rebalance with a dummy."
    ),
  },
  {
    cat: "presentasi",
    q: b("Apa beda MODI dan Stepping Stone untuk kasus ini?", "How do MODI and Stepping Stone differ here?"),
    a: b(
      "Hasilnya sama. Stepping Stone membuat loop untuk setiap sel kosong lalu menjumlahkan biaya bertanda. MODI lebih cepat karena cukup menghitung u dan v sekali per iterasi. Dengan M, keduanya tetap memakai aturan perbandingan koefisien M.",
      "Same result. Stepping Stone builds a loop for each empty cell and sums signed costs. MODI is faster because u and v are computed once per iteration. With M, both use the same coefficient-comparison rule."
    ),
  },
];

export const glossary: { term: Bi; def: Bi }[] = [
  { term: b("Jalur rusak", "Broken route"), def: b("Pasangan sumber–tujuan yang tidak boleh atau tidak bisa dipakai. Diberi biaya M.", "A source–destination pair that cannot or must not be used. Given cost M.") },
  { term: b("M (Big-M)", "M (Big-M)"), def: b("Bilangan simbolik yang dianggap lebih besar dari angka mana pun di soal.", "A symbolic number treated as larger than any number in the problem.") },
  { term: b("Sumber (supply)", "Source (supply)"), def: b("Titik asal barang beserta kapasitasnya, ditulis a_i.", "The origin of goods and its capacity, written a_i.") },
  { term: b("Tujuan (demand)", "Destination (demand)"), def: b("Titik penerima beserta kebutuhannya, ditulis b_j.", "The receiving point and its requirement, written b_j.") },
  { term: b("Biaya satuan c_ij", "Unit cost c_ij"), def: b("Biaya mengirim satu unit dari sumber i ke tujuan j.", "The cost of shipping one unit from source i to destination j.") },
  { term: b("Variabel keputusan x_ij", "Decision variable x_ij"), def: b("Jumlah unit yang dikirim dari sumber i ke tujuan j.", "The number of units shipped from source i to destination j.") },
  { term: b("Setimbang", "Balanced"), def: b("Total supply sama dengan total demand.", "Total supply equals total demand.") },
  { term: b("Dummy", "Dummy"), def: b("Baris atau kolom fiktif berbiaya 0 untuk menyeimbangkan supply dan demand.", "A fictitious row or column with cost 0 used to balance supply and demand.") },
  { term: b("Sel basis", "Basic cell"), def: b("Sel yang termasuk solusi dasar, termasuk sel dengan alokasi ε.", "A cell in the basic solution, including cells with allocation ε.") },
  { term: b("Syarat m + n − 1", "The m + n − 1 rule"), def: b("Jumlah sel basis yang diperlukan agar uji optimalitas bisa dijalankan.", "The number of basic cells needed to run the optimality test.") },
  { term: b("Kemerosotan (degenerasi)", "Degeneracy"), def: b("Kondisi ketika sel basis kurang dari m + n − 1.", "When there are fewer than m + n − 1 basic cells.") },
  { term: b("ε (epsilon)", "ε (epsilon)"), def: b("Alokasi bernilai nol yang ditambahkan untuk mengatasi kemerosotan.", "A zero allocation added to fix degeneracy.") },
  { term: b("NWC (Pojok Barat Laut)", "NWC (North-West Corner)"), def: b("Metode solusi awal yang mengisi dari pojok kiri atas tanpa melihat biaya.", "A starting method that fills from the top-left corner and ignores costs.") },
  { term: b("Least Cost (Biaya Terkecil)", "Least Cost"), def: b("Metode solusi awal yang mengisi sel termurah lebih dulu.", "A starting method that fills the cheapest cell first.") },
  { term: b("VAM (Aproksimasi Vogel)", "VAM (Vogel’s Approximation)"), def: b("Metode solusi awal berbasis penalti, biasanya paling dekat dengan optimal.", "A penalty-based starting method, usually closest to optimal.") },
  { term: b("Penalti", "Penalty"), def: b("Selisih biaya terkecil kedua dan terkecil pada satu baris atau kolom.", "The gap between the second-smallest and smallest cost in a row or column.") },
  { term: b("MODI", "MODI"), def: b("Modified Distribution: uji optimalitas memakai bilangan u_i dan v_j.", "Modified Distribution: an optimality test using numbers u_i and v_j.") },
  { term: b("Stepping Stone", "Stepping Stone"), def: b("Uji optimalitas dengan membentuk loop untuk setiap sel kosong.", "An optimality test that builds a loop for every empty cell.") },
  { term: b("d_ij (biaya tereduksi)", "d_ij (reduced cost)"), def: b("Perubahan biaya per unit bila sel kosong dimasukkan ke solusi.", "The cost change per unit if an empty cell enters the solution.") },
  { term: b("Sel masuk", "Entering cell"), def: b("Sel kosong dengan d_ij paling negatif yang akan dimasukkan ke basis.", "The empty cell with the most negative d_ij, which enters the basis.") },
  { term: b("Sel keluar", "Leaving cell"), def: b("Sel bertanda (−) dengan alokasi θ yang dikeluarkan dari basis.", "The (−) cell holding θ that leaves the basis.") },
  { term: b("Loop tertutup", "Closed loop"), def: b("Lintasan horizontal–vertikal yang berawal dan berakhir di sel masuk, berbelok hanya di sel basis.", "A horizontal–vertical path that starts and ends at the entering cell, turning only at basic cells.") },
  { term: b("θ (theta)", "θ (theta)"), def: b("Jumlah unit yang dipindahkan sepanjang loop, yaitu alokasi terkecil pada sel (−).", "The amount moved along the loop: the smallest allocation on a (−) cell.") },
  { term: b("Solusi tidak layak", "Infeasible solution"), def: b("Solusi optimal yang masih memakai jalur rusak, tanda tidak ada rencana tanpa rute itu.", "An optimum that still uses a broken route, meaning no plan exists without it.") },
  { term: b("Solusi optimal alternatif", "Alternative optimum"), def: b("Pola lain dengan biaya sama, ditandai d_ij = 0 pada sel kosong.", "Another pattern with the same cost, signalled by d_ij = 0 on an empty cell.") },
  { term: b("Transshipment", "Transshipment"), def: b("Perluasan model transportasi yang mengizinkan barang transit di simpul lain, salah satu cara mengakali jalur rusak.", "An extension that lets goods pass through intermediate nodes, one way around broken routes.") },
];
