import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { SwRegister } from "./sw-register";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Inmobot",
  description: "Comparador de deptos para alquilar",
  appleWebApp: { capable: true, title: "Inmobot", statusBarStyle: "default" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#c2410c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <SwRegister />
        <div className="mx-auto flex min-h-dvh max-w-xl flex-col pb-[calc(env(safe-area-inset-bottom)+5rem)]">
          {children}
        </div>
        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
          <div className="mx-auto grid max-w-xl grid-cols-4 text-center text-xs font-medium">
            <Link href="/" className="py-3">🏠<br />Deptos</Link>
            <Link href="/compare" className="py-3">📊<br />Comparar</Link>
            <Link href="/questions" className="py-3">❓<br />Preguntas</Link>
            <Link href="/my-living" className="py-3">🛋️<br />Mi living</Link>
          </div>
        </nav>
      </body>
    </html>
  );
}
