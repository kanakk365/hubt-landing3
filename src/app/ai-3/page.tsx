import type { Metadata } from "next";
import { AiHero } from "@/components/ai3/AiHero";
import { AiPillars } from "@/components/ai2/AiPillars";
import { AiArchitecture } from "@/components/ai2/AiArchitecture";
import { AiBuild } from "@/components/ai2/AiBuild";
import { AiInProduction } from "@/components/ai2/AiInProduction";
import { AiPrinciples } from "@/components/ai2/AiPrinciples";
import { ClosingBox } from "@/components/sections/ClosingBox";

export const metadata: Metadata = {
  title: "AI",
  description:
    "How HubTech builds production AI: AI systems, agents and automation, evaluation and observability, from your data to the interfaces people use.",
  // A third take on /ai, kept out of search so the takes don't compete.
  robots: { index: false, follow: true },
};

/** AI, black and green, opening on the black-and-white page's neural web in colour; the rest is /ai-2. */
export default function Ai3Page() {
  return (
    <div data-world="mono">
      <AiHero />
      <AiPillars />
      <AiArchitecture />
      <AiBuild />
      <AiInProduction />
      <AiPrinciples />
      <ClosingBox
        title={["Bring us the problem,", "not the model."]}
        line="Tell us what you need AI to do and where your data lives."
        lede="We'll tell you honestly whether AI is the right tool, and what the simplest working version looks like."
      />
    </div>
  );
}
