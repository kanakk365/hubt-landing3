/**
 * Site content for the HubTech marketing pages.
 * Every product fact here comes from shipped work (screenshots in
 * public/static/landing-page/projects and the product copy HubTech supplied).
 * Do not add client names, metrics or dates that HubTech has not confirmed.
 */

export const BOOKING = {
  namespace: "chat-with-hubtech",
  link: "hubtech/demo",
  url: "https://cal.com/hubtech/demo",
} as const;

export const NAV_LINKS = [{ href: "/ai", label: "AI" }] as const;

const IMG = "/static/landing-page/projects";

export type Accent = "violet" | "cyan" | "blue" | "amber" | "rose" | "lilac" | "lime";

export interface ProductFeature {
  id: string;
  label: string;
  description: string;
  image?: { src: string; width: number; height: number; alt: string; position?: "top" | "left"; artwork?: boolean; redacted?: boolean };
}

export interface Product {
  slug: string;
  name: string;
  category: string;
  summary: string;
  description: string;
  accent: Accent;
  cover?: { src: string; width: number; height: number; alt: string };
  features: ProductFeature[];
  /** What building it added to the team's range. Used on the History page. */
  added: string;
  addedTags: string[];
}

export const PRODUCTS: Product[] = [
  {
    slug: "battles-lounge",
    name: "Battle's Lounge",
    category: "Hybrid esports tournaments",
    summary:
      "Tournaments where youth players compete in a facility's esports arena or from home, in the same bracket.",
    description:
      "Battle's Lounge merges in-person and online gameplay. Organisers run registration, brackets and match updates in one place, and players follow their own tournament history across Fortnite, Apex Legends, FC, Rocket League and more.",
    accent: "violet",
    cover: {
      src: `${IMG}/battle-lounge-2.jpg`,
      width: 650,
      height: 600,
      alt: "Battle's Lounge tournament page for the Apex Weekly Qualifier with a Register Now button",
    },
    features: [
      {
        id: "tournaments",
        label: "In-person and online tournaments",
        description:
          "Real-time esports events that connect players competing on site with players competing remotely.",
        image: {
          src: `${IMG}/battle-lounge-home-crop.jpg`,
          width: 488,
          height: 397,
          alt: "Battle's Lounge home page listing supported games",
        },
      },
      {
        id: "management",
        label: "Tournament management",
        description:
          "The full tournament lifecycle: registration, brackets, players and real-time updates.",
        image: {
          src: `${IMG}/battle-lounge-2.jpg`,
          width: 650,
          height: 600,
          alt: "Tournament detail page with information, players and brackets tabs",
        },
      },
      {
        id: "dashboard",
        label: "Personal gaming dashboard",
        description:
          "Every player's tournament history, upcoming events and achievements in one view.",
        image: {
          src: `${IMG}/battle-lounge-3.jpg`,
          width: 650,
          height: 600,
          alt: "My Tournaments grid filtered by platform and game",
        },
      },
    ],
    added: "Real-time events: registration, brackets and match state that both an arena and a living room can trust.",
    addedTags: ["Realtime", "Brackets", "Web platform"],
  },
  {
    slug: "ysn",
    name: "YSN",
    category: "Live sports streaming",
    summary:
      "HD cameras capture every game so families and recruiters get a front-row seat from anywhere.",
    description:
      "YSN streams games and events with sponsor integration, live chat and multiple camera angles, and gives organisations a place to manage teams, rosters and match history.",
    accent: "cyan",
    cover: {
      src: `${IMG}/ysn-live-interface.jpeg`,
      width: 650,
      height: 600,
      alt: "YSN featured live stream with live chat beside the video and recent matches below",
    },
    features: [
      {
        id: "streaming",
        label: "Professional live streaming",
        description:
          "High-quality live broadcasts with professional presentation and sponsor integration.",
        image: {
          src: `${IMG}/ysn-streaming-crop.jpg`,
          width: 955,
          height: 396,
          alt: "Championship final streaming live with viewer count and live chat",
          position: "left",
        },
      },
      {
        id: "interactive",
        label: "Interactive viewing",
        description:
          "Live chat, multiple camera angles and match schedules around every stream.",
        image: {
          src: `${IMG}/ysn-live-interface.jpeg`,
          width: 650,
          height: 600,
          alt: "Featured live stream with live chat and a row of past matches",
        },
      },
      {
        id: "teams",
        label: "Team management",
        description:
          "Rosters, match history and organisation tools for every team on the network.",
        image: {
          src: `${IMG}/ysn-team-dashboard.jpeg`,
          width: 650,
          height: 600,
          alt: "Team page with record, past match scores and a player roster table",
        },
      },
    ],
    added: "Live video: capture, broadcast and chat at the moment it happens, with sponsors in the frame.",
    addedTags: ["Live video", "Chat", "Media"],
  },
  {
    slug: "connected-athlete",
    name: "Connected Athlete",
    category: "Computer-vision performance analysis",
    summary:
      "AI that analyses athlete movement on video, compares it with elite benchmarks and flags injury risk early.",
    description:
      "Connected Athlete uses computer vision to analyse how athletes move, compare it with elite professionals and generate performance reports. It identifies potential injury risks and shares data with on-site physical therapists and medical partners for proactive care.",
    accent: "blue",
    cover: {
      src: `${IMG}/connected-athlete-dashboard.png`,
      width: 767,
      height: 580,
      alt: "Connected Athlete health dashboard with steps, calories, active energy, stand minutes, sleep and resting heart rate",
    },
    features: [
      {
        id: "movement",
        label: "AI movement analysis",
        description:
          "Breaks down form and technique from video and benchmarks every movement against professionals.",
        image: {
          src: `${IMG}/connected-athlete.webp`,
          width: 1024,
          height: 1024,
          alt: "Connected Athlete artwork: a sprinting athlete beside performance panels",
          artwork: true,
        },
      },
      {
        id: "injury",
        label: "Injury risk detection",
        description:
          "Spots inefficiencies in movement patterns and flags physical issues before they become injuries.",
        image: {
          src: `${IMG}/connected-athlete-dashboard.png`,
          width: 767,
          height: 580,
          alt: "Health dashboard gauges and a resting heart rate chart",
        },
      },
      {
        id: "recovery",
        label: "Integrated recovery loop",
        description:
          "Syncs with physical therapists and health systems to deliver personalised improvement plans.",
        image: {
          src: `${IMG}/connected-athlete-profile-redacted.png`,
          width: 830,
          height: 530,
          redacted: true,
          alt: "Athlete profile with overview, documents, gallery and statistics tabs",
        },
      },
    ],
    added: "Computer vision in production: video in, movement analysis and risk flags out, shared with clinicians.",
    addedTags: ["Computer vision", "Health data", "AI"],
  },
  {
    slug: "rivalis",
    name: "Rivalis",
    category: "AI competitive intelligence",
    summary:
      "Track competitors and get every company you follow scored on the same 27 points.",
    description:
      "Rivalis is competitive intelligence for marketing and strategy teams. Every company you track is scored on 27 points, so rivals are compared on the same axes instead of in scattered notes. It signs in through OnePlace with the same account as the rest of the suite.",
    accent: "rose",
    features: [
      {
        id: "scoring",
        label: "27-point company scoring",
        description: "Every tracked company scored on the same 27 points.",
      },
      {
        id: "tracking",
        label: "Competitor tracking",
        description: "One place for the rivals you follow and how they move.",
      },
      {
        id: "sso",
        label: "One account",
        description: "Central sign-in through OnePlace, shared with every module.",
      },
    ],
    added: "AI applied to strategy: structured scoring over messy public information, comparable across companies.",
    addedTags: ["LLMs", "Scoring", "Research"],
  },
  {
    slug: "xura",
    name: "Xura",
    category: "Energy infrastructure platform",
    summary:
      "The web platform for a Level 3 EV charging and battery storage company, with partner and advertiser portals.",
    description:
      "Xura designs and delivers EV charging and battery energy storage for commercial and fleet sites. We built its platform: the site that explains storage, charging and microgrid load control to operators, a partner portal for EPC partners, contractors and installers, and an advertiser portal for brands running campaigns across the Xura station network, both with one-time-code sign-in.",
    accent: "lime",
    features: [
      {
        id: "site",
        label: "Solutions site",
        description: "Storage, Level 3 charging and microgrid load control explained for operators and fleet owners.",
      },
      {
        id: "partners",
        label: "Partner portal",
        description: "EPC partners, contractors and installers register and sign in with a one-time code.",
      },
      {
        id: "advertisers",
        label: "Advertiser portal",
        description: "Brands and agencies choose campaign packages across the Xura station network.",
      },
    ],
    added: "Two-sided portals: separate partner and advertiser sign-ups with one-time-code verification, on top of a marketing site.",
    addedTags: ["Portals", "OTP sign-in", "Energy"],
  },
  {
    slug: "oneplace",
    name: "OnePlace",
    category: "Every module, one console",
    summary:
      "The jobs a marketing team does every week, behind one login, reporting into one console.",
    description:
      "OnePlace brings competitive intelligence, newsletter and blog publishing, presentations, AI research and tenant operations into one console. Each module reports into a main dashboard, and HubTech's own products sign in through it with one account.",
    accent: "lilac",
    cover: {
      src: `${IMG}/oneplace-console.jpg`,
      width: 1085,
      height: 828,
      alt: "OnePlace main dashboard showing activity across products and a health row for each suite (demo workspace)",
    },
    features: [
      {
        id: "rivalis",
        label: "Competitive intelligence",
        description: "Rivalis scores every company you track on 27 points.",
      },
      {
        id: "publishing",
        label: "Newsletter and blog",
        description: "From research to draft to published.",
      },
      {
        id: "presentation",
        label: "Presentation",
        description: "PDF in, web report out, charts and all.",
      },
      {
        id: "research",
        label: "AI research",
        description: "Several models answer independently; you get one report with sources.",
      },
      {
        id: "programs",
        label: "Programs",
        description: "Sign-ups, orders and health for each tenant.",
      },
    ],
    added: "Platform engineering: one sign-on, one console and live connections across every product we run.",
    addedTags: ["SSO", "Integrations", "Console"],
  },
];

