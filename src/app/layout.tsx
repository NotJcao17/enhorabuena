import type { Metadata } from "next";
import { Lato, Pacifico } from "next/font/google";
import "./globals.css";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

const pacifico = Pacifico({
  variable: "--font-pacifico",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Enhorabuena",
  description: "Catálogo de productos de Betterware y Tienda Personal",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo128.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${lato.variable} ${pacifico.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans theme-betterware">{children}</body>
    </html>
  );
}
