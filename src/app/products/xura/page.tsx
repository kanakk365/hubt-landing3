import type { Metadata } from "next";
import { XuraHero, XuraSoFar, XuraWork } from "@/components/product/XuraPage";
import { ClosingBox } from "@/components/sections/ClosingBox";

export const metadata: Metadata = {
  title: "Xura",
  description:
    "What HubTech builds for Xura, an EV charging and battery storage company: a site feasibility platform, an ad engine for the screens at its chargers, and the site, sign-in, media kit and reports around them.",
};

/** One product on its own page: what we've built for Xura, in its real screens and in the order it shipped. */
export default function XuraProductPage() {
  return (
    <div data-world="mono">
      <XuraHero />
      <XuraWork />
      <XuraSoFar />
      <ClosingBox
        title={["Need a platform", "built like this?"]}
        line="Tell us what you're building."
        lede="We'll show you how we'd approach it, with Xura as the reference."
      />
    </div>
  );
}
