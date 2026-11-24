import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Vision from "@/components/Vision";
import Ecosystem from "@/components/Ecosystem";
import Podcast from "@/components/Podcast";
import CredentialsWall from "@/components/CredentialsWall";
import Athena from "@/components/Athena";
import CyberWebinarCallout from "@/components/CyberWebinarCallout";
import BroadcastCourse from "@/components/BroadcastCourse";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import AsFeaturedOn from "@/components/AsFeaturedOn";
import PodcastGuestForm from "@/components/PodcastGuestForm";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <Header />
      <main className="relative">
        <Hero />
        <Vision />
        <Ecosystem />
        <Podcast />
        <CredentialsWall />
        <Athena />
        <Testimonials />
        <CyberWebinarCallout />
        <BroadcastCourse ctaHref="#podcast-guest" />
        <AsFeaturedOn />
        <Newsletter />
        <PodcastGuestForm />
        <Footer />
      </main>
    </>
  );
}
