import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { brand } from "@/config/brand";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getCurrentCountry } from "@/lib/country/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${brand.name} – Online loan application`,
  description: brand.description,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const country = await getCurrentCountry();
  return (
    <html lang="en">
      <body className={`${geistSans.variable} flex min-h-screen flex-col antialiased`}>
        <Header country={country} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}