import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import SupabaseProvider from "./components/SupabaseProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "rizzORrisk.ai",
  description: "AI-powered vibe check for your situationship!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}
