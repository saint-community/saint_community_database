// 'use client';
/* eslint-disable react/no-children-prop */
import './globals.css';
import { Abhaya_Libre, Geist_Mono, Poppins } from 'next/font/google';
import { Toaster } from '@workspace/ui/lib/sonner';
import { Providers } from '@/src/components/providers';
import { Metadata } from 'next';

const fontSans = Poppins({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: "400",
});
const fontSans600 = Poppins({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: "600",
});
const fontSans500 = Poppins({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: "500",
});
const fontSans300 = Poppins({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: "300",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const fontSerif = Abhaya_Libre({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: 'Saints Community - Analytics Portal',
  description: 'Saints Community Analytics Portal Login',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${fontSans.variable} ${fontMono.variable} ${fontSerif.variable} ${fontSans600.variable} ${fontSans500.variable} ${fontSans300.variable} font-sans antialiased bg-[#fafafa]`}
      >
        <Providers>{children}</Providers>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
