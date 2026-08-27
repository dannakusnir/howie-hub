export type ChecklistSection = {
  letter: string;
  title: string;
  intro: string;
  bottomLine: string;
  groups: {
    heading?: string;
    items: string[];
  }[];
  watchOut?: string;
};

export const COVER_SECTIONS: ChecklistSection[] = [
  {
    letter: "C",
    title: "Check Your Policy Requirements",
    intro: "Cyber policies often include specific conditions around MFA, backups, patching, endpoint protection, training, vendor security, incident reporting, and documentation. If your business said yes to a control on the application, the insurer may expect it to be active, enforced, and provable.",
    bottomLine: "Your policy is not just a payment. It is a set of conditions. Know them before a claim happens.",
    groups: [
      {
        heading: "What to check",
        items: [
          "We have the full cyber insurance policy, not just the certificate.",
          "We have a copy of the application or renewal questionnaire we submitted.",
          "We know which cybersecurity controls are required for coverage.",
          "We know what exclusions could limit or deny a claim.",
          "We have asked our broker or insurer to clarify anything unclear in writing.",
          "We have shared the policy requirements with our IT provider or cybersecurity partner.",
        ],
      },
    ],
  },
  {
    letter: "O",
    title: "Own Your MFA",
    intro: "Passwords alone are no longer enough. MFA adds another layer of protection before a stolen password becomes a full business compromise. Many policies ask whether MFA is enabled, and partial implementation is where things break.",
    bottomLine: "If attackers get into your email, admin tools, or financial systems, the damage spreads fast. MFA stops stolen passwords from becoming full compromise.",
    watchOut: "MFA on some accounts is not the same as MFA across the business. Admin, remote access, email, and financial systems are high priority.",
    groups: [
      {
        heading: "Where MFA should be reviewed",
        items: [
          "Email accounts",
          "Microsoft 365 or Google Workspace",
          "Banking and financial accounts",
          "Payroll systems",
          "Accounting software",
          "Remote access tools",
          "VPN or remote desktop access",
          "Cloud applications",
          "Admin accounts",
          "Backup systems",
          "Cybersecurity tools",
          "Vendor portals",
        ],
      },
    ],
  },
  {
    letter: "V",
    title: "Verify Your Backups",
    intro: "A system saying backups are running is not the same as backups that can actually restore the business. During ransomware, server failure, or deletion, many businesses discover their backups were incomplete, corrupted, or never tested.",
    bottomLine: "Backups do not protect your business unless they can be restored when it matters.",
    watchOut: "A backup report is not the same as a recovery test. The only way to know if backups work is to test them.",
    groups: [
      {
        heading: "What to verify",
        items: [
          "Backups are running successfully.",
          "Critical files, systems, and applications are included.",
          "Backups are protected from ransomware.",
          "Backups are stored separately from the main network.",
          "Cloud systems are included (Microsoft 365, Google Workspace, cloud apps).",
          "We have completed a test restore recently.",
          "We know how long recovery would actually take.",
          "We know who is responsible for restoring systems during an incident.",
        ],
      },
    ],
  },
  {
    letter: "E",
    title: "Educate Your Team",
    intro: "Many cyber incidents start with a human moment: a phishing click, a fake invoice, a reused password, a fraudulent request that looks legitimate. Training does not need to be complicated, but it needs to be consistent.",
    bottomLine: "Cybersecurity is not just an IT issue. It is a business habit your whole team needs to practice.",
    groups: [
      {
        heading: "What employees should be trained to spot",
        items: [
          "Phishing emails",
          "Fake invoices",
          "Suspicious payment requests",
          "Business email compromise attempts",
          "Password reset scams",
          "Vendor impersonation",
          "Executive impersonation",
          "Malicious attachments",
          "Suspicious links",
          "Urgent requests asking them to bypass normal process",
        ],
      },
      {
        heading: "What employees should know",
        items: [
          "How to report suspicious emails",
          "Who to contact during a possible incident",
          "Why they should not reuse passwords",
          "Why MFA matters",
          "Why payment changes should be verified through a second channel",
          "Why cyber incidents should be reported immediately",
        ],
      },
    ],
  },
  {
    letter: "R",
    title: "Record Your Compliance",
    intro: "If a claim happens, being secure may not be enough. You may need to prove it. Cyber claims often involve questions about what controls were in place before the incident, and documentation is what answers them.",
    bottomLine: "Documentation can be the difference between we think we did it and here is the proof.",
    watchOut: "If it is not documented, it may be difficult to prove later.",
    groups: [
      {
        heading: "What to keep records of",
        items: [
          "MFA settings and screenshots",
          "Backup reports",
          "Backup test results",
          "Employee training records",
          "Security awareness attendance",
          "Patch management reports",
          "Endpoint protection reports",
          "Incident response plan",
          "Vendor security documentation",
          "Cyber insurance application and renewal forms",
          "Policy documents and endorsements",
          "Security review notes",
          "IT provider reports",
          "Risk assessment results",
        ],
      },
    ],
  },
];

