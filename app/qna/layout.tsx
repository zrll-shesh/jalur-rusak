import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tanya Jawab" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
