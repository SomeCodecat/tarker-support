import type { Metadata } from "next";
import {
  Barlow_Semi_Condensed,
  Chakra_Petch,
  JetBrains_Mono,
} from "next/font/google";
import { AppShell } from "@/components/shell/app-shell";
import "./globals.css";

const display = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

const sans = Barlow_Semi_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Tarkov Support",
  description:
    "A companion app for Escape from Tarkov: items, ammo, quests, traders, and hideout.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg text-fg">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
