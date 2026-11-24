import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Vision from "@/components/Vision";
import Timeline from "@/components/Timeline";
import AwardsWall from "@/components/AwardsWall";
import CredentialsWall from "@/components/CredentialsWall";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";

export const metadata: Metadata = {
  title: "Vision",
  description:
    "Twenty-five years behind the camera, three businesses built. The vision that connects the operator mindset across every play Howie Zales makes.",
};

export default function VisionPage() {
  return (
    <>
      <ScrollProgress />
      <Header />
      <main className="relative">
        <PageHero
          scene="01"
          variant="vision"
          bigYear="2001"
          kicker="01 · The Vision"
          title={"See the shot before the shot happens."}
          greenWords={["before"]}
          subtitle="The vision that turned a camera operator into a multi-business founder. Twenty-five years of watching the game before it plays."
        />
        <Vision />
        <AwardsWall />
        <Timeline />
        <CredentialsWall />
      </main>
      <Footer />
    </>
  );
}