/** Order used for the History page. Inferred from the product story; confirm with HubTech. */
export const HISTORY_ORDER = [
  "battles-lounge",
  "ysn",
  "connected-athlete",
  "rivalis",
  "xura",
  "oneplace",
] as const;

export const AI_PILLARS = [
  {
    id: "systems",
    title: "AI systems",
    description:
      "Systems that read, see and hear, understand information and context, find patterns, predict outcomes and recommend actions.",
    tags: ["Read, see, hear", "Understand", "Predict", "Recommend"],
  },
  {
    id: "agents",
    title: "Agents and automation",
    description:
      "Automation follows a process. An agent pursues an objective: it plans the work, uses approved tools, takes permitted actions and brings people in at defined control points.",
    tags: ["Deterministic", "AI-assisted", "Controlled agentic"],
  },
  {
    id: "evaluation",
    title: "Evaluation and observability",
    description:
      "Testing against agreed acceptance criteria, regression checks whenever anything changes, and monitoring in production, with the system re-verified after every improvement.",
    tags: ["Acceptance criteria", "Regression", "Drift", "Monitoring"],
  },
] as const;

export const HOME = {
  hero: {
    title: ["AI and software,", "built to run."],
    lede:
      "HubTech is a studio that designs, builds and runs AI systems, web platforms and mobile apps for businesses, founders and sports organisations.",
    build: {
      title: "One team from idea to production.",
      line: "Product design, AI, web and mobile engineering under one roof, so nothing gets lost between hand-offs.",
    },
    run: {
      title: "Still right months after launch.",
      line: "Testing before every release, monitoring after it, and the fixes that keep it working with real users.",
    },
  },
  statement:
    "HubTech is an AI and software studio. We design, build and run the systems a business depends on: AI that reads its documents and data, platforms its customers sign in to, apps that live on their phones, and the testing that keeps every release honest.",
  shipped:
    "end to end, from live sports streaming and hybrid esports to computer vision, AI research and energy infrastructure.",
  audiences:
    "established businesses, startup founders, enterprise IT teams and sports organisations.",
  /** Worlds HubTech has shipped into, cycled in the disciplines heading. */
  worlds: ["operations", "tournaments", "broadcasts", "athletes", "energy networks", "research teams"],
} as const;

