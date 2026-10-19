import type { Metadata } from "next";
import { ScrollHero } from "@/components/sections/ScrollHero";
import { StudioStatement } from "@/components/sections/StudioStatement";
import { DisciplineIndex } from "@/components/sections/DisciplineIndex";
import { AiLayers } from "@/components/sections/AiLayers";
import { PrincipleGrid } from "@/components/sections/PrincipleGrid";
import { ProcessLine } from "@/components/sections/ProcessLine";
import { ClosingBox } from "@/components/sections/ClosingBox";

export const metadata: Metadata = {
  description:
    "HubTech is an AI and software studio. We design, build and run AI systems, web platforms and mobile apps for businesses, founders and sports organisations.",
};

/** Home: whole sections alternate white and black, opened and closed by the black box. */
export default function Home() {
  return (
    <div data-world="mono">
      <ScrollHero />
      <StudioStatement />
      <DisciplineIndex />
      <AiLayers />
      <PrincipleGrid />
      <ProcessLine />
      <ClosingBox />
    </div>
  );
}
