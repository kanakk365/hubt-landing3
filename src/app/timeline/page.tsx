import type { Metadata } from "next";
import { ClosingBox } from "@/components/sections/ClosingBox";
import { NowChapter } from "@/components/timeline/NowChapter";
import { TimelineChapters } from "@/components/timeline/TimelineChapters";
import { TimelineHero } from "@/components/timeline/TimelineHero";
import { TimelineRecord } from "@/components/timeline/TimelineRecord";

export const metadata: Metadata = {
  title: "Timeline",
  description:
    "The companies behind HubTech since 2002: Data Treasury, Zaah, ICONIC Motors, VEEDIMS and Hub Technology, through to the platforms we build and run today.",
};

/**
 * Timeline: the line of companies behind HubTech. It opens in digital rain and sets out the record in six figures,
 * then tells each company full screen, one after another (its own footage, its figures, its products on a strip that
 * scrolls sideways), through to the work running now.
 */
export default function TimelinePage() {
  return (
    <div data-world="mono">
      <TimelineHero />
      <TimelineRecord />
      <TimelineChapters />
      <NowChapter />
      <ClosingBox
        title={["The next chapter", "is your product."]}
        line="Book a call with the team behind all of it."
        lede="Leave a few details first if you like; they carry over to the booking."
      />
    </div>
  );
}
