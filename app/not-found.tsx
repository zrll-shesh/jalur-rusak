import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[1240px] px-5 py-24 md:px-8">
      <div className="hazard-bar h-4 w-48" aria-hidden="true" />
      <h1 className="mt-8 text-[clamp(3rem,8vw,6rem)] font-black leading-[0.9] tracking-[-0.04em]">404</h1>
      <p className="mt-4 max-w-[40ch] text-[20px]">Jalan ini ditutup. Halaman yang kamu cari tidak ada.</p>
      <Link href="/" className="mt-8 inline-block rounded-[3px] bg-ink px-5 py-3 font-bold text-paper">
        Kembali ke beranda
      </Link>
    </div>
  );
}
