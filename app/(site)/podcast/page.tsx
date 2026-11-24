import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Podcast from "@/components/Podcast";
import EpisodesPreview from "@/components/EpisodesPreview";
import SubscribeGrid from "@/components/SubscribeGrid";
import PressLinks from "@/components/PressLinks";
import BookHowieForm from "@/components/BookHowieForm";
import PodcastGuestForm from "@/components/PodcastGuestForm";
import Newsletter from "@/components/Newsletter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSchema from "@/components/FAQSchema";

const PODCAST_FAQS = [
  {
    q: "What is Operator Mindset?",
    a: "Operator Mindset is a podcast for founders, leaders, and builders who think differently about how they run things. Leadership, execution, and the decisions that actually move the needle. Hosted by Emmy Award-winning camera operator Howie Zales, co-hosted by AI operator Athena.",
  },
  {
    q: "Where can I listen to Operator Mindset?",
    a: "Operator Mindset is available on Spotify, Apple Podcasts, Deezer, and YouTube. You can also listen to every episode directly from the embedded player on this page.",
  },
  {
    q: "How do I apply to be a guest on Operator Mindset?",
    a: "Fill out the Get on the Show form on this page. Howie personally reviews every application. He does not book guests, he finds operators. If you are building something worth talking about, apply and tell him what you are working on.",
  },
  {
    q: "How often are new episodes released?",
    a: "New Operator Mindset episodes drop monthly. 10 episodes and counting. Guests include founders, IATSE veterans, live production leaders, and an AI co-host who asks the questions most people are afraid to answer.",
  },
  {
    q: "Who is Athena, the AI co-host?",
    a: "Athena is an AI operator built on ACTi Beings who co-hosts full episodes of Operator Mindset. She interviews Howie and guests, brings diagnostic insight to conversations, and ensures every word lands. She also runs the operational back end of Howie's businesses.",
  },
];

export const metadata: Metadata = {
  title: "Operator Mindset Podcast",
  description:
    "Operator Mindset, the podcast where camera operators, producers, and founders sit across the desk and talk about the work behind the work. Hosted by Howie Zales, co-hosted by Athena.",
};

export default function PodcastPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", href: "/" },
          { name: "Podcast", href: "/podcast" },
        ]}
      />
      <FAQSchema faqs={PODCAST_FAQS} />
      <ScrollProgress />
      <Header />
      <main className="relative">
        <PageHero
          scene="03"
          variant="podcast"
          kicker="03 · The Podcast"
          title={"Operator Mindset."}
          greenWords={["mindset."]}
          subtitle="Leadership, execution, and building businesses that scale. The move from working in your business to operating on it. Systems, leadership, AI, technology. 10 episodes streaming everywhere."
        />
        <Podcast />
        <EpisodesPreview />
        <SubscribeGrid />
        <PressLinks />
        <PodcastGuestForm />
        <BookHowieForm />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
