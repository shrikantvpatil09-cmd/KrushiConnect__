import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import { Navbar, Footer } from "@/components/ui";

export const metadata: Metadata = { title: "KrishiConnect — Empowering Farmers, Connecting Agriculture", description: "Buy, Sell and Rent Everything You Need for Farming. English, Hindi and Marathi." };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fdfcf7] font-sans text-slate-900 antialiased">
        <LanguageProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
