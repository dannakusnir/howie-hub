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
  title: "Terms of Use",
  description:
    "The terms for using howiezales.com. What this site is, what it is not, how forms and inquiries work, and how third-party products like Athena are handled.",
};

const TOC = [
  { n: "01", title: "About these terms" },
  { n: "02", title: "What this site is" },
  { n: "03", title: "Forms and inquiries" },
  { n: "04", title: "Third-party products and links" },
  { n: "05", title: "No sales, no refunds, no billing" },
  { n: "06", title: "Content and intellectual property" },
  { n: "07", title: "Acceptable use" },
  { n: "08", title: "No professional advice" },
  { n: "09", title: "Availability" },
  { n: "10", title: "Disclaimers" },
  { n: "11", title: "Limitation of liability" },
  { n: "12", title: "Governing law" },
  { n: "13", title: "Changes" },
  { n: "14", title: "Contact" },
];

export default function TermsPage() {
  return (
    <>
      <ScrollProgress />
      <Header />
      <main className="relative">
        <PageHero
          scene="10"
          variant="press"
          kicker="10 · Legal"
          title={"Terms of Use."}
          greenWords={["Use."]}
          subtitle="The rules for using this website. Short, plain, and honest about what this site does and does not do."
        />

        <LegalShell updated="August 24, 2026" toc={TOC}>
          <LegalSection n="01" title="About these terms">
            <LegalP>
              These terms are an agreement between you and EZ Ventures LLC (&ldquo;we,&rdquo;
              &ldquo;us,&rdquo; &ldquo;our&rdquo;), the business entity of Howie Zales, covering
              your use of howiezales.com. By using this site you accept them. If you do not, please
              do not use the site.
            </LegalP>
            <LegalP>
              Read these alongside our{" "}
              <Link href="/privacy" className="text-green hover:text-white transition-colors">
                Privacy Policy
              </Link>
              , which covers what happens to your information.
            </LegalP>
          </LegalSection>

          <LegalSection n="02" title="What this site is">
            <LegalP>
              howiezales.com is an informational website. It presents Howie&rsquo;s work, his
              companies, the Operator Mindset podcast, written articles, press materials, and ways
              to get in touch.
            </LegalP>
            <LegalP>
              Crewing, production, speaking, and any other engagement is arranged separately and
              governed by the contract signed for that work. Nothing on this site is an offer, a
              quote, or a binding commitment to provide services.
            </LegalP>
          </LegalSection>

          <LegalSection n="03" title="Forms and inquiries">
            <LegalP>
              You can use the forms on this site to subscribe to the newsletter, apply to be a
              podcast guest, or send a booking or press inquiry.
            </LegalP>
            <LegalList
              items={[
                "Submitting a form does not create a contract or guarantee a reply, a booking, or a podcast appearance",
                "You must give accurate information and you must have the right to give us anything you submit",
                "Marketing email is opt-in only, and you can unsubscribe from any message",
                "We may decline or ignore submissions that are spam, abusive, or automated",
              ]}
            />
          </LegalSection>

          <LegalSection n="04" title="Third-party products and links">
            <LegalNote>
              Athena is a product of Actualized Intelligence, LLC (ACTi), a separate company. Howie
              Zales uses Athena in his own businesses and refers people to her because he believes
              in the product. He does not own, operate, host, support, or bill for Athena, and EZ
              Ventures LLC is not a party to your agreement with ACTi.
            </LegalNote>
            <LegalP>
              If you sign up for Athena, your relationship is entirely with ACTi and is governed by
              ACTi&rsquo;s own terms and privacy notice. Anything to do with access, pricing,
              subscriptions, billing, cancellation, refunds, service availability, or the content
              of Athena&rsquo;s responses is ACTi&rsquo;s responsibility. Contact them at{" "}
              <a
                href="mailto:info@acti.ai"
                className="text-green hover:text-white transition-colors"
              >
                info@acti.ai
              </a>
              .
            </LegalP>
            <LegalP>
              The same applies to every other outside destination we link to, including HJZ
              Productions, Viridity Entertainment Services, podcast platforms, partner webinars,
              and social networks. We link to them because they are relevant. We do not control
              them and we are not responsible for their content, products, or practices.
            </LegalP>
          </LegalSection>

          <LegalSection n="05" title="No sales, no refunds, no billing">
            <LegalP>
              This website does not sell anything. It takes no payments, holds no card details,
              runs no subscriptions, and issues no invoices.
            </LegalP>
            <LegalP>
              Because nothing is sold here, there is no refund policy on this site. If you bought
              something from another company after finding it through this site, including Athena
              or a partner program, that company handles its own billing and refunds under its own
              terms. Direct those requests to them.
            </LegalP>
          </LegalSection>

          <LegalSection n="06" title="Content and intellectual property">
            <LegalP>
              The text, articles, photographs, video, design, code, and branding on this site belong
              to EZ Ventures LLC or its licensors and are protected by copyright and trademark law.
            </LegalP>
            <LegalP>
              You may read, quote briefly with attribution, and share links. Press and media may use
              the bios and headshots on the{" "}
              <Link href="/press" className="text-green hover:text-white transition-colors">
                press page
              </Link>{" "}
              for coverage about Howie. Beyond that, do not copy, republish, scrape, or use this
              content commercially, or to train an AI model, without written permission.
            </LegalP>
            <LegalP>
              Third-party names, logos, and credits shown on this site belong to their respective
              owners and appear as factual references to work performed.
            </LegalP>
          </LegalSection>

          <LegalSection n="07" title="Acceptable use">
            <LegalP>When using this site, do not:</LegalP>
            <LegalList
              items={[
                "Break the law or use the site to harm anyone",
                "Attempt to disrupt, damage, probe, or gain unauthorized access to the site or its systems",
                "Scrape or harvest content or contact details at scale",
                "Submit false information, impersonate someone, or send spam through the forms",
                "Misrepresent your relationship with Howie Zales or his companies",
              ]}
            />
            <LegalP>
              We may block access if the site is being misused.
            </LegalP>
          </LegalSection>

          <LegalSection n="08" title="No professional advice">
            <LegalP>
              Articles, podcast episodes, and other content on this site are shared from experience
              and are for general information. They are not legal, financial, medical, or
              employment advice, and reading them does not create a professional relationship.
              Decisions about your own business are yours. Where the stakes are high, talk to a
              qualified professional.
            </LegalP>
          </LegalSection>

          <LegalSection n="09" title="Availability">
            <LegalP>
              We work to keep the site up and accurate, but we do not promise it will always be
              available, error free, or current. We may change, add, or remove anything on the site
              at any time.
            </LegalP>
          </LegalSection>

          <LegalSection n="10" title="Disclaimers">
            <LegalP>
              This site is provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo; To the
              fullest extent the law allows, we disclaim all warranties that are not written into
              these terms, including implied warranties of merchantability, fitness for a
              particular purpose, and non-infringement.
            </LegalP>
          </LegalSection>

          <LegalSection n="11" title="Limitation of liability">
            <LegalP>
              To the fullest extent the law allows, EZ Ventures LLC and its affiliates are not
              liable for indirect, incidental, special, or consequential damages, or for lost
              profits, data, or goodwill, arising from your use of this site or from anything you
              obtained through a third-party service you found here.
            </LegalP>
          </LegalSection>

          <LegalSection n="12" title="Governing law">
            <LegalP>
              These terms are governed by the laws of the State of New York, without regard to
              conflict-of-law rules. Any dispute relating to these terms or to this site will be
              handled in the state or federal courts located in New York, and you agree to that
              jurisdiction.
            </LegalP>
          </LegalSection>

          <LegalSection n="13" title="Changes">
            <LegalP>
              We may update these terms. When we do, we will change the date at the top of this
              page. Continuing to use the site after that means you accept the updated terms.
            </LegalP>
          </LegalSection>

          <LegalSection n="14" title="Contact">
            <LegalTable
              rows={[
                { k: "Entity", v: "EZ Ventures LLC" },
                { k: "Email", v: "info@hjzproductions.com" },
                { k: "Phone", v: "917-453-2251" },
                { k: "Location", v: "New York, NY" },
              ]}
            />
            <LegalP>
              For anything about Athena, including billing and refunds, contact ACTi at{" "}
              <a
                href="mailto:info@acti.ai"
                className="text-green hover:text-white transition-colors"
              >
                info@acti.ai
              </a>
              .
            </LegalP>
          </LegalSection>
        </LegalShell>
      </main>
      <Footer />
    </>
  );
}
