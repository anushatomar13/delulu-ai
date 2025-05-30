import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Rizz or Risk AI - Vibe Check Your Situationship',
  description: 'AI-powered relationship analyzer that tells you if you\'re smooth with the rizz or just deep in delulu. Swipe on red & green flags and get instant feedback!',
  keywords: 'rizz, dating, AI, relationship, delulu, red flags, green flags, situationship',
  authors: [{ name: 'Anusha Tomar' }],
  openGraph: {
    title: 'Rizz or Risk AI',
    description: 'AI-powered vibe check for your situationship!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rizz or Risk AI',
    description: 'AI-powered vibe check for your situationship!',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>
          <div className="min-h-screen">
            <main className="relative">
              {children}
            </main>
          </div>
      </body>
    </html>
  );
}