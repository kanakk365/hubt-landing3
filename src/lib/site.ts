/**
 * Site content for the HubTech landing page. Do not add client names,
 * metrics or dates that HubTech has not confirmed.
 */

export const BOOKING = {
  namespace: "chat-with-hubtech",
  link: "hubtech/demo",
  url: "https://cal.com/hubtech/demo",
} as const;

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
