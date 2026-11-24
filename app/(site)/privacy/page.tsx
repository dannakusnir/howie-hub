import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import {
  LegalShell,
  LegalSection,
  LegalP,
  LegalList,
  LegalNote,
  LegalTable,
} from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How howiezales.com collects, uses, and protects your information. What we collect, why we collect it, who we share it with, and the choices you have.",
};

const TOC = [
  { n: "01", title: "Who we are" },
  { n: "02", title: "What we collect" },
  { n: "03", title: "How we use it" },
  { n: "04", title: "Consent and marketing" },
  { n: "05", title: "Who we share it with" },
  { n: "06", title: "Athena and third-party services" },
  { n: "07", title: "Cookies and analytics" },
  { n: "08", title: "How long we keep it" },
  { n: "09", title: "Your rights" },
  { n: "10", title: "Security" },
  { n: "11", title: "Children" },
  { n: "12", title: "Changes" },
  { n: "13", title: "Contact" },
];

export default function PrivacyPage() {
  return (
    <>
      <ScrollProgress />
      <Header />
      <main className="relative">
        <PageHero
          scene="09"
          variant="press"
          kicker="09 · Legal"
          title={"Privacy Policy."}
          greenWords={["Policy."]}
          subtitle="What we collect, why we collect it, and what you can do about it. Written to be read, not to be skipped."
        />

        <LegalShell updated="August 24, 2026" toc={TOC}>
          <LegalSection n="01" title="Who we are">
            <LegalP>
              This site, howiezales.com, is operated by EZ Ventures LLC (&ldquo;we,&rdquo;
              &ldquo;us,&rdquo; &ldquo;our&rdquo;), the business entity of Howie Zales. This
              policy covers the information we collect through this website.
            </LegalP>
            <LegalP>
              It does not cover HJZ Productions or Viridity Entertainment Services client
              engagements, which are governed by the contracts signed for that work. It also does
              not cover Athena, which is a separate product operated by a different company. See
              section 06.
            </LegalP>
          </LegalSection>

          <LegalSection n="02" title="What we collect">
            <LegalP>
              We collect only what you give us and a small amount of standard technical data.
            </LegalP>
            <LegalP>
              <strong className="text-white">Information you give us.</strong> When you submit a
              form on this site, whether that is the newsletter signup, the podcast guest
              application, or a booking or press inquiry, we collect:
            </LegalP>
            <LegalList
              items={[
                "Your name",
                "Your email address",
                "Your phone number, when you choose to provide it",
                "Your company and role, when you choose to provide them",
                "Anything you write in a message, pitch, or links field",
                "Which form you submitted and when",
              ]}
            />
            <LegalP>
              <strong className="text-white">Information collected automatically.</strong> Our
              hosting and analytics provider records anonymized page views, referring pages, device
              and browser type, approximate region, and basic performance data. We do not run
              cross-site tracking on this website.
            </LegalP>
            <LegalP>
              We do not collect payment information on this site. We do not sell anything here.
            </LegalP>
          </LegalSection>

          <LegalSection n="03" title="How we use it">
            <LegalList
              items={[
                "To answer your inquiry, whether that is crewing, speaking, press, or a podcast guest application",
                "To send you the newsletter, if you asked for it",
                "To understand which pages people read so we can improve the site",
                "To keep the site working and protect it from abuse",
                "To meet legal obligations when they apply",
              ]}
            />
            <LegalP>
              We do not sell your information. We do not trade it. We do not share it with
              advertisers.
            </LegalP>
          </LegalSection>

          <LegalSection n="04" title="Consent and marketing">
            <LegalP>
              We add you to the newsletter only when you ask us to. Every form that results in
              marketing email carries a checkbox you have to tick yourself. It is never pre-ticked.
            </LegalP>
            <LegalP>
              Every marketing email includes an unsubscribe link. Unsubscribing takes effect right
              away and does not affect a business conversation already in progress.
            </LegalP>
            <LegalP>
              If you give us a phone number, we use it to reply to your inquiry. We do not add you
              to an SMS marketing list from a website form. If we ever want to text you marketing,
              we will ask for that separately and explicitly.
            </LegalP>
          </LegalSection>

          <LegalSection n="05" title="Who we share it with">
            <LegalP>
              We share your information only with the services we need to run this site and respond
              to you.
            </LegalP>
            <LegalTable
              rows={[
                {
                  k: "GoHighLevel",
                  v: "Stores form submissions and sends email. This is where your inquiry lands.",
                },
                {
                  k: "Vercel",
                  v: "Hosts the website and provides anonymized traffic analytics.",
                },
                {
                  k: "Google Analytics",
                  v: "Aggregated traffic measurement. No advertising or remarketing profiles.",
                },
              ]}
            />
            <LegalP>
              We may also disclose information when the law requires it, or to protect the rights
              and safety of people involved. If the business is ever sold or reorganized, your
              information may transfer with it under the same protections described here.
            </LegalP>
          </LegalSection>

          <LegalSection n="06" title="Athena and third-party services">
            <LegalNote>
              Athena is a product of Actualized Intelligence, LLC (ACTi), a separate company. Howie
              Zales uses Athena in his own businesses and talks about her publicly because he
              believes in the product. He does not own, operate, host, or bill for her.
            </LegalNote>
            <LegalP>
              When you click through from this site to Athena, or to any other outside site such as
              HJZ Productions, Viridity Entertainment Services, a podcast platform, or a partner
              webinar, you leave howiezales.com. From that moment on, that company&rsquo;s privacy
              policy and terms govern what happens to your data, not ours.
            </LegalP>
            <LegalP>
              We do not receive your Athena account data, conversation transcripts, subscription
              details, or payment information. Questions about Athena, including access, billing,
              cancellation, or refunds, go to ACTi at{" "}
              <a
                href="mailto:info@acti.ai"
                className="text-green hover:text-white transition-colors"
              >
                info@acti.ai
              </a>
              .
            </LegalP>
          </LegalSection>

          <LegalSection n="07" title="Cookies and analytics">
            <LegalP>
              We use a small number of cookies and similar technologies to keep the site working
              and to count visits. We do not use advertising or retargeting cookies on this site.
            </LegalP>
            <LegalList
              items={[
                "Essential — required for the site to load and forms to submit",
                "Analytics — aggregated page views and performance, used to improve the site",
              ]}
            />
            <LegalP>
              You can block or clear cookies in your browser settings. The site will still work,
              though some preferences will not be remembered.
            </LegalP>
          </LegalSection>

          <LegalSection n="08" title="How long we keep it">
            <LegalP>
              We keep inquiry and newsletter records for as long as the relationship is active, and
              afterward only as long as we need them for legitimate business or legal reasons.
              Analytics data is aggregated and retained for no more than 14 months.
            </LegalP>
            <LegalP>
              You can ask us to delete your record at any time. See section 09.
            </LegalP>
          </LegalSection>

          <LegalSection n="09" title="Your rights">
            <LegalP>
              Depending on where you live, you may have the right to do any of the following:
            </LegalP>
            <LegalList
              items={[
                "Ask what personal information we hold about you and get a copy",
                "Correct information that is wrong",
                "Ask us to delete your information",
                "Withdraw consent to marketing at any time",
                "Object to a particular use of your information",
              ]}
            />
            <LegalP>
              To exercise any of these, email{" "}
              <a
                href="mailto:info@hjzproductions.com"
                className="text-green hover:text-white transition-colors"
              >
                info@hjzproductions.com
              </a>
              . We will respond within the time the law allows.
            </LegalP>
            <LegalP>
              We do not sell or share personal information as those terms are defined under the
              California Consumer Privacy Act. If that ever changes, we will post a
              &ldquo;Do Not Sell or Share My Personal Information&rdquo; link on this site.
            </LegalP>
          </LegalSection>

          <LegalSection n="10" title="Security">
            <LegalP>
              The site runs over HTTPS. Form submissions are transmitted encrypted and stored with
              our providers under their security controls and our contracts with them. No system is
              perfectly secure, but we take reasonable measures and we do not keep data we do not
              need.
            </LegalP>
          </LegalSection>

          <LegalSection n="11" title="Children">
            <LegalP>
              This site is meant for adults working in broadcast, production, and business. We do
              not knowingly collect information from anyone under 16. If you believe a child has
              submitted information to us, contact us and we will delete it.
            </LegalP>
          </LegalSection>

          <LegalSection n="12" title="Changes">
            <LegalP>
              We may update this policy. When we make a material change, we will update the date at
              the top of this page and, where appropriate, tell you by email. Continuing to use the
              site after a change means you accept the updated policy.
            </LegalP>
          </LegalSection>

          <LegalSection n="13" title="Contact">
            <LegalP>
              Questions about this policy, or about the information we hold:
            </LegalP>
            <LegalTable
              rows={[
                { k: "Entity", v: "EZ Ventures LLC" },
                { k: "Email", v: "info@hjzproductions.com" },
                { k: "Phone", v: "917-453-2251" },
                { k: "Location", v: "New York, NY" },
              ]}
            />
            <LegalP>
              See also our{" "}
              <Link href="/terms" className="text-green hover:text-white transition-colors">
                Terms of Use
              </Link>
              .
            </LegalP>
          </LegalSection>
        </LegalShell>
      </main>
      <Footer />
    </>
  );
}
