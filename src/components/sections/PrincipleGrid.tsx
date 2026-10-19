import React from "react";
import { TextLink } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { PRINCIPLES } from "@/lib/site";

/**
 * The rules HubTech holds every project to: each rule set at display scale,
 * its reason hung on one shared column, ruled like a printed sheet.
 */
export function PrincipleGrid() {
  return (
    <section id="principles" data-nav-tone="light" aria-labelledby="principles-title" className="tone-light">
      <div className="container-site py-24 md:py-36">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-12">
          <Reveal>
            <h2
              id="principles-title"
              className="font-display max-w-[18ch] text-[clamp(2rem,1.15rem+2.3vw,3.3rem)] font-[460] leading-[1.04] tracking-[-0.036em] text-fg [font-stretch:104%]"
            >
              Six rules we hold every project to.
            </h2>
          </Reveal>
          <Reveal delay={0.06} className="shrink-0">
            <TextLink href="/ai#principles">Read the principles</TextLink>
          </Reveal>
        </div>

        <ul className="mt-14 border-b border-line md:mt-20">
          {PRINCIPLES.map((p) => (
            <Reveal
              as="li"
              key={p.title}
              delay={0.04}
              className="grid grid-cols-1 gap-x-12 gap-y-3 border-t border-line py-7 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] md:items-baseline md:py-9"
            >
              <h3 className="font-display text-[clamp(1.75rem,1rem+2.4vw,3.25rem)] font-[440] leading-[1.02] tracking-[-0.038em] text-fg [font-stretch:106%]">
                {p.title}
              </h3>
              <p className="max-w-[34ch] text-[1rem] leading-relaxed text-fg-muted md:text-[1.0625rem]">{p.description}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
