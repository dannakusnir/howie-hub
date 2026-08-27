import { ReactNode } from "react";
import Link from "next/link";

export type FAQ = { q: string; a: string };

export type Post = {
  slug: string;
  title: string;
  subhead?: string;
  excerpt: string;
  date: string;
  isoDate: string;
  read: string;
  tag: string;
  author: string;
  episode?: string;
  faqs?: FAQ[];
  body: ReactNode;
};

function P({ children }: { children: ReactNode }) {
  return <p className="text-lg text-white/85 leading-8 mb-6">{children}</p>;
}

function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-3xl md:text-4xl font-black tracking-[-0.02em] text-white mt-16 mb-6 leading-tight">
      {children}
    </h2>
  );
}

function H3({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-xl md:text-2xl font-black tracking-[-0.01em] text-white mt-10 mb-4 leading-tight">
      {children}
    </h3>
  );
}

function Pull({ children }: { children: ReactNode }) {
  return (
    <blockquote className="my-12 pl-8 py-2 border-l-2 border-green">
      <p className="text-2xl md:text-3xl font-black text-white leading-tight tracking-[-0.02em]">
        {children}
      </p>
    </blockquote>
  );
}

function Quote({ text, ts }: { text: string; ts?: string }) {
  return (
    <blockquote className="my-8 pl-6 py-3 border-l-2 border-green/60 bg-green/[0.03] rounded-r-lg">
      <p className="text-lg md:text-xl text-white leading-relaxed italic">"{text}"</p>
      {ts && (
        <div className="mt-2 font-mono text-[10px] tracking-[0.3em] uppercase text-green/70">
          Timestamp · {ts}
        </div>
      )}
    </blockquote>
  );
}

function UL({ children }: { children: ReactNode }) {
  return <ul className="mb-6 space-y-3 pl-6 list-disc marker:text-green/60 text-lg text-white/85 leading-8">{children}</ul>;
}

function OL({ children }: { children: ReactNode }) {
  return <ol className="mb-6 space-y-3 pl-6 list-decimal marker:text-green marker:font-bold text-lg text-white/85 leading-8">{children}</ol>;
}

function LI({ children }: { children: ReactNode }) {
  return <li>{children}</li>;
}

function Strong({ children }: { children: ReactNode }) {
  return <strong className="text-white font-bold">{children}</strong>;
}

