import type { Metadata } from "next";
import { ClosingBox } from "@/components/sections/ClosingBox";
import { Faq } from "@/components/local-ai/Faq";
import { Guarantees, HybridCompare } from "@/components/local-ai/Guarantees";
import { LeakTest } from "@/components/local-ai/LeakTest";
import { AirlockHero } from "@/components/local-ai/AirlockHero";
import { LocalNav } from "@/components/local-ai/LocalNav";
import { ScrubberDemo } from "@/components/local-ai/ScrubberDemo";
import { Sizing } from "@/components/local-ai/Sizing";
import { SystemMap } from "@/components/local-ai/SystemMap";
import { ValueExplorer } from "@/components/local-ai/ValueExplorer";

export const metadata: Metadata = {
  title: "Local AI",
  description:
    "Run open-weight American AI models inside your office and reach frontier models only through a scrubber, so company IP never crosses the firewall.",
  // Draft for the client's review; kept out of search until the figures are confirmed.
  robots: { index: false, follow: true },
};

/** Local AI, black and green: the promise, the system map, the value, then the scrubber and the leak test to try. */
export default function LocalAiPage() {
  return (
    <div data-world="mono">
      <AirlockHero />
      <LocalNav />
      <SystemMap />
      <ValueExplorer />
      <ScrubberDemo />
      <LeakTest />
      <Guarantees />
      <HybridCompare />
      <Sizing />
      <Faq />
      <ClosingBox
        title={["Unfair AI speed,", "with mathematical peace of mind."]}
        line="Ready in 48 hours, on-premise or in a private VPC."
        lede="Book a 20-minute walkthrough. We run your own industry use cases through the scrubber and draw up a custom hardware and ROI blueprint."
      />
    </div>
  );
}
