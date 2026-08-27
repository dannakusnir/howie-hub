export type Slide = {
  id: string;
  layout: "title" | "content" | "stats" | "quote" | "bio" | "athena" | "cta" | "transition" | "case_study" | "hook" | "questions";
  kicker?: string;
  title: string;
  subtitle?: string;
  body?: string;
  bullets?: string[];
  bottomLine?: string;
  letter?: string;
  stats?: { value: string; label: string }[];
  bio?: { name: string; role: string; lines: string[]; image?: string };
  tone?: "default" | "danger";
  caseStudy?: {
    label: string;
    oneLiner: string;
    narrative: string[];
    takeaway: string;
    source: string;
  };
  questions?: string[];
  extraBullets?: { heading: string; items: string[] }[];
};

export const SLIDES: Slide[] = [
  // 01 - Title
  {
    id: "title",
    layout: "title",
    kicker: "Live Webinar / June 22, 2026",
    title: "Covered, Not Voided.",
    subtitle: "The cyber insurance dos and don'ts every business owner should know before a claim gets denied.",
  },
  // 02 - What We'll Cover
  {
    id: "agenda",
    layout: "content",
    kicker: "What we'll cover",
    title: "60 minutes. One framework.",
    bullets: [
      "Meet your hosts: Howie and Michael",
      "Why most cyber policies fail the businesses they're supposed to protect",
      "The five things to do to stay covered: C.O.V.E.R.",
      "The five mistakes that get claims denied: V.O.I.D.S.",
      "Real local breach examples and coverage disputes",
      "Free downloadable checklist + live Q&A",
    ],
  },
  // 03 - Howie
  {
    id: "howie",
    layout: "bio",
    kicker: "Your hosts / 1 of 2",
    title: "Howie Zales",
    bio: {
      name: "Howie Zales",
      role: "Operator. Founder. Builder.",
      lines: [
        "25 years behind a camera at the Super Bowl, the Olympics, and WrestleMania.",
        "Now applies the same operator discipline to scaling businesses.",
        "Has lived through the cybersecurity wake up calls every owner eventually faces.",
      ],
      image: "/howie-profile.png",
    },
  },
  // 04 - Michael
  {
    id: "michael",
    layout: "bio",
    kicker: "Your hosts / 2 of 2",
    title: "Michael Hornby",
    bio: {
      name: "Michael Hornby",
      role: "Technology Strategist & CEO, Techmentum",
      lines: [
        "Helps business owners get coverage that actually pays when it matters.",
        "Knows exactly what insurers look for and what makes claims succeed.",
        "Knows the quiet exclusions that get claims denied.",
      ],
      image: "/michael-techmentum.jpg",
    },
  },
  // 05 - Opening Hook
  {
    id: "hook",
    layout: "hook",
    kicker: "The question worth asking",
    title: "You may be paying for cyber insurance...",
    subtitle: "But would your claim actually get paid?",
  },
  // 06 - The Better Question
  {
    id: "better-question",
    layout: "quote",
    kicker: "The better question",
    title: "Don't just ask:",
    subtitle: "“Do we have cyber insurance?”",
    body: "Ask: Can we prove we did what the policy required before the breach happened?",
  },
  // 07 - The Reality
  {
    id: "problem",
    layout: "stats",
    kicker: "The reality",
    title: "Most owners think they're covered.",
    subtitle: "Then a claim gets denied.",
    stats: [
      { value: "60%", label: "of SMBs experience a cyber incident annually" },
      { value: "277 days", label: "average time to identify and contain a breach" },
      { value: "1 in 3", label: "cyber insurance claims are partially or fully denied" },
    ],
  },
  // 08 - Big Idea
  {
    id: "big-idea",
    layout: "quote",
    kicker: "The big idea",
    title: "C.O.V.E.R. keeps you protected.",
    subtitle: "V.O.I.D.S. gets you denied.",
    body: "Do the COVER steps. Avoid the VOIDS mistakes.",
  },
  // 09 - Why This Matters Locally
  {
    id: "local-matters",
    layout: "content",
    kicker: "Why this matters locally",
    title: "This is not just a big-company problem.",
    body: "Cyber incidents have publicly affected regional organizations in New York and New Jersey.",
    bullets: [
      "Local accounting firms hit by ransomware",
      "Regional medical practices with patient data exposed",
      "Healthcare providers facing federal enforcement",
      "Settlements, corrective action plans, and penalties",
    ],
    bottomLine: "If your business handles client, employee, patient, financial, or operational data, this can happen here.",
  },
  // 10 - COVER intro
  {
    id: "cover-intro",
    layout: "transition",
    kicker: "Part 1 / DO",
    title: "C.O.V.E.R.",
    subtitle: "Five things to do to stay insurable, protected, and prepared.",
  },
  // 11 - C
  {
    id: "cover-c",
    layout: "content",
    letter: "C",
    kicker: "C.O.V.E.R. / 1 of 5",
    title: "Check Your Policy Requirements",
    body: "If your business said yes to a security control on the application, the insurer expects it to be active, enforced, and provable.",
    bullets: [
      "Do you have the full policy, not just the certificate?",
      "Do you have a copy of the application or renewal questionnaire?",
      "Do you know which controls are required for coverage?",
      "Do you know what exclusions could deny a claim?",
    ],
    extraBullets: [
      {
        heading: "Your policy may require safeguards like",
        items: ["MFA", "Backups", "Software updates", "Endpoint protection", "Employee training", "Vendor security", "Fast incident reporting", "Documentation"],
      },
    ],
    bottomLine: "Your policy is not just a payment. It is a set of conditions. Know them before a claim happens.",
  },
  // 12 - C Example
  {
    id: "cover-c-example",
    layout: "case_study",
    kicker: "Coverage example",
    title: "International Control Services vs. Travelers",
    caseStudy: {
      label: "When the insurance application became the problem",
      oneLiner: "Travelers challenged the policy because it said the business gave incorrect answers about MFA on its insurance application.",
      narrative: [
        "International Control Services had a ransomware incident.",
        "Afterward, Travelers challenged the policy based on the application answers about multi-factor authentication.",
        "The case ended with the policy being rescinded, treated as if it had never existed.",
      ],
      takeaway: "Do not guess on insurance forms. If your business says a security control is in place, make sure it is actually in place and that you have proof.",
      source: "Travelers v. ICS court order / Lockton analysis",
    },
  },
  // 13 - O
  {
    id: "cover-o",
    layout: "content",
    letter: "O",
    kicker: "C.O.V.E.R. / 2 of 5",
    title: "Own Your MFA",
    body: "MFA needs to protect the accounts attackers actually want.",
    bullets: [
      "Email, Microsoft 365, Google Workspace",
      "Banking, payroll, accounting software",
      "Remote access, VPN, cloud applications",
      "Admin accounts, backup systems, vendor portals",
    ],
    extraBullets: [
      {
        heading: "Where owners fall short",
        items: [
          "MFA is only turned on for some users",
          "Admin accounts are left out",
          "Remote access is not protected",
          "Old login methods are still allowed",
          "Exceptions are not documented",
        ],
      },
    ],
    bottomLine: "MFA on some accounts is not the same as MFA across the business.",
  },
  // 14 - O Example
  {
    id: "cover-o-example",
    layout: "case_study",
    kicker: "Coverage example",
    title: "The MFA Gap in Travelers v. ICS",
    caseStudy: {
      label: "“We have MFA” may not be specific enough",
      oneLiner: "The issue was whether MFA was set up the way the company said it was on the insurance application.",
      narrative: [
        "In the Travelers v. ICS case, MFA was not simply about whether it existed somewhere.",
        "Reports said Travelers alleged MFA was only used in one area, not across other important systems.",
        "Ask: Where is MFA turned on? Who must use it? Are admin and remote access protected? Are there exceptions?",
      ],
      takeaway: "“MFA exists” is not enough. You need to know where it exists.",
      source: "Travelers v. ICS court order / Lockton analysis",
    },
  },
  // 15 - V
  {
    id: "cover-v",
    layout: "content",
    letter: "V",
    kicker: "C.O.V.E.R. / 3 of 5",
    title: "Verify Your Backups",
    body: "Backups are not useful unless they can actually restore the business.",
    bullets: [
      "Are backups running successfully?",
      "Are critical systems included?",
      "Are backups protected from ransomware?",
      "Are backups stored separately from the main network?",
      "Has a test restore been completed?",
      "Do we know how long recovery would actually take?",
    ],
    bottomLine: "A backup report is not the same as a recovery test.",
  },
  // 16 - How to Test Backups
  {
    id: "cover-v-test",
    layout: "content",
    kicker: "Backups deep dive",
    title: "How to Test Backups Before Ransomware Does",
    body: "A backup is only useful if it restores.",
    bullets: [
      "Can we restore one file?",
      "Can we restore one full system?",
      "Can we restore cloud data?",
      "Can we restore without using the compromised network?",
      "How long would recovery take?",
      "Who is responsible during recovery?",
      "Was the test documented?",
    ],
    extraBullets: [
      {
        heading: "Where owners fall short",
        items: [
          "They have backup reports, but no restore tests",
          "Cloud apps are not included",
          "Backups are connected to systems ransomware can reach",
          "No one knows the real recovery timeline",
        ],
      },
    ],
    bottomLine: "A backup report says something ran. A restore test proves the business can recover.",
  },
  // 17 - V Example 1: Comprehensive Neurology
  {
    id: "cover-v-example-1",
    layout: "case_study",
    kicker: "Local example",
    title: "Comprehensive Neurology, PC",
    caseStudy: {
      label: "When ransomware locked up business data",
      oneLiner: "A small New York medical practice. Ransomware encrypted its IT network, including electronic patient information.",
      narrative: [
        "HHS OCR said ransomware encrypted the practice's IT network.",
        "In plain English, parts of the practice's data became locked and unavailable.",
        "6,800 people may have been affected. The practice agreed to pay $25,000 and follow a corrective action plan.",
      ],
      takeaway: "Ransomware is not just a technical problem. It can stop access to the information a business needs to operate.",
      source: "HHS OCR",
    },
  },
  // 18 - V Example 2: Central Jersey Medical Center
  {
    id: "cover-v-example-2",
    layout: "case_study",
    kicker: "Local example",
    title: "Central Jersey Medical Center",
    caseStudy: {
      label: "One affected system can still create a serious incident",
      oneLiner: "An outside party accessed its dental server network and used ransomware to encrypt files.",
      narrative: [
        "Potentially involved information: names, dates of birth, addresses, Social Security numbers, health insurance, dental diagnoses, treatment history, billing.",
        "CJMC also said its electronic medical record system was not involved.",
        "A department system, specialized application, or server used by one part of the business can still contain sensitive information.",
      ],
      takeaway: "Every system that stores important data needs to be protected and included in the recovery plan.",
      source: "Central Jersey Medical Center notice",
    },
  },
  // 19 - E
  {
    id: "cover-e",
    layout: "content",
    letter: "E",
    kicker: "C.O.V.E.R. / 4 of 5",
    title: "Educate Your Team",
    body: "Many cyber incidents start with a human moment: a phishing click, a fake invoice, a fraudulent request that looks legitimate.",
    bullets: [
      "Train people to spot phishing, BEC, and payment scams",
      "Verify payment changes through a second channel",
      "Report suspicious activity immediately, no judgment",
      "Make security awareness a quarterly habit, not annual",
    ],
    bottomLine: "Cybersecurity is not just an IT issue. It is a business habit your whole team needs to practice.",
  },
  // 20 - E Example 1: Wojeski
  {
    id: "cover-e-example-1",
    layout: "case_study",
    kicker: "Local example",
    title: "Wojeski & Company",
    caseStudy: {
      label: "One phishing email led to bigger problems",
      oneLiner: "A New York accounting firm. Ransomware attack, likely caused by a phishing email sent to an employee.",
      narrative: [
        "The incident exposed personal information of more than 4,700 New Yorkers.",
        "The firm later agreed to pay $60,000 after the AG said it waited too long to notify affected people.",
        "A phishing email is not just an email. One click can lead to ransomware, exposed client data, legal problems, penalties, and lost trust.",
      ],
      takeaway: "Train employees to pause, question, and report suspicious messages.",
      source: "New York Attorney General",
    },
  },
  // 21 - E Example 2: BST
  {
    id: "cover-e-example-2",
    layout: "case_study",
    kicker: "Local example",
    title: "BST & Co. CPAs, LLP",
    caseStudy: {
      label: "Professional service firms can carry sensitive client data",
      oneLiner: "A New York accounting, business advisory, and consulting firm. Part of its network was infected with ransomware.",
      narrative: [
        "HHS OCR said BST did not complete an accurate and thorough review of its security risks.",
        "BST agreed to pay $175,000 and follow a corrective action plan.",
        "Accounting, advisory, law, consulting firms may hold sensitive client information. If exposed, the issue grows beyond internal IT cleanup.",
      ],
      takeaway: "If clients trust you with sensitive data, your security responsibilities grow.",
      source: "HHS OCR",
    },
  },
  // 22 - R
  {
    id: "cover-r",
    layout: "content",
    letter: "R",
    kicker: "C.O.V.E.R. / 5 of 5",
    title: "Record Your Compliance",
    body: "If a claim happens, being secure may not be enough. You may need to prove it. Documentation is what answers the insurer's questions.",
    bullets: [
      "MFA settings",
      "Backup restore tests",
      "Employee training completion",
      "Software update records",
      "Access reviews, incident response plan, security policies",
      "Vendor reviews, insurance application, written broker clarifications",
    ],
    extraBullets: [
      {
        heading: "Where owners fall short",
        items: [
          "They rely on memory",
          "They cannot find old renewal answers",
          "They have no screenshots or reports",
          "They cannot prove when controls were active",
        ],
      },
    ],
    bottomLine: "Documentation is the difference between we think we did it and here is the proof.",
  },
  // 23 - R Example
  {
    id: "cover-r-example",
    layout: "case_study",
    kicker: "Local examples",
    title: "BST & Co. and Comprehensive Neurology",
    caseStudy: {
      label: "“We thought we were secure” is not enough",
      oneLiner: "Regulators, insurers, and business partners may expect more than verbal assurance.",
      narrative: [
        "In BST, HHS OCR said the firm failed to complete an accurate and thorough review of its security risks.",
        "In Comprehensive Neurology, HHS OCR also pointed to issues around understanding and managing security risks.",
        "They may want documentation showing what was reviewed, what risks were found, what was fixed, and what still needs attention.",
      ],
      takeaway: "Do not rely on memory. Keep proof.",
      source: "HHS OCR",
    },
  },
  // 24 - VOIDS intro
  {
    id: "voids-intro",
    layout: "transition",
    kicker: "Part 2 / DON'T",
    title: "V.O.I.D.S.",
    subtitle: "Five mistakes that put your coverage, claim, and business at risk.",
    tone: "danger",
  },
  // 25 - V
  {
    id: "voids-v",
    layout: "content",
    letter: "V",
    kicker: "V.O.I.D.S. / 1 of 5",
    title: "Don't View Insurance As a Security Plan",
    body: "Cyber insurance does not stop phishing, patch systems, manage passwords, secure remote access, train employees, restore systems, or prevent ransomware.",
    bullets: [
      "Cyber insurance helps with financial recovery after an incident",
      "Cybersecurity helps reduce the chance and impact of the incident",
    ],
    bottomLine: "Insurance helps after the damage. Security helps prevent the damage from spreading.",
    tone: "danger",
  },
  // 26 - V Example
  {
    id: "voids-v-example",
    layout: "case_study",
    kicker: "Local examples",
    title: "Local Incidents Prove the Point",
    tone: "danger",
    caseStudy: {
      label: "Insurance does not stop the incident",
      oneLiner: "Wojeski, BST, Comprehensive Neurology, and Central Jersey Medical Center were all publicly tied to ransomware or cyber incidents.",
      narrative: [
        "Regional organizations can face ransomware, phishing, exposed data, and operational disruption.",
        "They may also face regulatory review, corrective action, and penalties.",
        "Cyber insurance may help after an incident, depending on the policy.",
      ],
      takeaway: "Insurance does not prevent the incident from happening.",
      source: "NY AG / HHS OCR / public notices",
    },
  },
  // 27 - O
  {
    id: "voids-o",
    layout: "content",
    letter: "O",
    kicker: "V.O.I.D.S. / 2 of 5",
    title: "Don't Overlook Patches and Updates",
    body: "Old systems create avoidable risk.",
    bullets: [
      "Operating systems, servers, firewalls, routers",
      "Business applications, remote access tools",
      "Endpoint protection, cloud applications",
      "Mobile devices, unsupported software",
    ],
    bottomLine: "Updates may feel routine, but ignoring them can become expensive.",
    tone: "danger",
  },
  // 28 - O Example
  {
    id: "voids-o-example",
    layout: "case_study",
    kicker: "Control example",
    title: "System Inventory Before System Security",
    tone: "danger",
    caseStudy: {
      label: "You cannot protect what you do not track",
      oneLiner: "Central Jersey Medical Center's notice said the incident involved its dental server network.",
      narrative: [
        "The notice did not say missed updates caused the incident.",
        "So the lesson is not that they failed to update their systems.",
        "Every server, application, and data location needs to be known, maintained, monitored, and protected.",
      ],
      takeaway: "You cannot update systems you forgot existed. You cannot protect data you did not know was there.",
      source: "CJMC public notice",
    },
  },
  // 29 - I
  {
    id: "voids-i",
    layout: "content",
    letter: "I",
    kicker: "V.O.I.D.S. / 3 of 5",
    title: "Don't Ignore Access Control",
    body: "Not everyone should have access to everything.",
    bullets: [
      "Shared passwords, too many admin users",
      "Former employees with active accounts",
      "Vendors with unnecessary access",
      "No access reviews, weak or reused passwords",
      "Remote access without MFA, personal accounts for business work",
    ],
    bottomLine: "The fewer unnecessary keys you hand out, the less damage one stolen key can do.",
    tone: "danger",
  },
  // 30 - I Example
  {
    id: "voids-i-example",
    layout: "case_study",
    kicker: "Coverage example",
    title: "BitPay vs. Massachusetts Bay Insurance",
    tone: "danger",
    caseStudy: {
      label: "A partner's compromised account created a coverage fight",
      oneLiner: "BitPay reportedly lost about $1.8 million in bitcoin after a phishing attack.",
      narrative: [
        "According to reporting, the insurer refused to pay based on the policy wording.",
        "The initial compromise involved a business partner's system, not BitPay's own system.",
        "Your risk does not stop at your own employees. Vendors, partners, payment approvals, third-party tools, and transfer instructions can all create exposure.",
      ],
      takeaway: "Before money moves, verify the request through a separate trusted channel.",
      source: "CSO Online / CoinDesk",
    },
  },
  // 31 - D
  {
    id: "voids-d",
    layout: "content",
    letter: "D",
    kicker: "V.O.I.D.S. / 4 of 5",
    title: "Don't Delay Incident Reporting",
    body: "Speed matters during a cyber incident.",
    bullets: [
      "Suspicious login activity, ransomware message",
      "Lost or stolen device, business email compromise",
      "Unauthorized wire transfer, encrypted files",
      "Customer data exposure, employee account takeover",
    ],
    bottomLine: "Do not wait until Monday. Do not quietly fix it first. Report early.",
    tone: "danger",
  },
  // 32 - D Example
  {
    id: "voids-d-example",
    layout: "case_study",
    kicker: "Local example",
    title: "Wojeski & Company",
    tone: "danger",
    caseStudy: {
      label: "Waiting too long can create another problem",
      oneLiner: "The NY AG said Wojeski waited more than a year to notify affected people after personal data was put at risk.",
      narrative: [
        "The settlement required the firm to pay $60,000 and improve its cybersecurity program.",
        "The incident itself may not be the only issue.",
        "A slow response can create more legal, regulatory, and reputation problems.",
      ],
      takeaway: "Know who to call before something happens.",
      source: "New York Attorney General",
    },
  },
  // 33 - S
  {
    id: "voids-s",
    layout: "content",
    letter: "S",
    kicker: "V.O.I.D.S. / 5 of 5",
    title: "Don't Skip the Fine Print",
    body: "The fine print is where coverage decisions can happen.",
    bullets: [
      "Coverage limits, deductibles, exclusions",
      "Ransomware and business interruption terms",
      "Social engineering and funds transfer fraud coverage",
      "Incident reporting timelines, approved response vendors",
      "Required safeguards, sublimits",
    ],
    extraBullets: [
      {
        heading: "Where owners fall short",
        items: [
          "They assume all cyber losses are covered",
          "They miss small sublimits",
          "They do not ask about fake invoices or wire fraud",
          "They do not know the reporting deadline",
          "They do not know which vendors must be used after an incident",
        ],
      },
    ],
    bottomLine: "Assumptions are expensive. Read the policy before you need the policy.",
    tone: "danger",
  },
  // 34 - S Example 1: EMOI
  {
    id: "voids-s-example-1",
    layout: "case_study",
    kicker: "Coverage example",
    title: "EMOI Services vs. Owners Insurance",
    tone: "danger",
    caseStudy: {
      label: "The policy wording did not fit the loss",
      oneLiner: "EMOI suffered a ransomware attack and looked to its insurance policy for coverage.",
      narrative: [
        "The Supreme Court of Ohio held that the policy required a specific type of physical damage to covered software or media.",
        "The court found that the ransomware incident did not meet that requirement.",
        "A business can be badly disrupted and still face a coverage denial if the policy does not cover that type of loss.",
      ],
      takeaway: "Do not assume “cyber incident” automatically means “covered claim.”",
      source: "Supreme Court of Ohio",
    },
  },
  // 35 - S Example 2: P.F. Chang's
  {
    id: "voids-s-example-2",
    layout: "case_study",
    kicker: "Coverage example",
    title: "P.F. Chang's vs. Federal Insurance",
    tone: "danger",
    caseStudy: {
      label: "Covered does not mean every cost is covered",
      oneLiner: "After a payment card data breach, P.F. Chang's sought coverage for certain credit card-related fees and assessments.",
      narrative: [
        "Legal summaries report that the court found no coverage for more than $1.9 million in those assessments.",
        "A policy may cover some breach costs, but not every cost connected to the breach.",
      ],
      takeaway: "Ask exactly what is covered and what is not.",
      source: "National Law Review / court summary",
    },
  },
  // 36 - Three Questions
  {
    id: "three-questions",
    layout: "questions",
    kicker: "Before your next renewal",
    title: "The Three Questions to Ask",
    questions: [
      "What does our policy require us to have in place?",
      "Are those controls actually implemented across the business?",
      "Can we prove it with documentation?",
    ],
    bottomLine: "If the answer to any of these is unclear, that is your starting point.",
  },
  // 37 - Q&A prompts
  {
    id: "qa-prompts",
    layout: "content",
    kicker: "Live Q&A",
    title: "Questions?",
    body: "Drop them in the chat. Here are a few prompts if you're thinking about what to ask:",
    bullets: [
      "What should business owners review first?",
      "What should be documented?",
      "Who should be involved in policy review?",
      "What are the most common cyber insurance gaps?",
      "How often should controls be reviewed?",
    ],
  },
  // 38 - Free Download / Checklist
  {
    id: "checklist",
    layout: "content",
    kicker: "Your free download",
    title: "The Covered, Not Voided Checklist",
    body: "Audit your business against the C.O.V.E.R. framework in 15 minutes. Most owners find at least three gaps the first time through.",
    bullets: [
      "Free PDF, no strings attached",
      "Interactive online version saves your progress",
      "Built with Techmentum, made for business owners",
      "Get it at cyber-webinar.vercel.app/checklist",
    ],
  },
  // 39 - Athena
  {
    id: "athena",
    layout: "athena",
    kicker: "Bonus / Curious about AI?",
    title: "Meet Athena.",
    body: "The AI operator running Howie's day to day, from meetings to follow ups to decisions. If you have been wondering what AI inside a real business actually looks like, this is where to start.",
    bio: {
      name: "Athena",
      role: "AI Operator",
      lines: [],
      image: "/athena-close.webp",
    },
  },
  // 40 - Closing CTA
  {
    id: "closing-cta",
    layout: "quote",
    kicker: "Closing CTA",
    title: "Don't wait for a breach",
    subtitle: "to find out what your policy requires.",
    body: "Talk to your broker. Talk to your IT provider. Review your controls. Document your proof.",
  },
  // 41 - Pick the Conversation (QR Codes)
  {
    id: "cta",
    layout: "cta",
    kicker: "Pick the conversation you need",
    title: "Two doors. Both free.",
    subtitle: "Scan to book a 30 minute conversation.",
  },
];

export const BOOK_HOWIE_URL = "https://calendly.com/hzales/30min";
export const BOOK_MICHAEL_URL = "https://outlook.office365.com/owa/calendar/FreeConsultationwithMichaelHornby@techmentumit.com/bookings/";
