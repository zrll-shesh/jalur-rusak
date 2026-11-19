import type { Metadata, Viewport } from "next";
import "@fontsource/overpass/400.css";
import "@fontsource/overpass/600.css";
import "@fontsource/overpass/700.css";
import "@fontsource/overpass/800.css";
import "@fontsource/overpass/900.css";
import "@fontsource/overpass/400-italic.css";
import "@fontsource/overpass-mono/400.css";
import "@fontsource/overpass-mono/600.css";
import "katex/dist/katex.min.css";
import "./globals.css";
import { AppProvider } from "@/lib/i18n";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Jalur Rusak | Masalah Transportasi dengan Rute Terlarang",
    template: "%s | Jalur Rusak",
  },
  description:
    "Web pembelajaran interaktif tentang masalah transportasi dengan jalur rusak (rute terlarang): teori, metode NWC, Least Cost, VAM, MODI, Stepping Stone, contoh soal langkah demi langkah, kalkulator, games, dan kuis. Kelompok 1 Teknik Optimasi, Sains Data Unesa.",
  authors: [
    { name: "Nazril Ravi Pratama" },
    { name: "Rizki Piji Fathoni" },
    { name: "Faisal Muflih" },
    { name: "Mylovia Mahesa Ayu" },
    { name: "Syafira Najema" },
  ],
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EDF0EE" },
    { media: "(prefers-color-scheme: dark)", color: "#141918" },
  ],
};

const themeScript = `(function(){try{var t=localStorage.getItem('jr-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}else if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.setAttribute('data-theme','dark');}else{document.documentElement.setAttribute('data-theme','light');}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen">
        <AppProvider>
          <a href="#konten" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-surface focus:px-4 focus:py-2">
            Lewati ke konten
          </a>
          <Nav />
          <main id="konten" className="min-h-[70vh]">{children}</main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
