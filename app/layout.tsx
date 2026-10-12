import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import ClientEffects from "@/components/ClientEffects";
import PageTransition from "@/components/PageTransition";
import StructuredData from "@/components/StructuredData";

const GA_ID = "G-34C463TNPE";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://howiezales.com"),
  title: {
    default: "Howie Zales | Operator Mindset",
    template: "%s | Howie Zales",
  },
  description:
    "Emmy Award-winning handheld camera operator and TV executive. Founder of HJZ Productions (IATSE union crews for NFL Network, WWE, NBC Sports). Co-founder of Viridity Entertainment Services. Host of Operator Mindset podcast. NYC.",
  keywords: [
    "Howie Zales",
    "HJZ Productions",
    "Viridity Entertainment Services",
    "Operator Mindset podcast",
    "Emmy Award camera operator",
    "handheld camera operator",
    "IATSE union crews",
    "Super Bowl camera operator",
    "NFL Network handheld camera",
    "NBC Sports camera",
    "WWE camera operator",
    "Sunday Night Football camera",
    "NYC Marathon broadcast",
    "Olympic Games broadcast camera",
    "WrestleMania backstage camera",
    "New York broadcast production",
    "TV production crewing NYC",
    "livestream production NYC",
    "hybrid event production",
    "corporate livestream",
    "Athena AI operator",
    "ACTi Beings",
    "podcast guest interview",
    "broadcast operator speaker",
  ],
  verification: {
    google: "sbfqByYDGyONKwWMdcl95n-XTvbJg1qu-wDHG1vhVeg",
  },
  authors: [{ name: "Howie Zales" }],
  creator: "Howie Zales",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://howiezales.com",
    siteName: "Howie Zales",
    title: "Howie Zales | Operator Mindset",
    description:
      "Emmy Award-winning handheld camera operator. Founder HJZ Productions. Co-founder Viridity Entertainment Services. Host of Operator Mindset. NYC.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Howie Zales | Operator Mindset",
    description:
      "Emmy-winning handheld camera operator. HJZ Productions. Viridity Entertainment. Operator Mindset podcast.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <head>
        <StructuredData />
      </head>
      <body className="bg-black text-white antialiased custom-cursor">
        <ClientEffects />
        <PageTransition>{children}</PageTransition>
      </body>
      <GoogleAnalytics gaId={GA_ID} />
    </html>
  );
}
