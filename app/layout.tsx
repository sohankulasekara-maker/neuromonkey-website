import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import VoiceAssistant from "@/components/VoiceAssistant";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Neuro Monkey",
  description: "We build intelligent automation systems that save you time, money, and headcount. AI-powered solutions for sales, marketing, customer service, and operations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen bg-black text-white">
        <SmoothScroll>{children}</SmoothScroll>
        <VoiceAssistant />
      </body>
    </html>
  );
}
