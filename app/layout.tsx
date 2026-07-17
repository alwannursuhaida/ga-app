import type { Metadata } from "next";
import "./globals.css";

// made by al with love
export const metadata: Metadata = {
  title: "GA Yayasan Albanna",
  description: "Aplikasi Sarana & Prasarana — Divisi General Affair",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="font-body">{children}</body>
    </html>
  );
}
