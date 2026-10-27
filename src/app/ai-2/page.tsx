import type { Metadata } from "next";
import { AiHero } from "@/components/ai2/AiHero";
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
  // A second take on /ai, kept out of search so the two don't compete.
  robots: { index: false, follow: true },
};

/** AI, black and green: the knowledge graph forms, comes apart into six layers, then the work, the shape and the proof. */
export default function Ai2Page() {
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
