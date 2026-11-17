"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Tex from "@/components/Tex";
import TransportTable from "@/components/TransportTable";
import { useApp, useStored } from "@/lib/i18n";
import { references } from "@/lib/content/site";
import { problems } from "@/lib/content/problems";
import { solve } from "@/lib/solver";
import { Check, Print } from "@/components/Icons";
import type { Bi } from "@/lib/solver";

const Cite = ({ k, children }: { k: string; children: React.ReactNode }) => (
  <a href="#pustaka" className="text-route underline decoration-route/40 underline-offset-2 hover:decoration-route" title={references.find((r) => r.key === k)?.text}>
    {children}
  </a>
);

const H = ({ children }: { children: React.ReactNode }) => (
  <h3 className="mt-10 text-[21px] font-extrabold tracking-[-0.015em]">{children}</h3>
);

const Note = ({ children, tone = "route" }: { children: React.ReactNode; tone?: "route" | "hazard" }) => (
  <aside className={`my-6 border-l-[4px] ${tone === "hazard" ? "border-hazard bg-hazard/10" : "border-route bg-routeSoft/40"} px-5 py-4 text-[16px]`}>{children}</aside>
);

function ChapterSection(props: {
  id: string;
  n: number;
  title: string;
  label: string;
  done: boolean;
  onToggle: () => void;
  doneLabel: string;
  todoLabel: string;
  children: React.ReactNode;
}) {
  const { id, n, title, label, done, onToggle, doneLabel, todoLabel, children } = props;
  return (
    <section id={id} className="scroll-mt-24 border-t border-line pb-6 pt-14 first:border-t-0 first:pt-0">
      <p className="num text-[14px] text-muted">
        {label} {n}
      </p>
      <h2 className="mt-1 text-[clamp(1.8rem,3.4vw,2.6rem)] font-black leading-[1.05] tracking-[-0.03em]">{title}</h2>
      <div className="prose-body mt-6 max-w-[68ch] text-[17.5px] leading-[1.7]">{children}</div>
      <button
        type="button"
        onClick={onToggle}
        className={`no-print mt-10 flex items-center gap-2 rounded-[3px] border-2 px-4 py-2 text-[14px] font-bold transition-colors ${done ? "border-route bg-route text-white" : "border-ink/30 hover:border-ink"}`}
        aria-pressed={done}
      >
        <Check className="h-4 w-4" />
        {done ? doneLabel : todoLabel}
      </button>
    </section>
  );
}

const chapters: { id: string; title: Bi }[] = [
  { id: "masalah-transportasi", title: { id: "Masalah transportasi", en: "The transportation problem" } },
  { id: "model-matematis", title: { id: "Model matematis", en: "Mathematical model" } },
  { id: "jalur-rusak", title: { id: "Apa itu jalur rusak", en: "What a broken route is" } },
  { id: "teknik-big-m", title: { id: "Teknik biaya M", en: "The big-M technique" } },
  { id: "aritmetika-m", title: { id: "Aturan berhitung dengan M", en: "Rules for calculating with M" } },
  { id: "alur", title: { id: "Alur penyelesaian", en: "Solution procedure" } },
  { id: "membaca-hasil", title: { id: "Membaca hasil akhir", en: "Reading the result" } },
  { id: "kasus-lain", title: { id: "Kaitan dengan kasus khusus lain", en: "Links to other special cases" } },
  { id: "sains-data", title: { id: "Sudut pandang sains data", en: "A data-science perspective" } },
  { id: "kesalahan", title: { id: "Kesalahan yang sering terjadi", en: "Common mistakes" } },
];