export const VOIDS_SECTIONS: ChecklistSection[] = [
  {
    letter: "V",
    title: "View Insurance as a Security Plan",
    intro: "Cyber insurance is not a cybersecurity strategy. It helps with financial recovery after an incident. It does not stop phishing, block ransomware, patch software, secure access, or restore broken systems.",
    bottomLine: "Insurance helps after the damage. Security helps prevent the damage from spreading.",
    groups: [
      {
        heading: "Do not assume",
        items: [
          "We have insurance, so we are protected.",
          "Our insurer will cover everything.",
          "Cybersecurity is only needed after something happens.",
          "Our IT provider automatically handles every policy requirement.",
          "A policy means our claim will definitely be paid.",
        ],
      },
    ],
  },
  {
    letter: "O",
    title: "Overlook Patches and Updates",
    intro: "Software updates often fix known vulnerabilities. When updates are ignored, attackers exploit weaknesses that already have available fixes. After a breach, unpatched systems can complicate the claim process.",
    bottomLine: "Patching is not exciting, but it is one of the basic habits that prevents expensive problems.",
    watchOut: "Unsupported systems are a major risk. If software no longer receives security updates, have a plan to replace, isolate, or protect it.",
    groups: [
      {
        heading: "Review these areas",
        items: [
          "Operating systems",
          "Servers",
          "Firewalls",
          "Routers",
          "Business applications",
          "Accounting software",
          "Remote access tools",
          "Endpoint protection",
          "Web plugins",
          "Cloud applications",
          "Mobile devices",
          "Old or unsupported software",
        ],
      },
    ],
  },
  {
    letter: "I",
    title: "Ignore Access Control",
    intro: "Access control means the right people have the right access and nothing more. Poor access control makes breaches worse. One compromised account with too much access spreads damage faster.",
    bottomLine: "The fewer unnecessary keys you hand out, the less damage one stolen key can do.",
    groups: [
      {
        heading: "Common access control problems",
        items: [
          "Shared passwords",
          "Too many admin users",
          "Former employees with active accounts",
          "Vendors with unnecessary access",
          "No regular access reviews",
          "Weak passwords",
          "Reused passwords",
          "No password manager",
          "Remote access without MFA",
          "Employees using personal accounts for business work",
        ],
      },
      {
        heading: "What to review",
        items: [
          "Who has admin access?",
          "Who has access to financial systems?",
          "Who can approve payments or wire transfers?",
          "Who has remote access?",
          "Are former employees fully removed?",
          "Are vendor accounts still needed?",
          "Are permissions reviewed at least quarterly?",
        ],
      },
    ],
  },
  {
    letter: "D",
    title: "Delay Incident Reporting",
    intro: "Waiting makes the damage worse. Many policies have reporting requirements, approved vendors, response procedures, and notification timelines. Know who to contact before an incident, not after.",
    bottomLine: "Do not wait until Monday. Do not try to quietly fix it first. Report early so the right people can help contain the damage.",
    groups: [
      {
        heading: "Report quickly if you notice",
        items: [
          "Suspicious login activity",
          "Ransomware message",
          "Lost or stolen device",
          "Business email compromise",
          "Unauthorized wire transfer",
          "Strange admin activity",
          "Missing or encrypted files",
          "Suspicious vendor payment change",
          "Customer data exposure",
          "Malware alert",
          "Employee account takeover",
        ],
      },
      {
        heading: "Know who to contact",
        items: [
          "IT provider or cybersecurity partner",
          "Cyber insurance broker",
          "Cyber insurance carrier claims contact",
          "Legal counsel",
          "Internal leadership team",
          "Finance team",
          "Communications lead",
          "Required regulatory or customer contacts, if applicable",
        ],
      },
    ],
  },
  {
    letter: "S",
    title: "Skip the Fine Print",
    intro: "Policies include exclusions, limits, conditions, sublimits, warranties, reporting timelines, approved response vendors, and specific security requirements. Skipping the fine print leads to assumptions that cost money after the incident.",
    bottomLine: "Assumptions are expensive. Read the policy before you need the policy.",
    groups: [
      {
        heading: "Review these details",
        items: [
          "Coverage limits",
          "Deductibles or retentions",
          "Exclusions",
          "Ransomware conditions",
          "Business interruption terms",
          "Social engineering or funds transfer fraud coverage",
          "Data breach response coverage",
          "Incident reporting timelines",
          "Approved breach response vendors",
          "Required security controls",
          "Sublimits for certain claim types",
          "Conditions tied to MFA, backups, patching, or training",
        ],
      },
      {
        heading: "Questions to ask your broker or carrier",
        items: [
          "What could cause a cyber claim to be denied?",
          "What security controls are required for coverage?",
          "Are our application answers considered part of the policy?",
          "What incidents must be reported immediately?",
          "Who are we required to call first after an incident?",
          "Are ransomware, business interruption, and social engineering losses covered?",
          "What documentation should we keep?",
        ],
      },
    ],
  },
];
