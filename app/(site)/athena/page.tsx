import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Athena from "@/components/Athena";
import AthenaVideoHero from "@/components/AthenaVideoHero";
import AthenaCapabilities from "@/components/AthenaCapabilities";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSchema from "@/components/FAQSchema";

const ATHENA_FAQS = [
  {
    q: "What is Athena?",
    a: "Athena is an AI operator built on ACTi Beings. She runs the operational back end of two production companies (HJZ Productions and Viridity Entertainment Services) and co-hosts the Operator Mindset podcast with Howie Zales. She is not a chatbot. She is an operator that handles meetings, follow-through, prep dossiers, contract precision, and decision logs.",
  },
  {
    q: "How is Athena different from ChatGPT or other AI assistants?",
    a: "Athena does not wait for instructions. She anticipates. She triages meetings by strategic fit not politeness, pre-reads contracts to surface the three lines that shift leverage, and drafts follow-ups in Howie's voice before he notices a ball was dropped. She is a strategic partner, not a tool.",
  },
  {
    q: "Can I hire Athena for my own business?",
    a: "Yes. Athena is available for subscription through ACTi Beings. Anyone ready to operate at this level in their business, their calls, their meetings, and their life can access her. Visit go.acti.ai/go/athena_subscription for details.",
  },
  {
    q: "Who built Athena?",
    a: "Athena was built in partnership between Howie Zales and ACTi Beings. Howie designed her to run his production companies and podcast, then opened her up so other operators could use her too.",
  },
  {
    q: "Does Athena actually appear on the Operator Mindset podcast?",
    a: "Yes. Athena co-hosts full episodes of Operator Mindset. She interviews Howie about the businesses, the plays, and the decisions most people never think to ask about. Guests also engage with her directly during the show.",
  },
];

export const metadata: Metadata = {
  title: "Athena, AI Operator",
  description:
    "Athena is Howie's AI operator. She runs the day to day and co-hosts Operator Mindset. Powered by ACTi Beings.",
};

const ATHENA_VIDEO_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: "Meet Athena, Howie's AI Operator",
  description:
    "Athena, the AI operator behind Howie Zales's businesses and co-host of Operator Mindset, introduces herself in her own words. Built on ACTi Beings.",
  thumbnailUrl: "https://howiezales.com/athena-podcast-poster.jpg",
  uploadDate: "2026-08-06",
  contentUrl: "https://howiezales.com/athena-podcast.mp4",
  duration: "PT37S",
  publisher: {
    "@type": "Organization",
    name: "Howie Zales · Operator Mindset Hub",
    url: "https://howiezales.com",
    logo: {
      "@type": "ImageObject",
      url: "https://howiezales.com/howie-profile.png",
    },
  },
};

const ATHENA_SPEAKABLE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  url: "https://howiezales.com/athena",
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", "h2", ".speakable"],
  },
};

export default function AthenaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ATHENA_VIDEO_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ATHENA_SPEAKABLE_SCHEMA) }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", href: "/" },
          { name: "Athena", href: "/athena" },
        ]}
      />
      <FAQSchema faqs={ATHENA_FAQS} />
      <ScrollProgress />
      <Header />
      <main className="relative">
        <PageHero
          scene="05"
          variant="athena"
          kicker="05 · Meet Athena"
          title={"The AI operator behind the operator."}
          greenWords={["behind", "the", "operator."]}
          subtitle="Not a chatbot. An operator. Meetings, follow ups, decisions, prep. She runs Howie's day and co-hosts Operator Mindset."
        />
        <AthenaVideoHero />
        <Athena />
        <AthenaCapabilities />
      </main>
      <Footer />
    </>
  );
}
