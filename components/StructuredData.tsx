export default function StructuredData() {
  const base = "https://howiezales.com";

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Howie Zales",
    alternateName: "Howie",
    url: base,
    image: `${base}/howie-front.png`,
    jobTitle: "Emmy-winning handheld camera operator, TV executive, podcast host",
    description:
      "Emmy Award-winning handheld camera operator, founder of HJZ Productions and co-founder + president of Viridity Entertainment Services, host of Operator Mindset podcast. Based in New York City.",
    telephone: "+1-917-453-2251",
    email: "info@hjzproductions.com",
    award: [
      "Emmy Award",
      "Super Bowl broadcast camera (NFL Network)",
      "Sunday Night Football camera (NBC Sports)",
      "Summer Olympics broadcast (Gymnastics, Swimming)",
      "Winter Olympics broadcast (Figure Skating)",
      "WrestleMania broadcast camera (WWE)",
      "NYC Marathon broadcast",
      "Triple Crown Horse Races",
      "Notre Dame Football",
    ],
    knowsAbout: [
      "Handheld camera operating",
      "Live sports broadcast production",
      "IATSE union crewing",
      "Broadcast television production",
      "Livestreaming",
      "Hybrid event production",
      "Corporate broadcast",
      "Podcast production",
      "AI operations",
      "Leadership",
    ],
    worksFor: [
      {
        "@type": "Organization",
        name: "HJZ Productions",
        url: "https://www.hjzproductions.com/",
      },
      {
        "@type": "Organization",
        name: "Viridity Entertainment Services",
        url: "https://www.viridityentertainment.com/",
      },
    ],
    sameAs: [
      "https://www.linkedin.com/in/howardzales/",
      "https://www.instagram.com/howiezales/",
      "https://www.instagram.com/viridityentertainment/",
      "https://www.linkedin.com/company/hjzproductions/",
      "https://www.facebook.com/hjzproductions/",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "New York",
      addressRegion: "NY",
      addressCountry: "US",
    },
  };

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${base}#hub`,
    name: "Howie Zales · Operator Mindset Hub",
    url: base,
    logo: `${base}/howie-profile.png`,
    founder: { "@type": "Person", name: "Howie Zales" },
    foundingDate: "2001",
    telephone: "+1-917-453-2251",
    email: "info@hjzproductions.com",
    sameAs: [
      "https://www.hjzproductions.com/",
      "https://www.viridityentertainment.com/",
      "https://www.linkedin.com/in/howardzales/",
      "https://www.instagram.com/howiezales/",
      "https://www.instagram.com/viridityentertainment/",
      "https://www.linkedin.com/company/hjzproductions/",
      "https://www.facebook.com/hjzproductions/",
    ],
    areaServed: [
      { "@type": "Place", name: "New York Metropolitan Area" },
      { "@type": "Place", name: "United States" },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "New York",
      addressRegion: "NY",
      addressCountry: "US",
    },
  };

  const podcast = {
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    name: "Operator Mindset",
    description:
      "The podcast where handheld camera operators, live sports producers, network executives, and founders sit across the desk and talk about the work behind the work. Hosted by Howie Zales, co-hosted by Athena.",
    url: `${base}/podcast`,
    image: `${base}/howie-new.png`,
    author: { "@type": "Person", name: "Howie Zales" },
    inLanguage: "en-US",
    genre: ["Broadcast", "Business", "Media", "AI", "Leadership"],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${base}#website`,
    url: base,
    name: "Howie Zales",
    description: "Operator Mindset hub for Howie Zales.",
    publisher: { "@id": `${base}#hub` },
  };

  const hjz = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    "@id": "https://www.hjzproductions.com/#business",
    name: "HJZ Productions",
    url: "https://www.hjzproductions.com/",
    description:
      "IATSE union broadcast crewing built for productions that can't afford a bad day. 25 years crewing for WWE, AEW, NBC Sports, Apple TV, DAZN, NEP, MLS, NWSL, IMG, Gravity Media, Gametime Productions, and Ross Productions.",
    telephone: "+1-917-453-2251",
    email: "info@hjzproductions.com",
    foundingDate: "2001",
    founder: { "@type": "Person", name: "Howie Zales" },
    priceRange: "$$$",
    areaServed: [
      { "@type": "City", name: "New York" },
      { "@type": "Place", name: "New York Metropolitan Area" },
      { "@type": "Country", name: "United States" },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "New York",
      addressRegion: "NY",
      addressCountry: "US",
    },
    serviceType: [
      "Broadcast crewing",
      "IATSE union camera crews",
      "ENG production",
      "Studio production",
      "Live sports broadcast",
    ],
  };

  const viridity = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    "@id": "https://www.viridityentertainment.com/#business",
    name: "Viridity Entertainment Services",
    url: "https://www.viridityentertainment.com/",
    description:
      "Livestream, hybrid, and corporate production for T-Mobile, Capital One, Food Network, GCI Health, Omaha Productions, 160over90, and Temple Beth Sholom. Fireside chats, LinkedIn Lives, galas, panels, virtual and hybrid events.",
    foundingDate: "2019",
    founder: { "@type": "Person", name: "Howie Zales" },
    priceRange: "$$$",
    areaServed: [
      { "@type": "City", name: "New York" },
      { "@type": "Place", name: "New York Metropolitan Area" },
      { "@type": "Country", name: "United States" },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "New York",
      addressRegion: "NY",
      addressCountry: "US",
    },
    serviceType: [
      "Livestream production",
      "Hybrid event production",
      "Corporate broadcast",
      "Fireside chat production",
      "LinkedIn Live production",
      "Panel discussion production",
      "Gala broadcast",
      "Virtual event production",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(podcast) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hjz) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(viridity) }}
      />
    </>
  );
}
