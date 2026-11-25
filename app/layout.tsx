import type { Metadata, Viewport } from "next";
import { Google_Sans_Code, Inter } from "next/font/google";
import NeuralField from "@/components/NeuralField";
import ImmersiveLayer from "@/components/immersive/ImmersiveLayer";
import ScrollProgress from "@/components/ScrollProgress";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
/* The brand's secondary face: labels, counters and the console. */
const code = Google_Sans_Code({ subsets: ["latin"], variable: "--font-code" });

export const metadata: Metadata = {
  title: "Neuro Monkey",
  description: "Web development and AI automation. We build fast custom websites and intelligent automation systems that save you time, money, and headcount across sales, marketing, customer service, and operations.",
};

export const viewport: Viewport = { themeColor: "#000000" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${code.variable} antialiased`}>
      <body className="min-h-screen bg-black text-white">
        {/* The star field: fixed behind every section of the site. */}
        <NeuralField className="fixed inset-0 -z-10" />
        {/* The WebGL layer (glass form in the hero, iridescent form by contact),
            loaded after first paint. Sits above the star field, below content. */}
        <ImmersiveLayer />
        <ScrollProgress />
        <SmoothScroll>{children}</SmoothScroll>
        {/* The "Ask Anything" voice button (components/VoiceAssistant.tsx) is off:
            the Vapi account ran out of credit on 14 Nov 2026, so every call failed.
            Top the account up, then render <VoiceAssistant /> here again. */}
      </body>
    </html>
  );
}