export default function MateriPage() {
  const { t, lang } = useApp();
  const [read, setRead] = useStored<string[]>("jr-read", []);
  const [active, setActive] = useState(chapters[0].id);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" }
    );
    chapters.forEach((c) => {
      const el = document.getElementById(c.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const toggleRead = (id: string) => setRead((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const inf = useMemo(() => solve(problems.find((p) => p.slug === "tidak-layak")!, "vam", "modi"), []);
  const main = useMemo(() => solve(problems.find((p) => p.slug === "jembatan-putus")!, "lcm", "modi"), []);

  const sp = (sid: string, n: number) => ({
    id: sid,
    n,
    title: t(chapters[n - 1].title),
    label: t({ id: "Bab", en: "Chapter" }),
    done: read.includes(sid),
    onToggle: () => toggleRead(sid),
    doneLabel: t({ id: "Sudah dibaca", en: "Marked as read" }),
    todoLabel: t({ id: "Tandai sudah dibaca", en: "Mark as read" }),
  });

  const id = lang === "id";

  return (
    <div className="mx-auto max-w-[1240px] px-5 py-12 md:px-8 md:py-16">
      <header className="max-w-[60ch]">
        <h1 className="text-[clamp(2.6rem,6vw,4.6rem)] font-black leading-[0.95] tracking-[-0.04em]">{t({ id: "Materi", en: "Theory" })}</h1>
        <p className="mt-4 text-[19px] text-ink/80">
          {t({
            id: "Sepuluh bab singkat, dari definisi masalah transportasi sampai cara membaca hasil yang masih mengandung M. Setiap definisi merujuk pada buku teks dan jurnal yang tercantum di bagian akhir.",
            en: "Ten short chapters, from the definition of the transportation problem to reading a result that still contains M. Every definition cites the textbooks and journals listed at the end.",
          })}
        </p>
        <div className="no-print mt-6 flex flex-wrap items-center gap-4">
          <div className="h-2 w-48 bg-line">
            <div className="h-full bg-route transition-all" style={{ width: `${(read.length / chapters.length) * 100}%` }} />
          </div>
          <span className="num text-[14px] text-muted">
            {read.length}/{chapters.length} {t({ id: "bab dibaca", en: "chapters read" })}
          </span>
          <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-[14px] font-semibold text-muted hover:text-ink">
            <Print className="h-4 w-4" />
            {t({ id: "Cetak materi", en: "Print theory" })}
          </button>
        </div>
      </header>

      <div className="mt-14 grid gap-12 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav className="no-print hidden lg:block" aria-label={t({ id: "Daftar isi", en: "Contents" })}>
          <ol className="sticky top-24 space-y-0.5 border-l-2 border-line">
            {chapters.map((c, k) => (
              <li key={c.id}>
                <a
                  href={`#${c.id}`}
                  className={`-ml-[2px] flex items-start gap-2 border-l-2 py-1.5 pl-4 text-[14.5px] leading-snug transition-colors ${active === c.id ? "border-route font-bold text-ink" : "border-transparent text-muted hover:text-ink"}`}
                >
                  <span className="num w-5 shrink-0 text-[12px] leading-[1.6]">{k + 1}</span>
                  <span className="flex-1">{t(c.title)}</span>
                  {read.includes(c.id) && <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-route" />}
                </a>
              </li>
            ))}
            <li>
              <a href="#pustaka" className="-ml-[2px] block border-l-2 border-transparent py-1.5 pl-11 text-[14.5px] text-muted hover:text-ink">
                {t({ id: "Daftar pustaka", en: "References" })}
              </a>
            </li>
          </ol>
        </nav>

        <article className="min-w-0">
          <aside className="mb-14 border-2 border-ink bg-surface p-6 md:p-8">
            <p className="text-[14px] font-bold text-muted">{t({ id: "Ringkasan satu menit", en: "The one-minute summary" })}</p>
            <ol className="mt-4 space-y-3 text-[17px] leading-relaxed">
              {[
                { id: "Masalah transportasi mencari cara mengirim barang dari beberapa sumber ke beberapa tujuan dengan total biaya paling murah.", en: "The transportation problem finds the cheapest way to ship goods from several sources to several destinations." },
                { id: "Jalur rusak adalah rute yang tidak boleh dipakai. Biayanya diganti M, angka yang lebih besar dari biaya apa pun.", en: "A broken route must not be used. Its cost is replaced by M, a number larger than any other cost." },
                { id: "Karena kita mencari biaya termurah, metode penyelesaian otomatis menjauhi sel M. Tidak perlu aturan tambahan.", en: "Because we look for the cheapest plan, the method keeps away from M cells on its own. No extra rules are needed." },
                { id: "Saat menghitung, bandingkan koefisien M lebih dulu: 8 − M negatif, M − 8 positif.", en: "When calculating, compare the M coefficient first: 8 − M is negative, M − 8 is positive." },
                { id: "Di akhir, cek sel M. Kosong berarti rencana aman. Masih terisi berarti permintaan tidak bisa dipenuhi tanpa jalur itu.", en: "At the end, check the M cells. Empty means the plan is safe. Still filled means demand cannot be met without that route." },
              ].map((x, k) => (
                <li key={k} className="grid grid-cols-[1.75rem_1fr] gap-2">
                  <span className="num pt-[3px] text-[14px] font-semibold text-route">{k + 1}</span>
                  <span>{t(x)}</span>
                </li>
              ))}
            </ol>
          </aside>
          {/* 1 */}
          <ChapterSection {...sp("masalah-transportasi", 1)}>
            <p>
              {id ? "Masalah transportasi adalah persoalan memindahkan barang dari beberapa " : "The transportation problem is about moving goods from several "}
              <strong>{id ? "sumber" : "sources"}</strong>
              {id ? " (pabrik, gudang) ke beberapa " : " (factories, warehouses) to several "}
              <strong>{id ? "tujuan" : "destinations"}</strong>
              {id
                ? " (toko, agen, kota) dengan total biaya serendah mungkin. Bentuk formalnya pertama kali ditulis oleh "
                : " (stores, agents, cities) at the lowest possible total cost. Its formal statement was first written by "}
              <Cite k="Hitchcock 1941">Hitchcock (1941)</Cite>
              {id
                ? " dalam makalah tentang distribusi produk dari beberapa sumber ke banyak lokasi. Dantzig (1951) kemudian menunjukkan bahwa metode simpleks bisa disederhanakan untuk struktur khusus ini."
                : " in a paper on distributing a product from several sources to many localities. Dantzig (1951) later showed that the simplex method can be simplified for this special structure."}
            </p>
            <p>
              {id
                ? "Menurut Dantzig dan Thapa, masalah transportasi klasik adalah menentukan jadwal pengiriman optimal yang berasal dari sumber dengan jumlah barang tertentu, dikirim langsung ke tujuan, menghabiskan supply dan demand, dan biayanya dihitung dari jumlah semua biaya pengiriman. Rangkuman ini juga dipakai oleh "
                : "Following Dantzig and Thapa, the classical transportation problem is to find an optimal shipping schedule from sources with given amounts, shipped directly to destinations, exhausting supply and demand, with total cost equal to the sum of all shipping costs. This summary is also used by "}
              <Cite k="Darojatun dkk. 2026">Darojatun, Ahmad, &amp; Hartono (2026)</Cite>
              {id ? " di Jurnal Riset dan Aplikasi Matematika terbitan Unesa." : " in the Unesa-published Jurnal Riset dan Aplikasi Matematika."}
            </p>
            <p>
              {id
                ? "Masalah ini dipakai luas di Indonesia, misalnya pada distribusi beras. "
                : "The model is widely applied in Indonesia, for example in rice distribution. "}
              <Cite k="Fitriani 2026">Fitriani (2026)</Cite>
              {id
                ? " di MATHunesa membandingkan Least Cost, VAM, dan MODI untuk optimasi biaya pengiriman beras dan menegaskan bahwa pilihan metode awal sangat menentukan efektivitas proses optimasi."
                : " in MATHunesa compared Least Cost, VAM, and MODI for rice shipping costs and stressed that the choice of starting method strongly affects how efficiently the optimisation proceeds."}
            </p>
            <H>{t({ id: "Unsur-unsurnya", en: "Its ingredients" })}</H>
            <p>
              {id ? "Ada " : "There are "}
              <Tex>{"m"}</Tex> {id ? "sumber dengan kapasitas" : "sources with capacities"} <Tex>{"a_1, \\dots, a_m"}</Tex>, <Tex>{"n"}</Tex>{" "}
              {id ? "tujuan dengan kebutuhan" : "destinations with requirements"} <Tex>{"b_1, \\dots, b_n"}</Tex>,{" "}
              {id ? "dan biaya satuan" : "and unit costs"} <Tex>{"c_{ij}"}</Tex> {id ? "untuk setiap rute dari sumber" : "for every route from source"} <Tex>{"i"}</Tex>{" "}
              {id ? "ke tujuan" : "to destination"} <Tex>{"j"}</Tex>. {id ? "Yang dicari adalah" : "We look for"} <Tex>{"x_{ij}"}</Tex>,{" "}
              {id ? "banyak barang yang dikirim lewat setiap rute." : "the quantity shipped on each route."}
            </p>
          </ChapterSection>

          {/* 2 */}
          <ChapterSection {...sp("model-matematis", 2)}>
            <p>{t({ id: "Dalam bentuk program linear, masalah transportasi ditulis sebagai berikut.", en: "As a linear program, the transportation problem reads as follows." })}</p>
            <Tex block>{"\\min Z = \\sum_{i=1}^{m} \\sum_{j=1}^{n} c_{ij}\\, x_{ij}"}</Tex>
            <p>{t({ id: "dengan kendala", en: "subject to" })}</p>
            <Tex block>{"\\sum_{j=1}^{n} x_{ij} = a_i \\quad (i = 1,\\dots,m), \\qquad \\sum_{i=1}^{m} x_{ij} = b_j \\quad (j = 1,\\dots,n), \\qquad x_{ij} \\ge 0."}</Tex>
            <p>
              {t({
                id: "Kendala pertama memastikan setiap sumber mengirim tepat sebanyak kapasitasnya, kendala kedua memastikan setiap tujuan menerima tepat sebanyak kebutuhannya. Bentuk dengan tanda sama dengan ini mensyaratkan masalah setimbang:",
                en: "The first set makes each source ship exactly its capacity; the second makes each destination receive exactly its requirement. This equality form requires a balanced problem:",
              })}
            </p>
            <Tex block>{"\\sum_{i=1}^{m} a_i = \\sum_{j=1}^{n} b_j ."}</Tex>
            <p>
              {t({
                id: "Kalau tidak setimbang, ditambahkan baris atau kolom dummy berbiaya 0 (Taha, 2017). Solusi dasar yang layak memiliki tepat m + n − 1 variabel basis, karena satu dari m + n kendala selalu bisa diturunkan dari kendala lainnya. Syarat inilah yang dicek sebelum uji optimalitas.",
                en: "If it is not balanced, a dummy row or column with cost 0 is added (Taha, 2017). A basic feasible solution has exactly m + n − 1 basic variables, because one of the m + n constraints can always be derived from the others. This is the condition checked before the optimality test.",
              })}
            </p>
            <Note>
              <strong>{t({ id: "Ingat:", en: "Remember:" })}</strong>{" "}
              {t({
                id: "dalam tabel transportasi, setiap baris adalah satu sumber, setiap kolom adalah satu tujuan, dan setiap sel adalah satu rute dengan biaya c_ij di pojoknya.",
                en: "in the transportation table, each row is a source, each column a destination, and each cell a route with cost c_ij in its corner.",
              })}
            </Note>
          </ChapterSection>

          {/* 3 */}
          <ChapterSection {...sp("jalur-rusak", 3)}>
            <p>
              <strong>{t({ id: "Jalur rusak", en: "A broken route" })}</strong>{" "}
              {t({
                id: "adalah pasangan sumber–tujuan yang tidak dapat atau tidak boleh dipakai untuk pengiriman. Literatur berbahasa Inggris menyebutnya prohibited route atau unacceptable route, dan buku berbahasa Indonesia sering menyebutnya rute terlarang. Hillier & Lieberman (2015) menjelaskan bahwa alokasi yang mustahil cukup diberi biaya satuan yang sangat besar agar tidak pernah muncul di solusi optimal.",
                en: "is a source–destination pair that cannot or must not be used for shipping. English textbooks call it a prohibited or unacceptable route, and Indonesian textbooks often say rute terlarang. Hillier & Lieberman (2015) explain that an impossible allocation can simply be given a huge unit cost so it never appears in an optimal solution.",
              })}
            </p>
            <H>{t({ id: "Penyebab di dunia nyata", en: "Real-world causes" })}</H>
            <ul className="mt-3 list-none space-y-2 pl-0">
              {[
                { id: "Infrastruktur rusak: jembatan putus, jalan longsor, atau banjir.", en: "Damaged infrastructure: collapsed bridges, landslides, or floods." },
                { id: "Batasan kendaraan: truk besar atau mobil berpendingin tidak muat lewat jalan desa.", en: "Vehicle limits: large trucks or refrigerated vans cannot fit village roads." },
                { id: "Regulasi: larangan angkutan barang tertentu melewati wilayah atau jam tertentu.", en: "Regulation: certain goods may not pass through some areas or hours." },
                { id: "Kebijakan bisnis: kontrak eksklusif atau wilayah pemasaran yang tidak boleh dilayani gudang tertentu.", en: "Business policy: exclusive contracts or territories a warehouse may not serve." },
                { id: "Data: jarak atau biaya rute tidak tersedia, sehingga rute itu tidak bisa direncanakan.", en: "Data: distance or cost is unavailable, so the route cannot be planned." },
              ].map((x, k) => (
                <li key={k} className="flex gap-3">
                  <span className="hazard-bar mt-[0.6em] h-2 w-5 shrink-0" aria-hidden="true" />
                  <span>{t(x)}</span>
                </li>
              ))}
            </ul>
            <Note tone="hazard">
              {t({
                id: "Jalur rusak berbeda dengan rute mahal. Rute mahal masih boleh dipakai kalau secara keseluruhan menguntungkan. Jalur rusak sama sekali tidak boleh dipakai, berapa pun penghematannya.",
                en: "A broken route differs from an expensive one. An expensive route may still be used if it helps overall. A broken route must not be used at all, whatever it might save.",
              })}
            </Note>
          </ChapterSection>

          {/* 4 */}
          <ChapterSection {...sp("teknik-big-m", 4)}>
            <p>
              {t({
                id: "Secara model, jalur rusak dari sumber i ke tujuan j cukup ditulis sebagai kendala tambahan:",
                en: "In the model, a broken route from source i to destination j is just an extra constraint:",
              })}
            </p>
            <Tex block>{"x_{ij} = 0 ."}</Tex>
            <p>
              {t({
                id: "Masalahnya, metode tabel (NWC, Least Cost, VAM, MODI, Stepping Stone) tidak punya tempat untuk kendala tambahan. Solusinya adalah mengganti biaya sel itu dengan M:",
                en: "The catch is that table methods (NWC, Least Cost, VAM, MODI, Stepping Stone) have no place for an extra constraint. The fix is to replace that cell’s cost with M:",
              })}
            </p>
            <Tex block>{"c_{ij} = M, \\qquad M \\gg \\max_{k,l} c_{kl}."}</Tex>
            <Note>
              <strong>{t({ id: "Analogi:", en: "Analogy:" })}</strong>{" "}
              {t({
                id: "bayangkan aplikasi peta yang memberi “waktu tempuh 1 juta jam” pada jalan yang ditutup. Aplikasi tidak perlu tahu jalan itu ditutup; ia cukup mencari rute tercepat, dan jalan itu tidak akan pernah terpilih selama ada jalan lain. M bekerja persis seperti itu.",
                en: "imagine a maps app that gives a closed road a ‘travel time of a million hours’. The app doesn’t need to know the road is closed; it just looks for the fastest route, and that road is never picked while another exists. M works exactly like that.",
              })}
            </Note>
            <p>
              {t({
                id: "Setiap unit yang lewat jalur rusak menambah biaya sebesar M. Karena M lebih besar dari kombinasi biaya mana pun, solusi yang memakai jalur rusak selalu lebih mahal daripada solusi layak mana pun yang tidak memakainya. Akibatnya, prosedur minimisasi biasa akan mengosongkan sel M dengan sendirinya. Ide menghukum variabel yang tidak diinginkan dengan koefisien sangat besar ini sama dengan metode Big-M pada simpleks untuk variabel buatan.",
                en: "Each unit on a broken route adds M to the cost. Since M exceeds any cost combination, a solution using the broken route is always dearer than any feasible solution that avoids it. So the ordinary minimisation procedure empties M cells by itself. This idea of penalising an unwanted variable with a huge coefficient is the same as the Big-M method in simplex for artificial variables.",
              })}
            </p>
            <figure className="my-8">
              <TransportTable data={main} snap={{ alloc: main.steps[0].snap.alloc, hideDummy: true, focus: [{ r: 0, c: 1 }], focusKind: "warn" }} compact />
              <figcaption className="mt-2 text-[14px] text-muted">
                {t({ id: "Contoh utama: rute S1 ke D2 rusak sehingga biayanya ditulis M dan selnya diberi tanda garis kuning-hitam.", en: "Main example: route S1 to D2 is broken, so its cost is written M and the cell is striped yellow-black." })}
              </figcaption>
            </figure>
            <H>{t({ id: "Kenapa tidak memakai angka biasa?", en: "Why not use an ordinary number?" })}</H>
            <p>
              {t({
                id: "Boleh, asalkan angkanya benar-benar jauh lebih besar dari skala biaya. Tetapi memilih angka yang “cukup besar” bisa keliru pada soal besar. Simbol M menjamin dominasi untuk soal apa pun, dan koefisien M di total biaya langsung memberi tahu berapa unit yang masih lewat jalur rusak.",
                en: "You may, as long as it is far above the cost scale. But picking a ‘large enough’ number can go wrong on big problems. The symbol M guarantees dominance for any problem, and the M coefficient in the total cost tells you directly how many units still use broken routes.",
              })}
            </p>
          </ChapterSection>

          {/* 5 */}
          <ChapterSection {...sp("aritmetika-m", 5)}>
            <p>
              {t({
                id: "Nilai yang mengandung M ditulis sebagai pM + q. Hitung seperti aljabar biasa, lalu bandingkan dengan aturan berikut.",
                en: "Values with M are written as pM + q. Calculate as in ordinary algebra, then compare using these rules.",
              })}
            </p>
            <div className="scroll-x my-6">
              <table className="w-full min-w-[520px] border-collapse text-left text-[15.5px]">
                <thead>
                  <tr className="border-b-2 border-ink">
                    <th className="py-2 pr-4 font-bold">{t({ id: "Aturan", en: "Rule" })}</th>
                    <th className="py-2 font-bold">{t({ id: "Contoh", en: "Example" })}</th>
                  </tr>
                </thead>
                <tbody className="num text-[14.5px]">
                  {[
                    [t({ id: "Jumlah/kurang: gabungkan suku sejenis", en: "Add/subtract: combine like terms" }), "(M + 3) − (M − 4) = 7"],
                    [t({ id: "Kali bilangan: kalikan kedua suku", en: "Multiply by a number: scale both terms" }), "10 × (8 − M) = 80 − 10M"],
                    [t({ id: "Tanda ditentukan koefisien M", en: "The M coefficient decides the sign" }), "8 − M < 0,   M − 1000 > 0"],
                    [t({ id: "Bandingkan koefisien M lebih dulu", en: "Compare M coefficients first" }), "2M − 900 > M + 900"],
                    [t({ id: "Koefisien sama: bandingkan konstanta", en: "Equal coefficients: compare constants" }), "M + 5 > M − 2"],
                    [t({ id: "M − M hilang", en: "M − M cancels" }), "3 − (6 − M) − (M − 3) = 0"],
                  ].map(([a, b], k) => (
                    <tr key={k} className="border-b border-line align-top">
                      <td className="py-2.5 pr-4 font-sans text-[15.5px]">{a}</td>
                      <td className="py-2.5 whitespace-nowrap">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              {t({
                id: "Secara formal, pM + q < rM + s jika p < r, atau p = r dan q < s. Inilah urutan leksikografis yang dipakai solver di website ini.",
                en: "Formally, pM + q < rM + s if p < r, or p = r and q < s. This lexicographic order is what the solver on this site uses.",
              })}
            </p>
            <Note>
              {t({ id: "Latih aturan ini di game ", en: "Practise these rules in the " })}
              <Link href="/games" className="font-bold text-route underline underline-offset-2">
                {t({ id: "Duel M", en: "M Duel" })}
              </Link>
              {t({ id: ".", en: " game." })}
            </Note>
          </ChapterSection>

          {/* 6 */}
          <ChapterSection {...sp("alur", 6)}>
            <p>{t({ id: "Urutan kerja untuk soal transportasi dengan jalur rusak:", en: "The working order for a transportation problem with broken routes:" })}</p>
            <ol className="mt-5 space-y-4 pl-0">
              {[
                { id: "Identifikasi jalur rusak dan ganti biayanya dengan M.", en: "Identify broken routes and replace their cost with M." },
                { id: "Cek keseimbangan. Tambahkan dummy berbiaya 0 jika total supply ≠ total demand.", en: "Check balance. Add a cost-0 dummy if total supply ≠ total demand." },
                { id: "Cari solusi awal dengan NWC, Least Cost, atau VAM. VAM paling disarankan karena penalti yang memuat M langsung terlihat besar.", en: "Find an initial solution with NWC, Least Cost, or VAM. VAM is recommended because penalties containing M stand out at once." },
                { id: "Pastikan jumlah sel basis m + n − 1. Kalau kurang, tambahkan ε.", en: "Make sure there are m + n − 1 basic cells. If fewer, add ε." },
                { id: "Uji optimalitas dengan MODI (u_i + v_j = c_ij, lalu d_ij = c_ij − u_i − v_j) atau Stepping Stone. Bandingkan nilai dengan aturan M.", en: "Test optimality with MODI (u_i + v_j = c_ij, then d_ij = c_ij − u_i − v_j) or Stepping Stone. Compare values using the M rules." },
                { id: "Jika ada d_ij negatif, bentuk loop, hitung θ, perbarui tabel, lalu kembali ke langkah 5.", en: "If some d_ij is negative, build the loop, compute θ, update the table, and return to step 5." },
                { id: "Jika semua d_ij ≥ 0, baca hasilnya: apakah masih ada alokasi di sel M?", en: "If every d_ij ≥ 0, read the result: is anything still allocated to an M cell?" },
              ].map((x, k) => (
                <li key={k} className="grid grid-cols-[2.25rem_1fr] gap-3">
                  <span className="num grid h-8 w-8 place-items-center bg-ink text-[14px] font-semibold text-paper">{k + 1}</span>
                  <span className="pt-0.5">{t(x)}</span>
                </li>
              ))}
            </ol>
            <Note>
              {t({ id: "Lihat setiap langkah ini dijalankan pada ", en: "See each of these steps carried out in the " })}
              <Link href="/contoh" className="font-bold text-route underline underline-offset-2">
                {t({ id: "Contoh Soal", en: "Examples" })}
              </Link>
              .
            </Note>
          </ChapterSection>

          {/* 7 */}
          <ChapterSection {...sp("membaca-hasil", 7)}>
            <p>{t({ id: "Ada tiga kemungkinan saat semua d_ij ≥ 0:", en: "There are three possible outcomes once every d_ij ≥ 0:" })}</p>
            <H>{t({ id: "1. M hilang dari total biaya", en: "1. M disappears from the total cost" })}</H>
            <p>{t({ id: "Solusi layak dan optimal. Semua barang dikirim tanpa melewati jalur rusak. Ini hasil yang paling sering terjadi.", en: "The solution is feasible and optimal. Everything is shipped without touching a broken route. This is the most common outcome." })}</p>
            <H>{t({ id: "2. M masih ada di total biaya", en: "2. M remains in the total cost" })}</H>
            <p>
              {t({
                id: "Masalah tidak memiliki solusi layak tanpa jalur rusak. Contoh di bawah: D2 butuh 40 unit, tetapi satu-satunya sumber lain yang bisa mencapainya (S2) hanya punya 20. Berapa pun cara mengatur, 20 unit harus lewat jalur rusak, sehingga Z = 130 + 20M.",
                en: "The problem has no feasible solution without the broken route. Below, D2 needs 40 units but the only other source that can reach it (S2) has 20. However you arrange it, 20 units must use the broken route, so Z = 130 + 20M.",
              })}
            </p>
            <figure className="my-6">
              <TransportTable data={inf} snap={inf.steps[inf.steps.length - 1].snap} compact />
              <figcaption className="mt-2 text-[14px] text-muted">{t({ id: "Solusi optimal yang tetap memakai jalur rusak S1D2: tanda masalah tidak layak.", en: "An optimum that still uses the broken route S1D2: a sign of infeasibility." })}</figcaption>
            </figure>
            <p>
              {t({
                id: "Yang dilaporkan bukan angka 130 + 20M, melainkan temuan: kebutuhan D2 tidak bisa dipenuhi. Rekomendasinya bisa berupa perbaikan jalan, pengiriman transit lewat simpul lain (transshipment), atau menerima kekurangan 20 unit.",
                en: "What you report is not the number 130 + 20M but the finding: D2’s demand cannot be met. Recommendations include repairing the road, shipping through another node (transshipment), or accepting a 20-unit shortfall.",
              })}
            </p>
            <H>{t({ id: "3. Ada d_ij = 0 pada sel kosong", en: "3. Some empty cell has d_ij = 0" })}</H>
            <p>{t({ id: "Ada solusi optimal alternatif dengan biaya sama. Sel M tidak akan pernah menjadi alternatif ini selama M sudah keluar dari basis, karena d_ij sel M bernilai M dikurangi angka biasa.", en: "An alternative optimum with the same cost exists. An M cell will never be that alternative once M has left the basis, because its d_ij is M minus ordinary numbers." })}</p>
          </ChapterSection>

          {/* 8 */}
          <ChapterSection {...sp("kasus-lain", 8)}>
            <p>{t({ id: "Topik kelompok kami bersinggungan dengan topik tiga kelompok lain. Jalur rusak bisa muncul bersamaan dengan kasus khusus mana pun.", en: "Our topic overlaps with the other three groups’ topics. A broken route can appear together with any special case." })}</p>
            <H>{t({ id: "Dengan masalah tak setimbang (Kelompok 2)", en: "With unbalanced problems (Group 2)" })}</H>
            <p>{t({ id: "Dummy diberi biaya 0, jalur rusak diberi M. Keduanya tidak saling mengganggu. Satu hal penting: sel dummy tidak pernah dianggap rusak, karena dummy hanya pencatat kelebihan atau kekurangan.", en: "Dummy cells get cost 0, broken routes get M. They don’t interfere. One key point: a dummy cell is never broken, because the dummy only records surplus or shortage." })}</p>
            <H>{t({ id: "Dengan kemerosotan (Kelompok 3)", en: "With degeneracy (Group 3)" })}</H>
            <p>{t({ id: "ε ditaruh di sel yang tidak membentuk loop, sebaiknya sel berbiaya kecil, bukan sel M. Dengan begitu u dan v tidak mengandung M tanpa alasan.", en: "Place ε in a cell that does not close a loop, preferably a cheap one rather than an M cell. That way u and v don’t contain M for no reason." })}</p>
            <H>{t({ id: "Dengan pola maksimum (Kelompok 4)", en: "With maximisation (Group 4)" })}</H>
            <p>
              {t({
                id: "Pada masalah memaksimumkan keuntungan, jalur rusak diberi keuntungan −M, bukan +M. Kalau tabel keuntungan diubah menjadi tabel kerugian peluang (keuntungan terbesar dikurangi setiap nilai), sel itu otomatis menjadi M lagi. Kesalahan tanda di sini adalah jebakan klasik.",
                en: "When maximising profit, a broken route gets profit −M, not +M. If the profit table is converted into an opportunity-loss table (largest profit minus each value), that cell becomes M again automatically. Getting this sign wrong is a classic trap.",
              })}
            </p>
            <Tex block>{"\\text{maks: } p_{ij} = -M \\;\\Longrightarrow\\; \\text{rugi: } \\; p_{\\max} - (-M) = M + p_{\\max} \\approx M"}</Tex>
          </ChapterSection>

          {/* 9 */}
          <ChapterSection {...sp("sains-data", 9)}>
            <p>
              {t({
                id: "Dalam praktik sains data, matriks biaya biasanya berasal dari data jarak atau tarif. Rute yang tidak tersedia sering muncul sebagai nilai kosong (NaN). Dengan pustaka optimasi seperti PuLP di Python, rute rusak cukup tidak dibuatkan variabel, atau diberi kendala x_ij = 0. Hasilnya sama persis dengan teknik M.",
                en: "In data-science practice, the cost matrix usually comes from distance or tariff data. Unavailable routes often appear as missing values (NaN). With an optimisation library such as PuLP in Python, you simply don’t create a variable for a broken route, or you add x_ij = 0. The result matches the M technique exactly.",
              })}
            </p>
            <pre className="num my-6 overflow-x-auto border-l-[3px] border-route bg-ink px-5 py-4 text-[13px] leading-[1.7] text-paper">
{`import pulp

biaya = {("S1","D1"): 5, ("S1","D3"): 4,          # S1→D2 rusak: tidak ditulis
         ("S2","D1"): 3, ("S2","D2"): 6, ("S2","D3"): 8,
         ("S3","D1"): 7, ("S3","D2"): 4, ("S3","D3"): 5}
supply = {"S1": 50, "S2": 40, "S3": 30}
demand = {"D1": 30, "D2": 50, "D3": 40}

model = pulp.LpProblem("jalur_rusak", pulp.LpMinimize)
x = pulp.LpVariable.dicts("x", biaya.keys(), lowBound=0)
model += pulp.lpSum(biaya[r] * x[r] for r in biaya)
for s in supply:
    model += pulp.lpSum(x[r] for r in biaya if r[0] == s) == supply[s]
for d in demand:
    model += pulp.lpSum(x[r] for r in biaya if r[1] == d) == demand[d]

model.solve(pulp.PULP_CBC_CMD(msg=False))
print(pulp.value(model.objective))   # 510.0`}
            </pre>
            <p>
              {t({
                id: "Kalau solver melaporkan status Infeasible, itulah padanan dari “M masih tersisa di solusi optimal” pada perhitungan tabel. Memahami teknik M membantu kita membaca dan menjelaskan hasil solver kepada pengambil keputusan.",
                en: "If the solver reports Infeasible, that is the counterpart of ‘M is still in the optimal solution’ in table calculations. Understanding the M technique helps you read solver output and explain it to decision-makers.",
              })}
            </p>
          </ChapterSection>

          {/* 10 */}
          <ChapterSection {...sp("kesalahan", 10)}>
            <p>{t({ id: "Kesalahan berikut paling sering muncul saat mengerjakan soal jalur rusak. Kenali tandanya agar tidak terjebak.", en: "These mistakes come up most often in broken-route problems. Learn the warning signs so you don’t fall in." })}</p>
            <div className="mt-6 space-y-5">
              {[
                {
                  w: { id: "Memberi jalur rusak biaya 0", en: "Giving a broken route cost 0" },
                  r: { id: "Biaya 0 justru membuat rute itu paling menarik. Jalur rusak harus diberi M. Biaya 0 hanya untuk sel dummy.", en: "Cost 0 makes the route the most attractive. A broken route must get M. Cost 0 is only for dummy cells." },
                },
                {
                  w: { id: "Menganggap 8 − M positif karena ada angka 8", en: "Treating 8 − M as positive because of the 8" },
                  r: { id: "Tanda ditentukan koefisien M. Koefisiennya −1, jadi 8 − M negatif berapa pun konstantanya.", en: "The sign is decided by the M coefficient. It is −1, so 8 − M is negative whatever the constant." },
                },
                {
                  w: { id: "Berhenti setelah solusi awal karena terlihat “sudah murah”", en: "Stopping after the initial solution because it ‘looks cheap’" },
                  r: { id: "Solusi awal hanyalah titik mulai. Kalau total biaya masih mengandung M, solusi itu pasti belum optimal selama ada rute alternatif.", en: "The initial solution is only a starting point. If the total still contains M, it is certainly not optimal while alternatives exist." },
                },
                {
                  w: { id: "Menyimpulkan salah hitung ketika M tersisa di solusi optimal", en: "Assuming a calculation error when M remains at the optimum" },
                  r: { id: "Kalau semua d_ij sudah ≥ 0 dan sel M masih terisi, itu temuan, bukan kesalahan: masalahnya tidak layak tanpa jalur rusak.", en: "If every d_ij ≥ 0 and an M cell is still filled, that is a finding, not an error: the problem is infeasible without the broken route." },
                },
                {
                  w: { id: "Lupa menguji sel M saat MODI", en: "Skipping M cells in MODI" },
                  r: { id: "Semua sel kosong tetap diuji, termasuk sel M. Hasilnya biasanya M dikurangi angka biasa (positif), jadi tidak akan terpilih, tetapi tetap harus ditulis.", en: "Every empty cell is tested, including M cells. The result is usually M minus ordinary numbers (positive), so it won’t be chosen, but it still has to be written." },
                },
                {
                  w: { id: "Mengisi sel dummy lebih dulu pada Least Cost", en: "Filling dummy cells first in Least Cost" },
                  r: { id: "Biaya 0 di dummy bukan biaya nyata. Mengisinya lebih dulu bisa mendorong barang nyata ke jalur rusak di akhir proses.", en: "The 0 in dummy cells is not a real cost. Filling it first can push real goods onto a broken route at the end." },
                },
                {
                  w: { id: "Menghitung total akhir dengan M yang sudah tidak terpakai", en: "Including unused M cells in the final total" },
                  r: { id: "Total biaya hanya menjumlahkan alokasi × biaya pada sel terisi. Sel M yang kosong tidak menyumbang apa-apa.", en: "The total only sums allocation × cost over filled cells. Empty M cells contribute nothing." },
                },
              ].map((x, k) => (
                <div key={k} className="grid gap-1 border-l-[4px] border-alert pl-4">
                  <p className="font-bold text-alert">{t(x.w)}</p>
                  <p className="text-[16.5px]">{t(x.r)}</p>
                </div>
              ))}
            </div>
          </ChapterSection>

          {/* Pustaka */}
          <section id="pustaka" className="scroll-mt-24 border-t-2 border-ink pt-10">
            <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-black tracking-[-0.025em]">{t({ id: "Daftar pustaka", en: "References" })}</h2>
            <ol className="mt-6 max-w-[80ch] space-y-3 text-[15px] leading-relaxed">
              {references.map((r) => (
                <li key={r.key} className="pl-6 -indent-6">
                  {r.text}{" "}
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noreferrer" className="break-all text-route underline underline-offset-2">
                      {r.url.replace("https://", "")}
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </section>
        </article>
      </div>
    </div>
  );
}
