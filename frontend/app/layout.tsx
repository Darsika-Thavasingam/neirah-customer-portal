import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import Header from "./components/Header";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Neirah Customer Portal",
    template: "%s | Neirah Customer Portal",
  },
  description:
    "Secure self-service portal for Neirah Construction OS customers — track your project, invoices, quotations, and payments.",
  keywords: ["construction", "project tracking", "customer portal", "Neirah"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable}`}
    >
      <body className="flex min-h-screen bg-[#F7F9FC] text-[#0B1220] antialiased flex-col lg:flex-row relative">
        <Header />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 relative z-10">
          {/* Global Architectural Blueprint Watermark Background (Matches Design Image) */}
          <div className="absolute top-0 left-0 right-0 h-[500px] overflow-hidden pointer-events-none -z-10 opacity-35 select-none transition-opacity">
            <img
              src="/images/project-highrise.png"
              alt=""
              className="w-full h-full object-cover object-top filter contrast-125 brightness-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F7F9FC]/30 to-[#F7F9FC]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#F7F9FC]/40 via-transparent to-[#F7F7F7]/60" />
          </div>
          {children}
        </main>
      </body>
    </html>
  );
}
