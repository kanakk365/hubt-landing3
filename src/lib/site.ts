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
  video: {
    cube: { src: "/video/hubtech-cube.mp4", poster: "/video/hubtech-cube.webp" },
    particles: { src: "/video/hubtech-particles.mp4", poster: "/video/hubtech-particles.webp" },
  },
} as const;
