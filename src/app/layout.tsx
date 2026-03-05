import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import MainLayout from "@/components/layout";
import AppInitializer from "@/provider/AppInitializer";
import CommonToast from "@/components/common-toast";
import SolanaProvider from "@/provider/SolanaProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import "./globals.css";

const geist = Geist_Mono({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-Lander",
  description: "Solana utility platform for bulk transfers, snapshots, and airdrops",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable}  antialiased`}>
        <GoogleAnalytics />
        <SolanaProvider>
          <AppInitializer />
          <MainLayout>{children}</MainLayout>
          <CommonToast />
        </SolanaProvider>
      </body>
    </html>
  );
}
