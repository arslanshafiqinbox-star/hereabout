import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, Newsreader } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz", "wdth"],
  variable: "--font-bricolage",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-plex-mono",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: "Herebout",
  description: "Discover gatherings. Keep a journal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${plexMono.variable} ${newsreader.variable} scroll-smooth`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
