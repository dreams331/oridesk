import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OriDesk — Smarter Support. Safer Agents. Happier Customers.",
  description:
    "OriDesk is an AI-powered customer service platform by Ori Global Ltd. Manage agents, automate support, and protect customer data — all in one place.",
  keywords: ["customer service", "AI support", "help desk", "live chat", "OriDesk", "Ori Global"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
