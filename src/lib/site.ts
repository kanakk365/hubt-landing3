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
  image?: {
    src: string;
    width: number;
    height: number;
    alt: string;
    position?: "top" | "left";
    artwork?: boolean;
    redacted?: boolean;
  };
}

export interface Product {
  slug: string;
  name: string;
  category: string;
  summary: string;
  description: string;
  accent: Accent;
  cover?: { src: string; width: number; height: number; alt: string; label?: string };
  /** /products only: what the product is in plain words, where `category` is a tagline (other pages keep `category`). */
  kind?: string;
  /** /products only: the screen that stands for the product in the reel and the index preview, when it isn't the cover. */
  lead?: NonNullable<ProductFeature["image"]>;
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
      "Esports tournaments that put players in a facility's arena and players at home in the same bracket. Organisers run registration, brackets and match updates in one place; players track their history across Fortnite, Apex Legends, FC, Rocket League and more.",
    accent: "violet",
    cover: {
      src: `${IMG}/battle-lounge-2.jpg`,
      width: 650,
      height: 600,
      alt: "Battle's Lounge tournament page for the Apex Weekly Qualifier with a Register Now button",
    },
    lead: {
      src: `${IMG}/battle-lounge-home-crop.jpg`,
      width: 488,
      height: 397,
      alt: "Battle's Lounge home page: Welcome to the battleground of esports, for Xbox, PlayStation and PC",
    },
    features: [
      {
        id: "tournaments",
        label: "In-person and online tournaments",
        description:
          "Arena players and online players compete in the same live event.",
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
          "Registration, brackets, rosters and live match updates.",
        image: {
          src: `${IMG}/battle-lounge-2.jpg`,
          width: 650,
          height: 600,
          alt: "Tournament detail page with information, players and brackets tabs",
        },
      },
      {
        id: "dashboard",
        label: "Player dashboard",
        description:
          "Each player's past tournaments, upcoming events and achievements.",
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
      "Live HD streams of games and events, with chat, multiple camera angles and sponsor placements. Organisations manage their teams, rosters and match history in the same place.",
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
        label: "Live streaming",
        description:
          "HD broadcasts with sponsor placements built in.",
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
        label: "Chat and camera angles",
        description:
          "Live chat, several angles and the match schedule around every stream.",
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
          "Rosters, records and match history for every team on the network.",
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
      "A performance and health platform for athletes. Computer vision analyses movement on video against elite benchmarks and flags injury risk early; dashboards and athlete profiles share the data with physical therapists and medical partners.",
    accent: "blue",
    cover: {
      src: `${IMG}/connected-athlete-dashboard.png`,
      width: 767,
      height: 580,
      alt: "Connected Athlete health dashboard with steps, calories, active energy, stand minutes, sleep and resting heart rate",
    },
    features: [
      {
        id: "health",
        label: "Health dashboard",
        description:
          "Steps, calories, active energy, sleep and resting heart rate for each athlete.",
        image: {
          src: `${IMG}/connected-athlete-dashboard.png`,
          width: 767,
          height: 580,
          alt: "Connected Athlete health dashboard: steps, calories, active energy, stand minutes, sleep and resting heart rate",
        },
      },
      {
        id: "movement",
        label: "AI movement analysis",
        description:
          "Form and technique broken down from video, benchmarked against professionals.",
      },
      {
        id: "recovery",
        label: "Athlete profile",
        description:
          "Each athlete's record, documents and statistics, shared with physical therapists and medical partners.",
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
      "Competitor tracking, with every company scored on the same 27 points.",
    description:
      "Competitive intelligence for marketing and strategy teams. Every company you track is scored on the same 27 points, so rivals compare side by side instead of sitting in scattered notes. Sign-in runs through OnePlace, on the same account as the rest of the suite.",
    accent: "rose",
    features: [
      {
        id: "tracking",
        label: "Competitor tracking",
        description: "Every competitor's social, website and market activity on one dashboard.",
        image: {
          src: `${IMG}/rivalis-dashboard.jpg`,
          width: 1600,
          height: 1280,
          alt: "Rivalis dashboard with sample companies: competitors tracked, social media, website traffic and market activity",
        },
      },
      {
        id: "scoring",
        label: "27-point company scoring",
        description: "Each company scored on the same 27 points, with the reasons and its biggest opportunity.",
        image: {
          src: `${IMG}/rivalis-company.jpg`,
          width: 1600,
          height: 1280,
          alt: "Rivalis company page for a sample club: overall score 7.4 out of 10, why this score and the biggest opportunity",
        },
      },
      {
        id: "sentiment",
        label: "Review sentiment",
        description: "Reviews from Reddit, Trustpilot, Google and Yelp, sorted by sentiment.",
        image: {
          src: `${IMG}/rivalis-sentiment.jpg`,
          width: 1600,
          height: 1280,
          alt: "Rivalis review sentiment for a sample club: positive, neutral and negative feedback by platform",
        },
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
      "The feasibility platform, ad engine and site for a Level 3 EV charging and battery storage company.",
    description:
      "Xura builds EV charging and battery storage for commercial and fleet sites. We build its software: a platform that scores sites for EV charging, storage, solar and efficiency, an ad engine for the screens at its chargers, and the site, sign-in and reports around them.",
    accent: "lime",
    features: [
      {
        id: "feasibility",
        label: "Feasibility platform",
        description: "Scores every site for EV charging, battery storage, rooftop solar and efficiency, then ranks them.",
        image: {
          src: `${IMG}/xura-feasibility.jpg`,
          width: 1600,
          height: 1280,
          alt: "Xura feasibility dashboard, EV Charge view: site rankings and score distribution for sample sites",
        },
      },
      {
        id: "ad-engine",
        label: "Ad Engine",
        description: "Brands book the screens at Xura's chargers and track every campaign.",
        image: {
          src: `${IMG}/xura-ad-engine.jpg`,
          width: 1600,
          height: 1280,
          alt: "Xura Ad Engine dashboard for a sample advertiser: investment, views, interactions and campaign ranking",
        },
      },
      {
        id: "site",
        label: "The site",
        description: "Level 3 charging, battery storage and load control, explained for fleet and property owners.",
        image: {
          src: `${IMG}/xura-hero.jpg`,
          width: 1600,
          height: 1280,
          alt: "Xura home page: Built for today's grid constraints, beside two Level 3 chargers",
        },
      },
    ],
    added: "Site scoring across four energy technologies, ad booking for the screens at charging sites, and one sign-in across separate back ends.",
    addedTags: ["Feasibility scoring", "Ad tech", "Portals", "Energy"],
  },
  {
    slug: "oneplace",
    name: "OnePlace",
    category: "Every module, one console",
    kind: "Marketing operations console",
    summary:
      "The jobs a marketing team does every week, behind one login, reporting into one console.",
    description:
      "Competitive intelligence, newsletter and blog publishing, presentations, AI research and tenant operations in one console. Each module reports to a main dashboard, and our other products sign in through it.",
    accent: "lilac",
    cover: {
      src: `${IMG}/oneplace-console.jpg`,
      width: 1085,
      height: 828,
      alt: "OnePlace main dashboard showing activity across products and a health row for each suite (demo workspace)",
      label: "Main dashboard",
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

export type ProductShot = NonNullable<ProductFeature["image"]>;

/** A product's real screenshots, in feature order; its cover when no feature has one. */
export function shotsOf(product: Product): (ProductShot & { label: string; description: string; id: string })[] {
  const shots = product.features
    .filter((f) => f.image)
    .map((f) => ({ ...f.image!, id: f.id, label: f.label, description: f.description }));
  if (shots.length || !product.cover) return shots;
  return [{ ...product.cover, id: "screen", label: product.cover.label ?? "Main screen", description: product.cover.alt }];
}

/** The one screenshot that stands for a product in lists: its lead, else its cover, else its first real screen. */
export function leadShot(product: Product): ProductShot | undefined {
  return product.lead ?? product.cover ?? shotsOf(product)[0];
}

/** Products that have a page of their own under /products/<slug>. */
export const PRODUCT_PAGES = new Set(["xura"]);

type PageShot = { src: string; alt: string; label: string };

/**
 * The Xura product page: what HubTech builds for Xura. The two platforms are
 * shown with fictional sample data (their API answered locally, no real
 * accounts). Site screens come from the public deployment (xura-two.vercel.app),
 * cropped clear of Xura's own stats rows: those are Xura's claims, not proof of
 * our work. The timeline covers the site repo (HubtechIndia/xura). Client decks
 * and proposals stay off the page; they name third parties.
 */
export const XURA_PAGE = {
  title: ["Xura", "Two platforms and the site around them."],
  lede: "Xura builds EV charging and battery storage for fleet and commercial sites. We build the software around it: two platforms its partners and advertisers sign in to, and the public site, media kit and market reports.",
  hero: {
    src: `${IMG}/xura-feasibility-wide.jpg`,
    alt: "Xura feasibility dashboard, EV Charge view: KPI tiles, site rankings and score distribution for sample sites",
    label: "Feasibility platform",
  },
  work: [
    {
      id: "feasibility",
      title: "Feasibility platform",
      short: "Scores any list of addresses for charging, storage, solar and efficiency.",
      line: "Xura's team loads addresses one at a time, in bulk or from a spreadsheet, and the platform scores every site for EV charging, battery storage, rooftop solar and energy efficiency. Sites are ranked and tracked from feasibility to LOI to design, with the CRM, calendar, documents and presentations in the same app.",
      points: ["A score per site for each technology", "Single, bulk or spreadsheet analysis", "CRM, calendar and presentations built in"],
      main: {
        src: `${IMG}/xura-analyses-wide.jpg`,
        alt: "Xura analyses list: sample sites ranked by total, EV and battery storage score, with phase and lease",
        label: "Analyses",
      },
    },
    {
      id: "ad-engine",
      title: "Ad Engine",
      short: "Brands book the screens at Xura's chargers.",
      line: "Brands book screen time at Xura's charging sites. They pick screens, upload creative and check out, then follow views, interactions and spend for every campaign from one dashboard.",
      points: ["Screens to browse and book by site", "Campaigns go live once creative is in", "Views, interactions and spend per campaign"],
      main: {
        src: `${IMG}/xura-ad-engine-wide.jpg`,
        alt: "Xura Ad Engine dashboard for a sample advertiser: investment, views, interactions and campaign ranking",
        label: "Dashboard",
      },
      second: {
        src: `${IMG}/xura-campaigns-wide.jpg`,
        alt: "Xura Ad Engine campaigns: sample ads running on charging-bay screens, with status and spend",
        label: "Campaigns",
      },
    },
    {
      id: "site",
      title: "The site",
      short: "Makes Xura's case to fleet and property owners.",
      line: "Xura's pitch is one constraint: demand is rising faster than the grid can expand. The site makes that case to fleet operators and property owners, then shows the three systems Xura builds around it: Level 3 charging, battery storage and microgrid load control.",
      points: ["Home, strategy, projects and leadership pages", "A site review request on every page", "Redesigned in August to match the reports"],
      main: {
        src: `${IMG}/xura-hero-wide.jpg`,
        alt: "Xura home page: Built for today's grid constraints, beside two Level 3 chargers",
        label: "Home",
      },
      second: {
        src: `${IMG}/xura-site-solutions.jpg`,
        alt: "Xura Solutions section: three systems for sites the grid hasn't caught up to",
        label: "Solutions",
      },
    },
    {
      id: "sign-in",
      title: "Portal sign-in",
      short: "One sign-up and sign-in for both platforms.",
      line: "One page signs people up and in to both platforms: installers and EPC partners land in the feasibility platform, brands in the Ad Engine. New accounts confirm their email with a six-digit code.",
      points: ["One page, a tab for each platform", "Six-digit email code, with resend", "Each tab wired to its own back end"],
      main: {
        src: `${IMG}/xura-signin-verify.jpg`,
        alt: "Xura verify page: Verify your EV Partner account, with six boxes for the emailed code and a resend timer",
        label: "Verify",
      },
      second: {
        src: `${IMG}/xura-signup.jpg`,
        alt: "Xura partner sign-up form: name, work email, username, password and an Apply as a partner button",
        label: "Sign up",
      },
    },
    {
      id: "media-kit",
      title: "Media kit",
      short: "Sells ad space on Xura's site and newsletter.",
      line: "A page that sells ad space on Xura's site and newsletter to fleet operators, property owners, capital partners and engineers. Five ad surfaces, three packages, how a campaign runs, and a media brief instead of a contact form.",
      points: ["Five ad surfaces, hero marquee to newsletter", "Pulse, Surge and Voltage packages", "Media brief: brand, tier, budget, start date"],
      main: {
        src: `${IMG}/xura-advertise-inventory.jpg`,
        alt: "Xura ad inventory table: Five surfaces, no noise, listing each placement with its format",
        label: "Inventory",
      },
      second: {
        src: `${IMG}/xura-media-brief.jpg`,
        alt: "Xura media brief: Get a media plan in your inbox, with brand, tier and budget fields",
        label: "Media brief",
      },
    },
    {
      id: "briefings",
      title: "Market reports",
      short: "Long-form reports Xura publishes, every figure cited.",
      line: "Long-form reports Xura publishes on its site. The first maps U.S. energy and grid investment: where the money goes, who's moving it and where battery storage fits, with every figure sourced and dated. We build Xura's decks and proposals in the same design.",
      points: ["Ten chapters, market size to risks", "Charts with their sources", "Decks and proposals in the same design"],
      main: {
        src: `${IMG}/xura-report-cover.jpg`,
        alt: "Xura market briefing cover: The grid is the new gold rush, with four headline figures and their sources",
        label: "Briefing",
      },
      second: {
        src: `${IMG}/xura-report-flows.jpg`,
        alt: "Xura market briefing, Where the money goes: utility capex and battery storage by segment, as bar charts",
        label: "Where the money goes",
      },
    },
  ],
  /** From the repo's history; months are when each piece first shipped. */
  timeline: [
    {
      when: "May 2026",
      date: "2026-05",
      title: "Site and sign-in",
      line: "Home page, solutions and the constraint, the media kit, and sign-in for both portals.",
    },
    {
      when: "June 2026",
      date: "2026-06",
      title: "Verification and new pages",
      line: "Six-digit email verification. Strategy, projects and leadership pages.",
    },
    {
      when: "July 2026",
      date: "2026-07",
      title: "First reports",
      line: "Market reports on the site, and the first decks.",
    },
    {
      when: "August 2026",
      date: "2026-08",
      title: "One design",
      line: "Site proposals and decks; the whole site redesigned to match the reports.",
    },
  ],
} satisfies {
  title: string[];
  lede: string;
  hero: PageShot;
  work: { id: string; title: string; short: string; line: string; points: string[]; main: PageShot; second?: PageShot }[];
  timeline: { when: string; date: string; title: string; line: string }[];
};

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
