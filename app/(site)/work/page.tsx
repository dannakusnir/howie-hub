import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Ecosystem from "@/components/Ecosystem";
import CaseStudies from "@/components/CaseStudies";
import HowWeWork from "@/components/HowWeWork";
import CyberWebinarCallout from "@/components/CyberWebinarCallout";
import BroadcastCourse from "@/components/BroadcastCourse";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";

export const metadata: Metadata = {
  title: "The Work",
  description:
    "HJZ Productions. Viridity Entertainment. Operator Mindset podcast. Athena. Plus features: Covered Not Voided webinar with Techmentum, Broadcast Sports Course. Four lenses, one operator.",
};

export default function WorkPage() {
  return (
    <>
      <ScrollProgress />
      <Header />
      <main className="relative">
        <PageHero
          scene="02"
          variant="work"
          kicker="02 · The Work"
          title={"Four lenses. One operator."}
          greenWords={["operator."]}
          subtitle="HJZ Productions crews broadcast. Viridity delivers livestream. Operator Mindset runs the podcast. Athena runs the day. Everything Howie has built."
        />
        <Ecosystem />
        <HowWeWork />
        <CaseStudies />
        <CyberWebinarCallout />
        <BroadcastCourse ctaHref="/podcast#podcast-guest" />
      </main>
      <Footer />
    </>
  );
}
