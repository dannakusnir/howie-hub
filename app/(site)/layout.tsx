import { GoogleAnalytics } from "@next/third-parties/google";
import ClientEffects from "@/components/ClientEffects";
import PageTransition from "@/components/PageTransition";
import StructuredData from "@/components/StructuredData";

const GA_ID = "G-34C463TNPE";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="custom-cursor min-h-screen">
      <StructuredData />
      <ClientEffects />
      <PageTransition>{children}</PageTransition>
      <GoogleAnalytics gaId={GA_ID} />
    </div>
  );
}
