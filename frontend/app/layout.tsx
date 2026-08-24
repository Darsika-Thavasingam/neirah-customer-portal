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
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-[#F7F9FC] text-[#0B1220] antialiased">
        <Header />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
