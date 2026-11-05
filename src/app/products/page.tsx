import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { BookCall } from "@/components/site/BookCall";
import { ProductReel } from "@/components/sections/ProductReel";
import { ProductIndex } from "@/components/sections/ProductIndex";
import { ProductShowcase } from "@/components/sections/ProductShowcase";
import { ClosingBox } from "@/components/sections/ClosingBox";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Battle's Lounge, YSN, Connected Athlete, Rivalis, Xura and OnePlace: six products HubTech designed, built and shipped.",
};

/** Products: the six interfaces in a reel, an index on white, then each one in turn. */
export default function ProductsPage() {
  return (
    <div data-world="mono">
      <PageHero
        title={["Six products,", "designed and built by our team."]}
        lede="Esports tournaments, live sports streaming, computer-vision analysis, competitive intelligence, a console for marketing teams, and the software behind an EV charging company."
        actions={<BookCall size="lg">Build yours with us</BookCall>}
        className="pb-16 md:pb-24"
      >
        <ProductReel />
      </PageHero>
      <ProductIndex />
      <ProductShowcase />
      <ClosingBox
        title={["Your product could", "be the seventh."]}
        line="Tell us what you're building."
        lede="We'll walk you through how we'd approach it, using the work above as the reference."
      />
    </div>
  );
}
