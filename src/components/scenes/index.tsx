import React from "react";
import { BattleLoungeScene } from "./BattleLoungeScene";
import { YsnScene } from "./YsnScene";
import { AthleteScene } from "./AthleteScene";
import { XuraScene } from "./XuraScene";
import { RivalisScene } from "./RivalisScene";
import { OnePlaceScene } from "./OnePlaceScene";

/** Coded interface scene for each product, keyed by product slug. */
export const SCENES: Record<string, React.ComponentType<{ tag?: boolean }>> = {
  "battles-lounge": BattleLoungeScene,
  ysn: YsnScene,
  "connected-athlete": AthleteScene,
  xura: XuraScene,
  rivalis: RivalisScene,
  oneplace: OnePlaceScene,
};

export function ProductScene({ slug, tag }: { slug: string; tag?: boolean }) {
  const Scene = SCENES[slug];
  return Scene ? <Scene tag={tag} /> : null;
}
