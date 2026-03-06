import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

import { AuthModalProvider } from "@/components/auth/AuthModalProvider";
import { AuthModal } from "@/components/auth/AuthModal";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ana y Boo | Membresía Premium para Madres de Pomerania",
  description:
    "Acceso exclusivo a guías de cuidado, planes personalizados y asesoría directa para el bienestar de tu Pomerania.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f0e8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-[#F6F0E8] text-[#1A1A1A] font-sans antialiased">
        <AuthModalProvider>
          {children}
          <AuthModal />
        </AuthModalProvider>

        <Analytics />
      </body>
    </html>
  );
}