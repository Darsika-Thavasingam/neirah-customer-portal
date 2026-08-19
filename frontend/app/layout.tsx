import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import Header from "./components/Header";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Neirah Customer Portal",
  description: "Customer portal for project, quotation, contract and invoice access",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F7F9FC] text-[#0B1220] antialiased">
        <Header />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
