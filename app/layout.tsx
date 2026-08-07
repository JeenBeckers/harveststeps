import type { Metadata } from "next";
import localFont from "next/font/local";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const libreFranklin = localFont({
  src: [
    {
      path: "./fonts/LibreFranklin-VariableFont_wght.ttf",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "./fonts/LibreFranklin-Italic-VariableFont_wght.ttf",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-libre-franklin",
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HarvestSteps",
  description: "Talentplanner voor de Harvest Post-master reis",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="nl" className={`${libreFranklin.variable} ${cormorantGaramond.variable}`}>
      <body className="hv">{children}</body>
    </html>
  );
}