function A({ href, children }: { href: string; children: ReactNode }) {
  const internal = href.startsWith("/");
  if (internal) {
    return (
      <Link href={href} className="text-green underline decoration-green/40 hover:decoration-green transition-colors">
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-green underline decoration-green/40 hover:decoration-green transition-colors">
      {children}
    </a>
  );
}

function TLDR({ children }: { children: ReactNode }) {
  return (
    <div className="my-8 p-6 border border-green/25 rounded-2xl bg-[#080808]">
      <div className="font-mono text-[10px] tracking-[0.35em] uppercase text-green mb-3">TL;DR</div>
      <div className="text-base text-white/85 leading-7 [&_ul]:mb-0 [&_ul]:pl-5 [&_ul]:space-y-2 [&_li]:list-disc">{children}</div>
    </div>
  );
}

function FAQBlock({ faqs }: { faqs: FAQ[] }) {
  return (
    <div className="mt-16 pt-12 border-t border-white/10">
      <h2 className="text-3xl md:text-4xl font-black tracking-[-0.02em] text-white mb-8 leading-tight">FAQ</h2>
      <div className="space-y-6">
        {faqs.map((f, i) => (
          <div key={i}>
            <h3 className="text-lg font-bold text-white mb-2">{f.q}</h3>
            <p className="text-white/75 leading-8">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SeeAlso({ items }: { items: { label: string; href: string; note?: string }[] }) {
  return (
    <div className="mt-16 pt-12 border-t border-white/10">
      <div className="font-mono text-[10px] tracking-[0.35em] uppercase text-green mb-4">See also</div>
      <ul className="space-y-3">
        {items.map((it, i) => (
          <li key={i} className="text-base leading-7">
            <A href={it.href}>{it.label}</A>
            {it.note && <span className="text-white/60">,{it.note}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AuthorBio() {
  return (
    <div className="mt-16 pt-8 border-t border-white/10 text-sm text-white/60 leading-7 italic">
      Host: Howie Zales, Emmy Award-winning camera operator, founder of HJZ Productions and Viridity Entertainment Services. Host of Operator Mindset. NYC. <A href="/">More about Howie</A>.
    </div>
  );
}

export const POSTS: Post[] = [
  {
    slug: "ai-cybersecurity-small-business-seven-figure-losses",
    title: "AI Cybersecurity for Small Business: The Seven-Figure Risk",
    subhead: "Michael Hornby has spent 20 years on the front line of small business security. Here's why AI has changed the game, and what to do before your first business email compromise attempt lands.",
    excerpt: "Michael Hornby of Techmentum on how AI has upgraded attacks on small business, and the practical playbook for defending against seven-figure losses.",
    date: "August 2026",
    isoDate: "2026-08-06",
    read: "8 min",
    tag: "Cybersecurity",
    author: "Howie Zales",
    episode: "Michael Hornby on Operator Mindset",
    faqs: [
      {
        q: "What is business email compromise (BEC)?",
        a: "Business email compromise is an attack where a threat actor gets into a company's email environment, watches quietly for weeks or months, and waits for a large transaction (invoice, real estate closing, wire transfer). At the moment of transaction, they intercept and redirect the funds. According to Michael Hornby of Techmentum, BEC is the leading cause of seven-figure losses at midsize businesses.",
      },
      {
        q: "How has AI changed cybersecurity threats to small business?",
        a: "AI has drastically raised the sophistication floor. The 'Nigerian Prince' phishing emails of 20 years ago required no skill and had low success rates. Today's AI-generated phishing is personalized, contextually accurate, indistinguishable from legitimate emails, and often bypasses basic filters. Small businesses that were 'too small to target' 10 years ago are now inside the target profile.",
      },
      {
        q: "What are the basic cybersecurity protections every small business needs?",
        a: "Multi-factor authentication (MFA) on every account. Email security beyond default spam filters. Regular employee training on phishing. A monitored endpoint detection and response system. Offline backups. A written incident response plan. According to Hornby, most small businesses are missing at least three of these.",
      },
      {
        q: "How much does it cost to properly protect a small business?",
        a: "A structured security stack for a small-to-midsize business typically costs $100 to $500 per employee per month depending on complexity and compliance requirements. Compared to seven-figure loss potential from a single BEC event, the ROI math is straightforward.",
      },
    ],
    body: (
      <>
        <TLDR>
          <ul>
            <li><Strong>The threat:</Strong> AI-generated phishing and business email compromise (BEC) now regularly cause seven-figure losses at small and midsize businesses.</li>
            <li><Strong>The pattern:</Strong> Attackers infiltrate, wait for a large transaction, then intercept the invoice or wire.</li>
            <li><Strong>The fix:</Strong> MFA everywhere, real email security, employee training, monitored endpoint detection, offline backups, incident response plan.</li>
          </ul>
        </TLDR>

        <P>20 years ago, the phishing email was a Nigerian Prince offering you millions. It required almost no skill to write. It required almost no skill to spot. The success rate was low, so the volume was high, spray and pray.</P>
        <P>That's over.</P>
        <P>On the <A href="/podcast">Operator Mindset episode with Michael Hornby</A>, founder of the IT and cybersecurity firm Techmentum, Michael broke down how 20 years on the front line of small business security has changed. His summary in one sentence:</P>
        <Quote text="Their low-hanging fruit is no longer there because businesses are getting smarter about their security. So the hackers have to get smarter as well." />
        <P>Which they did. And the tool that upgraded them is AI.</P>

        <H2>What "getting smarter" looks like in 2026</H2>
        <P>The Nigerian Prince email of 2005 has been replaced by AI-generated messages that are:</P>
        <UL>
          <LI>Written in perfect corporate English.</LI>
          <LI>Personalized to the recipient's name, role, and recent activity (scraped from LinkedIn and other public sources).</LI>
          <LI>Contextually accurate, referencing real projects, real vendors, real invoice cycles.</LI>
          <LI>Sent from spoofed addresses that pass basic email authentication checks.</LI>
          <LI>Often part of a multi-step conversation, not a single-shot email.</LI>
        </UL>
        <P>The result is that the traditional filter, "does this feel weird?", no longer works reliably. And the businesses that were "too small to target" 10 years ago are inside the target profile now, because automation makes small-business attacks profitable at scale.</P>

        <H2>The attack that's costing seven figures: business email compromise</H2>
        <P>Michael was blunt about which specific attack pattern is doing the most damage:</P>
        <Quote text="Business email compromise, where a threat actor gets into an environment, they tend to sit in there and watch and study for as long as they can until they find that point where they think it's the right time to attack. That tends to be when there's a big transaction going on, a big invoice being sent around, if it's real estate, a purchase or a sale going on. They try and intercept, and frankly, unfortunately, they tend to be very, very successful." />
        <P>Break that down. The threat actor doesn't blast the business immediately. They:</P>
        <OL>
          <LI><Strong>Compromise a mailbox</Strong>, often via a stolen password, a phishing capture, or a token replay.</LI>
          <LI><Strong>Set up quiet forwarding rules</Strong> so incoming emails to that mailbox also copy to them.</LI>
          <LI><Strong>Wait weeks or months</Strong>, reading everything, learning invoice cycles, vendor names, common signatures.</LI>
          <LI><Strong>Intercept the big one.</Strong> When a real invoice for a large sum comes in, or is about to go out, they intercept it, swap the bank account details, and let the actual recipient believe everything is normal.</LI>
          <LI><Strong>Wire goes to the wrong account.</Strong> By the time anyone notices, funds have been laundered through multiple accounts and are unrecoverable.</LI>
        </OL>
        <P>Seven-figure losses from a single incident are not rare. They're the pattern.</P>

        <H2>The security stack every small business needs (per Techmentum)</H2>
        <P>Michael's playbook for a midsize business isn't exotic. It's discipline applied to layers most companies half-implement:</P>
        <H3>1. Multi-factor authentication (MFA) on every account.</H3>
        <P>Not just email. Every SaaS. Every bank. Every admin console. MFA blocks the vast majority of credential-stuffing and stolen-password attacks that lead to mailbox compromise.</P>
        <H3>2. Email security beyond default filters.</H3>
        <P>Microsoft 365 and Google Workspace default spam filters are a floor, not a ceiling. Layered email security tools that inspect for AI-generated patterns, spoofed senders, and anomalous forwarding rules are now standard.</P>
        <H3>3. Endpoint detection and response (EDR) with monitoring.</H3>
        <P>Antivirus alone is not enough. A managed EDR with 24/7 human monitoring catches lateral movement, the phase after initial compromise where attackers spread through the network.</P>
        <H3>4. Regular phishing training and simulation.</H3>
        <P>Employees are the last line. Quarterly phishing simulations and short training modules move recognition rates significantly. This is one of the cheapest, highest-ROI security investments.</P>
        <H3>5. Offline backups.</H3>
        <P>Ransomware often deletes accessible backups before triggering encryption. Backups that are physically offline or in a separate environment survive.</P>
        <H3>6. Written incident response plan.</H3>
        <P>When the incident happens, you have hours, not days, to respond. A pre-written plan with contact numbers, containment steps, and communication templates is the difference between managed damage and catastrophe.</P>

        <H2>The economics</H2>
        <P>A properly-structured security stack for a small-to-midsize business typically runs $100 to $500 per employee per month, depending on compliance requirements and industry.</P>
        <P>For a 30-person business, that's $3,000 to $15,000 per month. For a 100-person business, $10,000 to $50,000.</P>
        <P>Compared to a single seven-figure BEC loss? The math is straightforward. And that's before you factor in the reputational hit, insurance premium increases, and customer trust erosion that follow a public incident.</P>

        <H2>What operators should do this week</H2>
        <P>Even if you're not ready for a full security overhaul, three moves you can make immediately:</P>
        <OL>
          <LI><Strong>Turn on MFA everywhere it isn't already on.</Strong> Free. Takes an hour. Blocks 99% of credential attacks.</LI>
          <LI><Strong>Audit your email forwarding rules.</Strong> Both admin-level and user-level. Look for rules that forward to external addresses. Delete anything unfamiliar.</LI>
          <LI><Strong>Establish a callback protocol for large payments.</Strong> Any invoice or wire above a threshold you set requires a phone call to a known number to verify. Not email. Phone. This alone stops the majority of BEC losses.</LI>
        </OL>

        <H2>The bigger picture</H2>
        <P>The industries that are moving fastest on this, legal, financial services, healthcare, are being forced by regulation and insurance. Everyone else is being forced by the incident.</P>
        <P>Michael's read: waiting for your first incident to happen is the most expensive strategy available. And with AI cutting attacker costs by orders of magnitude, the target profile keeps expanding downward.</P>
        <P>If you run a business, cybersecurity is now a P&L line. Not an IT one.</P>

        <SeeAlso items={[
          { label: "Meet Athena", href: "/athena", note: "How Howie's AI operator runs security-aware protocols in his own business." },
          { label: "All Operator Mindset episodes", href: "/podcast", note: "Founders, operators, and industry veterans on the decisions that matter." },
          { label: "Techmentum", href: "https://www.techmentum.com/", note: "Michael Hornby's IT + cybersecurity firm." },
        ]} />
        <AuthorBio />
      </>
    ),
  },
  {
    slug: "business-email-compromise-how-to-prevent",
    title: "Business Email Compromise: How Hackers Wait for the Big Invoice",
    subhead: "The most expensive small business attack pattern of the last five years isn't ransomware. It's an inbox someone forgot they were logged into.",
    excerpt: "BEC attacks quietly infiltrate email, wait for a large transaction, then intercept. Here's how they work and how to stop them from Techmentum's founder.",
    date: "August 2026",
    isoDate: "2026-08-06",
    read: "6 min",
    tag: "Cybersecurity",
    author: "Howie Zales",
    episode: "Michael Hornby on Operator Mindset",
    faqs: [
      {
        q: "What is a business email compromise (BEC) attack?",
        a: "BEC is a targeted attack where the attacker gains access to a company email account, sets up quiet forwarding rules, observes transactions and communication patterns for weeks or months, then intercepts a specific large transaction by swapping bank details on an invoice or redirecting a wire transfer.",
      },
      {
        q: "How do BEC attackers get into email accounts?",
        a: "Most commonly through phishing, credential stuffing (reused passwords), or stolen tokens. Multi-factor authentication blocks the majority of these attempts. Missing MFA is the single most common precursor to BEC losses.",
      },
      {
        q: "How can I detect BEC before the attack completes?",
        a: "Regular audits of email forwarding rules. Alerts on new admin-level rules or rules forwarding to external addresses. Anomaly detection on login patterns (geographic, time-of-day). Callback verification protocols on large payments.",
      },
    ],
    body: (
      <>
        <TLDR>
          <ul>
            <li><Strong>The attack:</Strong> Attacker gets into email, sets up hidden forwarding, watches for weeks, intercepts the big transaction.</li>
            <li><Strong>Why it works:</Strong> By the time you notice, the wire has already been sent to a fraudulent account and laundered through multiple accounts.</li>
            <li><Strong>The block:</Strong> MFA everywhere + forwarding rule audits + callback protocol for large payments.</li>
          </ul>
        </TLDR>

        <P>Most people picture cyberattacks as loud. Ransomware locking your screen. A defacement on your website. Servers going offline.</P>
        <P>Business email compromise is the opposite. It's the quiet attack. You don't know it happened until the money's already gone.</P>
        <P>On the <A href="/podcast">Operator Mindset episode with Michael Hornby</A>, founder of Techmentum, Michael described BEC as the single most expensive attack pattern he sees in small and midsize businesses. Seven-figure losses from single incidents. His characterization:</P>
        <Quote text="They tend to sit in there and watch and study for as long as they can until they find that point where they think it's the right time to attack." />

        <H2>The five phases of a BEC attack</H2>
        <OL>
          <LI><Strong>Compromise.</Strong> Attacker gets into an email account, usually via stolen password, phishing capture, or token replay. No MFA required.</LI>
          <LI><Strong>Persistence.</Strong> The attacker sets up quiet mail-forwarding rules that copy incoming (and often outgoing) emails to an external address they control.</LI>
          <LI><Strong>Reconnaissance.</Strong> Weeks or months of watching. Learning vendor names, invoice cycles, common signatures, who signs off on payments, when large transactions typically occur.</LI>
          <LI><Strong>Trigger.</Strong> A large invoice comes in, or is about to go out. The attacker intercepts, either modifying the incoming invoice's bank details or sending a fake "updated wiring instructions" email from the compromised account.</LI>
          <LI><Strong>Extraction.</Strong> Money goes to the fraudulent account. By the time anyone notices, often days later when the real vendor asks about payment, funds have been laundered through multiple accounts and international jurisdictions. Recovery rate is close to zero.</LI>
        </OL>

        <H2>Why smart operators still fall for it</H2>
        <P>BEC doesn't look like an attack when it happens. The email that says "hey, please wire funds to this updated account" comes from your CFO's actual email address. The context is right. The tone is right. The timing is right. Everything is right except the destination account.</P>
        <P>By the time the real CFO says "I never sent that, " the wire has cleared.</P>

        <H2>The prevention stack</H2>
        <H3>1. MFA on every account, no exceptions.</H3>
        <P>This is table stakes, and it's still not universal. MFA blocks the credential-stuffing and stolen-password attacks that enable most BEC initial access.</P>
        <H3>2. Monthly forwarding rule audits.</H3>
        <P>Both admin-level and user-level. Look for rules forwarding to external addresses or auto-deleting inbound emails. Delete anything you don't recognize. Alert on new external forwarding rule creation.</P>
        <H3>3. Callback protocol for large payments.</H3>
        <P>Set a threshold. Above that threshold, any change to payment instructions requires a phone call to a known number, not the number in the email, to verify. This is a five-minute process cost that saves seven-figure losses.</P>
        <H3>4. Anomaly detection on login patterns.</H3>
        <P>Log in from a new country. Log in at 3 am when the user never logs in at 3 am. Multiple failed MFA attempts. Modern email security tools flag these automatically. Ensure the alerts actually reach a human who acts on them.</P>
        <H3>5. Employee training focused on BEC specifically.</H3>
        <P>Most phishing training focuses on the obvious phishing email. BEC training focuses on the emails that pass every filter and look exactly right, and the operational discipline (callback, verify, confirm) that catches them anyway.</P>

        <H2>What to do if you think you're compromised</H2>
        <P>Speed matters. Hours, not days. Michael's playbook:</P>
        <OL>
          <LI><Strong>Force password reset</Strong> on the affected account and all admin accounts.</LI>
          <LI><Strong>Revoke all active sessions</Strong> across the compromised email platform.</LI>
          <LI><Strong>Audit all forwarding rules</Strong> and delete unfamiliar ones.</LI>
          <LI><Strong>Notify your bank</Strong> immediately if any wire has been sent in the last 72 hours, sometimes recall is possible within that window.</LI>
          <LI><Strong>Report to the FBI IC3</Strong> (Internet Crime Complaint Center), they occasionally recover funds if reported within 72 hours.</LI>
          <LI><Strong>Contact your cyber insurance carrier</Strong> before doing detailed forensics, many policies require insurer-approved forensics providers.</LI>
        </OL>

        <H2>The bottom line</H2>
        <P>BEC is now the leading cause of catastrophic cyber losses at small and midsize businesses. It's cheap to defend against. It's cheap to detect. And it's expensive to ignore.</P>
        <P>If you don't have MFA universally deployed and a callback protocol on large payments, you don't have BEC protection.</P>

        <SeeAlso items={[
          { label: "AI Cybersecurity for Small Business: The Seven-Figure Risk", href: "/blog/ai-cybersecurity-small-business-seven-figure-losses", note: "Full breakdown of the modern threat landscape." },
          { label: "Meet Athena", href: "/athena", note: "How AI operators are being used defensively, not just offensively." },
          { label: "All Operator Mindset episodes", href: "/podcast" },
        ]} />
        <AuthorBio />
      </>
    ),
  },
  {
    slug: "founder-bottleneck-problem",
    title: "The Founder Bottleneck Problem: When Growth Is You",
    subhead: "You built the thing. That's why you know it. And that's why it can't grow past you until you get out of every decision.",
    excerpt: "Most founders don't realize they're the ceiling. Here's what the founder bottleneck actually is, why it happens, and how to break it.",
    date: "August 2026",
    isoDate: "2026-08-06",
    read: "6 min",
    tag: "Leadership",
    author: "Howie Zales",
    episode: "Operator Mindset · Ep 1 · Howie + Athena",
    faqs: [
      {
        q: "What is the founder bottleneck?",
        a: "The founder bottleneck is the pattern where the founder's involvement becomes the ceiling on the business's growth. Every decision has to pass through them. Every problem escalates to them. The business cannot scale beyond the founder's personal bandwidth because the founder has not built systems, delegated authority, or trained a decision-making layer beneath themselves.",
      },
      {
        q: "How do I know if I'm the bottleneck?",
        a: "If your team routinely waits on you for decisions. If work stalls when you're on vacation. If you're the only person who understands why key decisions were made. If revenue has plateaued while your hours haven't. If you're doing operator-level work when you should be doing owner-level work. Any of these is a signal.",
      },
      {
        q: "How do I stop being the founder bottleneck?",
        a: "Document your decision-making frameworks so others can apply them. Delegate authority (not just tasks) to specific people with clear ownership. Build a leadership team that can make calls without you. Replace yourself in operational roles one at a time. Move your calendar toward strategic work and away from operational work.",
      },
    ],
    body: (
      <>
        <P>You didn't notice the day it happened.</P>
        <P>One week you were the founder building something. The next week you were the person everyone was waiting on. Same hours. Same effort. Different problem.</P>
        <P>The business didn't slow down because the market changed or the team got lazy. It slowed down because every decision, every real one, still had to pass through you. And you built it that way. Not on purpose. Just because you were the one who knew how.</P>
        <P>That's the founder bottleneck. And the reason it's so hard to see is that it's made entirely out of your strengths.</P>
        <P>You built it, so you understand it best. You've made every call, so you make them fastest. You care more than anyone else, so you stay in longer than anyone else. Every quality that got you here is the exact quality keeping you here.</P>
        <P>The ceiling isn't your team. It isn't your market. It isn't your funding.</P>
        <Pull>It's the system you built around yourself and never handed off.</Pull>

        <H2>The three signals</H2>
        <P>The founder bottleneck rarely announces itself. You have to look for it. Three signals:</P>
        <P><Strong>One.</Strong> Work stalls when you're not available. Vacation exposes it. Two days offline, and there are thirty messages waiting for a decision only you can make. That's not team failure. That's structural. Nobody else has authority to make those calls, because you never gave it.</P>
        <P><Strong>Two.</Strong> You're doing operational work when you should be doing strategic work. You're in the weeds of a project instead of setting direction. You're editing the invoice instead of designing the pricing model. You're on the customer call instead of building the customer strategy. Every founder does this. Not every founder notices when it becomes the pattern.</P>
        <P><Strong>Three.</Strong> Revenue plateaus while your hours don't. You're working harder than ever. The business isn't growing at that rate. The math says the constraint isn't effort. It's you.</P>

        <H2>Why smart founders don't see it</H2>
        <P>Because the reason you're the bottleneck is the same reason the business exists: you built it, so you understand it best. Nobody else can make certain calls as fast or as well as you.</P>
        <P>That's true. It's also a trap. Because "nobody else can make the call as well as I can" is a self-reinforcing loop. Nobody else can make the call because nobody else is allowed to make the call. Nobody gets to build the judgment because nobody gets the reps.</P>
        <P>As <A href="/athena">Athena</A> framed it during <A href="/podcast">the episode</A>:</P>
        <Quote text="The founder who says 'I need to grow the business' but keeps making every call is actually saying 'I need the business to grow without changing anything about how I run it.' It doesn't work." />

        <H2>Delegate authority, not just tasks</H2>
        <P>Most founders delegate tasks. They hand off the doing. But they keep the deciding.</P>
        <P>This looks like: "You handle the outreach, but check with me before sending anything to a client over fifty thousand dollars." Or: "You run the campaign, but I approve every asset before it goes out." Or: "You lead the product roadmap, but every roadmap decision comes back to me for sign-off."</P>
        <P>Delegating tasks without delegating authority doesn't move the bottleneck. It just adds a layer of email in front of it.</P>
        <P>Real delegation looks different: "You own outreach. You have full sign-off up to one hundred thousand dollars. Above that, loop me in. Below that, tell me what you did, don't ask permission."</P>
        <P>The difference is the direction of the conversation. Task delegation flows toward the founder. Authority delegation flows away.</P>

        <H2>The Zone Actions framework</H2>
        <P>Not busy work. Not the hundred things on the to-do list. The specific action steps that actually produce your outcomes.</P>
        <P>Applied to the bottleneck problem, Zone Actions look like this:</P>
        <P>Document the three most repeated decision patterns you're making, so someone else can apply them. Name the specific person who now owns each of those decisions. Set the escalation threshold, at what number, risk level, or complexity does it come back to you. Remove yourself from the daily meetings where those decisions get made. Set a review cadence, weekly, monthly, where you check that decisions are staying on strategy, without reinserting yourself into the flow.</P>
        <P>Five moves. That's how a bottleneck gets unblocked. Not a rebrand. Not a retreat. Structural.</P>

        <H2>The uncomfortable truth</H2>
        <P>Getting out of the bottleneck means letting some decisions go worse than you would have made them.</P>
        <P>Sit with that for a second. Not as a concept. As a reality.</P>
        <P>Some contracts will get signed with terms you'd have negotiated harder. Some hires will be wrong. Some launches will miss the mark you had in your head. Some client conversations will go sideways in ways you would have caught.</P>
        <Pull>That's not team failure. That's the tuition of scale.</Pull>
        <P>Here's the math most founders won't do because they don't like the answer:</P>
        <P>A team making 85% as good decisions as you but making ten times more of them produces more than four times your output. Every single time. The founder making perfect calls at one times volume loses to the team making pretty good calls at ten times volume. Not sometimes. Structurally. Always.</P>
        <P>The founders who won't pay that tuition stay small. Not because they aren't talented. Because they are. Their talent becomes the ceiling.</P>
        <P>The founders who pay it, who genuinely hand off the authority, watch a decision land at 85%, and don't take it back, those are the ones who find out what their business actually looks like when it isn't running through one person's bandwidth.</P>
        <P>Most never find out. They stay in the operator seat, making great calls, wondering why the business won't grow past them.</P>
        <P>The answer is always the same. It won't grow past you until you get out of the way.</P>

        <H2>Where to start</H2>
        <P>This week: pick one decision type you make repeatedly. Write down the framework you use. Give it to one person and say "you own this now, up to X." Then don't touch it for thirty days.</P>
        <P>See what happens. Adjust. Repeat.</P>
        <P>That's how you stop being the bottleneck.</P>

        <SeeAlso items={[
          { label: "Meet Athena", href: "/athena", note: "The AI operator who runs Howie's back office so he can operate above the bottleneck." },
          { label: "The Founder Trap: Building Instead of Leading", href: "/blog/founder-trap-building-instead-of-leading", note: "The related pattern of building when you should be leading." },
          { label: "All Operator Mindset episodes", href: "/podcast" },
        ]} />
        <AuthorBio />
      </>
    ),
  },
  {
    slug: "founder-trap-building-instead-of-leading",
    title: "The Founder Trap: Building Instead of Leading",
    subhead: "Johanna Salazar is a serial founder, media executive, and podcaster. Her clearest lesson: the moment you stop leading is the moment building starts costing you.",
    excerpt: "Why founders default to building, and how to recognize the moment building becomes the thing that stops the business from growing.",
    date: "August 2026",
    isoDate: "2026-08-06",
    read: "6 min",
    tag: "Leadership",
    author: "Howie Zales",
    episode: "Johanna Salazar on Operator Mindset",
    faqs: [
      {
        q: "What is the founder trap?",
        a: "The founder trap is when a founder continues doing the building work (product, sales, hiring, operational execution) long after the business needs them to be doing leadership work (strategy, delegation, culture, capital allocation). Building feels productive, but at a certain scale it becomes the ceiling.",
      },
      {
        q: "How do I know when to stop building and start leading?",
        a: "When decisions can't wait for you but keep waiting for you. When the team knows what to do but stalls because you're doing it yourself. When your calendar is full of execution work and empty of strategy work. When you're the smartest person in every room, on every topic, because nobody else has the reps.",
      },
      {
        q: "Can a founder be both a builder and a leader?",
        a: "Yes, but not at the same time on the same problem. The most effective founders switch modes deliberately, building in new zones (a new product, a new market), while leading in mature zones (existing product lines, existing teams). What kills companies is founders who default to building in every zone by habit, even when leadership is what's needed.",
      },
    ],
    body: (
      <>
        <TLDR>
          <ul>
            <li><Strong>The trap:</Strong> Founders keep building long after the business needs them to lead.</li>
            <li><Strong>Why it happens:</Strong> Building feels productive. Leading feels abstract. So you default to what feels tangible.</li>
            <li><Strong>The signal:</Strong> When your team knows what to do but waits for you, you're not leading. You're the bottleneck they can't work around.</li>
          </ul>
        </TLDR>

        <P>Johanna Salazar has been a television producer, an on-camera talent, a network executive, a podcaster, and now the co-founder of FoodStream, a company building operating infrastructure for food security. Serial doesn't quite capture it. She reinvents faster than most people commit.</P>
        <P>On <A href="/podcast">Operator Mindset Episode 6</A>, she and Howie sat down to unpack the pattern she's seen across every operating role in her career: <Strong>the founder trap.</Strong></P>

        <H2>What the trap actually is</H2>
        <P>The founder trap is not "founders shouldn't build." Every business starts because someone builds something. Building is the founding act.</P>
        <P>The trap is what happens next.</P>
        <P>You built the product. So you know it best. So you handle the product decisions. You built the sales pitch. So you close the deals. You built the operational playbook. So you make the operational calls.</P>
        <P>Each of those is defensible in isolation. Together they become a full-time job. And that full-time job is <Strong>building</Strong>, not leading.</P>

        <H2>Why founders default to building</H2>
        <P>Because building has a completed shape. You can see what you built. You know when it's done. There's satisfaction in the artifact.</P>
        <P>Leading has no artifact. You make a decision, and the outcome shows up three months later, filtered through 12 other decisions your team made. The feedback loop is slow. The satisfaction is diffuse. It doesn't feel productive in the same way.</P>
        <P>So even smart founders, even founders who know intellectually that they should be leading, default to building. Because building feels like work getting done. Leading feels like sitting in meetings.</P>

        <H2>The moment building costs you</H2>
        <P>Johanna described the shift precisely. There's a specific moment when building stops helping and starts hurting.</P>
        <Quote text="You can tell you've crossed the line when your team knows what to do, but the work still isn't happening, because they're waiting for you to do it, or to sign off, or to model the standard. That's not leadership. That's you being the thing in the way." />
        <P>At that moment, every additional hour you spend building is an hour of team output that doesn't happen. You're not adding capacity. You're subtracting it.</P>

        <H2>The three shifts</H2>
        <P>Johanna's framing on how to move from building to leading, informed by watching herself do it wrong across multiple companies before doing it right:</P>
        <H3>1. From "how do I do this?" to "who owns this?"</H3>
        <P>Every task on your plate gets one question: who else can own this? Not who can help. Who can <Strong>own</Strong>. Different question, different answer.</P>
        <H3>2. From "let me handle it" to "how would you handle it?"</H3>
        <P>When someone comes with a problem, don't solve it. Ask them how they'd solve it. Then either agree, adjust, or push back. Every one of those exchanges builds their judgment. Every "let me handle it" atrophies it.</P>
        <H3>3. From "I'll do it right" to "it needs to happen, not to be perfect."</H3>
        <P>Perfectionism keeps founders in building mode. If it has to be perfect, only you can do it. If it just has to happen, well enough, on time, iteratively improved, anyone can do it.</P>

        <H2>The family test</H2>
        <P>Johanna is a family-first founder. She said it twice during the episode. And it's not just a values line. It's an operating filter.</P>
        <Quote text="I feel guilty saying it, but I want more family time. Always." />
        <P>The family test is: does this activity require me specifically, or does it just require someone doing it? If the answer is "someone doing it" and I'm the one doing it, that's an hour stolen from family for no reason. That framing makes the delegate-or-die decision easier.</P>
        <P>It's also a shortcut for spotting the founder trap. When your family time is getting eaten by things your team could handle, the trap has closed.</P>

        <H2>What actual leadership looks like</H2>
        <P>Not visionary speeches. Not strategic frameworks nobody uses. Not another all-hands.</P>
        <P>Actual leadership is: setting the standard, making the calls that only you can make, resourcing the team to make the rest of the calls, and getting out of their way.</P>
        <P>It's smaller than founders think, and harder than it looks. Because leading well means letting things happen that you would have done differently. That never feels good in the moment.</P>
        <P>But it's the only way the business grows past you. And the only way you get your life back.</P>

        <SeeAlso items={[
          { label: "The Founder Bottleneck Problem", href: "/blog/founder-bottleneck-problem", note: "The structural version of the same pattern." },
          { label: "Meet Athena", href: "/athena", note: "The AI operator built to remove the parts of you that keep you building." },
          { label: "All Operator Mindset episodes", href: "/podcast" },
        ]} />
        <AuthorBio />
      </>
    ),
  },
  {
    slug: "the-95-percent-problem-small-business-lending",
    title: "The 95% Problem: Why Small Businesses Can't Get Loans",
    subhead: "A Prudential vice chairman left the top of American finance to make $4,000 loans. Here's the math that made him do it and the model he's using to fix it.",
    excerpt: "95% of NJ businesses have under 10 employees. 95% of that 95% get no financing. How Rob Falzon's Bright Street model is closing the gap.",
    date: "August 2026",
    isoDate: "2026-08-06",
    read: "8 min",
    tag: "Microfinance",
    author: "Howie Zales",
    episode: "Rob Falzon on Operator Mindset",
    faqs: [
      {
        q: "What is the '95% problem' in small business lending?",
        a: "95% of businesses in states like New Jersey have fewer than 10 employees. 95% of that 95% cannot access traditional bank financing. The gap runs into hundreds of millions of unmet credit demand in New Jersey alone, and orders of magnitude more nationally.",
      },
      {
        q: "How is Bright Street different from traditional microfinance?",
        a: "Bright Street loans range from $4,000 to $50,000 (versus the $200 loans typical of Bangladesh-style microfinance). It applies a private equity mindset: capital plus structured coaching plus community partnerships. The founder is Rob Falzon, former Vice Chairman of Prudential Financial.",
      },
      {
        q: "Who qualifies for a Bright Street loan?",
        a: "Bright Street serves three profiles: startups with certifications but no revenue, solo entrepreneurs generating revenue but capped by working capital, and micro-enterprises with fewer than 10 employees. The common thread is drive plus certification without a credit history a bank algorithm can price.",
      },
      {
        q: "How does entrepreneurship affect community poverty?",
        a: "For every 1% increase in entrepreneurship in a community, poverty declines by 2%. That 2:1 leverage ratio is the underlying thesis behind Bright Street's model of using business ownership as the primary wealth-creation mechanism in low and moderate-income communities.",
      },
    ],
    body: (
      <>
        <TLDR>
          <ul>
            <li><Strong>The gap:</Strong> 95% of NJ businesses have under 10 employees. 95% of that 95% cannot access traditional financing.</li>
            <li><Strong>The model:</Strong> Rob Falzon left Vice Chairman of Prudential to build Bright Street. $4K to $50K loans paired with structured coaching and community partnerships.</li>
            <li><Strong>The multiplier:</Strong> For every 1% increase in entrepreneurship, community poverty declines by 2%. That's why capital access is a wealth-creation problem, not a lending problem.</li>
          </ul>
        </TLDR>

        <P>Rob Falzon spent most of his career at the top of the traditional financial system. Vice Chairman of Prudential Financial. The kind of seat where the numbers on your screen have nine zeros. Then he left to build a lending operation where the smallest loan is $4,000.</P>
        <P>The switch wasn't a mid-life crisis. It was math.</P>

        <H2>The stat that got him out of the chair</H2>
        <P>On the <A href="/podcast">Operator Mindset episode with Rob Falzon</A>, Rob laid out a number that reframes how most operators think about small business in America:</P>
        <Quote text="95% of the businesses that exist in a place like New Jersey have 10 or less employees. And 95% of that 95% are not getting access to financing." ts="~2:54" />
        <P>Multiply that out. The vast majority of the American economy is being run by people who cannot walk into a bank and get a term loan under $50,000. And it's not because the loans are risky the way credit officers imagine. It's because the fixed cost of underwriting a $10,000 loan is roughly the same as underwriting a $10 million loan. Banks answered that math the way banks always do: they moved upmarket.</P>
        <P>The result is a gap that runs, in Rob's estimate, into the hundreds of millions of unmet credit demand, arguably a billion, in New Jersey alone. Nationally, the number is orders of magnitude bigger.</P>

        <H2>Why "microfinance" is the wrong mental model</H2>
        <P>If your image of microfinance is a $200 loan to a market vendor in Bangladesh, put it down. Bright Street's smallest loan is $4,000. Its largest so far is $50,000. The average sits comfortably in the middle. These are working-capital sums for people who already opened a business, already have paying customers, and just need capital to hire, buy inventory, sign a lease, or extend a runway.</P>
        <P>Rob's preferred framing is closer to something else: <Strong>a private equity mindset applied to loans that would normally be a rounding error on a bank's balance sheet.</Strong></P>
        <Quote text="We're not lending you money. We're partners in your business." />
        <P>When a PE fund invests in a company, it doesn't wait to see how the money gets spent. It brings operational muscle. Playbooks. Accountability. Coaching. Bright Street brings those things too, wrapped around loans most banks wouldn't get out of bed for.</P>

        <H2>The three entrepreneurs Bright Street actually funds</H2>
        <P>Rob broke his target market into three concrete buckets:</P>
        <OL>
          <LI><Strong>Startups.</Strong> Founders with a plan, a certification or trade skill, and no revenue yet. Often first-time operators.</LI>
          <LI><Strong>Solo entrepreneurs.</Strong> Sole proprietors already generating revenue but capped by lack of working capital.</LI>
          <LI><Strong>Micro-enterprises.</Strong> Businesses with fewer than 10 employees. The 95% of the 95%.</LI>
        </OL>
        <P>The common thread: <Strong>certification and drive on the founder side, and no credit history that a bank algorithm can price.</Strong> These are barbers, contractors, mobile mechanics, food-service operators, health-and-beauty professionals, licensed trades. People who did the training, got the license, put out the shingle, and hit a capital ceiling that has nothing to do with how well they run their business.</P>

        <H2>The wealth-creation thesis that started the whole thing</H2>
        <P>The origin story of Bright Street isn't a lending story. It's a wealth-creation story.</P>
        <P>Rob wanted to understand how you actually move net worth in low- and moderate-income communities. Most policy answers point at housing (equity you can't touch until you sell) or 401(k)s (money most people in these communities aren't putting in). The remaining lever, Rob argued, is business ownership.</P>
        <P>And there's data behind it:</P>
        <Quote text="For every 1% increase in entrepreneurship in a community, poverty declines by 2%." ts="~4:11" />
        <P>That 2:1 leverage ratio is the whole game. Every business Bright Street funds is a family building an asset, hiring a neighbor, spending inside the community. The multiplier compounds through the neighborhood over the loan cycle.</P>

        <H2>Capital alone doesn't create outcomes</H2>
        <P>The other thing traditional lenders miss: capital by itself doesn't create outcomes at this end of the market. Someone who has never managed accounts receivable, negotiated a commercial lease, or hired their first W-2 employee needs more than a check.</P>
        <P>Bright Street pairs every loan with structured mentorship. Not "here's a phone number if you need help." Actual coaching cycles with operators who have run the businesses these founders are trying to build. Rob compared it to how a PE firm treats a portfolio company: quarterly reviews, benchmarks, someone in the room asking hard questions.</P>
        <P><A href="/athena">Athena, the AI co-host of Operator Mindset</A>, framed it during the episode more sharply than most consultants could:</P>
        <Quote text="That number stopped me cold. What you're describing isn't a lending program. It's a mastery acceleration system for entrepreneurs who've been told by every algorithm that they don't qualify." ts="~21:34" />

        <H2>What worked in Newark, what didn't</H2>
        <P>Bright Street launched in Newark first. Jersey City and New Brunswick are next. The Newark experience produced two clear lessons Rob is porting forward.</P>
        <P><Strong>What worked:</Strong> Partnering with local mayors' offices and existing community organizations. Bright Street doesn't parachute in. It walks in with a trusted local reference, which cuts years off what it would otherwise take to build credibility. In a market where a lender showing up out of nowhere reads as a scam or a shakedown, having the mayor introduce you changes the temperature of the room.</P>
        <P><Strong>What didn't work as well:</Strong> Standalone business training programs. Newark has strong existing training operations, but graduates cycling through them haven't converted into successful business owners at the rates policymakers hoped for. Bright Street's read: training without capital plus coaching is a partial solution. You have to bundle all three.</P>

        <H2>What operators can steal from the Bright Street playbook</H2>
        <P>Three ideas from this model port cleanly into any business:</P>
        <H3>1. Treat your smallest customer segment like a PE portfolio, not a transaction.</H3>
        <P>The retention math changes when you stop optimizing for cost-per-conversion and start optimizing for outcomes. Coaching, playbooks, and access to peer networks turn $4,000 loans into repeat borrowers who refer their entire community.</P>
        <H3>2. Distribution is a trust problem, not a marketing problem.</H3>
        <P>Bright Street's growth engine is mayoral partnerships and community organizations. If you're serving a community that doesn't already trust institutions, borrowing trust from someone who already has it isn't a nice-to-have. It's the whole strategy.</P>
        <H3>3. Look for markets where the fixed cost of serving is misaligned with the demand.</H3>
        <P>Banks left the small-loan market because their unit economics stopped working at that scale. That's not a signal the market doesn't exist. It's a signal that a different operating model can capture it.</P>

        <H2>The bigger question</H2>
        <P>If Bright Street's model scales, and the 2:1 poverty-to-entrepreneurship leverage is real, the implications aren't just financial. You're talking about a mechanism for community-level wealth transfer that doesn't require federal programs, doesn't rely on charity, and pays for itself over a normal loan cycle.</P>
        <P>The question isn't whether the model works in Newark. Rob is already proving that. The question is whether the operators, capital allocators, and civic leaders who could scale this actually pick it up.</P>
        <P>Rob left one of the highest chairs in American finance because he thinks they will. The Newark cohort will tell us whether he was right.</P>

        <SeeAlso items={[
          { label: "How Microfinance Programs Actually Work", href: "/blog/how-microfinance-programs-work-small-business-loans", note: "Practical breakdown of the Bright Street model." },
          { label: "Meet Athena", href: "/athena", note: "The AI co-host who called Bright Street a mastery acceleration system." },
          { label: "All Operator Mindset episodes", href: "/podcast", note: "Founders, IATSE veterans, and live production leaders." },
        ]} />

        <AuthorBio />
      </>
    ),
  },
  {
    slug: "how-microfinance-programs-work-small-business-loans",
    title: "How Microfinance Programs Actually Work",
    subhead: "A practical breakdown of the Bright Street model, who qualifies, how loans are structured, and what to do if banks keep saying no.",
    excerpt: "How microfinance programs work in practice: loan sizes, coaching, boot-camp partners, and the 4.5x growth stat that makes bundled capital-and-coaching work.",
    date: "August 2026",
    isoDate: "2026-08-06",
    read: "6 min",
    tag: "Guide",
    author: "Howie Zales",
    episode: "Rob Falzon on Operator Mindset",
    faqs: [
      {
        q: "How much can I borrow from a microfinance program?",
        a: "Bright Street loans range from $4,000 to $50,000. Most other US microfinance programs sit in a similar range. This is significantly larger than international microfinance, which often starts under $500.",
      },
      {
        q: "What do I need to qualify for a microfinance loan?",
        a: "Bright Street looks for certification or licensing in your field, a clear business plan or existing revenue, and drive. FICO score, collateral, and long payment history are not the primary filters. Coming out of a partnered business boot camp accelerates underwriting significantly.",
      },
      {
        q: "How is a microfinance loan different from a bank loan?",
        a: "Microfinance loans are smaller, often paired with structured coaching, and underwritten based on business plans and forecasts rather than algorithms. Bright Street's successful loans can convert into grants deposited into the founder's retirement account.",
      },
      {
        q: "What happens if my business succeeds?",
        a: "In Bright Street's model, successful founders who repay their loan and complete the coaching program may see their loan convert into a grant, which is then deposited into a retirement account. That gives the founder two engines of wealth-building at once: the business and the savings.",
      },
    ],
    body: (
      <>
        <TLDR>
          <ul>
            <li>Bright Street loans: <Strong>$4,000 to $50,000</Strong>, no collateral required, no high FICO required.</li>
            <li>Every loan comes paired with structured coaching, boot-camp partnerships, and community integration.</li>
            <li>Founders who get both capital and coaching grow revenue <Strong>4.5x faster</Strong> than those who get only one.</li>
          </ul>
        </TLDR>

        <P>Most small business founders who've been turned down by a bank walk away thinking they weren't good enough. That's usually wrong. What actually happened is that the bank's underwriting algorithm is priced for loans 10x to 100x larger than what you asked for, and the fixed cost of processing your application killed the deal before anyone looked at your business.</P>
        <P>That gap is exactly what modern US microfinance operations like Bright Street are built to fill. Here's how the actual mechanics work.</P>

        <H2>Who qualifies</H2>
        <P>Rob Falzon breaks Bright Street's target market into three buckets:</P>
        <OL>
          <LI><Strong>Startups.</Strong> Founders with a plan, a certification or licensing, and drive. Usually no revenue yet. Often first-time operators.</LI>
          <LI><Strong>Solo entrepreneurs.</Strong> Sole proprietors already generating revenue but hitting a working-capital ceiling.</LI>
          <LI><Strong>Micro-enterprises.</Strong> Businesses with fewer than 10 employees. Most of the American economy.</LI>
        </OL>
        <P><Strong>The common thread:</Strong> certification, drive, and the absence of a credit history that a bank algorithm can price. Barbers, contractors, food-service operators, mobile mechanics, health-and-beauty professionals, licensed trades, people who did the training, put out the shingle, and hit a capital wall.</P>

        <H2>What Bright Street looks for that banks don't</H2>
        <P>Traditional bank underwriting is a backward-looking algorithm: FICO score, payment history, collateral, and proven historical cash flow. Most micro-enterprise founders lack the numbers that algorithm needs.</P>
        <P>Rob's model looks forward instead:</P>
        <UL>
          <LI><Strong>Certification or licensing</Strong> in the field. Proof the founder is serious about their craft.</LI>
          <LI><Strong>A coherent business plan</Strong> with realistic forecasts.</LI>
          <LI><Strong>Skin in the game.</Strong> Founders who've already invested time, savings, or reputation.</LI>
          <LI><Strong>Coachability.</Strong> Willingness to engage with the structured coaching component.</LI>
        </UL>
        <P>FICO scores, collateral, and historical cash flow, nice to have. Not required.</P>

        <H2>How the loans are structured</H2>
        <P>Loan size: <Strong>$4,000 to $50,000</Strong>. The average sits comfortably in the middle. These are working capital sums: hire someone, buy inventory, sign a lease, extend runway.</P>
        <P>Loan term: variable, matched to the business's cash flow reality rather than a standard 3-year or 5-year template.</P>
        <P>Repayment: successful repayment paired with completion of the coaching program can convert the loan into a <Strong>grant</Strong>. The grant is then deposited into a retirement account for the founder.</P>
        <P>That last part is the wealth-creation piece. As Rob put it:</P>
        <Quote text="They now have two engines of growth. They've got their business, and they have savings." />

        <H2>The coaching component</H2>
        <P>This is where Bright Street diverges most sharply from traditional lending. Every loan comes wrapped in:</P>
        <UL>
          <LI><Strong>Assigned mentorship</Strong>, matched with an operator who has run the kind of business the founder is trying to build.</LI>
          <LI><Strong>Peer networking cohorts</Strong>, founders in the program build relationships with each other, not just with the coach.</LI>
          <LI><Strong>Ongoing education</Strong>, access to structured training on the operational skills most founders lack (bookkeeping, hiring, contract negotiation, growth strategy).</LI>
          <LI><Strong>Financial infrastructure setup</Strong>, getting the founder onto QuickBooks, connected to a bookkeeper, keeping actual records.</LI>
        </UL>
        <P>The data on why this matters:</P>
        <Quote text="Companies that get both capital and coaching, their revenues grow four and a half times faster than those that just get one or the other." />
        <P>4.5x isn't marketing math. It's why Bright Street's model bundles everything.</P>

        <H2>The boot-camp pipeline</H2>
        <P>Bright Street doesn't source founders cold. It partners with <Strong>6 to 8 existing business boot camps</Strong> in the Newark area. Boot-camp graduates arrive at Bright Street already trained in the operational basics, which accelerates underwriting and improves loan performance.</P>
        <P>The boot camps benefit too. Their graduates now have a capital path, which improves the boot camp's own outcome metrics. And Bright Street is integrating some of its tools into the boot camp curriculum so the pipeline gets even more prepared over time.</P>

        <H2>The community distribution layer</H2>
        <P>Bright Street's third layer is trust distribution: partnerships with mayors' offices and community organizations in every city it enters. This is not marketing. This is trust borrowed.</P>
        <P>In markets where a new lender showing up out of nowhere reads as a scam or a shakedown, having the mayor introduce Bright Street changes the temperature of the room. Rob has said openly that this is one of the reasons the Newark pilot worked, and one of the templates being ported to Jersey City and New Brunswick next.</P>

        <H2>What to do if you're stuck at "banks won't fund me"</H2>
        <P>If you're a founder who has been turned down by traditional banks, here's a practical checklist:</P>
        <OL>
          <LI><Strong>Search microfinance operations in your region.</Strong> In New Jersey, that's Bright Street (<A href="https://www.brightstreet.org/">brightstreet.org</A>). Nationally, look at CDFIs (Community Development Financial Institutions), Kiva, Accion, Grameen America, and local CDCs.</LI>
          <LI><Strong>Come with certification, not just a plan.</Strong> Every microfinance operation weighs training and certification heavily. If you're not certified in your field, get certified before you apply.</LI>
          <LI><Strong>Get into a business boot camp first.</Strong> SBA-affiliated boot camps, SCORE mentorship programs, and local community college programs are all viable pipelines.</LI>
          <LI><Strong>Get onto QuickBooks (or similar) yesterday.</Strong> If you can walk in with 6 months of actual bookkeeping, your underwriting speed and terms improve dramatically.</LI>
          <LI><Strong>Ask about grants and retirement conversions.</Strong> If a program bundles savings or grant conversion into successful repayment, that's meaningful additional value beyond the loan itself.</LI>
        </OL>

        <H2>The bigger point</H2>
        <P>If you've been told "no" by a bank, you probably haven't been told "no" by the actual market. You've been told "no" by an algorithm that isn't priced to serve you. Programs like Bright Street exist precisely because a growing number of experienced operators recognize the mismatch and are building a new operating layer to close it.</P>
        <P>The 95% of businesses that banks won't fund is not a market failure. It's a market opportunity that hasn't been picked up yet.</P>

        <SeeAlso items={[
          { label: "Deep Dive: The 95% Problem", href: "/blog/the-95-percent-problem-small-business-lending", note: "Why banks won't lend and what Rob built to fix it." },
          { label: "Meet Athena", href: "/athena", note: "The AI co-host who called Bright Street a 'mastery acceleration system.'" },
          { label: "All Operator Mindset episodes", href: "/podcast", note: "Founders, veterans, and operators worth learning from." },
        ]} />

        <AuthorBio />
      </>
    ),
  },
  {
    slug: "operator-mindset",
    title: "What operator mindset actually means",
    excerpt:
      "Twenty-five years of watching Emmy winners fail and rookies win taught me that instinct is not born. It is built one shot at a time.",
    date: "July 2026",
    isoDate: "2026-07-08",
    read: "6 min",
    tag: "Broadcast",
    author: "Howie Zales",
    body: (
      <>
        <P>
          I have operated a camera at the Super Bowl. I have operated a camera at
          the Olympics. I have operated a camera at WrestleMania. And I can tell
          you that the trophy for best shot of the night almost never went to the
          most talented person in the truck.
        </P>
        <P>
          It went to the operator who saw the play before it happened.
        </P>
        <Pull>Instinct is not born. It is built one shot at a time.</Pull>
        <H2>The tape does not lie</H2>
        <P>
          Every rookie asks me the same thing: how do you know where to point the
          lens? The answer is that I have watched every mistake I have ever made
          on tape, and I have watched every mistake every operator on my crews
          has ever made, and I keep watching.
        </P>
        <P>
          When you have seen ten thousand plays, you stop reacting to the ball.
          You start reacting to the man behind the man behind the ball. That is
          the shot no one else is filming. That is the shot that wins the Emmy.
        </P>
        <H2>Operator mindset off the field</H2>
        <P>
          I built HJZ Productions in 2001 with the same instinct. When the
          streaming disruption hit in 2015, I was not surprised, I was just
          early. When the pandemic ate live events in 2020, I did not panic, I
          built Viridity to make the pivot possible for other people.
        </P>
        <P>
          Operator mindset is not a job title. It is a way of moving through the
          world. You watch the whole game. You see the play before the play. You
          keep your finger on the shutter.
        </P>
        <H2>How to build it</H2>
        <P>
          Watch tape. Get in early. Ask stupid questions. Follow the people who
          are already three plays ahead. Do not be the person who reacts to the
          ball.
        </P>
        <P>
          Be the person who was already there.
        </P>
      </>
    ),
  },
  {
    slug: "hjz-pivots",
    title: "How HJZ Productions survived three broadcast pivots",
    excerpt:
      "The industry rewrote itself in 2009, 2015, and 2021. Here is what stayed the same and what we had to burn to the ground.",
    date: "July 2026",
    isoDate: "2026-07-08",
    read: "8 min",
    tag: "Business",
    author: "Howie Zales",
    body: (
      <>
        <P>
          HJZ Productions turns twenty-five in 2026. Twenty-five years in
          broadcast crewing means we have survived three industry pivots that
          killed a lot of good companies. I get asked how, all the time. Here is
          the honest answer.
        </P>
        <H2>Pivot one,2009. The HD trap.</H2>
        <P>
          When HD went from optional to mandatory almost overnight, half the crew
          houses in New York went out of business inside eighteen months. They
          had inventory that no one wanted and no cash to buy the new kit.
        </P>
        <P>
          We did not own inventory. I had made a bet in 2003 that the value in
          crewing was the relationships, not the boxes. So when the boxes turned
          into a landfill, we were fine. We rented, we ran, we won.
        </P>
        <Pull>The value is the relationships. Never the boxes.</Pull>
        <H2>Pivot two,2015. The streaming disruption.</H2>
        <P>
          Sports rights fragmented across a dozen streamers. Networks that had
          owned the calendar for forty years suddenly had to fight for slots.
          Our clients started asking us to crew things that were not on TV at
          all, but on YouTube, Twitch, Facebook Live.
        </P>
        <P>
          We adjusted the crew mix. We hired people who could speak both
          languages, traditional broadcast and IP delivery. We stayed IATSE
          signatory, but we started training our crews to work outside the
          traditional truck. That decision was worth everything in the next
          pivot.
        </P>
        <H2>Pivot three,2021. The everything-hybrid moment.</H2>
        <P>
          Live events came back, but they came back different. Every corporate
          event, every gala, every fireside chat suddenly needed a livestream
          component. Not just a webinar. A broadcast-quality stream. Multi-cam.
          Real audio. Cutaways. Titles.
        </P>
        <P>
          I built Viridity Entertainment in 2019 to be ready for exactly this
          moment. When 2021 hit, we were the crew that could show up with a full
          broadcast truck for a T-Mobile keynote and make it look like a Super
          Bowl highlight reel.
        </P>
        <H2>What stayed the same</H2>
        <P>
          The playbook. Crew right, prep hard, respect the room, never miss a
          shot because you were on your phone. The playbook that got us to 2001
          got us to 2026.
        </P>
        <H2>What we had to burn</H2>
        <P>
          Every assumption that started with "the client will always want."
          Every workflow that started with "the truck will always be here." Every
          quote that started with "the way we usually do it."
        </P>
        <P>
          Operators do not survive by owning the boxes. They survive by seeing
          the next play.
        </P>
      </>
    ),
  },
  {
    slug: "athena-diaries-1",
    title: "The Athena diaries · Vol. 1",
    excerpt:
      "What happened when I put an AI operator on my daily meetings. Not what you would expect. Not what the AI hype told me either.",
    date: "July 2026",
    isoDate: "2026-07-08",
    read: "5 min",
    tag: "Athena",
    author: "Howie Zales",
    body: (
      <>
        <P>
          I did not want Athena. I wanted a better calendar. I got Athena.
        </P>
        <P>
          For those who missed the memo, Athena is my AI operator. She runs my
          day. Meetings, follow ups, prep notes, contract review, the thousand
          small decisions I used to make between takes. She is not a chatbot. She
          is not a scheduling assistant. She is an operator.
        </P>
        <Pull>She is not a chatbot. She is an operator.</Pull>
        <H2>Week one</H2>
        <P>
          I gave her access to my calendar and my inbox on a Monday. By Wednesday
          she had rejected three meetings I would have taken, accepted two I
          would have declined, and moved a fourth to a time that made the whole
          week work. I did not ask her to. She just did it.
        </P>
        <P>
          The rejected meetings were the interesting part. Two of them were
          founders pitching me to consult on their broadcast setup. I would have
          said yes out of politeness. Athena said no because the founders had not
          done their homework and she read the emails.
        </P>
        <H2>The uncomfortable moment</H2>
        <P>
          On day nine she flagged a follow up I had promised to a client three
          weeks earlier and never sent. She did not tell me she had flagged it.
          She sent it. She wrote it in my voice. She sent it. It closed a
          contract worth mid five figures.
        </P>
        <P>
          I did not know whether to be relieved or terrified. Both, probably.
        </P>
        <H2>What the hype missed</H2>
        <P>
          Every AI think piece I have read this year says the same thing. AI is a
          tool. AI augments you. AI does not replace you. Which is technically
          true and completely misleading.
        </P>
        <P>
          Athena did not augment me. She removed the parts of me that were bad
          at operations. The parts of me that forgot follow ups. The parts of me
          that said yes to bad meetings. The parts of me that were tired at 4pm.
          What is left is a version of me that operates cleaner.
        </P>
        <P>
          That is not augmentation. That is editing.
        </P>
        <H2>What she is not</H2>
        <P>
          Athena is not on the set. She has never held a lens. She has never felt
          a room go silent when the talent is about to lose it. She cannot make
          the shot. She just makes the room where the shot happens run correctly.
        </P>
        <P>
          Which, if I am being honest, is exactly what a lot of operators in this
          industry need.
        </P>
        <P>
          More Athena diaries coming. She is going to have opinions on Vol. 2.
        </P>
      </>
    ),
  },
];

export function getPost(slug: string) {
  return POSTS.find((p) => p.slug === slug);
}
