import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LifeLine AI - Platform Keselamatan Publik Masa Depan",
  description: "Mencegah bahaya sebelum kejadian terjadi menggunakan teknologi LifeLine AI, crowdsourced warga, realtime telemetry dan anomali cuaca.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <main className="flex-1 w-full max-w-full">{children}</main>
      </body>
    </html>
  );
}
