'use client';
import { Poppins, Geist_Mono, Abhaya_Libre } from 'next/font/google';

import '@workspace/ui/globals.css';
import { Providers } from '@/components/providers';

const fontSans = Poppins({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: '400',
});
const fontSans600 = Poppins({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: '600',
});
const fontSans500 = Poppins({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: '500',
});
const fontSans300 = Poppins({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: '300',
});

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

const fontSerif = Abhaya_Libre({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-serif',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} ${fontSerif.variable} ${fontSans600.variable} ${fontSans500.variable} ${fontSans300.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