export const ANATOMY = [
  { title: "Context and data", description: "What the system is allowed to see." },
  { title: "Model", description: "The part that reasons over it." },
  { title: "Tools and systems", description: "What it can actually reach." },
  { title: "Action", description: "What it is permitted to do." },
  { title: "Verification", description: "Whether the output was right." },
  { title: "Monitoring", description: "Whether it still is, months later." },
] as const;

export const PRINCIPLES = [
  { title: "Start with the problem", description: "AI is a means, not the proposition." },
  { title: "Measure before building", description: "Agree what better actually means first." },
  {
    title: "Use the simplest system that works",
    description: "Rules before models, models before agents, where that is enough.",
  },
  {
    title: "Keep people where judgement matters",
    description: "Autonomy is designed, not assumed.",
  },
  {
    title: "Connect AI to the real environment",
    description: "Data, systems, permissions and tools matter as much as the model.",
  },
  {
    title: "Test what runs in production",
    description: "Evaluation continues after release.",
  },
] as const;

export const CAPABILITIES = [
  {
    id: "ai",
    title: "AI development",
    description: "Systems that understand data, act through tools and keep being measured after launch.",
    items: ["Data audit and preparation", "Model selection and training", "Fine-tuning and optimisation", "Integration and deployment", "Evaluation and monitoring"],
  },
  {
    id: "web",
    title: "Web development",
    description: "Modern, responsive web platforms built to carry real traffic and real data.",
    items: ["UI and UX design", "Frontend in React and Next.js", "APIs and backend logic", "Database design", "Launch and monitoring"],
  },
  {
    id: "app",
    title: "App development",
    description: "Native and cross-platform mobile experiences, from wireframe to store release.",
    items: ["Wireframing and prototyping", "iOS with Swift and SwiftUI", "Android with Kotlin and Compose", "Cross-platform builds", "App Store and Play Store release"],
  },
  {
    id: "qa",
    title: "QA and testing",
    description: "Automated and manual testing that keeps every release dependable.",
    items: ["Requirements and coverage analysis", "Test planning", "CI/CD automation", "Manual and exploratory testing", "Reporting and quality gates"],
  },
] as const;

export const ENGAGEMENT = [
  {
    title: "Discover",
    description:
      "We map the problem, the people involved, the data that exists and what success has to look like before anything is built.",
  },
  {
    title: "Design",
    description:
      "Flows, interfaces and system architecture, agreed with you and tested against real cases rather than assumptions.",
  },
  {
    title: "Build",
    description:
      "Short cycles of working software you can click through, with the riskiest parts built first.",
  },
  {
    title: "Verify",
    description:
      "Automated and manual testing against the acceptance criteria, and evaluation for anything that uses a model.",
  },
  {
    title: "Launch",
    description:
      "Deployment, store releases and the monitoring that tells us how it behaves with real users.",
  },
  {
    title: "Run",
    description:
      "We keep measuring, fixing and improving once it is live, so it is still right months later.",
  },
] as const;
