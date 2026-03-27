import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PescaShop - Artículos de Pesca",
  description:
    "Tu tienda especializada en artículos de pesca. Cañas, señuelos, accesorios y más.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
