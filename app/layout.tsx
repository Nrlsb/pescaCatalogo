import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { NotificationProvider } from "@/components/ui/NotificationProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

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
    <html lang="es" className={`${inter.variable} ${playfair.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased font-sans">
        <NotificationProvider>{children}</NotificationProvider>
      </body>
    </html>
  );
}
