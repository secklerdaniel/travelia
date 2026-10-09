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

const DESCRICAO =
  "A previsão do tempo com o sotaque da cidade, narrada por IA — e o que fazer lá.";

// Sem openGraph o WhatsApp mostrava so o endereco no preview. A imagem vem de
// app/opengraph-image.jpg (feita no remotion-app, Still "TravelIAOg").
export const metadata: Metadata = {
  metadataBase: new URL("https://clima-seckler.vercel.app"),
  title: "TravelIA — Clima Web",
  description: DESCRICAO,
  openGraph: {
    title: "TravelIA — a previsão do tempo com sotaque",
    description: DESCRICAO,
    url: "/",
    siteName: "TravelIA",
    locale: "pt_BR",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
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
