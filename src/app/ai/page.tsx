import type { Metadata, Viewport } from "next";
import { AiHero } from "@/components/sections/AiHero";
import { AiPillars } from "@/components/sections/AiPillars";
import { AiArchitecture } from "@/components/sections/AiArchitecture";
import { AiBuild } from "@/components/sections/AiBuild";
import { AiInProduction } from "@/components/sections/AiInProduction";
import { AiPrinciples } from "@/components/sections/AiPrinciples";
import { ClosingBox } from "@/components/sections/ClosingBox";

export const metadata: Metadata = {
  title: "AI",
  description:
    "How HubTech builds production AI: AI systems, agents and automation, evaluation and observability, from your data to the interfaces people use.",
};

export const viewport: Viewport = { themeColor: "#fafafa" };

/**
 * AI: the neural web comes apart into six layers, then the work, the shape and
 * the proof. This is the black-and-white page as it first shipped (data-theme
 * "bw" brings back its white and black sections); /ai-2 is the black-and-green take.
 */
export default function AiPage() {
  return (
    <div data-world="mono" data-theme="bw">
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
