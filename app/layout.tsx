import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import ClientProvider from "@/components/ClientProvider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FinTrack",
  description: "Personal Finance Management Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-dark-300 font-inter antialiased",
          inter.variable
        )}
      >
        {/* Wrap the entire app with the Redux Provider */}
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
