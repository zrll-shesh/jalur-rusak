# Jalur Rusak

Web pembelajaran interaktif tentang masalah transportasi dengan jalur rusak (rute terlarang).
Kelompok 1, Teknik Optimasi, Sains Data, Kelas International 24, Universitas Negeri Surabaya.
Dosen pengampu: Yuliani Puji Astuti, S.Si., M.Si.

Website diinisiasi dan dikembangkan oleh Nazril Ravi Pratama, bersama anggota Kelompok 1.

Anggota: Nazril Ravi Pratama, Rizki Piji Fathoni, Faisal Muflih, Mylovia Mahesa Ayu, Syafira Najema.

## Menjalankan di komputer

Butuh Node.js 18.17 atau lebih baru.

```bash
npm install
npm run dev
```

Buka http://localhost:3000

## Deploy ke Vercel

1. Upload folder ini ke repositori GitHub baru.
2. Di vercel.com pilih Add New > Project, lalu import repositori tersebut.
3. Framework terdeteksi otomatis sebagai Next.js. Klik Deploy.

Cara lain tanpa GitHub: `npm i -g vercel`, lalu jalankan `vercel` di folder ini.

## Struktur

- `app/` halaman: beranda, materi, metode, contoh, kalkulator, games, kuis, qna, glosarium, tentang
- `components/` tabel transportasi, pemutar langkah, peta interaktif, games
- `lib/solver.ts` solver NWC, Least Cost, VAM, MODI, Stepping Stone dengan aritmetika M simbolik, dummy, dan ε
- `lib/content/` isi soal, kuis, tanya jawab, glosarium, dan daftar pustaka (dwibahasa)

Untuk menambah soal, cukup tambahkan objek baru di `lib/content/problems.ts`. Pembahasan langkah demi langkah dibuat otomatis oleh solver.

## Hak cipta dan izin penggunaan

Hak Cipta (c) 2026 Nazril Ravi Pratama. Seluruh hak dilindungi.

Repositori ini **bukan open source**. Siapa pun yang ingin menyalin, mengubah, memakai ulang, atau men-deploy kode, desain, maupun materi dari repositori ini **wajib meminta izin terlebih dahulu** kepada Nazril Ravi Pratama melalui akun GitHub pemilik repositori. Repositori ini boleh dilihat untuk keperluan belajar pribadi. Ketentuan lengkap ada di file `LICENSE`.
