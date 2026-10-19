import { ScrollHero } from "@/components/sections/ScrollHero";
import { StudioStatement } from "@/components/sections/StudioStatement";

/** A white page held together by one black box that opens into the black studio statement. */
export default function Home() {
  return (
    <div data-world="mono">
      <ScrollHero />
      <StudioStatement />
    </div>
  );
}
