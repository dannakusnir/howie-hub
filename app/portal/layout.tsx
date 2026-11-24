import type { Metadata } from "next";
import "./portal.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Client Portal", template: "%s | Howie Zales Portal" },
  description: "Private coaching portal for Howie Zales clients.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  openGraph: null,
  twitter: null,
  keywords: null,
};

export default function PortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="portal">{children}</div>;
}
