import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'GlazeCorp',
  description: 'Donut Miner Protocol',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`
          ${inter.variable}
          ${jetbrainsMono.variable}
          font-sans
          bg-[#020202]
          text-zinc-300
          antialiased
          h-screen
          w-screen
          overflow-hidden
        `}
      >
        {/* Background Grid Effect */}
        <div className="fixed inset-0 bg-grid pointer-events-none z-0" />

        {/* Main App Container */}
        <Providers>
          {children}
        </Providers>

        {/* CRT Scanlines Effect */}
        <div className="scanlines" />
      </body>
    </html>
  );
}
