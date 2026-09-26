import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";

import "./globals.css";

// Outfit para os numeros grandes e o nome da cidade; Inter para o resto;
// JetBrains Mono nas medidas, para os digitos nao dancarem ao atualizar.
const display = Outfit({
  subsets: ["latin"],
  variable: "--fonte-display",
  weight: ["200", "300", "400", "500", "600"],
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--fonte-sans",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--fonte-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "TravelIA — Clima Web",
  description: "Previsao do tempo com analise e narracao geradas por IA.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
